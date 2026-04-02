import { useEffect, useRef, useCallback, useState } from 'react';
import { TAB_ORDER } from './types';

interface TabBarProps {
  activeTab: string;
  visitedTabs: Set<string>;
  onTabChange: (tabId: string) => void;
}

const TabBar = ({ activeTab, visitedTabs, onTabChange }: TabBarProps) => {
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
      className={`sticky top-0 z-20 flex overflow-x-auto hide-scrollbar relative transition-all duration-300 ease-out ${
        isStuck ? 'translate-y-0 opacity-100 shadow-lg' : ''
      }`}
      style={{
        background: '#1E293B',
        borderBottom: '1px solid rgba(99,102,241,.2)',
        boxShadow: isStuck ? '0 4px 20px rgba(0,0,0,.25), 0 0 15px rgba(99,102,241,.15)' : 'none',
      }}
    >
      <div
        ref={sliderRef}
        className="absolute bottom-0 h-[3px] rounded-t-sm pointer-events-none z-10 transition-all duration-300"
        style={{ background: 'linear-gradient(90deg, #8B8FE8, #D97FAA)', boxShadow: '0 0 14px rgba(99,102,241,.5)' }}
      />
      {TAB_ORDER.map((tab) => {
        const isActive = activeTab === tab.id;
        const isVisited = visitedTabs.has(tab.id);
        return (
          <button
            key={tab.id}
            data-tab={tab.id}
            onClick={() => handleClick(tab.id)}
            className={`group relative inline-flex flex-col items-center gap-1 px-3.5 py-2.5 whitespace-nowrap transition-all duration-200 flex-shrink-0 hover:-translate-y-1 hover:scale-110`}
            style={{
              color: isActive ? '#fff' : 'rgba(255,255,255,.5)',
              background: isActive ? 'rgba(99,102,241,.15)' : 'transparent',
              borderRadius: isActive ? '6px 6px 0 0' : '0',
            }}
          >
            <span
              ref={isActive ? activeIconRef : undefined}
              className={`text-[17px] leading-none transition-transform duration-200 ${isActive ? '' : 'grayscale-[0.5] opacity-65'} ${isActive ? 'animate-icon-pop' : ''} ${
                isStuck && !isActive ? 'hover:scale-110' : ''
              }`}
              key={`${tab.id}-${isActive}`}
            >
              {tab.icon}
            </span>
            <span className="text-[10px] leading-none tracking-wide">{tab.label}</span>
            {isVisited && !isActive && (
              <span className="absolute top-1 right-1 text-[8px] font-extrabold" style={{ color: '#EC4899' }}>✓</span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabBar;
