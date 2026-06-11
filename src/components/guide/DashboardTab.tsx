import BdrScoreboard from './BdrScoreboard';
import DailyBrief from './DailyBrief';

const DashboardTab = () => {
  return (
    <section
      style={{
        maxWidth: 1400,
        margin: '0 auto',
        padding: '32px 40px',
      }}
    >
      <DailyBrief />
      <BdrScoreboard />
    </section>
  );
};

export default DashboardTab;
