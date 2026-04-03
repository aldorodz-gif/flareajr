import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface SetupTabProps {
  onNavigate: (tabId: string) => void;
}

const steps = [
  {
    num: 1, gradient: 'linear-gradient(135deg,#0EA5E9,#38BDF8)',
    title: 'Click + → More → Agent Mode',
    body: 'In any new chat, click the ( + ) button on the left → hover More → click Agent Mode.',
  },
  {
    num: 2, gradient: 'linear-gradient(135deg,#06B6D4,#22D3EE)',
    title: 'A "Describe a Task" Box Appears',
    body: 'After clicking Agent Mode, this input box appears. Go to the Run Search tab, copy your city prompt, come back, paste it here, then hit the arrow to send.',
  },
  {
    num: 3, gradient: 'linear-gradient(135deg,#14B8A6,#2DD4BF)',
    title: 'Your Prompt Is Entered. Hit Send',
    body: 'This is what your city prompt looks like pasted in. Hit the send arrow to kick it off.',
  },
  {
    num: 4, gradient: 'linear-gradient(135deg,#0D9488,#5EEAD4)',
    title: 'ChatGPT Confirms. No Action Needed',
    body: "The agent tells you what it's going to do. Read it quickly to make sure it understood. You don't need to type anything — it starts on its own.",
  },
  {
    num: 5, gradient: 'linear-gradient(135deg,#0891B2,#67E8F9)',
    title: 'Agent Is Searching. Let It Run',
    body: 'The agent is now searching live web sources. This takes a few minutes — leave the tab open and let it finish. You\'ll get a notification when your first report is ready.',
  },
];

const SetupTab = ({ onNavigate }: SetupTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #0EA5E9, #14B8A6)">Step 01: One Time Setup</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Get Into Agent Mode</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Follow these 5 steps exactly. Each mockup shows what your ChatGPT screen will look like at each stage.
      </p>

      <div className="flex flex-col gap-7">
        {steps.map((step) => (
          <div key={step.num} className="overflow-hidden border" style={{ borderColor: 'rgba(14,184,166,.18)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div className="flex items-center gap-3.5 px-4 py-3.5" style={{ background: step.gradient }}>
              <div className="min-w-[30px] h-[30px] rounded-full flex items-center justify-center text-[14px] font-semibold flex-shrink-0" style={{ background: 'rgba(255,255,255,.22)', color: '#fff' }}>
                {step.num}
              </div>
              <p className="text-[14px] font-semibold" style={{ color: '#fff' }}>{step.title}</p>
            </div>
            <div className="p-4" style={{ background: '#fff' }}>
              <p className="text-[13px] leading-[1.65] text-muted-foreground">
                {step.body}
              </p>
            </div>
            {step.num === 1 && (
              <div className="p-5 border-t" style={{ background: '#F0FDFA', borderColor: '#CCFBF1' }}>
                <div className="flex gap-3 items-start max-w-[480px]">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0F766E, #0E7490)' }}>
                    <span className="text-[18px] font-bold" style={{ color: '#fff' }}>+</span>
                  </div>
                  <div className="flex-1 rounded-lg overflow-hidden border" style={{ borderColor: '#99F6E4', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                    <div className="px-3.5 py-2.5 border-b text-[12px] font-medium" style={{ color: '#64748B', borderColor: '#F1F5F9' }}>New chat options</div>
                    <div className="py-2">
                      <div className="px-3.5 py-2 text-[13px] flex items-center gap-2" style={{ color: '#475569' }}>📎 Attach files</div>
                      <div className="px-3.5 py-2 text-[13px] flex items-center gap-2" style={{ color: '#475569' }}>🌐 Search the web</div>
                      <div className="px-3.5 py-2 text-[13px] font-semibold flex items-center gap-2 border-l-[3px]" style={{ color: '#0891B2', background: '#ECFEFF', borderColor: '#0891B2' }}>
                        ⚡ Agent Mode
                        <span className="ml-auto text-[11px] px-2 py-0.5 rounded-full" style={{ background: '#0891B2', color: '#fff' }}>click here</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step.num === 2 && (
              <div className="p-5 border-t" style={{ background: '#F0FDFA', borderColor: '#CCFBF1' }}>
                <div className="max-w-[480px]">
                  <div className="overflow-hidden border" style={{ borderColor: '#99F6E4', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                    <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #0F766E, #0E7490)' }}>
                      <span className="text-[14px]">⚡</span>
                      <span className="text-[14px] font-semibold" style={{ color: '#fff' }}>Agent Mode Active</span>
                    </div>
                    <div className="p-4">
                      <p className="text-[12px] font-medium mb-2.5" style={{ color: '#64748B' }}>Describe a task for your agent</p>
                      <div className="flex items-center min-h-[60px] p-3.5 border-2 border-dashed" style={{ borderColor: '#0891B2', background: '#F0FDFA' }}>
                        <span className="text-[13px] italic" style={{ color: '#94A3B8' }}>Paste your city prompt here, then hit send →</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step.num === 3 && (
              <div className="p-5 border-t" style={{ background: '#F0FDFA', borderColor: '#CCFBF1' }}>
                <div className="max-w-[480px]">
                  <div className="overflow-hidden border" style={{ borderColor: '#99F6E4', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                    <div className="flex items-center gap-2 px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #0F766E, #0E7490)' }}>
                      <span className="text-[14px]">⚡</span>
                      <span className="text-[14px] font-semibold" style={{ color: '#fff' }}>Agent Mode Active</span>
                    </div>
                    <div className="p-4">
                      <div className="relative p-3.5 mb-3" style={{ background: '#134E4A' }}>
                        <p className="text-[12px] leading-[1.7] pr-9" style={{ color: 'rgba(255,255,255,.7)' }}>
                          Search for new <strong style={{ color: 'rgba(255,255,255,.9)' }}>[Your City, State]</strong> business movements that could create demand for <strong style={{ color: 'rgba(255,255,255,.9)' }}>temporary housing, travel, hotels, or destination services</strong>...
                        </p>
                        <div className="absolute bottom-2.5 right-2.5 w-[26px] h-[26px] rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #0EA5E9, #14B8A6)' }}>
                          <span className="text-[14px]" style={{ color: '#fff' }}>→</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step.num === 4 && (
              <div className="p-5 border-t" style={{ background: '#F0FDFA', borderColor: '#CCFBF1' }}>
                <div className="max-w-[480px]">
                  <div className="overflow-hidden border" style={{ borderColor: '#99F6E4', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                    <div className="flex items-center gap-2.5 px-4 py-3.5 border-b" style={{ borderColor: '#F1F5F9' }}>
                      <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg, #0EA5E9, #14B8A6)' }}>
                        <span className="text-[13px]" style={{ color: '#fff' }}>⚡</span>
                      </div>
                      <div>
                        <p className="text-[14px] font-semibold text-foreground">ChatGPT Agent</p>
                        <p className="text-[12px]" style={{ color: '#10B981' }}>✓ Task received</p>
                      </div>
                    </div>
                    <div className="p-4">
                      <p className="text-[13px] leading-[1.65] text-muted-foreground">I'll search for new business movements in <strong className="text-foreground">[Your City, State]</strong> that could create demand for temporary housing, travel, hotels, or destination services.</p>
                      <div className="mt-2.5 p-2.5" style={{ background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
                        <p className="text-[12px]" style={{ color: '#059669' }}>You don't need to do anything. It starts on its own.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {step.num === 5 && (
              <div className="p-5 border-t" style={{ background: '#F0FDFA', borderColor: '#CCFBF1' }}>
                <div className="max-w-[480px] overflow-hidden border" style={{ borderColor: '#99F6E4', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
                  <div className="flex items-center gap-2.5 px-4 py-3.5 border-b" style={{ borderColor: '#F1F5F9' }}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'linear-gradient(135deg,#FCAF45,#F56040)' }}>
                      <span className="text-[13px]" style={{ color: '#fff' }}>⚡</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[13px] font-semibold text-foreground">Searching live sources...</p>
                      <div className="h-1 rounded-sm mt-1.5 overflow-hidden" style={{ background: '#F1F5F9' }}>
                        <div className="h-full w-[65%] rounded-sm" style={{ background: 'linear-gradient(90deg,#0EA5E9,#14B8A6)' }} />
                      </div>
                    </div>
                  </div>
                  <div className="px-4 py-3.5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#64748B' }}><span style={{ color: '#14B8A6' }}>✓</span> Searching Huntsville business news</div>
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#64748B' }}><span style={{ color: '#14B8A6' }}>✓</span> Scanning contract awards and expansions</div>
                    <div className="flex items-center gap-2 text-[12px]" style={{ color: '#0EA5E9' }}>⟳ Filtering for housing and travel signals...</div>
                    <div className="mt-2 p-2.5" style={{ background: '#ECFEFF', border: '1px solid #A5F3FC' }}>
                      <p className="text-[12px]" style={{ color: '#0E7490' }}>⏱ This takes a few minutes — leave the tab open and let it finish.</p>
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