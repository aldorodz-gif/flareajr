import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBdr } from './BdrContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

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
  last_verified: string;
  status: string;
  saved_by_bdr: string | null;
}

const PRIORITY_COLORS: Record<string, string> = {
  'Top Priority': 'bg-pink-500 text-white border-pink-600',
  'Strong Opportunity': 'bg-purple-500 text-white border-purple-600',
  'Early Signal': 'bg-teal-600 text-white border-teal-700',
};

const CONFIDENCE_COLORS: Record<string, string> = {
  High: 'bg-teal-500 text-white border-teal-600',
  Medium: 'bg-purple-500 text-white border-purple-600',
  Low: 'bg-zinc-600 text-white border-zinc-700',
};

export default function OpportunitiesTab() {
  const { selected } = useBdr();
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [filter, setFilter] = useState<'all' | 'top' | 'near' | 'saved'>('all');

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

  const allowedStates = new Set(
    (selected?.markets || [])
      .map(m => m.split(',').pop()?.trim().toUpperCase())
      .filter(Boolean) as string[]
  );

  const inTerritory = (market: string | null) => {
    if (!market || allowedStates.size === 0) return allowedStates.size === 0;
    const st = market.split(',').pop()?.trim().toUpperCase();
    return st ? allowedStates.has(st) : false;
  };

  const filtered = items.filter(o => {
    if (!inTerritory(o.market)) return false;
    if (filter === 'top') return o.priority === 'Top Priority';
    if (filter === 'near') return o.near_core_inventory;
    if (filter === 'saved') return o.saved_by_bdr === selected?.id;
    return true;
  });

  if (!selected) return <div className="p-12 text-center text-muted-foreground">Select a BDR to view opportunities</div>;

  return (
    <div className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold">Live Opportunities</h2>
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
          ['all', `All (${items.filter(o => inTerritory(o.market)).length})`],
          ['top', `🔥 Top Priority`],
          ['near', `📍 Near Inventory`],
          ['saved', `⭐ My Saved`],
        ] as const).map(([k, label]) => (
          <button
            key={k}
            onClick={() => setFilter(k)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors border ${
              filter === k
                ? 'bg-pink-500 text-white border-pink-500'
                : 'bg-card text-foreground border-border hover:bg-muted'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {loading && <div className="py-12 text-center text-muted-foreground">Loading…</div>}

      {!loading && filtered.length === 0 && (
        <div className="py-16 text-center border border-dashed rounded-lg">
          <p className="text-muted-foreground mb-3">No opportunities yet for this BDR.</p>
          <Button onClick={refresh} disabled={scanning}>Run first scan</Button>
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
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border ${PRIORITY_COLORS[o.priority] || 'bg-muted text-muted-foreground'}`}>
                        {o.priority}
                      </span>
                    )}
                    {o.confidence_label && (
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${CONFIDENCE_COLORS[o.confidence_label] || 'bg-card text-foreground border-border'}`}>
                        Source: {o.confidence_label}
                      </span>
                    )}
                    {o.near_core_inventory && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-teal-600 text-white border border-teal-700 font-medium">📍 Near {o.nearest_inventory}</span>
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
                  <div className="flex gap-2 text-[10px] text-muted-foreground">
                    <span title="How strong the news/signal is">Signal:{o.discovery_score}</span>
                    <span title="How well it fits 30+ day housing">Housing:{o.housing_fit_score}</span>
                    <span title="How trustworthy the source is">Source:{o.confidence_score}</span>
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
