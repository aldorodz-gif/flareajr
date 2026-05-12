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

    const refresh = () => {
      // re-trigger
      setB(prev => ({ ...prev }));
    };
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

  return (
    <div className="mb-5 rounded-2xl overflow-hidden shadow-xl" style={{ border: '1px solid rgba(168,85,247,.25)' }}>
      <div className="px-5 py-4 relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #2d1b69 55%, #4a2080 100%)' }}>
        <div className="absolute top-0 right-0 w-40 h-40 opacity-30 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(236,72,153,.5), transparent 70%)' }} />
        <div className="relative z-10 flex items-start justify-between gap-3">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f9a8d4' }}>☕ Daily Briefing</div>
            <div className="text-[20px] font-extrabold tracking-tight mt-0.5" style={{ color: '#fff' }}>
              {greeting}{selected ? `, ${selected.name}` : ''} — here's your morning
            </div>
            <div className="text-[12px] mt-1" style={{ color: '#cbd5e1' }}>
              {b.loading ? 'Loading…' : `${b.newOppsCount} new lead${b.newOppsCount === 1 ? '' : 's'} · ${b.dueToday} due today · ${b.overdue} overdue · ${b.meetingsBooked} meeting${b.meetingsBooked === 1 ? '' : 's'} booked`}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 grid grid-cols-2 md:grid-cols-4 gap-2.5" style={{ background: '#FAF7F2' }}>
        <button
          onClick={() => navigate('opportunities')}
          className="text-left p-3 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: 'linear-gradient(135deg, rgba(236,72,153,.08), rgba(168,85,247,.06))', border: '1px solid rgba(236,72,153,.25)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#be185d' }}>⚡ Today's Leads</div>
          <div className="text-[22px] font-extrabold mt-0.5" style={{ color: '#0e1e3a' }}>{b.newOppsCount}</div>
          <div className="text-[10px] text-muted-foreground">{b.highPriorityCount > 0 ? `${b.highPriorityCount} high priority` : 'auto-built overnight'}</div>
        </button>

        <button
          onClick={() => navigate('prospects')}
          className="text-left p-3 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: 'rgba(236,72,153,.08)', border: '1px solid rgba(236,72,153,.25)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#be185d' }}>⏰ Due today</div>
          <div className="text-[22px] font-extrabold mt-0.5" style={{ color: '#0e1e3a' }}>{b.dueToday}</div>
          <div className="text-[10px] text-muted-foreground">sequenced touches</div>
        </button>

        <button
          onClick={() => navigate('prospects')}
          className="text-left p-3 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.3)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#b91c1c' }}>🚨 Overdue</div>
          <div className="text-[22px] font-extrabold mt-0.5" style={{ color: '#0e1e3a' }}>{b.overdue}</div>
          <div className="text-[10px] text-muted-foreground truncate">{b.nextOverdueCompany ? `Oldest: ${b.nextOverdueCompany}` : 'all caught up'}</div>
        </button>

        <button
          onClick={() => navigate('prospects')}
          className="text-left p-3 rounded-lg transition-all hover:-translate-y-0.5 hover:shadow-md"
          style={{ background: 'rgba(45,212,191,.1)', border: '1px solid rgba(45,212,191,.35)' }}
        >
          <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#0f766e' }}>🪩 Meetings</div>
          <div className="text-[22px] font-extrabold mt-0.5" style={{ color: '#0e1e3a' }}>{b.meetingsBooked}</div>
          <div className="text-[10px] text-muted-foreground">booked & open</div>
        </button>
      </div>

      {b.topCompanies.length > 0 && (
        <div className="px-4 py-3 flex flex-wrap items-center gap-2" style={{ background: '#fff', borderTop: '1px solid rgba(14,30,58,.06)' }}>
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Top picks today:</span>
          {b.topCompanies.map(c => (
            <button
              key={c}
              onClick={() => navigate('opportunities')}
              className="text-[11px] font-bold px-2.5 py-1 rounded-full transition-all hover:-translate-y-0.5"
              style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', color: '#fff' }}
            >
              {c} →
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default DailyBrief;
