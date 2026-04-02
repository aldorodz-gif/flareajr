import { TAB_ORDER } from './types';

interface ProgressBarProps {
  activeTab: string;
}

const ProgressBar = ({ activeTab }: ProgressBarProps) => {
  const idx = TAB_ORDER.findIndex(t => t.id === activeTab);
  const pct = Math.round(((idx + 1) / TAB_ORDER.length) * 100);

  return (
    <div className="h-[3px] relative overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
      <div
        className="h-full rounded-r-sm transition-all duration-400"
        style={{
          width: `${pct}%`,
          background: 'linear-gradient(90deg, #8B8FE8, #D97FAA)',
          boxShadow: '0 0 8px rgba(99,102,241,.4)',
        }}
      />
    </div>
  );
};

export default ProgressBar;
