import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface MindsetTabProps {
  onNavigate: (tabId: string) => void;
}

const MindsetTab = ({ onNavigate }: MindsetTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #D97FAA, #E8A87A)">Step 02: Prospecting Philosophy</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Mindset</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Come back here when your outreach feels generic, when you're stuck, or when you need to refocus on what actually matters.
      </p>

      <div className="flex flex-col gap-6">
        {/* Buyer Persona Model */}
        <section>
          <h3 className="text-[20px] font-semibold mb-1 text-foreground">We Sell Company Goals</h3>
          <p className="text-[13px] text-muted-foreground mb-4">Disguised as temp housing & relocation. Every buyer conversation starts with what the company is trying to achieve — not what we offer.</p>

          <div className="overflow-hidden border mb-4" style={{ borderColor: 'rgba(155,120,200,.12)' }}>
            <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
              <p className="text-[12px] font-bold uppercase tracking-[2px]" style={{ color: '#C4A5DE' }}>The Buyer Persona Chain</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3">
              {[
                { icon: '🎯', title: "Company's Goals", desc: 'Growth, expansion, new markets, operational efficiency — the C-level agenda driving everything downstream.' },
                { icon: '⚙️', title: 'Programs & Initiatives', desc: 'Intern cohorts, LDPs, rotational programs, office launches, project mobilizations — the initiatives that execute on those goals.' },
                { icon: '👥', title: 'The Talent to Make It Happen', desc: 'HR Managers, Department Heads, L&D, Recruiters, Interns, LDPs, Trainees — the people who physically need to move.' },
              ].map((step, i) => (
                <div key={step.title} className={`p-4 ${i < 2 ? 'md:border-r' : ''}`} style={{ background: '#fff', borderColor: '#E2E8F0' }}>
                  <p className="text-[20px] mb-1.5">{step.icon}</p>
                  <p className="text-[13px] font-semibold mb-1 text-foreground">{step.title}</p>
                  <p className="text-[12px] leading-[1.6] text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 items-start p-3.5" style={{ background: 'rgba(155,120,200,.05)', border: '1px solid rgba(99,102,241,.18)' }}>
            <span className="text-[16px] flex-shrink-0 mt-0.5">💡</span>
            <p className="text-[13px] leading-[1.65] text-foreground">
              <strong>Example — Intern/Trainee Program:</strong> The company goal is growth. The initiative is the intern class. The talent is HR, Department Heads, and L&D coordinating 50 interns arriving in June. That's your signal — and your opening.
            </p>
          </div>
        </section>

        {/* Market intelligence */}
        <section>
          <h3 className="text-[20px] font-semibold mb-1 text-foreground">Use market intelligence before building lists</h3>
          <p className="text-[13px] text-muted-foreground mb-3">The goal is to see where movement is building in your market. Then focus your prospecting there.</p>

          <div className="p-4 border mb-3" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
            <p className="text-[12px] font-bold uppercase tracking-wide mb-2.5 text-muted-foreground">Ask yourself</p>
            <div className="flex flex-col gap-1.5">
              {['What is changing in my market right now?', 'Does it imply physical people movement?', 'Which companies are tied to it, and who inside owns the problem?'].map(q => (
                <p key={q} className="text-[13px] text-foreground flex gap-2.5"><span className="font-bold" style={{ color: '#C47EAA' }}>→</span> {q}</p>
              ))}
            </div>
            <p className="text-[13px] text-muted-foreground mt-2.5 pt-2.5" style={{ borderTop: '1px solid #E2E8F0' }}>Run a territory prompt first to spot where demand is forming. Then go deeper on specific companies, contacts, and angles.</p>
          </div>
        </section>

        {/* Real examples */}
        <section>
          <h3 className="text-[20px] font-semibold mb-1 text-foreground">Real examples of what this looks like</h3>
          <p className="text-[13px] text-muted-foreground mb-3">The strongest opportunities usually come from a business change that is both physical and time bound.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { title: 'Intern and training cohorts', body: 'A company launches a summer intern program, technician training group, or onboarding cohort. That creates a defined group arriving at the same time for a fixed period.', look: 'Intern classes, academy launches, graduate rotations, training programs.' },
              { title: 'Employee relocation and bridge housing', body: 'A company opens a new office, expands into a new market, or transfers staff before permanent housing is secured.', look: 'Office openings, new market entry, regional expansions, leadership moves.' },
              { title: 'Major facility expansions and phased projects', body: 'A manufacturer or energy company launches a new site, expands an existing one, or moves through multiple phases of a project.', look: 'Plant construction, phased openings, project mobilization, commissioning.' },
              { title: 'New operating bases or regional launches', body: 'A company establishes a new branch, regional hub, operations center, or service base in your market.', look: 'New bases, new hubs, branch openings, service center launches.' },
            ].map(c => (
              <div key={c.title} className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
                <strong className="block text-[14px] mb-2 text-foreground">{c.title}</strong>
                <p className="text-[13px] leading-[1.65] mb-2 text-muted-foreground">{c.body}</p>
                <p className="text-[13px] leading-[1.65] text-muted-foreground"><strong className="text-foreground">What to look for:</strong> {c.look}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What experienced reps miss */}
        <section>
          <h3 className="text-[20px] font-semibold mb-1 text-foreground">What experienced reps often miss</h3>
          <p className="text-[13px] text-muted-foreground mb-3">These patterns separate the reps who close on signal-based accounts from the ones who get stuck in follow-up cycles.</p>
          <div className="flex flex-col gap-2.5">
            {[
              { title: 'They go to HR first. Every time.', body: 'HR owns the policy and the vendor setup. Not the problem. A project manager with crews landing in six weeks feels the pain before HR even knows there\'s a need. Start with the person whose schedule breaks if housing or travel isn\'t handled.' },
              { title: 'They lead with one service line and stop', body: 'A relocation signal often creates demand for temporary housing, destination services, AND travel. Not just one. Ask what else is moving before you pitch the first need. Multi-service accounts are your highest-value accounts.' },
              { title: 'They treat the signal as a one-time event', body: 'A company that mobilizes once will mobilize again. Once you\'ve placed an account, watch their signals. Re-engage before the next project starts.' },
              { title: 'They wait for the account to be "ready"', body: 'By the time an account is fully ready, they\'ve already called three other vendors. The best time to reach a project manager is the week the contract drops. Early outreach with a real signal reference earns a conversation.' },
            ].map(m => (
              <div key={m.title} className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
                <div className="grid" style={{ gridTemplateColumns: '3px 1fr' }}>
                  <div style={{ background: 'linear-gradient(135deg, #9B78C8, #C47EAA)' }} />
                  <div className="p-4">
                    <p className="text-[13px] font-semibold mb-1 text-foreground">{m.title}</p>
                    <p className="text-[13px] leading-[1.6] text-muted-foreground">{m.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Every account is different */}
        <section>
          <div className="flex gap-3 items-start p-4" style={{ background: '#E8D1AC', border: '1px solid rgba(16,65,118,.10)', borderRadius: '10px' }}>
            <span className="text-[20px] flex-shrink-0">⭐</span>
            <div>
              <p className="text-[13px] font-semibold mb-1 text-foreground">Every account is different. Sell like it.</p>
              <p className="text-[13px] leading-[1.6] text-foreground">When your outreach sounds the same regardless of the account, you're competing on price by default. The rep who tailors the message to the signal, the buyer, and the business moment — that's the one who earns the conversation.</p>
            </div>
          </div>
        </section>
      </div>

      <SectionNav currentTab="mindset" onNavigate={onNavigate} />
    </div>
  );
};

export default MindsetTab;
