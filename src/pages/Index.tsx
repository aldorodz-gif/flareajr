import { useState, useCallback, useEffect } from 'react';
import TopNav from '../components/guide/TopNav';
import WelcomeModal from '../components/guide/WelcomeModal';

import TrackerTab from '../components/guide/TrackerTab';
import DashboardTab from '../components/guide/DashboardTab';
import MarketHeatTab from '../components/guide/MarketHeatTab';

import OutreachTab from '../components/guide/OutreachTab';
import SignalsTab from '../components/guide/SignalsTab';
import EventsTab from '../components/guide/EventsTab';
import OpportunitiesTab from '../components/guide/OpportunitiesTab';
import ProspectsTab from '../components/guide/ProspectsTab';
import SettingsPage from '../components/guide/SettingsPage';

import { BdrProvider } from '../components/guide/BdrContext';
import { ThemeProvider } from '../components/guide/ThemeContext';
import DailySummaryToast from '../components/guide/DailySummaryToast';
import { TAB_ORDER } from '../components/guide/types';

const Index = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [animKey, setAnimKey] = useState(0);
  const [tourOpen, setTourOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const handleTabChange = useCallback((tabId: string) => {
    setActiveTab(tabId);
    setAnimKey(k => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      const tabId = (e as CustomEvent<string>).detail;
      if (tabId && TAB_ORDER.some(t => t.id === tabId)) handleTabChange(tabId);
    };
    window.addEventListener('flare:navigate-tab', handler);
    return () => window.removeEventListener('flare:navigate-tab', handler);
  }, [handleTabChange]);

  const renderTab = () => {
    const props = { onNavigate: handleTabChange };
    switch (activeTab) {
      case 'dashboard': return <DashboardTab />;
      case 'opportunities': return <OpportunitiesTab />;
      case 'market': return <MarketHeatTab />;
      case 'prospects': return <ProspectsTab />;
      case 'tracker': return <TrackerTab {...props} />;
      case 'outreach': return <OutreachTab {...props} />;
      case 'signals': return <SignalsTab {...props} />;
      case 'events': return <EventsTab {...props} />;
      default: return null;
    }
  };

  return (
    <ThemeProvider>
      <BdrProvider>
        <div className="min-h-screen" style={{ background: '#FFFFFF', color: '#0F172A' }}>
          <DailySummaryToast />
          <WelcomeModal onNavigateToTab={handleTabChange} forceOpen={tourOpen} onClose={() => setTourOpen(false)} />
          <TopNav activeTab={activeTab} onTabChange={handleTabChange} onOpenSettings={() => setSettingsOpen(true)} />

          {/* Push content below the fixed 56px nav */}
          <main style={{ paddingTop: 56 }}>
            {settingsOpen ? (
              <SettingsPage onClose={() => setSettingsOpen(false)} />
            ) : (
              <div key={animKey} className="animate-tab-fade">
                {renderTab()}
              </div>
            )}
          </main>

          <footer
            className="flex flex-col md:flex-row justify-between items-center px-6 md:px-12 py-5 gap-2.5"
            style={{ background: '#FFFFFF', borderTop: '1px solid #E2E8F0' }}
          >
            <p className="text-[11px]" style={{ color: '#94A3B8' }}>Flare</p>
            <span className="text-[11px]" style={{ color: '#94A3B8' }}>Created by Aldo Rodriguez</span>
          </footer>
        </div>
      </BdrProvider>
    </ThemeProvider>
  );
};

export default Index;
