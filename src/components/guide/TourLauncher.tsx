import { exampleStorageKey, TAB_TOURS } from './tabTours';
import { useBdr } from './BdrContext';

interface Props {
  tabId: string;
}

const TourLauncher = ({ tabId }: Props) => {
  const { selected } = useBdr();
  if (!TAB_TOURS[tabId]) return null;

  const startTour = () => {
    window.dispatchEvent(new CustomEvent('flare:tour:start', { detail: tabId }));
  };
  const showExample = () => {
    try { localStorage.setItem(exampleStorageKey(tabId, selected?.id ?? null), '1'); } catch { /* ignore */ }
    window.dispatchEvent(new CustomEvent('flare:example:show', { detail: tabId }));
  };

  return (
    <div className="flex flex-wrap items-center gap-2 px-6 md:px-12 pt-4">
      <button
        onClick={startTour}
        className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all hover:-translate-y-0.5"
        style={{
          background: 'linear-gradient(135deg, #ec4899, #a855f7)',
          color: '#fff',
          boxShadow: '0 2px 8px rgba(168,85,247,.25)',
        }}
      >
        ▶ Tour this tab
      </button>
      <button
        onClick={showExample}
        className="text-[11px] font-bold px-3 py-1.5 rounded-full transition-all hover:-translate-y-0.5"
        style={{
          background: 'rgba(45,212,191,.15)',
          color: '#0f766e',
          border: '1px solid rgba(45,212,191,.4)',
        }}
      >
        💡 See an example
      </button>
      <span className="text-[11px] text-muted-foreground italic ml-1">
        Optional — auto-runs once per tab per BDR. Stop anytime.
      </span>
    </div>
  );
};

export default TourLauncher;
