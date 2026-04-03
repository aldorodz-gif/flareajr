import { TAB_ORDER } from './types';

interface SectionNavProps {
  currentTab: string;
  onNavigate: (tabId: string) => void;
}

const SectionNav = ({ currentTab, onNavigate }: SectionNavProps) => {
  const idx = TAB_ORDER.findIndex(t => t.id === currentTab);
  const prev = idx > 0 ? TAB_ORDER[idx - 1] : null;
  const next = idx < TAB_ORDER.length - 1 ? TAB_ORDER[idx + 1] : null;

  return (
    <div className="mt-7 pt-5 border-t border-foreground/10 flex justify-between gap-4 flex-wrap">
      {prev ? (
        <button
          onClick={() => onNavigate(prev.id)}
          className="flex-1 min-w-[240px] flex items-center gap-3 p-4 text-left transition-colors duration-200 border"
          style={{ background: '#fff', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F0FA'; e.currentTarget.style.borderColor = '#9B78C8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
        >
          <span className="text-[22px]" style={{ color: '#9B78C8' }}>←</span>
          <span className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Previous section</span>
            <span className="text-[16px] font-semibold text-foreground">{prev.label}</span>
          </span>
        </button>
      ) : <div className="flex-1 min-w-[180px]" />}
      {next && (
        <button
          onClick={() => onNavigate(next.id)}
          className="flex-1 min-w-[240px] flex items-center justify-between gap-3 p-4 text-left transition-colors duration-200 border"
          style={{ background: '#fff', borderColor: '#E2E8F0', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}
          onMouseEnter={e => { e.currentTarget.style.background = '#F5F0FA'; e.currentTarget.style.borderColor = '#9B78C8'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.borderColor = '#E2E8F0'; }}
        >
          <span className="flex flex-col gap-0.5">
            <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: '#94A3B8' }}>Next section</span>
            <span className="text-[16px] font-semibold text-foreground">{next.label}</span>
          </span>
          <span className="text-[22px]" style={{ color: '#9B78C8' }}>→</span>
        </button>
      )}
    </div>
  );
};

export default SectionNav;