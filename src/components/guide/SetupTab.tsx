import { useState } from 'react';
import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface SetupTabProps {
  onNavigate: (tabId: string) => void;
}

const steps = [
  {
    num: 1,
    title: 'Open Agent Mode',
    action: 'Click the ( + ) button → More → Agent Mode.',
    detail: 'This turns ChatGPT into a live research assistant that searches the web in real time — normal ChatGPT can\'t do this.',
    defaultOpen: true,
    mockup: 'menu',
  },
  {
    num: 2,
    title: 'Paste your prompt',
    action: 'A "Describe a Task" box appears. Paste your city prompt from the Prompt Builder tab.',
    detail: null,
    defaultOpen: false,
    mockup: 'taskbox',
  },
  {
    num: 3,
    title: 'Hit send',
    action: 'Your prompt is loaded — tap the send arrow to kick it off.',
    detail: null,
    defaultOpen: false,
    mockup: 'pasted',
  },
  {
    num: 4,
    title: 'Let it confirm',
    action: 'ChatGPT will tell you what it\'s about to search. You don\'t need to do anything — it starts on its own.',
    detail: null,
    defaultOpen: false,
    mockup: 'confirm',
  },
  {
    num: 5,
    title: 'Wait for results',
    action: 'The agent searches live sources for a few minutes. Leave the tab open — you\'ll get your first report when it\'s done.',
    detail: null,
    defaultOpen: false,
    mockup: 'searching',
  },
];

const SetupTab = ({ onNavigate }: SetupTabProps) => {
  const [expandedMockups, setExpandedMockups] = useState<Set<number>>(new Set([1]));

  const toggleMockup = (num: number) => {
    setExpandedMockups(prev => {
      const next = new Set(prev);
      if (next.has(num)) next.delete(num);
      else next.add(num);
      return next;
    });
  };

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #5BBFA0, #5AB8D4)">Step 01: One-Time Setup</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Get Into Agent Mode</h2>

      {/* Welcoming intro */}
      <div className="flex items-start gap-3 p-4 mb-6" style={{ background: 'linear-gradient(135deg, rgba(91,191,160,.08), rgba(90,184,212,.08))', border: '1px solid rgba(91,191,160,.15)', borderRadius: '8px' }}>
        <span className="text-[22px] flex-shrink-0 mt-0.5">👋</span>
        <div>
          <p className="text-[14px] font-semibold text-foreground mb-1">This takes about 2 minutes. You'll do it once and never again.</p>
          <p className="text-[13px] leading-[1.6] text-muted-foreground">
            Agent Mode is a feature inside ChatGPT that lets it search the live web for you — pulling real-time news, contract awards, and business movements as they happen. Normal ChatGPT can't do this. Once you turn it on, you're ready to start finding leads.
          </p>
        </div>
      </div>

      {/* Timeline */}
      <div className="relative pl-8 mb-8">
        {/* Vertical connector line */}
        <div className="absolute left-[15px] top-4 bottom-4 w-[2px]" style={{ background: 'linear-gradient(180deg, #5BBFA0, #5AB8D4, #9B78C8)' }} />

        <div className="flex flex-col gap-0">
          {steps.map((step, idx) => {
            const isExpanded = expandedMockups.has(step.num);
            const isLast = idx === steps.length - 1;

            return (
              <div key={step.num} className={isLast ? '' : 'pb-6'}>
                {/* Step dot + content */}
                <div className="relative">
                  {/* Dot on timeline */}
                  <div className="absolute -left-8 top-0.5 w-[30px] h-[30px] rounded-full flex items-center justify-center text-[13px] font-bold z-10" style={{
                    background: '#fff',
                    border: '2px solid #5BBFA0',
                    color: '#5BBFA0',
                    boxShadow: '0 0 0 4px rgba(91,191,160,.1)',
                  }}>
                    {step.num}
                  </div>

                  {/* Text */}
                  <div className="pt-0.5">
                    <p className="text-[15px] font-semibold text-foreground mb-1">{step.title}</p>
                    <p className="text-[13px] leading-[1.6] text-muted-foreground">{step.action}</p>
                    {step.detail && (
                      <p className="text-[12px] leading-[1.5] mt-1.5 italic text-muted-foreground/70">{step.detail}</p>
                    )}

                    {/* Expandable mockup toggle */}
                    <button
                      onClick={() => toggleMockup(step.num)}
                      className="mt-2 flex items-center gap-1.5 text-[12px] font-medium transition-colors duration-200"
                      style={{ color: '#5BBFA0' }}
                    >
                      <span className="transition-transform duration-200" style={{ transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)', display: 'inline-block' }}>▶</span>
                      {isExpanded ? 'Hide preview' : 'See what this looks like'}
                    </button>

                    {/* Mockup content */}
                    {isExpanded && (
                      <div className="mt-3 overflow-hidden transition-all duration-300" style={{ borderRadius: '6px' }}>
                        {step.mockup === 'menu' && <MenuMockup />}
                        {step.mockup === 'taskbox' && <TaskboxMockup />}
                        {step.mockup === 'pasted' && <PastedMockup />}
                        {step.mockup === 'confirm' && <ConfirmMockup />}
                        {step.mockup === 'searching' && <SearchingMockup />}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Success / next step */}
      <div className="flex items-center gap-3 p-4 mb-6" style={{ background: 'linear-gradient(135deg, rgba(214,176,122,.08), rgba(155,120,200,.06))', border: '1px solid rgba(214,176,122,.2)', borderRadius: '8px' }}>
        <span className="text-[22px] flex-shrink-0">✅</span>
        <div className="flex-1">
          <p className="text-[14px] font-semibold text-foreground mb-0.5">That's it — you're set up.</p>
          <p className="text-[13px] text-muted-foreground">Head to the Prompt Builder to create your first market search and start finding leads.</p>
        </div>
        <button
          onClick={() => onNavigate('tracker')}
          className="flex-shrink-0 px-5 py-2.5 text-[13px] font-semibold transition-all duration-200"
          style={{
            background: 'linear-gradient(135deg, #D6B07A, #C49A5C)',
            color: '#fff',
            boxShadow: '0 2px 8px rgba(214,176,122,.3)',
          }}
          onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 4px 15px rgba(214,176,122,.4)')}
          onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(214,176,122,.3)')}
        >
          Build My Prompt →
        </button>
      </div>

      <SectionNav currentTab="setup" onNavigate={onNavigate} />
    </div>
  );
};

/* ── Mockup Components ── */

const MenuMockup = () => (
  <div className="p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
    <div className="flex gap-3 items-start max-w-[420px]">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #1E293B, #2d1b69)' }}>
        <span className="text-[18px] font-bold" style={{ color: '#fff' }}>+</span>
      </div>
      <div className="flex-1 rounded-lg overflow-hidden border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div className="px-3.5 py-2 border-b text-[12px] font-medium" style={{ color: '#64748B', borderColor: '#F1F5F9' }}>New chat options</div>
        <div className="py-1.5">
          <div className="px-3.5 py-2 text-[12px] flex items-center gap-2" style={{ color: '#94A3B8' }}>📎 Attach files</div>
          <div className="px-3.5 py-2 text-[12px] flex items-center gap-2" style={{ color: '#94A3B8' }}>🌐 Search the web</div>
          <div className="px-3.5 py-2 text-[13px] font-semibold flex items-center gap-2 border-l-[3px]" style={{ color: '#5BBFA0', background: 'rgba(91,191,160,.08)', borderColor: '#5BBFA0' }}>
            ⚡ Agent Mode
            <span className="ml-auto text-[10px] px-2 py-0.5 font-bold uppercase tracking-wider" style={{ background: '#5BBFA0', color: '#fff', borderRadius: '3px' }}>click here</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TaskboxMockup = () => (
  <div className="p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
    <div className="max-w-[420px] overflow-hidden border" style={{ borderColor: '#E2E8F0', borderRadius: '6px' }}>
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #1E293B, #2d1b69)' }}>
        <span className="text-[13px]">⚡</span>
        <span className="text-[13px] font-semibold" style={{ color: '#fff' }}>Agent Mode Active</span>
      </div>
      <div className="p-4">
        <p className="text-[11px] font-medium mb-2" style={{ color: '#94A3B8' }}>Describe a task for your agent</p>
        <div className="flex items-center min-h-[50px] p-3 border-2 border-dashed" style={{ borderColor: '#5BBFA0', background: 'rgba(91,191,160,.04)', borderRadius: '4px' }}>
          <span className="text-[12px] italic" style={{ color: '#94A3B8' }}>Paste your prompt here →</span>
        </div>
      </div>
    </div>
  </div>
);

const PastedMockup = () => (
  <div className="p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
    <div className="max-w-[420px] overflow-hidden border" style={{ borderColor: '#E2E8F0', borderRadius: '6px' }}>
      <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #1E293B, #2d1b69)' }}>
        <span className="text-[13px]">⚡</span>
        <span className="text-[13px] font-semibold" style={{ color: '#fff' }}>Agent Mode Active</span>
      </div>
      <div className="p-4">
        <div className="relative p-3" style={{ background: '#1E293B', borderRadius: '4px' }}>
          <p className="text-[11px] leading-[1.6] pr-8" style={{ color: 'rgba(255,255,255,.6)' }}>
            Search for new <strong style={{ color: 'rgba(255,255,255,.85)' }}>[Your City]</strong> business movements that could create demand for <strong style={{ color: 'rgba(255,255,255,.85)' }}>temporary housing, travel...</strong>
          </p>
          <div className="absolute bottom-2 right-2 w-6 h-6 rounded-full flex items-center justify-center" style={{ background: '#5BBFA0' }}>
            <span className="text-[12px]" style={{ color: '#fff' }}>→</span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const ConfirmMockup = () => (
  <div className="p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
    <div className="max-w-[420px] overflow-hidden border" style={{ borderColor: '#E2E8F0', borderRadius: '6px' }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: '#F1F5F9' }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#5BBFA0' }}>
          <span className="text-[11px]" style={{ color: '#fff' }}>⚡</span>
        </div>
        <p className="text-[13px] font-semibold text-foreground">ChatGPT Agent</p>
        <span className="text-[11px] ml-auto" style={{ color: '#10B981' }}>✓ Task received</span>
      </div>
      <div className="p-4">
        <p className="text-[12px] leading-[1.6] text-muted-foreground">I'll search for business movements in <strong className="text-foreground">[Your City]</strong> that create demand for temporary housing and travel.</p>
        <div className="mt-2 p-2" style={{ background: 'rgba(16,185,129,.06)', border: '1px solid rgba(16,185,129,.15)', borderRadius: '4px' }}>
          <p className="text-[11px]" style={{ color: '#10B981' }}>No action needed — it starts automatically.</p>
        </div>
      </div>
    </div>
  </div>
);

const SearchingMockup = () => (
  <div className="p-4" style={{ background: '#F8FAFC', border: '1px solid #E2E8F0', borderRadius: '6px' }}>
    <div className="max-w-[420px] overflow-hidden border" style={{ borderColor: '#E2E8F0', borderRadius: '6px' }}>
      <div className="flex items-center gap-2.5 px-4 py-3 border-b" style={{ borderColor: '#F1F5F9' }}>
        <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#FCAF45,#F56040)' }}>
          <span className="text-[11px]" style={{ color: '#fff' }}>⚡</span>
        </div>
        <div className="flex-1">
          <p className="text-[12px] font-semibold text-foreground">Searching live sources...</p>
          <div className="h-1 rounded-sm mt-1 overflow-hidden" style={{ background: '#F1F5F9' }}>
            <div className="h-full w-[65%] rounded-sm" style={{ background: 'linear-gradient(90deg,#FCAF45,#F56040)' }} />
          </div>
        </div>
      </div>
      <div className="px-4 py-3 flex flex-col gap-1.5">
        <div className="flex items-center gap-2 text-[11px]" style={{ color: '#64748B' }}><span style={{ color: '#10B981' }}>✓</span> Searching business news</div>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: '#64748B' }}><span style={{ color: '#10B981' }}>✓</span> Scanning contract awards</div>
        <div className="flex items-center gap-2 text-[11px]" style={{ color: '#F59E0B' }}>⟳ Filtering for housing signals...</div>
        <div className="mt-1.5 p-2" style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '4px' }}>
          <p className="text-[11px]" style={{ color: '#92400E' }}>⏱ Takes a few minutes — leave the tab open.</p>
        </div>
      </div>
    </div>
  </div>
);

export default SetupTab;
