import { Settings } from 'lucide-react';
import { TAB_ORDER } from './types';
import { useBdr } from './BdrContext';
import { useDueTaskCount } from '@/hooks/useDueTaskCount';

interface TopNavProps {
  activeTab: string;
  onTabChange: (tabId: string) => void;
  onOpenSettings?: () => void;
}

/**
 * Fixed top navigation — 56px, dark navy bar over the white app.
 */
const TopNav = ({ activeTab, onTabChange, onOpenSettings }: TopNavProps) => {
  const { bdrs, selected, setSelectedId, loading } = useBdr();
  const dueCount = useDueTaskCount();

  return (
    <nav
      className="fixed top-0 left-0 right-0 flex items-center h-[56px]"
      style={{ background: '#0F172A', zIndex: 100 }}
    >
      {/* Wordmark with accent bar */}
      <div className="flex items-center shrink-0" style={{ paddingLeft: 28, gap: 10 }}>
        <span className="block" style={{ width: 2, height: 16, background: '#0EA5E9' }} />
        <span
          style={{
            color: '#FFFFFF',
            fontWeight: 800,
            fontSize: 16,
            letterSpacing: '-0.04em',
          }}
        >
          FLARE
        </span>
      </div>

      {/* Tabs centered */}
      <div className="flex-1 flex items-center justify-center overflow-x-auto hide-scrollbar">
        {TAB_ORDER.map(tab => {
          const Icon = tab.iconNode;
          const isActive = tab.id === activeTab;
          const color = isActive ? '#FFFFFF' : '#64748B';
          return (
            <button
              key={tab.id}
              data-tab={tab.id}
              data-active={isActive ? 'true' : 'false'}
              onClick={() => onTabChange(tab.id)}
              className="relative inline-flex items-center h-[56px] whitespace-nowrap transition-colors"
              style={{
                color,
                fontSize: 13,
                fontWeight: 500,
                padding: '0 16px',
                gap: 8,
                borderBottom: isActive ? '2px solid #0EA5E9' : '2px solid transparent',
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.color = '#CBD5E1'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.color = '#64748B'; }}
            >
              <Icon size={14} color={color} />
              <span>{tab.label}</span>
              {tab.id === 'prospects' && dueCount > 0 && (
                <span
                  className="ml-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-full leading-none"
                  style={{ background: '#0EA5E9', color: '#FFFFFF' }}
                >
                  {dueCount}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right cluster: BDR + settings */}
      <div className="flex items-center shrink-0" style={{ paddingRight: 28, gap: 8 }}>
        {!loading && bdrs.length > 0 && (
          <select
            value={selected?.id || ''}
            onChange={(e) => setSelectedId(e.target.value)}
            className="outline-none"
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: '#FFFFFF',
              borderRadius: 6,
              height: 32,
              padding: '0 12px',
              fontSize: 13,
            }}
            title="Active BDR"
          >
            {bdrs.map(b => (
              <option key={b.id} value={b.id} style={{ background: '#0F172A', color: '#FFFFFF' }}>
                {b.name}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={() => onOpenSettings?.()}
          className="inline-flex items-center justify-center transition-colors"
          style={{
            height: 32,
            width: 32,
            color: '#64748B',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.color = '#FFFFFF'; }}
          onMouseLeave={(e) => { e.currentTarget.style.color = '#64748B'; }}
          title="Settings"
        >
          <Settings size={16} />
        </button>
      </div>
    </nav>
  );
};

export default TopNav;
