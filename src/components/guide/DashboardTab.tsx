import BdrScoreboard from './BdrScoreboard';
import DailyBrief from './DailyBrief';

const DashboardTab = () => {
  return (
    <section className="max-w-[1400px] mx-auto" style={{ padding: '24px' }}>
      <div className="mb-6">
        <h1 className="text-[20px] font-semibold tracking-tight" style={{ color: '#FAFAFA' }}>
          Dashboard
        </h1>
        <p className="text-[12px] mt-1" style={{ color: '#71717A' }}>
          Your numbers at a glance — switch BDR in the top nav to compare.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        <DailyBrief />
        <BdrScoreboard />
      </div>
    </section>
  );
};

export default DashboardTab;
