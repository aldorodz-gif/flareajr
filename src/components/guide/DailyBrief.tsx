import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBdr } from './BdrContext';

interface BriefData {
  newOppsCount: number;
  topCompanies: string[];
  highPriorityCount: number;
  dueToday: number;
  overdue: number;
  nextOverdueCompany: string | null;
  meetingsBooked: number;
  loading: boolean;
}

const navigate = (tab: string) => window.dispatchEvent(new CustomEvent('flare:navigate-tab', { detail: tab }));

const StatCard = ({
  label, value, sub, accent, onClick,
}: { label: string; value: string | number; sub: string; accent: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="text-left rounded-lg transition-colors"
    style={{
      background: '#18181B',
      border: '1px solid #27272A',
      borderLeft: `3px solid ${accent}`,
      padding: '20px 24px',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = '#1F1F23'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = '#18181B'; }}
  >
    <div className="text-[32px] font-semibold leading-none tabular-nums" style={{ color: '#FAFAFA' }}>
      {value}
    </div>
    <div
      className="mt-2 text-[11px] font-medium uppercase"
      style={{ color: '#71717A', letterSpacing: '0.08em' }}
    >
      {label}
    </div>
    <div className="mt-1 text-[11px]" style={{ color: '#71717A' }}>{sub}</div>
  </button>
);

const DailyBrief = () => {
  const { selected } = useBdr();
  const [b, setB] = useState<BriefData>({
    newOppsCount: 0, topCompanies: [], highPriorityCount: 0,
    dueToday: 0, overdue: 0, nextOverdueCompany: null, meetingsBooked: 0,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setB(prev => ({ ...prev, loading: true }));
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const today = new Date().toISOString().slice(0, 10);
      const { data: { user } } = await supabase.auth.getUser();

      const oppsQ = supabase
        .from('opportunities')
        .select('company, priority, discovery_score')
        .gte('created_at', since)
        .order('discovery_score', { ascending: false });
      const opps = selected ? oppsQ.eq('assigned_bdr', selected.id) : oppsQ;

      const [oppsRes, dueRes, overdueRes, nextOverdueRes, meetRes] = await Promise.all([
        opps,
        user
          ? supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending').eq('due_date', today)
          : Promise.resolve({ count: 0 } as { count: number }),
        user
          ? supabase.from('tasks').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'pending').lt('due_date', today)
          : Promise.resolve({ count: 0 } as { count: number }),
        user
          ? supabase.from('tasks').select('company_name, due_date').eq('user_id', user.id).eq('status', 'pending').lt('due_date', today).order('due_date', { ascending: true }).limit(1)
          : Promise.resolve({ data: [] as { company_name: string; due_date: string }[] }),
        user
          ? supabase.from('pipeline_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id).not('meeting_booked_at', 'is', null).is('archived_at', null)
          : Promise.resolve({ count: 0 } as { count: number }),
      ]);

      if (cancelled) return;
      const oppsRows = (oppsRes as { data: { company: string; priority: string | null }[] | null }).data ?? [];
      const high = oppsRows.filter(o => o.priority === 'Top Priority');
      setB({
        newOppsCount: oppsRows.length,
        topCompanies: oppsRows.slice(0, 3).map(o => o.company),
        highPriorityCount: high.length,
        dueToday: (dueRes as { count: number | null }).count ?? 0,
        overdue: (overdueRes as { count: number | null }).count ?? 0,
        nextOverdueCompany: ((nextOverdueRes as { data: { company_name: string }[] | null }).data ?? [])[0]?.company_name ?? null,
        meetingsBooked: (meetRes as { count: number | null }).count ?? 0,
        loading: false,
      });
    })();

    const refresh = () => setB(prev => ({ ...prev }));
    window.addEventListener('flare:tasks-updated', refresh);
    return () => {
      cancelled = true;
      window.removeEventListener('flare:tasks-updated', refresh);
    };
  }, [selected?.id]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 18) return 'Good afternoon';
    return 'Good evening';
  })();

  const summary = b.loading
    ? 'Loading…'
    : [
        `${b.newOppsCount} new lead${b.newOppsCount === 1 ? '' : 's'}`,
        `${b.dueToday} due today`,
        `${b.overdue} overdue`,
        `${b.meetingsBooked} meeting${b.meetingsBooked === 1 ? '' : 's'} booked`,
      ].join(' · ');

  return (
    <div className="flex flex-col gap-6">
      {/* Briefing header card — solid surface, no gradient */}
      <div
        className="rounded-lg"
        style={{ background: '#18181B', border: '1px solid #27272A', padding: '20px 24px' }}
      >
        <div className="text-[18px] font-semibold tracking-tight" style={{ color: '#FAFAFA' }}>
          {greeting}{selected ? `, ${selected.name}` : ''} — here's your morning
        </div>
        <div className="text-[12px] mt-1" style={{ color: '#71717A' }}>{summary}</div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          label="Today's Leads"
          value={b.newOppsCount}
          sub={b.highPriorityCount > 0 ? `${b.highPriorityCount} high priority` : 'auto-built overnight'}
          accent="#6366F1"
          onClick={() => navigate('opportunities')}
        />
        <StatCard
          label="Due Today"
          value={b.dueToday}
          sub="sequenced touches"
          accent="#F59E0B"
          onClick={() => navigate('prospects')}
        />
        <StatCard
          label="Overdue"
          value={b.overdue}
          sub={b.nextOverdueCompany ? `Oldest: ${b.nextOverdueCompany}` : 'all caught up'}
          accent="#EF4444"
          onClick={() => navigate('prospects')}
        />
        <StatCard
          label="Meetings"
          value={b.meetingsBooked}
          sub="booked & open"
          accent="#10B981"
          onClick={() => navigate('prospects')}
        />
      </div>

      {b.topCompanies.length > 0 && (
        <div
          className="rounded-lg flex flex-wrap items-center gap-2"
          style={{ background: '#18181B', border: '1px solid #27272A', padding: '14px 20px' }}
        >
          <span
            className="text-[11px] font-medium uppercase"
            style={{ color: '#71717A', letterSpacing: '0.08em' }}
          >
            Top picks today
          </span>
          {b.topCompanies.map(c => (
            <button
              key={c}
              onClick={() => navigate('opportunities')}
              className="text-[12px] font-medium px-3 py-1 rounded-md transition-colors"
              style={{ background: '#6366F1', color: '#fff' }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#4F46E5'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#6366F1'; }}
            >
              {c}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyBrief;
