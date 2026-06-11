import { useEffect, useState, useCallback, useMemo } from 'react';
import { Inbox } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useBdr } from './BdrContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import AddToPipelineSheet, { PipelineLead } from './AddToPipelineSheet';
import { exportRowsToXlsx } from './exportXlsx';
import PageHeader from './PageHeader';
import SkeletonRows from './SkeletonRows';
import { PERPLEXITY_FEATURES_ENABLED } from '@/lib/featureFlags';

interface Opportunity {
  id: string;
  company: string;
  market: string | null;
  project: string | null;
  vertical: string | null;
  signal_type: string | null;
  why_it_matters: string | null;
  description: string | null;
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
  suggested_contacts: string[] | null;
  source_url: string | null;
  last_verified: string;
  status: string;
  saved_by_bdr: string | null;
}

const stripLegacyTags = (s: string | null | undefined): string =>
  (s || '').replace(/\[(WHALE|GLOBAL|COLLAB|TREND:[^\]]*)\]\s*/gi, '').trim();

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
  const [includeOutside, setIncludeOutside] = useState(false);
  const [pipeOpp, setPipeOpp] = useState<Opportunity | null>(null);
  const [burstId, setBurstId] = useState<string | null>(null);

  const triggerPipeline = (o: Opportunity) => {
    setBurstId(o.id);
    window.setTimeout(() => setBurstId(curr => (curr === o.id ? null : curr)), 750);
    window.setTimeout(() => setPipeOpp(o), 220);
  };

  const pipelineLead = useMemo<PipelineLead | null>(() => {
    if (!pipeOpp) return null;
    return {
      company_name: pipeOpp.company,
      vertical: pipeOpp.vertical || '',
      signal_type: pipeOpp.signal_type || '',
      signal_detail: pipeOpp.why_it_matters || pipeOpp.description || '',
      why_housing: pipeOpp.why_it_matters || pipeOpp.estimated_stay || '',
      recommended_titles: pipeOpp.suggested_contacts || [],
      source_url: pipeOpp.source_url || undefined,
      city: pipeOpp.market || undefined,
    };
  }, [pipeOpp]);

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
    if (!PERPLEXITY_FEATURES_ENABLED) {
      toast.error('Scan is temporarily disabled', {
        description: 'Live opportunity scans require Perplexity, which is currently disconnected.',
      });
      return;
    }
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
    if (typeof window === 'undefined') return;
    const target = parseMarketTarget(opportunity.market);

    if (target) {
      sessionStorage.setItem(
        MARKET_HEAT_ROUTE_KEY,
        JSON.stringify({
          city: target.city,
          state: target.state,
          inventory: stripDistanceSuffix(opportunity.nearest_inventory) || null,
        })
      );
    }

    window.dispatchEvent(new CustomEvent('flare:navigate-tab', { detail: 'market' }));
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

  const baseList = includeOutside ? items : territoryFiltered;
  const filtered = baseList.filter(o => {
    if (filter === 'top') return o.priority === 'Top Priority';
    if (filter === 'near') return o.near_core_inventory;
    if (filter === 'saved') return o.saved_by_bdr === selected?.id;
    return true;
  });

  if (!selected) return <div className="p-12 text-center text-muted-foreground">Select a BDR to view opportunities</div>;

  return (
    <div className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <PageHeader
        title="Today's Leads"
        subtitle="Your auto-built morning list — pre-scored and ready to work."
        right={
          <div className="flex gap-2">
            <Button
              onClick={() => {
                if (!filtered.length) { toast.error('Nothing to export'); return; }
                const rows = filtered.map(o => ({
                  Company: o.company,
                  Market: o.market || '',
                  Vertical: o.vertical || '',
                  Signal: o.signal_type || '',
                  Project: o.project || '',
                  Priority: o.priority || '',
                  Confidence: o.confidence_label || '',
                  'Discovery Score': o.discovery_score,
                  'Housing Fit': o.housing_fit_score,
                  'Confidence Score': o.confidence_score,
                  'Overall Score': Math.round(o.discovery_score * 0.4 + o.housing_fit_score * 0.4 + o.confidence_score * 0.2),
                  'Why It Matters': o.why_it_matters || '',
                  'Estimated Stay': o.estimated_stay || '',
                  'Nearest Inventory': o.nearest_inventory || '',
                  'Distance (mi)': o.distance_to_inventory ?? '',
                  'Suggested Contacts': (o.suggested_contacts || []).join('; '),
                  Status: o.status,
                  'Last Verified': o.last_verified,
                }));
                const stamp = new Date().toISOString().slice(0, 10);
                exportRowsToXlsx(rows, `flare-todays-leads-${selected.name.replace(/\s+/g, '-')}-${stamp}.xlsx`, "Today's Leads");
                toast.success(`Exported ${rows.length} leads to Excel`);
              }}
              variant="outline"
              size="sm"
            >
              Export Excel
            </Button>
            <Button onClick={refresh} disabled={scanning} size="sm">
              {scanning ? 'Scanning…' : 'Refresh Scan'}
            </Button>
          </div>
        }
      />

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
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={() => setIncludeOutside(v => !v)}
            role="switch"
            aria-checked={includeOutside}
            aria-label={
              includeOutside
                ? `Hide ${territoryRemovedCount} off-territory lead${territoryRemovedCount > 1 ? 's' : ''}`
                : `Reveal ${territoryRemovedCount} off-territory lead${territoryRemovedCount > 1 ? 's' : ''}`
            }
            title={includeOutside ? 'Hide leads outside your territory' : 'Reveal leads outside your territory'}
            className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
              includeOutside
                ? 'bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 hover:border-purple-300 focus-visible:ring-purple-400'
                : 'bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 hover:border-amber-300 focus-visible:ring-amber-400'
            }`}
          >
            <span
              aria-hidden="true"
              className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold ${
                includeOutside ? 'bg-purple-200 text-purple-900' : 'bg-amber-200 text-amber-900'
              }`}
            >
              {territoryRemovedCount}
            </span>
            <span>
              {includeOutside
                ? `Hide off-territory leads`
                : `Reveal ${territoryRemovedCount} off-territory lead${territoryRemovedCount > 1 ? 's' : ''}`}
            </span>
          </button>
          <span className="text-[11px] text-muted-foreground font-medium">Rule: {territoryRuleText}</span>
        </div>
      )}

      {loading && <SkeletonRows count={5} height={72} />}

      {!loading && filtered.length === 0 && (
        <div className="py-16 px-6 text-center flex flex-col items-center gap-3 rounded-md" style={{ border: '1px solid #E2E8F0', background: '#FFFFFF' }}>
          {filter !== 'all' && territoryFiltered.length > 0 ? (
            <>
              <Inbox size={32} color="#94A3B8" />
              <p className="text-[14px]" style={{ color: '#64748B' }}>
                No leads match the <span className="font-semibold" style={{ color: '#0F172A' }}>
                  {filter === 'top' ? 'Top Priority' : filter === 'near' ? 'Near Inventory' : 'My Saved'}
                </span> filter.
              </p>
              <Button onClick={() => setFilter('all')} variant="outline" size="sm">Show all leads</Button>
            </>
          ) : (
            <>
              <Inbox size={32} color="#94A3B8" />
              <h3 style={{ fontSize: 16, fontWeight: 600, color: '#0F172A' }}>No leads yet for today</h3>
              <p style={{ fontSize: 12, color: '#64748B', maxWidth: 360 }}>
                Your list auto-builds overnight. Check back tomorrow morning, or run a manual scan in Scan a Market.
              </p>
              <Button
                size="sm"
                onClick={() => window.dispatchEvent(new CustomEvent('flare:navigate-tab', { detail: 'market' }))}
              >
                Scan a Market Now
              </Button>
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
                  {o.why_it_matters && <p className="text-sm mt-2 text-foreground/80">{stripLegacyTags(o.why_it_matters)}</p>}
                  {o.estimated_stay && (
                    <p className="text-xs mt-2 text-muted-foreground">Estimated stay: <span className="font-medium text-foreground">{o.estimated_stay}</span></p>
                  )}
                  {o.source_url ? (
                    <a
                      href={o.source_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold mt-2 px-2.5 py-1 rounded-full border transition-opacity hover:opacity-80"
                      style={{ background: 'rgba(45,212,191,.12)', color: '#0d9488', borderColor: 'rgba(45,212,191,.3)' }}
                    >
                      🔗 View source
                    </a>
                  ) : (
                    <span className="inline-block text-[11px] font-semibold mt-2 px-2.5 py-1 rounded-full border bg-amber-50 text-amber-700 border-amber-200">
                      ⚠ No source link — re-scan to refresh
                    </span>
                  )}
                </div>

                <div className="flex flex-col items-end gap-2 min-w-[180px]">
                  <div className="text-right">
                    <div className="text-2xl font-bold text-pink-400">{composite}</div>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Overall Score</div>
                  </div>
                  <div className="flex flex-col gap-1.5 mt-2 w-full">
                    {o.saved_by_bdr === selected.id ? (
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md text-center"
                        style={{ background: 'rgba(16,185,129,.15)', color: '#14b8a6' }}
                      >
                        ✓ In pipeline
                      </span>
                    ) : (
                      <div className="relative w-full">
                        <button
                          onClick={() => triggerPipeline(o)}
                          className="relative w-full text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-all hover:-translate-y-0.5 active:scale-95 overflow-visible"
                          style={{ background: '#0e1e3a', color: '#fff' }}
                        >
                          + Pipeline
                          {burstId === o.id && <span className="flare-pulse-ring" aria-hidden />}
                        </button>
                        {burstId === o.id && (
                          <div className="absolute inset-0 pointer-events-none" aria-hidden>
                            {['✨','⚡','🎯','💥','✨','⭐'].map((emoji, i) => {
                              const angle = (i / 6) * Math.PI * 2;
                              const dist = 38 + (i % 2) * 14;
                              return (
                                <span
                                  key={i}
                                  className="flare-sparkle"
                                  style={{
                                    left: '50%',
                                    top: '50%',
                                    ['--fx' as string]: `${Math.cos(angle) * dist}px`,
                                    ['--fy' as string]: `${Math.sin(angle) * dist}px`,
                                    animationDelay: `${i * 25}ms`,
                                  }}
                                >
                                  {emoji}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                    <button
                      onClick={() => archiveOpp(o.id)}
                      className="text-[11px] font-bold uppercase tracking-wider px-3 py-2 rounded-md transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(251,146,60,.12)', color: '#DC2626', border: '1px solid rgba(251,146,60,.35)' }}
                    >
                      Archive
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <AddToPipelineSheet
        lead={pipelineLead}
        onClose={() => setPipeOpp(null)}
        onSaved={async () => {
          if (pipeOpp && selected) {
            await supabase.from('opportunities').update({ saved_by_bdr: selected.id, status: 'working' }).eq('id', pipeOpp.id);
            load();
          }
        }}
      />
    </div>
  );
}
