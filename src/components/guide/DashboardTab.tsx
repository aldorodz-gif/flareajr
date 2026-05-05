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
    </section>
  );
};

export default DashboardTab;
