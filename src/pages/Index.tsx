import { useState, useCallback, useRef } from 'react';
import Header from '../components/guide/Header';
import WelcomeModal from '../components/guide/WelcomeModal';
import TabBar from '../components/guide/TabBar';
import ProgressBar from '../components/guide/ProgressBar';

import TrackerTab from '../components/guide/TrackerTab';
import DashboardTab from '../components/guide/DashboardTab';
import MarketHeatTab from '../components/guide/MarketHeatTab';

import OutreachTab from '../components/guide/OutreachTab';
import SignalsTab from '../components/guide/SignalsTab';
import EventsTab from '../components/guide/EventsTab';
import OpportunitiesTab from '../components/guide/OpportunitiesTab';
import BdrSelector from '../components/guide/BdrSelector';
import { BdrProvider } from '../components/guide/BdrContext';
import { TAB_ORDER } from '../components/guide/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set());
  const [slideDir, setSlideDir] = useState<'right' | 'left'>('right');
  const [animKey, setAnimKey] = useState(0);
  const [tourOpen, setTourOpen] = useState(false);
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
      case 'dashboard': return <DashboardTab />;
      case 'opportunities': return <OpportunitiesTab />;
      case 'market': return <MarketHeatTab />;
      case 'tracker': return <TrackerTab {...props} />;
      case 'outreach': return <OutreachTab {...props} />;
      case 'signals': return <SignalsTab {...props} />;
      case 'events': return <EventsTab {...props} />;
      default: return null;
    }
  };

  return (
    <BdrProvider>
      <div className="min-h-screen bg-background">
        <WelcomeModal onNavigateToTab={handleTabChange} forceOpen={tourOpen} onClose={() => setTourOpen(false)} />
        <Header onReplayTour={() => setTourOpen(true)} />
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
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,.42)' }}>Flare</p>
          <span className="text-[11px] px-3 py-1 rounded-full" style={{ background: 'rgba(99,102,241,.15)', color: '#A5B4FC' }}>Created by Aldo Rodriguez</span>
        </footer>
      </div>
    </BdrProvider>
  );
};

export default Index;
