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

const MetricCard = ({
  label, value, sub, topAccent, onClick,
}: { label: string; value: string | number; sub: string; topAccent: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="text-left transition-colors"
    style={{
      background: '#FFFFFF',
      border: '1px solid #E2E8F0',
      borderTop: `2px solid ${topAccent}`,
      borderRadius: 8,
      padding: 24,
      boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
    }}
    onMouseEnter={(e) => { e.currentTarget.style.background = '#F8FAFC'; }}
    onMouseLeave={(e) => { e.currentTarget.style.background = '#FFFFFF'; }}
  >
    <div
      style={{
        fontSize: 11,
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: '#94A3B8',
      }}
    >
      {label}
    </div>
    <div
      className="tabular-nums"
      style={{
        fontSize: 40,
        fontWeight: 700,
        letterSpacing: '-0.04em',
        color: '#0F172A',
        marginTop: 8,
        lineHeight: 1,
      }}
    >
      {value}
    </div>
    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 4 }}>{sub}</div>
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
      ].join('  ·  ');

  return (
    <div>
      {/* Greeting — no card, directly on the page */}
      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 22,
            fontWeight: 600,
            letterSpacing: '-0.03em',
            color: '#0F172A',
          }}
        >
          {greeting}{selected ? `, ${selected.name}` : ''} — here's your morning
        </div>
        <div style={{ fontSize: 13, color: '#64748B', marginTop: 6 }}>{summary}</div>
      </div>

      {/* 4 metric cards */}
      <div
        className="grid grid-cols-2 md:grid-cols-4"
        style={{ gap: 16, marginBottom: 32 }}
      >
        <MetricCard
          label="Today's Leads"
          value={b.newOppsCount}
          sub={b.highPriorityCount > 0 ? `${b.highPriorityCount} high priority` : 'auto-built overnight'}
          topAccent="#0EA5E9"
          onClick={() => navigate('opportunities')}
        />
        <MetricCard
          label="Due Today"
          value={b.dueToday}
          sub="sequenced touches"
          topAccent="#D97706"
          onClick={() => navigate('prospects')}
        />
        <MetricCard
          label="Overdue"
          value={b.overdue}
          sub={b.nextOverdueCompany ? `Oldest: ${b.nextOverdueCompany}` : 'all caught up'}
          topAccent="#DC2626"
          onClick={() => navigate('prospects')}
        />
        <MetricCard
          label="Meetings"
          value={b.meetingsBooked}
          sub="booked & open"
          topAccent="#16A34A"
          onClick={() => navigate('prospects')}
        />
      </div>

      {b.topCompanies.length > 0 && (
        <div
          className="flex flex-wrap items-center"
          style={{
            background: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: 8,
            padding: '14px 20px',
            gap: 8,
            marginBottom: 32,
            boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.07em',
              color: '#94A3B8',
            }}
          >
            Top picks today
          </span>
          {b.topCompanies.map(c => (
            <button
              key={c}
              onClick={() => navigate('opportunities')}
              className="transition-colors"
              style={{
                background: '#0EA5E9',
                color: '#FFFFFF',
                borderRadius: 6,
                height: 28,
                padding: '0 12px',
                fontSize: 12,
                fontWeight: 500,
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#0284C7'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#0EA5E9'; }}
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
