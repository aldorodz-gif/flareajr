import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import AiToolCard from './AiToolCard';
import BdrScoreboard from './BdrScoreboard';

const DashboardTab = () => {

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
