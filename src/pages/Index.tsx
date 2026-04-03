import { useState, useCallback, useRef } from 'react';
import Header from '../components/guide/Header';
import TabBar from '../components/guide/TabBar';
import ProgressBar from '../components/guide/ProgressBar';
import OverviewTab from '../components/guide/OverviewTab';
import MindsetTab from '../components/guide/MindsetTab';
import SetupTab from '../components/guide/SetupTab';
import TrackerTab from '../components/guide/TrackerTab';
import ResultsTab from '../components/guide/ResultsTab';
import ContactTab from '../components/guide/ContactTab';
import OutreachTab from '../components/guide/OutreachTab';
import SignalsTab from '../components/guide/SignalsTab';
import { TAB_ORDER } from '../components/guide/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('workflow');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set());
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');
  const [animKey, setAnimKey] = useState(0);
  const tabBarRef = useRef<HTMLDivElement>(null);

  const handleTabChange = useCallback((tabId: string) => {
    const prevIdx = TAB_ORDER.findIndex(t => t.id === activeTab);
    const nextIdx = TAB_ORDER.findIndex(t => t.id === tabId);
    setSlideDir(nextIdx >= prevIdx ? 'right' : 'left');
    setVisitedTabs(prev => new Set([...prev, activeTab]));
    setActiveTab(tabId);
    setAnimKey(k => k + 1);
    setTimeout(() => {
      tabBarRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }, [activeTab]);

  const renderTab = () => {
    const props = { onNavigate: handleTabChange };
    switch (activeTab) {
      case 'workflow': return <OverviewTab {...props} />;
      case 'mindset': return <MindsetTab {...props} />;
      case 'setup': return <SetupTab {...props} />;
      case 'tracker': return <TrackerTab {...props} />;
      case 'results': return <ResultsTab {...props} />;
      case 'contact': return <ContactTab {...props} />;
      case 'outreach': return <OutreachTab {...props} />;
      case 'signals': return <SignalsTab {...props} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div ref={tabBarRef}>
        <TabBar activeTab={activeTab} visitedTabs={visitedTabs} onTabChange={handleTabChange} />
      </div>
      <ProgressBar activeTab={activeTab} />
      <div
        key={animKey}
        className={slideDir === 'right' ? 'animate-slide-right' : 'animate-slide-left'}
      >
        {renderTab()}
      </div>
      <footer className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-5 gap-2.5" style={{ background: '#1E293B', borderTop: '1px solid rgba(99,102,241,.15)' }}>
        <p className="text-[11px]" style={{ color: 'rgba(255,255,255,.42)' }}>ChatGPT Prospecting Agent Setup Guide</p>
        <span className="text-[11px] px-3 py-1 rounded-full" style={{ background: 'rgba(99,102,241,.15)', color: '#A5B4FC' }}>Aldo Rodriguez</span>
      </footer>
    </div>
  );
};

export default Index;
