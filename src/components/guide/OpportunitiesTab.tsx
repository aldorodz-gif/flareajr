import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBdr } from './BdrContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import TopVerticals, { VerticalShare } from './TopVerticals';
import InventoryMap from './InventoryMap';

interface Opportunity {
  id: string;
  company: string;
  market: string | null;
  project: string | null;
  vertical: string | null;
  signal_type: string | null;
  why_it_matters: string | null;
  estimated_stay: string | null;
  discovery_score: number;
  housing_fit_score: number;
  confidence_score: number;
  priority: string | null;
  confidence_label: string | null;
  review_status: string | null;
  nearest_inventory: string | null;
  near_core_inventory: boolean;
  distance_to_inventory: number | null;
  last_verified: string;
  status: string;
  saved_by_bdr: string | null;
}

// Pill color helpers — softer/lighter tones with dark text for readability.
// NOTE: tailwind.config.ts overrides `teal` as a single token (no shades),
// so teal pills use a custom inline style instead of bg-teal-100.
const PILL_FALLBACK = 'bg-slate-100 text-slate-700 border-slate-200';
const MARKET_HEAT_ROUTE_KEY = 'flare.marketHeatRoute';

const priorityPill = (raw: string | null): string => {
  const key = (raw || '').trim().toLowerCase();
  if (key.includes('top')) return 'bg-pink-100 text-pink-800 border-pink-200';
  if (key.includes('strong')) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (key.includes('early')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  return PILL_FALLBACK;
};

const confidencePill = (raw: string | null): string => {
  const key = (raw || '').trim().toLowerCase();
  if (key.startsWith('h')) return 'bg-emerald-100 text-emerald-800 border-emerald-200';
  if (key.startsWith('m')) return 'bg-purple-100 text-purple-800 border-purple-200';
  if (key.startsWith('l')) return 'bg-slate-100 text-slate-700 border-slate-200';
  return PILL_FALLBACK;
};

const DISTANCE_SUFFIX_RE = /\s+[—-]\s*~?\d+(?:\.\d+)?\s*(?:mi|km)\b/i;

const stripDistanceSuffix = (value: string | null) =>
  (value || '').replace(DISTANCE_SUFFIX_RE, '').trim();

const formatNearInventoryLabel = (inventory: string | null, distance: number | null) => {
  const embeddedDistance = (inventory || '').match(DISTANCE_SUFFIX_RE)?.[0]?.trim();
  const baseLabel = stripDistanceSuffix(inventory) || 'inventory';
  if (typeof distance === 'number' && Number.isFinite(distance)) {
    return `${baseLabel} · ~${Math.round(distance)} mi`;
  }
  if (embeddedDistance) {
    return `${baseLabel} · ${embeddedDistance.replace(/^[—-]\s*/, '')}`;
  }
  return baseLabel;
};

const parseMarketTarget = (market: string | null) => {
  if (!market) return null;
  const [cityPart = '', remainder = ''] = market.split(',', 2);
  const city = cityPart.trim();
  const state = remainder.match(/\b[A-Z]{2}\b/)?.[0] ?? remainder.trim();
  if (!city || !state) return null;
  return { city, state };
};


export default function OpportunitiesTab() {
  const { selected } = useBdr();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'top' | 'near' | 'saved'>('all');
  const [pulseOpen, setPulseOpen] = useState<boolean>(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('flare.marketPulseOpen') !== '0';
  });
  const [focusInventory, setFocusInventory] = useState<string | null>(null);
  const pulseRef = useRef<HTMLDivElement>(null);

  const togglePulse = () => {
    setPulseOpen(prev => {
      const next = !prev;
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('flare.marketPulseOpen', next ? '1' : '0');
      }
      return next;
    });
  };

  const load = useCallback(async () => {
    if (!selected) return;
    setLoading(true);
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('assigned_bdr', selected.id)
      .neq('status', 'archived')
      .order('discovery_score', { ascending: false })
      .limit(100);
    if (error) toast.error('Failed to load opportunities');
    setItems((data || []) as Opportunity[]);
    setLoading(false);
  }, [selected]);

  useEffect(() => { load(); }, [load]);

  const refresh = async () => {
    if (!selected) return;
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-opportunities', {
        body: { bdr_id: selected.id },
      });
      if (error) throw error;
      toast.success(`Scan complete: ${data.inserted} new, ${data.skipped} filtered`);
      await load();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Scan failed');
    } finally {
      setScanning(false);
    }
  };

  const saveOpp = async (id: string) => {
    if (!selected) return;
    await supabase.from('opportunities').update({ saved_by_bdr: selected.id, status: 'working' }).eq('id', id);
    toast.success('Saved to My Opportunities');
    load();
  };

  const archiveOpp = async (id: string) => {
    await supabase.from('opportunities').update({ status: 'archived' }).eq('id', id);
    load();
  };

  const openInventoryContext = (opportunity: Opportunity) => {
    const inv = stripDistanceSuffix(opportunity.nearest_inventory) || null;
    setFocusInventory(inv);
    if (!pulseOpen) togglePulse();
    setTimeout(() => {
      pulseRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  // Build state + city allow-lists. Snapshot-derived BDRs often only have a
  // city (e.g. "Minneapolis") with no state code — fall back to city matching
  // so opportunities aren't filtered to zero.
  const marketParts = (selected?.markets || []).map(m => {
    const tokens = m.split(',').map(s => s.trim()).filter(Boolean);
    const stateToken = tokens[tokens.length - 1];
    const isState = stateToken && /^[A-Z]{2}$/i.test(stateToken);
    return {
      state: isState ? stateToken!.toUpperCase() : null,
      city: (isState ? tokens.slice(0, -1).join(', ') : tokens.join(', ')).toLowerCase(),
    };
  });
  const allowedStates = new Set(marketParts.map(p => p.state).filter(Boolean) as string[]);
  const allowedCities = new Set(marketParts.map(p => p.city).filter(Boolean));

  const inTerritory = (market: string | null) => {
    if (!market) return allowedStates.size === 0 && allowedCities.size === 0;
    if (allowedStates.size === 0 && allowedCities.size === 0) return true;
    const tokens = market.split(',').map(s => s.trim()).filter(Boolean);
    const st = tokens[tokens.length - 1]?.toUpperCase();
    if (st && allowedStates.has(st)) return true;
    const cityLc = (tokens[0] || '').toLowerCase();
    return cityLc ? allowedCities.has(cityLc) : false;
  };

  const territoryFiltered = items.filter(o => inTerritory(o.market));
  const territoryRemovedCount = items.length - territoryFiltered.length;

  const territoryRuleText = (() => {
    const states = Array.from(allowedStates);
    const cities = Array.from(allowedCities);
    if (states.length && cities.length) {
      return `state: ${states.join(', ')} or city: ${cities.join(', ')}`;
    }
    if (states.length) return `state: ${states.join(', ')}`;
    if (cities.length) return `city: ${cities.join(', ')}`;
    return 'no territory restrictions';
  })();

  const filtered = territoryFiltered.filter(o => {
    if (filter === 'top') return o.priority === 'Top Priority';
    if (filter === 'near') return o.near_core_inventory;
    if (filter === 'saved') return o.saved_by_bdr === selected?.id;
    return true;
  });

  // Derive top verticals locally from territory-filtered opportunities.
  const topVerticals = useMemo<VerticalShare[]>(() => {
    if (territoryFiltered.length === 0) return [];
    const counts = new Map<string, { count: number; signals: Map<string, number> }>();
    for (const o of territoryFiltered) {
      const v = o.vertical?.trim();
      if (!v) continue;
      const entry = counts.get(v) ?? { count: 0, signals: new Map<string, number>() };
      entry.count += 1;
      if (o.signal_type) entry.signals.set(o.signal_type, (entry.signals.get(o.signal_type) ?? 0) + 1);
      counts.set(v, entry);
    }
    const total = Array.from(counts.values()).reduce((s, e) => s + e.count, 0) || 1;
    return Array.from(counts.entries())
      .map(([vertical, entry]) => {
        const topSignal = Array.from(entry.signals.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'mixed signals';
        return {
          vertical,
          share_pct: Math.round((entry.count / total) * 100),
          driver: `${entry.count} lead${entry.count > 1 ? 's' : ''} · driven by ${topSignal}`,
        };
      })
      .sort((a, b) => b.share_pct - a.share_pct)
      .slice(0, 5);
  }, [territoryFiltered]);

  // Pick a primary city/state for the inventory map from the BDR's first market.
  const primaryMarket = useMemo(() => {
    const first = selected?.markets?.[0];
    if (!first) return { city: '', state: '' };
    const tokens = first.split(',').map(s => s.trim()).filter(Boolean);
    const last = tokens[tokens.length - 1];
    const isState = last && /^[A-Z]{2}$/i.test(last);
    return {
      state: isState ? last!.toUpperCase() : '',
      city: isState ? tokens.slice(0, -1).join(', ') : tokens.join(', '),
    };
  }, [selected?.id]);

  if (!selected) return <div className="p-12 text-center text-muted-foreground">Select a BDR to view opportunities</div>;

  return (
    <div className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">AI Daily Lead Feed</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Auto-scanned signals for {selected.markets.join(', ')}
          </p>
        </div>
        <Button onClick={refresh} disabled={scanning} size="lg" className="bg-pink-500 hover:bg-pink-600">
          {scanning ? '🔄 Scanning…' : '⚡ Refresh Scan'}
        </Button>
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {([
          ['all', `All (${territoryFiltered.length})`],
          ['top', `🔥 Top Priority`],
          ['near', `📍 Near Inventory`],
          ['saved', `⭐ My Saved`],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              filter === k
                ? 'bg-pink-100 text-pink-800 border-pink-200'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {territoryRemovedCount > 0 && (
        <div className="mb-4 flex items-center gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
          <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-amber-200 text-[10px] font-bold text-amber-900">
            {territoryRemovedCount}
          </span>
          <span>
            opportunity{territoryRemovedCount > 1 ? 'ies' : 'y'} hidden outside territory
          </span>
          <span className="ml-auto font-medium">Rule: {territoryRuleText}</span>
        </div>
      )}

      {loading && <div className="py-12 text-center text-muted-foreground">Loading…</div>}

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center border border-dashed rounded-lg">
          {filter !== 'all' && territoryFiltered.length > 0 ? (
            <>
              <p className="text-muted-foreground mb-3">
                No leads match the <span className="font-semibold text-pink-500">
                  {filter === 'top' ? 'Top Priority' : filter === 'near' ? 'Near Inventory' : 'My Saved'}
                </span> filter.
              </p>
              <Button onClick={() => setFilter('all')} variant="outline">Show all leads</Button>
            </>
          ) : (
            <>
              <p className="text-muted-foreground mb-3">No opportunities yet for this BDR.</p>
              <Button onClick={refresh} disabled={scanning}>Run first scan</Button>
            </>
          )}
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(o => {
          const composite = Math.round(o.discovery_score * 0.4 + o.housing_fit_score * 0.4 + o.confidence_score * 0.2);
          return (
            <div key={o.id} className="border rounded-lg p-4 bg-card hover:border-pink-500/40 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-[300px]">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="text-lg font-semibold">{o.company}</h3>
                    {o.priority && (
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${priorityPill(o.priority)}`}>
                        {o.priority}
                      </span>
                    )}
                    {o.confidence_label && (
                      <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full border ${confidencePill(o.confidence_label)}`}>
                        Source: {o.confidence_label}
                      </span>
                    )}
                    {o.near_core_inventory && (
                      <button
                        type="button"
                        onClick={() => openInventoryContext(o)}
                        className="text-[11px] font-semibold px-2.5 py-1 rounded-full border transition-opacity hover:opacity-85"
                        style={{ background: '#ccfbf1', color: '#115e59', borderColor: '#99f6e4' }}
                        title="Open this market in Market Heat"
                      >
                        📍 Near {formatNearInventoryLabel(o.nearest_inventory, o.distance_to_inventory)}
                      </button>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">
                    {o.signal_type} · {o.market} · {o.vertical}
                  </p>
                  {o.project && <p className="text-sm font-medium">{o.project}</p>}
                  {o.why_it_matters && <p className="text-sm mt-2 text-foreground/80">{o.why_it_matters}</p>}
                  {o.estimated_stay && (
                    <p className="text-xs mt-2 text-muted-foreground">Estimated stay: <span className="font-medium text-foreground">{o.estimated_stay}</span></p>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[180px]">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-400">{composite}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall Score</div>
                  </div>
                  <div className="flex gap-2 mt-2">
                    {o.saved_by_bdr === selected.id ? (
                      <span className="text-xs text-teal-400">⭐ Saved</span>
                    ) : (
                      <Button size="sm" onClick={() => saveOpp(o.id)}>Save</Button>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => archiveOpp(o.id)}>Archive</Button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
