import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface OverviewTabProps {
  onNavigate: (tabId: string) => void;
}

const workflowSteps = [
  { num: 1, label: 'one time', gradient: 'linear-gradient(160deg,#9B78C8,#A885D4)', title: 'Get into Agent Mode', why: 'This gives you access to live research.', what: 'Turn it on before starting any prospecting task.' },
  { num: 2, label: 'set once', gradient: 'linear-gradient(160deg,#C47EAA,#CF8EBB)', title: 'Find companies showing demand signals', why: 'You want signs of real movement, not generic hiring noise.', what: 'Search for expansions, relocations, projects, cohorts, and operational growth.' },
  { num: 3, label: 'every morning', gradient: 'linear-gradient(160deg,#D97895,#DE8AA0)', title: 'Work your results', why: 'Not every result deserves time.', what: 'Prioritize the strongest signals and skip weak or vague findings.' },
  { num: 4, label: 'before you call', gradient: 'linear-gradient(160deg,#E2907A,#E89D85)', title: 'Research the company', why: 'Context improves relevance.', what: 'Understand what changed and what type of service line need it may create.' },
  { num: 5, label: 'find the POC', gradient: 'linear-gradient(160deg,#E8A87A,#EDB880)', title: 'Identify the buyer', why: 'The right message to the wrong person still fails.', what: 'Map the likely owner based on the signal and company structure.' },
  { num: 6, label: 'reach out', gradient: 'linear-gradient(160deg,#EBC980,#F0D490)', title: 'Build the outreach plan', why: 'Your outreach should reflect the signal, not sound copied.', what: 'Turn the business movement into a natural call or email reason tied to the most likely service line.' },
];

const OverviewTab = ({ onNavigate }: OverviewTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow>Start Here — Read This First</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>The Full Prospecting Flow</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Use this guide to move from signal to outreach with a clearer reason to contact the account. Each tab has one job and each step builds on the last.
      </p>

      <div className="flex flex-col gap-3">
        {/* Intro note */}
        <div className="p-4 border-l-4" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,.05), rgba(124,58,237,.03))', borderColor: 'rgba(99,102,241,.18)', borderLeftColor: '#6366F1' }}>
          <span className="inline-block text-[10px] font-semibold uppercase tracking-[1.8px] mb-1.5" style={{ color: '#6366F1' }}>Aldo</span>
          <p className="text-[13px] leading-[1.65]" style={{ color: '#1E293B' }}>
            I put this together to help you prospect with more context and less wasted motion. Start with the signal, understand why it matters, then work toward the right contact and the right angle.
          </p>
          <p className="text-[13px] leading-[1.65] mt-2" style={{ color: '#1E293B' }}>
            Use this as the operating flow. If your process gets noisy or your outreach starts sounding generic, come back to the tab that matches the step you are in.
          </p>
        </div>

        {/* Flow heading */}
        <div className="mt-4 mb-1">
          <h3 className="text-[20px] font-semibold" style={{ color: '#1E293B' }}>Full prospecting flow</h3>
          <p className="text-[13px]" style={{ color: '#64748B' }}>Use this as the sequence. Do not skip ahead.</p>
        </div>

        {/* Workflow rows */}
        <div className="flex flex-col gap-3">
          {workflowSteps.map((step) => (
            <div key={step.num} className="flex flex-col md:flex-row overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
              <div className="md:w-[132px] flex md:flex-col items-center md:justify-center gap-2 p-3 md:p-4 text-center flex-shrink-0" style={{ background: step.gradient }}>
                <span className="text-[17px] font-semibold leading-none" style={{ color: '#fff' }}>{step.num}</span>
                <small className="text-[11px] font-semibold uppercase tracking-wide leading-tight" style={{ color: 'rgba(255,255,255,.75)' }}>{step.label}</small>
              </div>
              <div className="p-4 flex-1 border-t md:border-t-0 md:border-l" style={{ borderColor: 'rgba(14,30,58,.06)' }}>
                <h4 className="text-[15px] font-semibold mb-1" style={{ color: '#1E293B' }}>{step.title}</h4>
                <p className="text-[14px] leading-[1.7]" style={{ color: '#475569' }}>
                  <strong style={{ color: '#1E293B' }}>Why it matters:</strong> {step.why} <strong style={{ color: '#1E293B' }}>What to do:</strong> {step.what}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SectionNav currentTab="workflow" onNavigate={onNavigate} />
    </div>
  );
};

export default OverviewTab;
