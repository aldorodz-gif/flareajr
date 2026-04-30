import Eyebrow from './Eyebrow';

interface GoalsVsPaceProps {
  outreach: { current: number; goal: number };
  meetings: { current: number; goal: number };
  pipeline: { current: number; goal: number };
}

const dayOfWeek = new Date().getDay() || 7; // 1-7 (Mon=1)
const expectedPct = Math.min(1, dayOfWeek / 5); // expect linear pace across 5 work days

const GoalsVsPace = ({ outreach, meetings, pipeline }: GoalsVsPaceProps) => {
  const rows = [
    { label: 'Outreach', current: outreach.current, goal: outreach.goal, fmt: (n: number) => `${n}` },
    { label: 'Meetings', current: meetings.current, goal: meetings.goal, fmt: (n: number) => `${n}` },
    { label: 'Pipeline $', current: pipeline.current, goal: pipeline.goal, fmt: (n: number) => `$${(n / 1000).toFixed(0)}k` },
  ];

  return (
    <div className="p-5 rounded-xl h-full" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.08)' }}>
      <Eyebrow gradient="linear-gradient(90deg, #fb923c, #fbbf24)">This Week</Eyebrow>
      <h3 className="text-[16px] font-extrabold tracking-tight mb-4" style={{ color: '#0e1e3a' }}>Goals vs Pace</h3>

      <div className="flex flex-col gap-4">
        {rows.map((row) => {
          const pct = row.goal > 0 ? row.current / row.goal : 0;
          const pacing = pct >= expectedPct ? 'on-track' : 'behind';
          const barColor = pacing === 'on-track' ? '#10B981' : '#fb923c';
          return (
            <div key={row.label}>
              <div className="flex items-baseline justify-between mb-1.5">
                <span className="text-[12px] font-semibold" style={{ color: '#0e1e3a' }}>{row.label}</span>
                <span className="text-[12px] font-bold tabular-nums" style={{ color: '#475569' }}>
                  {row.fmt(row.current)} <span style={{ color: '#94a3b8' }}>/ {row.fmt(row.goal)}</span>
                </span>
              </div>
              <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(14,30,58,.08)' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, pct * 100)}%`, background: barColor }}
                />
              </div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-wider" style={{ color: barColor }}>
                {pacing === 'on-track' ? '✓ On track' : '⚠ Behind pace'}
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-[10px] italic" style={{ color: '#94a3b8' }}>
        Pace assumes a 5-day work week. Day {dayOfWeek} of 7.
      </p>
    </div>
  );
};

export default GoalsVsPace;
