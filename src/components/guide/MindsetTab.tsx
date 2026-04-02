import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface MindsetTabProps {
  onNavigate: (tabId: string) => void;
}

const MindsetTab = ({ onNavigate }: MindsetTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #D97FAA, #E8A87A)">MINDSET</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>Mindset</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Use this tab before you start prospecting and come back to this section whenever your thinking starts to drift.
      </p>

      <div className="flex flex-col gap-6">
        {/* Start here */}
        <section>
          <div className="mb-3 pl-3.5 border-l-[3px]" style={{ borderColor: '#6366F1' }}>
            <h3 className="text-[24px] font-semibold leading-tight mb-1" style={{ color: '#1E293B' }}>Start here</h3>
            <p className="text-[13px]" style={{ color: 'rgba(15,30,58,.72)' }}>This tab is here to shape your judgment before you move into execution.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            {[
              { title: 'Why this matters', body: 'Signal based prospecting helps you focus on real business movement, not random lists.' },
              { title: 'Make it your own', body: 'Use this process as your foundation, but make the conversation sound like you and fit your style.' },
              { title: 'Use this to recenter', body: 'Come back here when you feel stuck, when outreach feels generic, or when you need a clearer starting point.' },
            ].map(c => (
              <div key={c.title} className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                <strong className="block text-[13px] mb-1.5" style={{ color: '#1E293B' }}>{c.title}</strong>
                <p className="text-[13px] leading-[1.65]" style={{ color: '#475569' }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Use market intelligence */}
        <section>
          <div className="mb-3 pl-3.5 border-l-[3px]" style={{ borderColor: '#6366F1' }}>
            <h3 className="text-[24px] font-semibold leading-tight mb-1" style={{ color: '#1E293B' }}>Use market intelligence before prospecting</h3>
            <p className="text-[13px] max-w-[640px]" style={{ color: 'rgba(15,30,58,.72)' }}>
              Use the agent to understand where movement is building in your market before you start building lists.
            </p>
          </div>

          <div className="flex flex-col gap-3.5">
            <div className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <strong className="block text-[13px] mb-1.5" style={{ color: '#1E293B' }}>How to think about it</strong>
              <p className="text-[13px] leading-[1.65] mb-2" style={{ color: '#475569' }}>Start with the territory. Look at what industries are growing, what projects are moving, what companies are expanding, and where people movement is likely happening.</p>
              <ul className="list-disc pl-5 text-[13px] leading-[1.65] space-y-1" style={{ color: '#475569' }}>
                <li>What is changing in my market</li>
                <li>Why does it matter</li>
                <li>Could it create demand for one of our service lines</li>
                <li>Which companies are tied to it</li>
                <li>Who inside that company would likely care</li>
              </ul>
            </div>
            <div className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
              <strong className="block text-[13px] mb-1.5" style={{ color: '#1E293B' }}>How to use this</strong>
              <p className="text-[13px] leading-[1.65]" style={{ color: '#475569' }}>Use this prompt first to understand where demand is forming. Then go deeper on specific companies. This helps you prospect with context instead of calling down lists.</p>
            </div>
          </div>
        </section>

        {/* Framework */}
        <section>
          <div className="mb-3">
            <h3 className="text-[20px] font-semibold" style={{ color: '#1E293B' }}>Simple framework to keep in mind</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { title: 'Territory trend', body: 'What industry or segment is growing' },
              { title: 'Business movement', body: 'What expansion, relocation, contract award, training cohort, phased project, or construction activity is happening' },
              { title: 'Service line implication', body: 'Why that movement could create demand for temporary housing, travel, hotels, or destination services' },
              { title: 'Target account', body: 'Which company is worth going after' },
              { title: 'Right contact', body: 'Who is most likely to own or influence the need' },
              { title: 'Outreach angle', body: 'What is the reason for your call or email right now' },
            ].map(c => (
              <div key={c.title} className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                <strong className="block text-[13px] mb-1.5" style={{ color: '#1E293B' }}>{c.title}</strong>
                <p className="text-[13px] leading-[1.65]" style={{ color: '#475569' }}>{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Real examples */}
        <section>
          <div className="mb-3">
            <h3 className="text-[20px] font-semibold mb-1" style={{ color: '#1E293B' }}>Real examples of what this looks like</h3>
            <p className="text-[13px]" style={{ color: '#64748B' }}>The strongest opportunities usually come from a business change that is both physical and time bound.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { title: 'Intern and training cohorts', body: 'A company launches a summer intern program, technician training group, or onboarding cohort. That creates a defined group arriving at the same time for a fixed period.', look: 'Intern classes, academy launches, graduate rotations, training programs.' },
              { title: 'Employee relocation and bridge housing', body: 'A company opens a new office, expands into a new market, or transfers staff before permanent housing is secured.', look: 'Office openings, new market entry, regional expansions, leadership moves.' },
              { title: 'Major facility expansions and phased projects', body: 'A manufacturer or energy company launches a new site, expands an existing one, or moves through multiple phases of a project.', look: 'Plant construction, phased openings, project mobilization, commissioning.' },
              { title: 'New operating bases or regional launches', body: 'A company establishes a new branch, regional hub, operations center, or service base in your market.', look: 'New bases, new hubs, branch openings, service center launches.' },
            ].map(c => (
              <div key={c.title} className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
                <strong className="block text-[15px] mb-2" style={{ color: '#1E293B' }}>{c.title}</strong>
                <p className="text-[13px] leading-[1.65] mb-2" style={{ color: '#475569' }}>{c.body}</p>
                <p className="text-[13px] leading-[1.65]" style={{ color: '#475569' }}><strong style={{ color: '#1E293B' }}>What to look for:</strong> {c.look}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom line */}
        <div className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(99,102,241,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
          <strong className="block text-[13px] mb-1.5" style={{ color: '#1E293B' }}>Bottom line</strong>
          <p className="text-[13px] leading-[1.65]" style={{ color: '#475569' }}>Good prospecting starts with change in the market, not a random list of companies. When you have a signal, the rest of the workflow gets easier.</p>
        </div>
      </div>

      <SectionNav currentTab="mindset" onNavigate={onNavigate} />
    </div>
  );
};

export default MindsetTab;
