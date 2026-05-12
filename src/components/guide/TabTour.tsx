import { useEffect, useState, useLayoutEffect, useRef } from 'react';
import { TAB_TOURS, tourStorageKey, exampleStorageKey } from './tabTours';

interface Props {
  tabId: string;
}

interface Rect { top: number; left: number; width: number; height: number; }

const PADDING = 8;
const TOOLTIP_W = 360;
const TOOLTIP_GAP = 14;

const TabTour = ({ tabId }: Props) => {
  const tour = TAB_TOURS[tabId];
  const [open, setOpen] = useState(false);
  const [stepIdx, setStepIdx] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [showExample, setShowExample] = useState(false);
  const lastTabRef = useRef<string>('');

  // Auto-start once per tab
  useEffect(() => {
    if (!tour) return;
    if (lastTabRef.current === tabId) return;
    lastTabRef.current = tabId;
    setOpen(false);
    setStepIdx(0);
    setShowExample(false);
    try {
      if (!localStorage.getItem(tourStorageKey(tabId))) {
        // small delay so tab content renders first
        const t = window.setTimeout(() => setOpen(true), 350);
        return () => window.clearTimeout(t);
      }
    } catch { /* ignore */ }
  }, [tabId, tour]);

  // Listen for manual replay/example triggers from the launcher
  useEffect(() => {
    const startHandler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id === tabId) { setStepIdx(0); setOpen(true); }
    };
    const exampleHandler = (e: Event) => {
      const id = (e as CustomEvent<string>).detail;
      if (id === tabId) setShowExample(true);
    };
    window.addEventListener('flare:tour:start', startHandler);
    window.addEventListener('flare:example:show', exampleHandler);
    return () => {
      window.removeEventListener('flare:tour:start', startHandler);
      window.removeEventListener('flare:example:show', exampleHandler);
    };
  }, [tabId]);

  // Restore example sticky state
  useEffect(() => {
    if (!tour) return;
    try {
      setShowExample(localStorage.getItem(exampleStorageKey(tabId)) === '1');
    } catch { /* ignore */ }
  }, [tabId, tour]);

  // Track target rect
  useLayoutEffect(() => {
    if (!open || !tour) return;
    const step = tour.steps[stepIdx];
    if (!step?.target) { setRect(null); return; }

    const compute = () => {
      const el = document.querySelector(step.target!) as HTMLElement | null;
      if (!el) { setRect(null); return; }
      const r = el.getBoundingClientRect();
      setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };
    compute();
    const t = window.setTimeout(compute, 250);
    window.addEventListener('resize', compute);
    window.addEventListener('scroll', compute, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', compute);
      window.removeEventListener('scroll', compute, true);
    };
  }, [open, stepIdx, tour]);

  if (!tour) return null;

  const finish = () => {
    setOpen(false);
    try { localStorage.setItem(tourStorageKey(tabId), '1'); } catch { /* ignore */ }
  };
  const stop = () => finish();
  const next = () => stepIdx < tour.steps.length - 1 ? setStepIdx(stepIdx + 1) : finish();
  const back = () => setStepIdx(Math.max(0, stepIdx - 1));

  const step = tour.steps[stepIdx];

  // Tooltip position: below target, centered. Fallback to centered modal.
  let tipStyle: React.CSSProperties = {
    position: 'fixed',
    left: '50%',
    top: '50%',
    transform: 'translate(-50%, -50%)',
    width: TOOLTIP_W,
    maxWidth: 'calc(100vw - 32px)',
  };
  if (rect) {
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const below = rect.top + rect.height + TOOLTIP_GAP;
    const above = rect.top - TOOLTIP_GAP;
    const placeBelow = below + 220 < vh;
    const top = placeBelow ? below : Math.max(16, above - 220);
    let left = rect.left + rect.width / 2 - TOOLTIP_W / 2;
    left = Math.max(16, Math.min(left, vw - TOOLTIP_W - 16));
    tipStyle = {
      position: 'fixed',
      top,
      left,
      width: TOOLTIP_W,
      maxWidth: 'calc(100vw - 32px)',
      transform: 'none',
    };
  }

  // Example banner (sticky, always-visible per tab when toggled)
  const exampleBanner = showExample && (
    <div
      className="mx-6 md:mx-12 mt-2 mb-4 rounded-xl p-4 animate-fade-in relative"
      style={{
        background: 'linear-gradient(135deg, rgba(168,85,247,.08), rgba(45,212,191,.06))',
        border: '1px dashed rgba(168,85,247,.4)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="text-[20px]">💡</div>
        <div className="flex-1">
          <div className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: '#7c3aed' }}>
            Example · {tour.tabId}
          </div>
          <p className="text-[13px] leading-relaxed" style={{ color: '#1e293b' }}>{tour.example}</p>
        </div>
        <button
          onClick={() => {
            setShowExample(false);
            try { localStorage.removeItem(exampleStorageKey(tabId)); } catch { /* ignore */ }
          }}
          className="text-[11px] font-semibold px-2 py-1 rounded text-muted-foreground hover:bg-white/60"
        >
          ✕ Hide
        </button>
      </div>
    </div>
  );

  if (!open) return <>{exampleBanner}</>;

  return (
    <>
      {exampleBanner}
      {/* Spotlight overlay using SVG mask */}
      <div className="fixed inset-0 z-[80] pointer-events-none animate-fade-in">
        <svg className="absolute inset-0 w-full h-full pointer-events-auto" onClick={stop}>
          <defs>
            <mask id={`tour-mask-${tabId}`}>
              <rect width="100%" height="100%" fill="white" />
              {rect && (
                <rect
                  x={rect.left - PADDING}
                  y={rect.top - PADDING}
                  width={rect.width + PADDING * 2}
                  height={rect.height + PADDING * 2}
                  rx={10}
                  fill="black"
                />
              )}
            </mask>
          </defs>
          <rect width="100%" height="100%" fill="rgba(10,12,28,0.66)" mask={`url(#tour-mask-${tabId})`} />
        </svg>
        {rect && (
          <div
            className="absolute pointer-events-none rounded-[10px] animate-pulse"
            style={{
              top: rect.top - PADDING,
              left: rect.left - PADDING,
              width: rect.width + PADDING * 2,
              height: rect.height + PADDING * 2,
              boxShadow: '0 0 0 2px #ec4899, 0 0 24px rgba(236,72,153,.6)',
            }}
          />
        )}
      </div>

      {/* Tooltip card */}
      <div className="z-[81] animate-scale-in" style={tipStyle}>
        <div
          className="rounded-xl shadow-2xl overflow-hidden"
          style={{ background: '#fff', border: '1px solid rgba(14,30,58,.12)' }}
        >
          <div
            className="px-4 py-2.5 flex items-center justify-between"
            style={{ background: 'linear-gradient(135deg, #1a2744, #2d1b69)', color: '#fff' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#f9a8d4' }}>
                Tour · step {stepIdx + 1} / {tour.steps.length}
              </span>
            </div>
            <button onClick={stop} className="text-[11px] font-semibold px-2 py-0.5 rounded hover:bg-white/10" style={{ color: '#fff' }}>
              ✕ Stop
            </button>
          </div>
          <div className="p-4">
            <div className="text-[15px] font-extrabold mb-1.5" style={{ color: '#0e1e3a' }}>{step.title}</div>
            <p className="text-[13px] leading-relaxed" style={{ color: '#1e293b' }}>{step.body}</p>
            {step.why && (
              <div className="mt-2.5 p-2 rounded text-[12px]" style={{ background: 'rgba(45,212,191,.1)', color: '#0f766e', border: '1px solid rgba(45,212,191,.3)' }}>
                <span className="font-bold">Why:</span> {step.why}
              </div>
            )}
            <div className="flex items-center justify-between gap-2 mt-4">
              <button
                onClick={stop}
                className="text-[11px] font-semibold px-2.5 py-1.5 rounded text-muted-foreground hover:bg-slate-50"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-1.5">
                {stepIdx > 0 && (
                  <button
                    onClick={back}
                    className="text-[12px] font-bold px-3 py-1.5 rounded"
                    style={{ background: '#F1F5F9', color: '#0e1e3a' }}
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="text-[12px] font-bold px-3.5 py-1.5 rounded text-white"
                  style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)' }}
                >
                  {stepIdx < tour.steps.length - 1 ? 'Next →' : 'Got it ✓'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TabTour;
