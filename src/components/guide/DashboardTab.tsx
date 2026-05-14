import AiToolCard from './AiToolCard';
import BdrSelector from './BdrSelector';
import DailyBrief from './DailyBrief';
import ActionQueue from './ActionQueue';
import PipelineHealth from './PipelineHealth';
import MomentumCard from './MomentumCard';

const DashboardTab = () => {
  return (
    <section className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <AiToolCard
          icon="🏠"
          title="Your Dashboard"
          subtitle="Your morning launch pad — what to do, what's in flight, where you stand"
        >
          <BdrSelector />
        </AiToolCard>
      </div>

      <DailyBrief />
      <ActionQueue />
      <PipelineHealth />
      <MomentumCard />
    </section>
  );
};

export default DashboardTab;
