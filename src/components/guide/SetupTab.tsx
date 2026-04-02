import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface SetupTabProps {
  onNavigate: (tabId: string) => void;
}

const steps = [
  {
    num: 1, gradient: 'linear-gradient(135deg,#9B78C8,#A885D4)',
    title: 'Click + → More → Agent Mode',
    body: 'In any new chat, click the ( + ) button on the left → hover More → click Agent Mode.',
  },
  {
    num: 2, gradient: 'linear-gradient(135deg,#C47EAA,#CF8EBB)',
    title: 'A "Describe a Task" Box Appears',
    body: 'After clicking Agent Mode, this input box appears. Go to the Step 2 tab, copy your city prompt, come back, paste it here, then hit the arrow to send.',
  },
  {
    num: 3, gradient: 'linear-gradient(135deg,#D97895,#DE8AA0)',
    title: 'Your Prompt Is Entered — Hit Send',
    body: 'This is what your city prompt looks like pasted in. Hit the send arrow to kick it off.',
  },
  {
    num: 4, gradient: 'linear-gradient(135deg,#E2907A,#E89D85)',
    title: 'ChatGPT Confirms — No Action Needed',
    body: "The agent tells you what it's going to do. Read it quickly to make sure it understood. You don't need to type anything — it starts on its own.",
  },
  {
    num: 5, gradient: 'linear-gradient(135deg,#EBC980,#F0D490)',
    title: 'Agent Is Searching — Let It Run',
    body: 'The agent is now searching live web sources. This takes a few minutes — leave the tab open and let it finish.',
  },
];

const SetupTab = ({ onNavigate }: SetupTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #5BBFA0, #5AB8D4)">Step 01 — One Time Setup</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>Get Into Agent Mode</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Follow these 5 steps exactly. Every screenshot below is your actual ChatGPT screen so you know exactly what to expect.
      </p>

      <div className="flex flex-col gap-5">
        {steps.map((step) => (
          <div key={step.num} className="overflow-hidden border" style={{ borderColor: 'rgba(99,102,241,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div className="flex items-center gap-3.5 px-4 py-3.5" style={{ background: step.gradient }}>
              <div className="min-w-[30px] h-[30px] rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0" style={{ background: 'rgba(255,255,255,.22)', color: '#fff' }}>
                {step.num}
              </div>
              <p className="text-[14px] font-semibold" style={{ color: '#fff' }}>{step.title}</p>
            </div>
            <div className="p-4" style={{ background: '#fff' }}>
              <p className="text-[13px] leading-[1.65]" style={{ color: '#475569' }}>
                {step.body}
              </p>
            </div>
            {/* Visual mockup for step 1 */}
            {step.num === 1 && (
              <div className="p-5 border-t" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
                <div className="flex gap-3 items-start max-w-[480px]">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#833AB4,#FCAF45)' }}>
                    <span className="text-[18px] font-bold" style={{ color: '#fff' }}>+</span>
                  </div>
                  <div className="flex-1 rounded-lg overflow-hidden border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                    <div className="px-3.5 py-2.5 border-b text-[12px] font-medium" style={{ color: '#64748B', borderColor: '#F1F5F9' }}>New chat options</div>
                    <div className="py-2">
                      <div className="px-3.5 py-2 text-[13px] flex items-center gap-2" style={{ color: '#475569' }}>📎 Attach files</div>
                      <div className="px-3.5 py-2 text-[13px] flex items-center gap-2" style={{ color: '#475569' }}>🌐 Search the web</div>
                      <div className="px-3.5 py-2 text-[13px] font-semibold flex items-center gap-2 border-l-[3px]" style={{ color: '#6366F1', background: '#EEF2FF', borderColor: '#6366F1' }}>
                        ⚡ Agent Mode
                        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full" style={{ background: '#6366F1', color: '#fff' }}>click here</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Search progress mockup for step 5 */}
            {step.num === 5 && (
              <div className="p-5 border-t" style={{ background: '#F8FAFC', borderColor: '#E2E8F0' }}>
                <div className="max-w-[480px] rounded-xl overflow-hidden border" style={{ borderColor: '#E2E8F0', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  <div className="flex items-center gap-2.5 px-4 py-3.5 border-b" style={{ borderColor: '#F1F5F9' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#FCAF45,#F56040)' }}>
                      <span className="text-[13px]" style={{ color: '#1E293B' }}>⚡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold" style={{ color: '#1E293B' }}>Searching live sources...</p>
                      <div className="h-1 rounded-sm mt-1.5 overflow-hidden" style={{ background: '#F1F5F9' }}>
                        <div className="h-full w-[65%] rounded-sm" style={{ background: 'linear-gradient(90deg,#FCAF45,#F56040)' }} />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3.5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#64748B' }}><span style={{ color: '#10B981' }}>✓</span> Searching Huntsville business news</div>
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#64748B' }}><span style={{ color: '#10B981' }}>✓</span> Scanning contract awards and expansions</div>
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#F59E0B' }}>⟳ Filtering for housing and travel signals...</div>
                    <div className="mt-2 p-2.5 rounded-md" style={{ background: '#FFFBEB', border: '1px solid #FDE68A' }}>
                      <p className="text-[12px]" style={{ color: '#92400E' }}>⏱ This takes a few minutes — leave the tab open and let it finish.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <SectionNav currentTab="setup" onNavigate={onNavigate} />
    </div>
  );
};

export default SetupTab;
