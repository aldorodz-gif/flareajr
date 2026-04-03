import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface MindsetTabProps {
  onNavigate: (tabId: string) => void;
}

const MindsetTab = ({ onNavigate }: MindsetTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #D946EF, #A855F7)">MINDSET</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Mindset</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Come back here when your outreach feels generic, when you're stuck, or when you need to refocus on what actually matters.
      </p>

      <div className="flex flex-col gap-6">
        {/* What this tab is for */}
        <section>
          <h3 className="text-[20px] font-semibold mb-3 text-foreground">What this tab is for</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { title: 'Make it yours', body: 'Use this as the foundation. Make every conversation sound like you.' },
              { title: 'Use this to recenter', body: 'Come back here when you feel stuck, when outreach feels generic, or when you need a clearer starting point.' },
            ].map(c => (
              <div key={c.title} className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(168,85,247,.12)' }}>
                <strong className="block text-[13px] mb-1.5 text-foreground">{c.title}</strong>
                <p className="text-[13px] leading-[1.65] text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Market intelligence */}
        <section>
          <h3 className="text-[20px] font-semibold mb-1 text-foreground">Use market intelligence before building lists</h3>
          <p className="text-[13px] text-muted-foreground mb-3">The goal is to see where movement is building in your market. Then focus your prospecting there.</p>

          <div className="p-4 border mb-3" style={{ background: '#fff', borderColor: 'rgba(168,85,247,.12)' }}>
            <p className="text-[12px] font-bold uppercase tracking-wide mb-2.5 text-muted-foreground">Ask yourself</p>
            <div className="flex flex-col gap-1.5">
              {['What is changing in my market right now?', 'Does it imply physical people movement?', 'Which companies are tied to it, and who inside owns the problem?'].map(q => (
                <p key={q} className="text-[13px] text-foreground flex gap-2.5"><span className="font-bold" style={{ color: '#A855F7' }}>→</span> {q}</p>
              ))}
            </div>
            <p className="text-[13px] text-muted-foreground mt-2.5 pt-2.5" style={{ borderTop: '1px solid #E2E8F0' }}>Run a territory prompt first to spot where demand is forming. Then go deeper on specific companies, contacts, and angles.</p>
          </div>
        </section>

        {/* Framework */}
        <section>
          <h3 className="text-[20px] font-semibold mb-3 text-foreground">Simple framework to keep in mind</h3>
          <div className="overflow-hidden border" style={{ borderColor: 'rgba(168,85,247,.15)' }}>
            <div className="px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #581C87, #4C1D95)' }}>
              <p className="text-[12px] font-bold uppercase tracking-wide" style={{ color: 'rgba(255,255,255,.55)' }}>Simple framework</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 border-b" style={{ borderColor: '#E9D5FF', background: '#fff' }}>
              {[
                { num: '01', title: 'Territory trend', desc: 'What industry or segment is growing', color: '#D946EF' },
                { num: '02', title: 'Business movement', desc: 'What expansion, contract, cohort, or construction is happening', color: '#A855F7' },
                { num: '03', title: 'Service line fit', desc: 'Why it creates demand for our services', color: '#8B5CF6' },
              ].map((f, i) => (
                <div key={f.num} className={`p-3.5 ${i < 2 ? 'md:border-r' : ''}`} style={{ borderColor: '#E9D5FF' }}>
                  <p className="text-[12px] font-bold uppercase tracking-wide mb-1" style={{ color: f.color }}>{f.num}</p>
                  <p className="text-[13px] font-semibold mb-0.5 text-foreground">{f.title}</p>
                  <p className="text-[13px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3" style={{ background: '#fff' }}>
              {[
                { num: '04', title: 'Target account', desc: 'Which company is worth going after', color: '#7C3AED' },
                { num: '05', title: 'Right contact', desc: 'Who most likely owns the problem', color: '#6D28D9' },
                { num: '06', title: 'Outreach angle', desc: 'The reason for your call or email right now', color: '#5B21B6' },
              ].map((f, i) => (
                <div key={f.num} className={`p-3.5 ${i < 2 ? 'md:border-r' : ''}`} style={{ borderColor: '#E9D5FF' }}>
                  <p className="text-[12px] font-bold uppercase tracking-wide mb-1" style={{ color: f.color }}>{f.num}</p>
                  <p className="text-[13px] font-semibold mb-0.5 text-foreground">{f.title}</p>
                  <p className="text-[13px] text-muted-foreground">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Real examples */}
        <section>
          <h3 className="text-[20px] font-semibold mb-1 text-foreground">Real examples of what this looks like</h3>
          <p className="text-[13px] text-muted-foreground mb-3">The strongest opportunities usually come from a business change that is both physical and time bound.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {[
              { title: 'Intern and training cohorts', body: 'A company launches a summer intern program, technician training group, or onboarding cohort. That creates a defined group arriving at the same time for a fixed period.', look: 'Intern classes, academy launches, graduate rotations, training programs.', color: '#D946EF' },
              { title: 'Employee relocation and bridge housing', body: 'A company opens a new office, expands into a new market, or transfers staff before permanent housing is secured.', look: 'Office openings, new market entry, regional expansions, leadership moves.', color: '#A855F7' },
              { title: 'Major facility expansions and phased projects', body: 'A manufacturer or energy company launches a new site, expands an existing one, or moves through multiple phases of a project.', look: 'Plant construction, phased openings, project mobilization, commissioning.', color: '#8B5CF6' },
              { title: 'New operating bases or regional launches', body: 'A company establishes a new branch, regional hub, operations center, or service base in your market.', look: 'New bases, new hubs, branch openings, service center launches.', color: '#7C3AED' },
            ].map(c => (
              <div key={c.title} className="p-4 border border-l-[3px]" style={{ background: '#fff', borderColor: 'rgba(168,85,247,.12)', borderLeftColor: c.color }}>
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
              { title: 'They go to HR first. Every time.', body: 'HR owns the policy and the vendor setup. Not the problem. A project manager with crews landing in six weeks feels the pain before HR even knows there\'s a need. Start with the person whose schedule breaks if housing or travel isn\'t handled.', color: '#D946EF' },
              { title: 'They lead with one service line and stop', body: 'A relocation signal often creates demand for temporary housing, destination services, AND travel. Not just one. Ask what else is moving before you pitch the first need. Multi-service accounts are your highest-value accounts.', color: '#A855F7' },
              { title: 'They treat the signal as a one-time event', body: 'A company that mobilizes once will mobilize again. Once you\'ve placed an account, watch their signals. Re-engage before the next project starts.', color: '#8B5CF6' },
              { title: 'They wait for the account to be "ready"', body: 'By the time an account is fully ready, they\'ve already called three other vendors. The best time to reach a project manager is the week the contract drops. Early outreach with a real signal reference earns a conversation.', color: '#7C3AED' },
            ].map(m => (
              <div key={m.title} className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(168,85,247,.12)' }}>
                <div className="grid" style={{ gridTemplateColumns: '3px 1fr' }}>
                  <div style={{ background: m.color }} />
                  <div className="p-4">
                    <p className="text-[13px] font-semibold mb-1 text-foreground">{m.title}</p>
                    <p className="text-[13px] leading-[1.6] text-muted-foreground">{m.body}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Bottom line */}
        <div className="p-4 flex gap-3.5 items-start" style={{ background: 'linear-gradient(135deg, #581C87, #4C1D95)' }}>
          <span className="text-[12px] font-bold uppercase tracking-wide whitespace-nowrap pt-0.5" style={{ color: '#E9D5FF' }}>Bottom line</span>
          <p className="text-[13px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.82)' }}>Good prospecting starts with change in the market. Not a random list. When you have a real signal, every other step in this guide gets faster.</p>
        </div>
      </div>

      <SectionNav currentTab="mindset" onNavigate={onNavigate} />
    </div>
  );
};

export default MindsetTab;