import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface State {
  streak: number;
  weekTouches: number;
  goalTouches: number;
  goalPipeline: number;
  loading: boolean;
}

export default function MomentumCard() {
  const [s, setS] = useState<State>({ streak: 0, weekTouches: 0, goalTouches: 25, goalPipeline: 100000, loading: true });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setS(p => ({ ...p, loading: false })); return; }

      const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
      const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString();

      const [tasksRes, settingsRes] = await Promise.all([
        supabase.from('tasks').select('completed_at').eq('user_id', user.id).eq('status', 'done').gte('completed_at', monthAgo),
        supabase.from('user_settings').select('weekly_goal_outreach, weekly_goal_pipeline').eq('user_id', user.id).maybeSingle(),
      ]);

      const completed = (tasksRes.data ?? []).map(t => t.completed_at).filter(Boolean) as string[];
      const days = new Set(completed.map(c => c.slice(0, 10)));

      // streak: walk back from today
      let streak = 0;
      for (let i = 0; i < 30; i++) {
        const d = new Date(Date.now() - i * 86400000).toISOString().slice(0, 10);
        if (days.has(d)) streak++;
        else if (i > 0) break; // today missing is OK if it's early
      }

      const weekTouches = completed.filter(c => c >= weekAgo).length;
      const goalTouches = settingsRes.data?.weekly_goal_outreach ?? 25;
      const goalPipeline = settingsRes.data?.weekly_goal_pipeline ?? 100000;

      setS({ streak, weekTouches, goalTouches, goalPipeline, loading: false });
    })();
  }, []);

  const pct = Math.min(100, Math.round((s.weekTouches / Math.max(1, s.goalTouches)) * 100));

  return (
    <div className="mb-5 rounded-2xl overflow-hidden shadow-md" style={{ border: '1px solid rgba(45,212,191,.3)' }}>
      <div className="px-5 py-4" style={{ background: 'linear-gradient(135deg, #0e1e3a 0%, #1e3a5f 60%, #0f766e 100%)' }}>
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#5eead4' }}>🔥 Your Momentum</div>
            <div className="text-[16px] font-extrabold mt-0.5" style={{ color: '#fff' }}>
              {s.loading ? 'Loading…' : s.streak === 0 ? 'Start your streak today' : `${s.streak}-day streak`}
            </div>
            <div className="text-[11px] mt-0.5" style={{ color: '#cbd5e1' }}>
              At least one outreach sent each day
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#5eead4' }}>This week</div>
            <div className="text-[22px] font-extrabold leading-none mt-1" style={{ color: '#fff' }}>
              {s.weekTouches}<span className="text-[14px] font-bold" style={{ color: '#94a3b8' }}> / {s.goalTouches}</span>
            </div>
            <div className="text-[10px]" style={{ color: '#cbd5e1' }}>touches sent</div>
          </div>
        </div>
        <div className="mt-3 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,.1)' }}>
          <div
            className="h-full transition-all duration-500"
            style={{ width: `${pct}%`, background: 'linear-gradient(90deg, #2dd4bf, #ec4899)' }}
          />
        </div>
        <div className="mt-1.5 text-[10px]" style={{ color: '#94a3b8' }}>
          {pct >= 100 ? '🎯 Weekly goal hit' : `${100 - pct}% to weekly goal`}
        </div>
      </div>
    </div>
  );
}
