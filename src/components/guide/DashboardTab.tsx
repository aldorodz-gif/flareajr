import AiToolCard from './AiToolCard';
import BdrScoreboard from './BdrScoreboard';
import BdrSelector from './BdrSelector';

const DashboardTab = () => {
  return (
    <section className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <AiToolCard
          icon="🏠"
          title="Your Dashboard"
          subtitle="Your numbers at a glance — switch BDR to compare"
        >
          <BdrSelector />
        </AiToolCard>
      </div>

      <BdrScoreboard />
    </section>
  );
};

export default DashboardTab;
