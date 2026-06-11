import { Settings } from 'lucide-react';
import { TAB_ORDER } from './types';
import { useBdr } from './BdrContext';
import { useDueTaskCount } from '@/hooks/useDueTaskCount';

interface TopNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
}

/**
 * Fixed top navigation: FLARE wordmark + tabs (Lucide icons) + Active BDR + Settings.
 * Height 52px, solid dark surface, single bottom border.
 */
const TopNav = ({ activeTab, onTabChange }: TopNavProps) => {
  const { bdrs, selected, setSelectedId, loading } = useBdr();
  const dueCount = useDueTaskCount();

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 flex items-center h-[52px] px-4"
      style={{ background: '#09090B', borderBottom: '1px solid #27272A' }}
    >
      {/* Wordmark with accent bar */}
      <div className="flex items-center gap-2.5 shrink-0">
        <span className="block h-5 w-[6px] rounded-sm" style={{ background: '#6366F1' }} />
        <span className="text-[15px] font-bold tracking-tight" style={{ color: '#FAFAFA' }}>
          FLARE
        </span>
      </div>

      {/* Tabs centered */}
      <div className="flex-1 flex items-center justify-center gap-0.5 overflow-x-auto hide-scrollbar mx-4">
        {TAB_ORDER.map(tab => {
          const Icon = tab.iconNode;
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => onTabChange(tab.id)}
              className="relative inline-flex items-center gap-1.5 h-[52px] px-3 whitespace-nowrap transition-colors"
              style={{
                color: isActive ? '#FAFAFA' : '#71717A',
                fontSize: 13,
                fontWeight: 500,
                borderBottom: isActive ? '2px solid #6366F1' : '2px solid transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#FAFAFA'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#71717A'; }}
            >
              <Icon size={14} />
              <span>{tab.label}</span>
              {tab.id === 'prospects' && dueCount > 0 && (
                <span
                  className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                  style={{ background: '#6366F1', color: '#fff' }}
                >
                  {dueCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Active BDR dropdown + settings */}
      <div className="flex items-center gap-2 shrink-0">
        {!loading && bdrs.length > 0 && (
          <select
            value={selected?.id || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-8 px-2.5 rounded-md text-[12px] font-medium outline-none"
            style={{
              background: '#18181B',
              color: '#FAFAFA',
              border: '1px solid #27272A',
            }}
            title="Active BDR"
          >
            {bdrs.map(b => (
              <option key={b.id} value={b.id} style={{ background: '#18181B', color: '#FAFAFA' }}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <button
          className="inline-flex items-center justify-center h-8 w-8 rounded-md transition-colors"
          style={{ background: 'transparent', border: '1px solid #27272A', color: '#71717A' }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FAFAFA'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#71717A'; }}
          title="Settings"
        >
          <Settings size={14} />
        </button>
      </div>
    </nav>
  );
};

export default TopNav;
