import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import AiToolCard from './AiToolCard';
import MarketSelector from './MarketSelector';
import GoalsVsPace from './GoalsVsPace';
import TopVerticals, { VerticalShare } from './TopVerticals';
import LeadFeed, { ScanLead } from './LeadFeed';
import InventoryMap from './InventoryMap';

const DashboardTab = () => {
  const [state, setState] = useState('');
  const [city, setCity] = useState('');
  const [vertical, setVertical] = useState('all');
  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<ScanLead[]>([]);
  const [topVerticals, setTopVerticals] = useState<VerticalShare[]>([]);
  const [lastScanAt, setLastScanAt] = useState<Date | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  // Goals (placeholder pulled from user_settings; current values read from existing tables)
  const [goals, setGoals] = useState({ outreach: 25, meetings: 5, pipeline: 100000 });
  const [actuals, setActuals] = useState({ outreach: 0, meetings: 0, pipeline: 0 });

  // Load saved market preferences + goals
  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      setUserId(user.id);

      const { data: settings } = await supabase
        .from('user_settings')
        .select('home_state, home_city, home_vertical, weekly_goal_outreach, weekly_goal_meetings, weekly_goal_pipeline, last_scan_at')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settings) {
        if (settings.home_state) setState(settings.home_state);
        if (settings.home_city) setCity(settings.home_city);
        if (settings.home_vertical) setVertical(settings.home_vertical);
        setGoals({
          outreach: settings.weekly_goal_outreach ?? 25,
          meetings: settings.weekly_goal_meetings ?? 5,
          pipeline: settings.weekly_goal_pipeline ?? 100000,
        });
        if (settings.last_scan_at) setLastScanAt(new Date(settings.last_scan_at));
      }

      // Compute weekly actuals from existing tables
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
      weekStart.setHours(0, 0, 0, 0);

      const [outreachRes, meetingsRes, pipelineRes] = await Promise.all([
        supabase.from('activity_log').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'outreach').gte('logged_at', weekStart.toISOString()),
        supabase.from('activity_log').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'meeting').gte('logged_at', weekStart.toISOString()),
        supabase.from('pipeline_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', weekStart.toISOString()),
      ]);

      setActuals({
        outreach: outreachRes.count ?? 0,
        meetings: meetingsRes.count ?? 0,
        pipeline: (pipelineRes.count ?? 0) * 15000, // rough placeholder $/deal
      });
    })();
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

  const handleScan = async () => {
    if (!state || !city) {
      toast({ title: 'Pick a market', description: 'Select a state and city before scanning.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('dashboard-scan', {
        body: { state, city, vertical },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      setLeads(data.leads ?? []);
      setTopVerticals((data.top_verticals ?? []).sort((a: VerticalShare, b: VerticalShare) => b.share_pct - a.share_pct));
      setLastScanAt(new Date());
      await persistMarket();
      toast({ title: 'Scan complete', description: `${data.leads?.length ?? 0} leads in ${city}, ${state}` });
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
          icon="🏠"
          title="Your Market Dashboard"
          subtitle={`${city && state ? `${city}, ${state}` : 'Pick a market in Market Heat to begin'} · ${lastScanLabel}`}
        >
          <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>
            Live snapshot of your territory. Use the <strong style={{ color: '#0e1e3a' }}>Market Heat</strong> panel below to choose a market and refresh the scan — leads, verticals, and inventory will update automatically.
          </p>
        </AiToolCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <GoalsVsPace
          outreach={{ current: actuals.outreach, goal: goals.outreach }}
          meetings={{ current: actuals.meetings, goal: goals.meetings }}
          pipeline={{ current: actuals.pipeline, goal: goals.pipeline }}
        />
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
        <InventoryMap city={city} state={state} />
      </div>
    </section>
  );
};

export default DashboardTab;
