import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useBdr } from './BdrContext';

interface Row {
  key: string;
  kind: 'overdue' | 'meeting' | 'lead';
  title: string;
  meta: string;
  badge: string;
  badgeColor: string;
  tab: string;
}

const navigate = (tab: string) => window.dispatchEvent(new CustomEvent('flare:navigate-tab', { detail: tab }));

export default function ActionQueue() {
  const { selected } = useBdr();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      const today = new Date().toISOString().slice(0, 10);
      const weekAhead = new Date(Date.now() + 7 * 86400000).toISOString();

      const [overdueRes, meetRes, leadRes] = await Promise.all([
        user
          ? supabase.from('tasks')
              .select('id, company_name, due_date')
              .eq('user_id', user.id).eq('status', 'pending').lt('due_date', today)
              .order('due_date', { ascending: true }).limit(5)
          : Promise.resolve({ data: [] }),
        user
          ? supabase.from('pipeline_items')
              .select('id, company_name, contact_name, meeting_booked_at, meeting_type')
              .eq('user_id', user.id).is('archived_at', null)
              .not('meeting_booked_at', 'is', null)
              .lte('meeting_booked_at', weekAhead)
              .order('meeting_booked_at', { ascending: true }).limit(3)
          : Promise.resolve({ data: [] }),
        (() => {
          const q = supabase.from('opportunities')
            .select('id, company, vertical, priority, market')
            .eq('priority', 'Top Priority')
            .eq('status', 'new')
            .order('discovery_score', { ascending: false }).limit(3);
          return selected ? q.eq('assigned_bdr', selected.id) : q;
        })(),
      ]);

      if (cancelled) return;
      const out: Row[] = [];

      for (const t of (overdueRes.data ?? []) as { id: string; company_name: string; due_date: string }[]) {
        const days = Math.max(1, Math.floor((Date.now() - new Date(t.due_date).getTime()) / 86400000));
        out.push({
          key: `t-${t.id}`,
          kind: 'overdue',
          title: t.company_name,
          meta: `${days}d overdue · sequenced touch`,
          badge: 'Send now',
          badgeColor: '#b91c1c',
          tab: 'prospects',
        });
      }

      for (const m of (meetRes.data ?? []) as { id: string; company_name: string; contact_name: string | null; meeting_booked_at: string; meeting_type: string | null }[]) {
        const d = new Date(m.meeting_booked_at);
        const isToday = d.toISOString().slice(0, 10) === today;
        const label = isToday
          ? `Today ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`
          : d.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
        out.push({
          key: `m-${m.id}`,
          kind: 'meeting',
          title: m.company_name,
          meta: `${label}${m.contact_name ? ` · ${m.contact_name}` : ''}${m.meeting_type ? ` · ${m.meeting_type}` : ''}`,
          badge: 'Prep',
          badgeColor: '#0f766e',
          tab: 'prospects',
        });
      }

      for (const o of (leadRes.data ?? []) as { id: string; company: string; vertical: string | null; market: string | null }[]) {
        out.push({
          key: `o-${o.id}`,
          kind: 'lead',
          title: o.company,
          meta: `${o.vertical ?? 'Lead'}${o.market ? ` · ${o.market}` : ''}`,
          badge: 'Add',
          badgeColor: '#be185d',
          tab: 'opportunities',
        });
      }

      setRows(out.slice(0, 8));
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [selected?.id]);

  return (
    <div className="mb-5 rounded-2xl overflow-hidden shadow-md" style={{ background: '#FAF7F2', border: '1px solid rgba(14,30,58,.08)' }}>
      <div className="px-5 py-3 flex items-center justify-between" style={{ background: '#fff', borderBottom: '1px solid rgba(14,30,58,.06)' }}>
        <div>
          <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#be185d' }}>🎯 Today's Action Queue</div>
          <div className="text-[13px] font-semibold mt-0.5" style={{ color: '#0e1e3a' }}>What to do right now, in order</div>
        </div>
        <span className="text-[11px] text-muted-foreground">{rows.length} item{rows.length === 1 ? '' : 's'}</span>
      </div>
      <div>
        {loading ? (
          <div className="px-5 py-6 text-[12px] text-muted-foreground">Loading…</div>
        ) : rows.length === 0 ? (
          <div className="px-5 py-6 text-[12px] text-muted-foreground">All clear — no overdue touches, meetings, or top-priority leads waiting. Run a scan or write today's emails.</div>
        ) : (
          rows.map((r, i) => (
            <button
              key={r.key}
              onClick={() => navigate(r.tab)}
              className="w-full px-5 py-3 flex items-center gap-3 text-left transition-all hover:bg-white"
              style={{ borderTop: i === 0 ? 'none' : '1px solid rgba(14,30,58,.06)' }}
            >
              <span className="text-[14px]">{r.kind === 'overdue' ? '🚨' : r.kind === 'meeting' ? '🪩' : '⚡'}</span>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-bold truncate" style={{ color: '#0e1e3a' }}>{r.title}</div>
                <div className="text-[11px] text-muted-foreground truncate">{r.meta}</div>
              </div>
              <span
                className="text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider whitespace-nowrap"
                style={{ background: `${r.badgeColor}15`, color: r.badgeColor, border: `1px solid ${r.badgeColor}40` }}
              >
                {r.badge} →
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
