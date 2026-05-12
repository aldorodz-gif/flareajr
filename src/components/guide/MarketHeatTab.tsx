import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AiToolCard from './AiToolCard';
import MarketSelector from './MarketSelector';
import TopVerticals, { VerticalShare } from './TopVerticals';
import LeadFeed, { ScanLead } from './LeadFeed';
import InventoryMap from './InventoryMap';
import { useBdr } from './BdrContext';

const MARKET_HEAT_ROUTE_KEY = 'flare.marketHeatRoute';

const MarketHeatTab = () => {
  const { selected } = useBdr();
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [vertical, setVertical] = useState('all');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<ScanLead[]>([]);
  const [seenCompanies, setSeenCompanies] = useState<string[]>([]);
  const [topVerticals, setTopVerticals] = useState<VerticalShare[]>([]);
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [focusInventory, setFocusInventory] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);
      const { data: settings } = await supabase
        .from('user_settings')
        .select('home_state, home_city, home_vertical, last_scan_at')
        .eq('user_id', user.id)
        .maybeSingle();
      if (settings) {
        if (settings.home_state) setState(settings.home_state);
        if (settings.home_city) setCity(settings.home_city);
        if (settings.home_vertical) setVertical(settings.home_vertical);
        if (settings.last_scan_at) setLastScanAt(new Date(settings.last_scan_at));
      }
    })();
  }, []);

  const [pendingBdrScan, setPendingBdrScan] = useState(false);

  // When the active BDR changes, snap filters to that BDR's first market and queue an auto-scan.
  useEffect(() => {
    if (!selected || !selected.markets?.length) return;
    const first = selected.markets[0]; // "City, ST"
    const [c, st] = first.split(',').map(s => s.trim());
    if (c) setCity(c);
    if (st) setState(st);
    setFocusInventory(null);
    setPendingBdrScan(true);
  }, [selected?.id]);

  // Run the queued scan once the new state/city values have been applied.
  useEffect(() => {
    if (!pendingBdrScan || !state || !city || loading) return;
    setPendingBdrScan(false);
    void handleScan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pendingBdrScan, state, city]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const raw = sessionStorage.getItem(MARKET_HEAT_ROUTE_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw) as { city?: string; state?: string; inventory?: string | null };
      if (parsed.city) setCity(parsed.city);
      if (parsed.state) setState(parsed.state);
      setFocusInventory(parsed.inventory ?? null);
    } catch {
      sessionStorage.removeItem(MARKET_HEAT_ROUTE_KEY);
      return;
    }

    sessionStorage.removeItem(MARKET_HEAT_ROUTE_KEY);
  }, []);

  const handleSelectorChange = (next: { state?: string; city?: string; vertical?: string }) => {
    if (next.state !== undefined) setState(next.state);
    if (next.city !== undefined) setCity(next.city);
    if (next.vertical !== undefined) setVertical(next.vertical);
  };

  const persistMarket = useCallback(async () => {
    if (!userId) return;
    await supabase.from('user_settings').upsert({
      user_id: userId,
      home_state: state,
      home_city: city,
      home_vertical: vertical,
      last_scan_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
  }, [userId, state, city, vertical]);

  useEffect(() => {
    if (!focusInventory || !state || !city || loading) return;
    void handleScan();
  }, [focusInventory, state, city]);

  const handleScan = async () => {
    if (!state || !city) {
      toast({ title: 'Pick a market', description: 'Select a state and city before scanning.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-scan', {
        body: {
          state,
          city,
          vertical,
          // Send recent companies (current + rolling history, scoped to this market) so the AI returns fresh leads.
          exclude: Array.from(new Set([
            ...leads.map(l => l.company_name),
            ...seenCompanies,
          ])).slice(0, 60),
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const newLeads: ScanLead[] = data.leads ?? [];
      setLeads(newLeads);
      setSeenCompanies(prev => Array.from(new Set([...newLeads.map(l => l.company_name), ...prev])).slice(0, 120));
      setTopVerticals((data.top_verticals ?? []).sort((a: VerticalShare, b: VerticalShare) => b.share_pct - a.share_pct));
      setLastScanAt(new Date());
      await persistMarket();
      toast({ title: 'Scan complete', description: `${newLeads.length} fresh leads in ${city}, ${state}` });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Scan failed';
      toast({ title: 'Scan failed', description: msg, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const lastScanLabel = lastScanAt
    ? `Last scan: ${Math.max(0, Math.round((Date.now() - lastScanAt.getTime()) / 60000))} min ago`
    : 'No scan yet';

  return (
    <section className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <AiToolCard
          icon="🔥"
          title="Market Heat"
          subtitle={`${city && state ? `${city}, ${state}` : 'Pick a state + city to begin'} · ${lastScanLabel}`}
        >
          <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>
            Live snapshot of your territory. Pick a market and click <strong style={{ color: '#0e1e3a' }}>Scan</strong> — leads, top verticals, and inventory will refresh.
          </p>
        </AiToolCard>
      </div>

      <div className="mb-5">
        <TopVerticals
          data={topVerticals}
          city={city}
          loading={loading}
          selector={
            <MarketSelector
              state={state}
              city={city}
              vertical={vertical}
              loading={loading}
              onChange={handleSelectorChange}
              onScan={handleScan}
            />
          }
        />
      </div>

      <div className="mb-5">
        <LeadFeed leads={leads} city={city} state={state} loading={loading} />
      </div>

      <div>
        <InventoryMap city={city} state={state} focusInventory={focusInventory} />
      </div>
    </section>
  );
};

export default MarketHeatTab;
