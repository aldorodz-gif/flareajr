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

const serviceLines = [
  { name: 'Temporary Housing', desc: 'Furnished apartments and homes for stays typically 30+ days. Project teams, relocating employees, corporate transfers.' },
  { name: 'Travel', desc: 'Flights, rental cars, and short-stay accommodations. Rotating crews, field teams, and business travelers on project schedules.' },
  { name: 'Hotels', desc: 'Negotiated hotel programs and rate management. Outage crews, short-term project teams, training groups needing nightly accommodations.' },
  { name: 'Destination Services', desc: 'Settling-in support for relocating employees: school search, area orientation, DMV, banking setup. Long-term relocations, family moves.' },
];

const OverviewTab = ({ onNavigate }: OverviewTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow>Start Here</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">What is Flare?</h2>
      <p className="text-[13px] max-w-[760px] mb-4 leading-[1.7] text-muted-foreground">
        Demand signals are flares — spot them first, and you're already ahead. Flare is a three-tool kit built for the NCH sales team that helps you score signals, build search prompts, and write outreach emails that reference what's actually happening at the account.
      </p>

      {/* What's New */}
      <div className="mb-6 p-4 border" style={{ background: 'linear-gradient(135deg, rgba(155,120,200,.06), rgba(16,185,129,.04))', borderColor: 'rgba(155,120,200,.15)' }}>
        <p className="text-[12px] font-bold uppercase tracking-wide mb-2.5" style={{ color: '#9B78C8' }}>🆕 What's New</p>
        <div className="flex flex-col gap-1.5">
          {[
            'Interactive guided tour — click ❓ Tour in the header to replay anytime',
            'Theater & Sports verticals added to Work Your List',
            'Company Research prompt built into Work Your List — no more switching tabs',
            'Score Signals, Prompt Builder & Email Generator — three live AI tools',
          ].map((item) => (
            <p key={item} className="text-[13px] leading-[1.6] text-foreground flex gap-2">
              <span style={{ color: '#10B981' }}>✓</span> {item}
            </p>
          ))}
        </div>
      </div>

      <h3 className="text-[20px] font-semibold mb-1 text-foreground">The Full Prospecting Flow</h3>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Signal to outreach. One clear reason to contact the account. Each tab has one job. Each step builds on the last.
      </p>

      {/* NCH Service Lines */}
      <div className="overflow-hidden border mb-7" style={{ borderColor: 'rgba(155,120,200,.15)' }}>
        <div className="flex items-center justify-between px-5 py-3" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
          <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.55)' }}>NCH Service Lines</p>
          <p className="text-[12px]" style={{ color: '#C4A5DE' }}>Reference this in every tab</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4">
          {serviceLines.map((sl, i) => (
            <div key={sl.name} className={`p-4 ${i < 3 ? 'md:border-r' : ''}`} style={{ borderColor: '#E2E8F0', background: '#fff' }}>
              <p className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#9B78C8' }}>{sl.name}</p>
              <p className="text-[13px] leading-[1.55] text-foreground">{sl.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <h3 className="text-[20px] font-semibold text-foreground">Step-by-step sequence</h3>
        <p className="text-[13px] text-muted-foreground">Use this as the sequence. Do not skip ahead.</p>
      </div>

      {/* Workflow rows */}
      <div className="flex flex-col gap-3">
        {workflowSteps.map((step) => (
          <div key={step.num} className="flex flex-col md:flex-row overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
            <div className="md:w-[132px] flex md:flex-col items-center md:justify-center gap-2 p-3 md:p-4 text-center flex-shrink-0" style={{ background: step.gradient }}>
              <span className="text-[20px] font-bold leading-none" style={{ color: '#fff' }}>{step.num}</span>
              <small className="text-[11px] font-semibold uppercase tracking-wide leading-tight" style={{ color: 'rgba(255,255,255,.5)' }}>{step.label}</small>
            </div>
            <div className="p-4 flex-1 border-t md:border-t-0 md:border-l" style={{ borderColor: 'rgba(14,30,58,.06)' }}>
              <h4 className="text-[15px] font-semibold mb-1 text-foreground">{step.title}</h4>
              <p className="text-[13px] leading-[1.7] text-muted-foreground">
                <strong className="text-foreground">Why it matters:</strong> {step.why} <strong className="text-foreground">What to do:</strong> {step.what}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* New to outbound / Know the basics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5">
        <div className="p-4 border-l-[3px]" style={{ background: '#fff', border: '1px solid rgba(99,102,241,.12)', borderLeftWidth: '3px', borderLeftColor: '#9B78C8' }}>
          <p className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#9B78C8' }}>New to outbound</p>
          <p className="text-[13px] leading-[1.6] text-foreground">Follow the tabs left to right. Do not skip ahead. Run Setup first, then use the Prompt Builder each morning. Read the Mindset tab before your first call.</p>
        </div>
        <div className="p-4 border-l-[3px]" style={{ background: '#fff', border: '1px solid rgba(16,185,129,.12)', borderLeftWidth: '3px', borderLeftColor: '#10B981' }}>
          <p className="text-[12px] font-bold uppercase tracking-wide mb-1.5" style={{ color: '#10B981' }}>Know the basics</p>
          <p className="text-[13px] leading-[1.6] text-foreground">Use the Prompt Builder daily and Score Signals as your quick filter. Write Outreach drafts your first-touch emails. The Mindset tab has what most experienced reps overlook.</p>
        </div>
      </div>

      <SectionNav currentTab="workflow" onNavigate={onNavigate} />
    </div>
  );
};

export default OverviewTab;
