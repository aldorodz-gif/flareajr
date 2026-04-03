import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface MindsetTabProps {
  onNavigate: (tabId: string) => void;
}

const MindsetTab = ({ onNavigate }: MindsetTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #D97FAA, #E8A87A)">MINDSET</Eyebrow>
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
              <div key={c.title} className="p-4 border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
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

        {/* Micro-Closes */}
        <section>
          <Eyebrow gradient="linear-gradient(90deg, #E8A87A, #EBC980)">From Raise the Bar</Eyebrow>
          <h3 className="text-[20px] font-semibold mb-1 text-foreground">Micro-Closes — Close Throughout, Not Just at the End</h3>
          <p className="text-[13px] text-muted-foreground mb-1.5">60% of B2B deals that reach proposal stage never close. Not because the solution was wrong — because alignment was never confirmed along the way.</p>
          <p className="text-[13px] text-muted-foreground mb-4">Micro-closes are small, intentional agreements gained throughout the sales process that confirm alignment, advance commitment, and reduce risk before the final decision.</p>

          <div className="flex flex-col gap-3">
            {[
              {
                num: '01',
                title: 'Agreement on the problem',
                gradient: 'linear-gradient(135deg,#9B78C8,#A885D4)',
                phrase: '"How might issues like these disrupt your operations?"',
                example: 'I completely understand your concern about cost control, and that\'s something we\'ve already helped several clients streamline by locking in corporate rates and eliminating last-minute booking premiums.',
              },
              {
                num: '02',
                title: 'Agreement on value',
                gradient: 'linear-gradient(135deg,#C47EAA,#CF8EBB)',
                phrase: '"Do you feel having a managed housing program like ours would create value for your team?"',
                example: 'While our clients initially come to us for the cost savings, they stay because we remove that operational drag entirely. Housing becomes one less thing your team has to manage.',
              },
              {
                num: '03',
                title: 'Agreement on urgency',
                gradient: 'linear-gradient(135deg,#D97895,#DE8AA0)',
                phrase: '"What would be the impact of these issues not being addressed over the next 6–12 months?"',
                example: '"What gets deprioritized when these things creep into the day-to-day operations?"',
              },
              {
                num: '04',
                title: 'Agreement on next steps',
                gradient: 'linear-gradient(135deg,#E8A87A,#EDB880)',
                phrase: '"Would it make sense to do a short working session to walk through your current process?"',
                example: 'Given that this is already pulling time from multiple teams, the most useful next step would be to map what a managed housing program would look like specifically for your use cases.',
              },
            ].map(mc => (
              <div key={mc.num} className="overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.06)' }}>
                <div className="flex items-center gap-3 px-4 py-3" style={{ background: mc.gradient }}>
                  <span className="text-[14px] font-bold" style={{ color: 'rgba(255,255,255,.5)' }}>{mc.num}</span>
                  <span className="text-[14px] font-semibold" style={{ color: '#fff' }}>{mc.title}</span>
                </div>
                <div className="p-4">
                  <p className="text-[13px] font-semibold italic mb-2.5 text-foreground">{mc.phrase}</p>
                  <p className="text-[13px] leading-[1.65] text-muted-foreground">{mc.example}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(155,120,200,.05)', border: '1px solid rgba(99,102,241,.18)' }}>
            <span className="text-[16px] flex-shrink-0 mt-0.5">💡</span>
            <p className="text-[13px] leading-[1.65] text-foreground">
              <strong>Yes/No questions work here — if you've earned them.</strong> If you've already built agreement on the problem and value, a direct question like "Would that create value for your team?" lands as a confirmation, not a gamble.
            </p>
          </div>
        </section>

        {/* BANT Reframed */}
        <section>
          <h3 className="text-[20px] font-semibold mb-1 text-foreground">Qualify Smarter — BANT Reframed</h3>
          <p className="text-[13px] text-muted-foreground mb-4">BANT isn't a checklist you run through. Each element should emerge naturally from the conversation — not from a scripted question.</p>

          <div className="overflow-hidden border" style={{ borderColor: 'rgba(155,120,200,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
            <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
              <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.55)' }}>BANT — How It Should Actually Work</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2">
              {[
                { letter: 'B', label: 'Budget', wrong: '"What\'s your budget?"', right: 'Emerges from discussing impact, cost of inaction, and priorities.' },
                { letter: 'A', label: 'Authority', wrong: '"Are you the decision-maker?"', right: 'Discovered by mapping the decision process, not by asking directly.' },
                { letter: 'N', label: 'Need', wrong: '"Do you need this?"', right: 'Must be buyer-stated and quantified. They tell you — you don\'t assume.' },
                { letter: 'T', label: 'Timing', wrong: '"When are you looking to start?"', right: 'Tied to business events, consequences, and urgency — not calendar dates.' },
              ].map((b, i) => (
                <div key={b.letter} className={`p-4 border-b ${i % 2 === 0 ? 'md:border-r' : ''}`} style={{ borderColor: '#E2E8F0', background: '#fff' }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-7 h-7 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #9B78C8, #C47EAA)', color: '#fff' }}>{b.letter}</span>
                    <span className="text-[14px] font-semibold text-foreground">{b.label}</span>
                  </div>
                  <p className="text-[12px] line-through mb-1.5" style={{ color: '#94A3B8' }}>{b.wrong}</p>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{b.right}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Stop selling the same way */}
        <section>
          <div className="flex gap-3 items-start p-4" style={{ background: '#E8D1AC', border: '1px solid rgba(16,65,118,.10)', borderRadius: '10px' }}>
            <span className="text-[20px] flex-shrink-0">⭐</span>
            <div>
              <p className="text-[13px] font-semibold mb-1 text-foreground">Stop selling the same way to everybody.</p>
              <p className="text-[13px] leading-[1.6] text-foreground">Creativity is how you stop competing on price. Every account has a different pain, a different timeline, and a different reason to act. Your job is to find it — not run the same pitch and hope it sticks.</p>
            </div>
          </div>
        </section>

        {/* Bottom line */}
        <div className="p-4 flex gap-3.5 items-start" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
          <span className="text-[12px] font-bold uppercase tracking-wide whitespace-nowrap pt-0.5" style={{ color: '#C4A5DE' }}>Bottom line</span>
          <p className="text-[13px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.82)' }}>Good prospecting starts with change in the market. Good closing starts with alignment you built along the way. When you have a real signal AND micro-close through the conversation, you don't need to "close hard" — you just confirm what's already been agreed.</p>
        </div>
      </div>

      <SectionNav currentTab="mindset" onNavigate={onNavigate} />
    </div>
  );
};

export default MindsetTab;
