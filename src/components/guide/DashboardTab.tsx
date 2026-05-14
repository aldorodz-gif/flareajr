import AiToolCard from './AiToolCard';
import BdrSelector from './BdrSelector';
import DailyBrief from './DailyBrief';

const DashboardTab = () => {
  return (
    <section className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <AiToolCard
          icon="🏠"
          title="Your Dashboard"
          subtitle="Your numbers at a glance"
        >
          <BdrSelector />
        </AiToolCard>
      </div>

      <DailyBrief />
    </section>
  );
};

export default DashboardTab;
