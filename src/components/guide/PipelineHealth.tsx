import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const navigate = (tab: string) => window.dispatchEvent(new CustomEvent('flare:navigate-tab', { detail: tab }));

interface Stats {
  active: number;
  weekAdds: number;
  stalled: number;
  conversion: number;
  loading: boolean;
}

export default function PipelineHealth() {
  const [s, setS] = useState<Stats>({ active: 0, weekAdds: 0, stalled: 0, conversion: 0, loading: true });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setS(p => ({ ...p, loading: false })); return; }

      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const { data: rows } = await supabase
        .from('pipeline_items')
        .select('id, created_at, last_followup_at, meeting_booked_at, archived_at, stage')
        .eq('user_id', user.id);

      const all = rows ?? [];
      const active = all.filter(r => !r.archived_at);
      const weekAdds = all.filter(r => r.created_at >= weekAgo).length;
      const stalled = active.filter(r => {
        const last = r.last_followup_at ?? r.created_at;
        return last < weekAgo && !r.meeting_booked_at;
      }).length;
      const totalAdds = all.length;
      const meetings = all.filter(r => r.meeting_booked_at).length;
      const conversion = totalAdds > 0 ? Math.round((meetings / totalAdds) * 100) : 0;

      setS({ active: active.length, weekAdds, stalled, conversion, loading: false });
    })();
  }, []);

  const cards = [
    { label: 'Active pipeline', value: s.active, sub: 'open accounts', color: '#a855f7', bg: 'rgba(168,85,247,.08)' },
    { label: 'Added this week', value: s.weekAdds, sub: 'new in pipeline', color: '#ec4899', bg: 'rgba(236,72,153,.08)' },
    { label: 'Stalled 7+ days', value: s.stalled, sub: 'need a touch', color: '#b91c1c', bg: 'rgba(239,68,68,.08)' },
    { label: 'Meeting rate', value: `${s.conversion}%`, sub: 'added → booked', color: '#0f766e', bg: 'rgba(45,212,191,.1)' },
  ];

  return (
    <div className="mb-5">
      <div className="px-1 mb-2 flex items-center justify-between">
        <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#be185d' }}>📊 Pipeline Health</div>
        <button onClick={() => navigate('prospects')} className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground hover:text-foreground">
          Open pipeline →
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        {cards.map(c => (
          <div
            key={c.label}
            className="p-3 rounded-xl"
            style={{ background: c.bg, border: `1px solid ${c.color}40` }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: c.color }}>{c.label}</div>
            <div className="text-[22px] font-extrabold mt-0.5" style={{ color: '#0e1e3a' }}>{s.loading ? '…' : c.value}</div>
            <div className="text-[10px] text-muted-foreground">{c.sub}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
