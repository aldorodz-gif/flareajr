import { useEffect, useRef, useCallback, useState } from 'react';
import { TAB_ORDER } from './types';
import { useDueTaskCount } from '@/hooks/useDueTaskCount';

interface TabBarProps {
  activeTab: string;
  visitedTabs: Set<string>;
  onTabChange: (tabId: string) => void;
}

const TabBar = ({ activeTab, visitedTabs, onTabChange }: TabBarProps) => {
  const dueCount = useDueTaskCount();
  const barRef = useRef<HTMLDivElement>(null);
  const sliderRef = useRef<HTMLDivElement>(null);
  const activeIconRef = useRef<HTMLSpanElement | null>(null);
  const [isStuck, setIsStuck] = useState(false);

  // Detect when tab bar becomes sticky (scrolled past its natural position)
  useEffect(() => {
    const bar = barRef.current;
    if (!bar) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // When the sentinel goes out of view, the bar is stuck
        setIsStuck(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: '0px 0px 0px 0px' }
    );

    // Create a sentinel element right above the tab bar
    const sentinel = document.createElement('div');
    sentinel.style.height = '1px';
    sentinel.style.position = 'absolute';
    sentinel.style.top = '-1px';
    sentinel.style.left = '0';
    sentinel.style.right = '0';
    sentinel.style.pointerEvents = 'none';
    bar.style.position = 'relative';
    bar.prepend(sentinel);
    observer.observe(sentinel);

    return () => {
      observer.disconnect();
      sentinel.remove();
    };
  }, []);

  const moveSlider = useCallback(() => {
    if (!barRef.current || !sliderRef.current) return;
    const activeBtn = barRef.current.querySelector(`[data-tab="${activeTab}"]`) as HTMLElement;
    if (!activeBtn) return;
    const barRect = barRef.current.getBoundingClientRect();
    const btnRect = activeBtn.getBoundingClientRect();
    sliderRef.current.style.width = `${btnRect.width}px`;
    sliderRef.current.style.left = `${btnRect.left - barRect.left + barRef.current.scrollLeft}px`;
  }, [activeTab]);

  useEffect(() => {
    requestAnimationFrame(moveSlider);
    window.addEventListener('resize', moveSlider);
    return () => window.removeEventListener('resize', moveSlider);
  }, [moveSlider]);

  const handleClick = (tabId: string) => {
    onTabChange(tabId);
    const btn = barRef.current?.querySelector(`[data-tab="${tabId}"]`) as HTMLElement;
    btn?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  };

  return (
    <div
      ref={barRef}
      data-shell="tab-bar"
      className={`sticky top-0 z-20 flex overflow-x-auto hide-scrollbar relative transition-all duration-300 ease-out ${
        isStuck ? 'translate-y-0 opacity-100 shadow-lg' : ''
      }`}
      style={{
        background: '#1E293B',
        borderBottom: '1px solid rgba(155,120,200,.25)',
        boxShadow: isStuck ? '0 4px 20px rgba(0,0,0,.25), 0 0 15px rgba(155,120,200,.15)' : 'none',
      }}
    >
      <div
        ref={sliderRef}
        data-shell="tab-slider"
        className="absolute bottom-0 h-[3px] rounded-t-sm pointer-events-none z-10 transition-all duration-300"
        style={{ background: 'linear-gradient(90deg, #16A34A, #DC2626 55%, #0EA5E9)', boxShadow: '0 0 14px rgba(236,72,153,.55)' }}
      />
      {TAB_ORDER.map((tab) => {
        const isActive = activeTab === tab.id;
        const isVisited = visitedTabs.has(tab.id);
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            data-active={isActive ? 'true' : 'false'}
            onClick={() => handleClick(tab.id)}
            className={`group relative inline-flex flex-col items-center gap-1 px-3.5 py-2.5 whitespace-nowrap transition-all duration-200 flex-shrink-0 hover:-translate-y-1 hover:scale-110 hover:text-white`}
            style={{
              color: isActive ? '#fff' : 'rgba(255,255,255,.78)',
              background: isActive ? 'rgba(236,72,153,.16)' : 'transparent',
              borderRadius: isActive ? '6px 6px 0 0' : '0',
            }}
          >
            <span
              ref={isActive ? activeIconRef : undefined}
              className={`relative text-[17px] leading-none transition-all duration-200 ${isActive ? '' : 'opacity-90 group-hover:opacity-100'} ${isActive ? 'animate-icon-pop' : ''}`}
              key={`${tab.id}-${isActive}`}
            >
              {tab.icon}
              {tab.id === 'prospects' && dueCount > 0 && (
                <span
                  className="absolute -top-1.5 -right-3 text-[9px] font-extrabold px-1.5 py-0.5 rounded-full leading-none"
                  style={{ background: '#DC2626', color: '#fff', boxShadow: '0 0 8px rgba(236,72,153,.6)' }}
                >
                  {dueCount}
                </span>
              )}
            </span>
            <span className="text-[11px] leading-none tracking-wide font-medium transition-colors duration-200 group-hover:text-white">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
