import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AiToolCard from './AiToolCard';
import BdrScoreboard from './BdrScoreboard';
import GoalsVsPace from './GoalsVsPace';

const DashboardTab = () => {
  const [goals, setGoals] = useState({ outreach: 25, meetings: 5, pipeline: 100000 });
  const [actuals, setActuals] = useState({ outreach: 0, meetings: 0, pipeline: 0 });

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: settings } = await supabase
        .from('user_settings')
        .select('weekly_goal_outreach, weekly_goal_meetings, weekly_goal_pipeline')
        .eq('user_id', user.id)
        .maybeSingle();

      if (settings) {
        setGoals({
          outreach: settings.weekly_goal_outreach ?? 25,
          meetings: settings.weekly_goal_meetings ?? 5,
          pipeline: settings.weekly_goal_pipeline ?? 100000,
        });
      }

      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      weekStart.setHours(0, 0, 0, 0);

      const [outreachRes, meetingsRes, pipelineRes] = await Promise.all([
        supabase.from('activity_log').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'outreach').gte('logged_at', weekStart.toISOString()),
        supabase.from('activity_log').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('action_type', 'meeting').gte('logged_at', weekStart.toISOString()),
        supabase.from('pipeline_items').select('id', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', weekStart.toISOString()),
      ]);

      setActuals({
        outreach: outreachRes.count ?? 0,
        meetings: meetingsRes.count ?? 0,
        pipeline: (pipelineRes.count ?? 0) * 15000,
      });
    })();
  }, []);

  return (
    <section className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <AiToolCard
          icon="🏠"
          title="Your Dashboard"
          subtitle="Your numbers at a glance — switch BDR to compare"
        >
          <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>
            BDR scoreboard pulls straight from the Sales Forecasting Calculator. For territory leads and inventory, head over to the <strong style={{ color: '#0e1e3a' }}>Market Heat</strong> tab.
          </p>
        </AiToolCard>
      </div>

      <BdrScoreboard />

      <GoalsVsPace
        outreach={{ current: actuals.outreach, goal: goals.outreach }}
        meetings={{ current: actuals.meetings, goal: goals.meetings }}
        pipeline={{ current: actuals.pipeline, goal: goals.pipeline }}
      />
    </section>
  );
};

export default DashboardTab;
