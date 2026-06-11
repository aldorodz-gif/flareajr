import { useState } from 'react';
import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useBdr } from './BdrContext';
import DefenseFrameworkCard from './DefenseFrameworkCard';
import MindsetLibrary from './MindsetLibrary';

interface MindsetTabProps {
  onNavigate: (tabId: string) => void;
}

const EXAMPLES = [
  { icon: '🎓', title: 'Intern & training cohorts', body: 'A company launches a summer intern program, technician training group, or onboarding cohort. That creates a defined group arriving at the same time for a fixed period.', look: 'Intern classes, academy launches, graduate rotations, training programs.' },
  { icon: '🏠', title: 'Employee relocation & bridge housing', body: 'A company opens a new office, expands into a new market, or transfers staff before permanent housing is secured.', look: 'Office openings, new market entry, regional expansions, leadership moves.' },
  { icon: '🏗️', title: 'Major facility expansions', body: 'A manufacturer or energy company launches a new site, expands an existing one, or moves through multiple phases of a project.', look: 'Plant construction, phased openings, project mobilization, commissioning.' },
  { icon: '📍', title: 'New operating bases', body: 'A company establishes a new branch, regional hub, operations center, or service base in your market.', look: 'New bases, new hubs, branch openings, service center launches.' },
];

const MISTAKES = [
  { num: '01', title: 'They go to HR first. Every time.', body: 'HR owns the policy and the vendor setup. Not the problem. A project manager with crews landing in six weeks feels the pain before HR even knows there\'s a need. Start with the person whose schedule breaks if housing or travel isn\'t handled.' },
  { num: '02', title: 'They lead with one service line and stop', body: 'A relocation signal often creates demand for temporary housing, destination services, AND travel. Not just one. Ask what else is moving before you pitch the first need. Multi-service accounts are your highest-value accounts.' },
  { num: '03', title: 'They treat the signal as a one-time event', body: 'A company that mobilizes once will mobilize again. Once you\'ve placed an account, watch their signals. Re-engage before the next project starts.' },
  { num: '04', title: 'They wait for the account to be "ready"', body: 'By the time an account is fully ready, they\'ve already called three other vendors. The best time to reach a project manager is the week the contract drops. Early outreach with a real signal reference earns a conversation.' },
];

const MindsetTab = ({ onNavigate }: MindsetTabProps) => {
  const [activeExample, setActiveExample] = useState(0);
  const { selected } = useBdr();
  const showDefense =
    !!selected &&
    (/milo/i.test(selected.name) ||
      (selected.markets || []).some(m => /\bwdc\b|washington|virginia|\bva\b|norfolk|tysons|reston|arlington|hampton|newport/i.test(m)));

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #DC2626, #ea580c)">Level Up</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Prospecting Philosophy</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(251,146,60,.1)' }}>
        Come back here when your outreach feels generic, when you're stuck, or when you need to refocus on what actually matters.
      </p>

      <div className="flex flex-col gap-8">
        <MindsetLibrary />
        {showDefense && <DefenseFrameworkCard />}

        {/* ── Buyer Persona Chain ── Hero Card */}
        <section>
          <div className="overflow-hidden rounded-xl shadow-lg">
            <div
              className="relative px-6 py-6 overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 70%, #3b1560 100%)' }}
            >
              <div className="absolute top-0 right-1/4 w-44 h-44 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(251,146,60,.6), transparent 70%)' }} />
              <div className="absolute bottom-0 left-1/4 w-36 h-36 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(168,85,247,.5), transparent 70%)' }} />
              
              <div className="relative z-10">
                <div className="flex items-center gap-2.5 mb-3">
                  <span className="text-[20px]">💡</span>
                  <span
                    className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm"
                    style={{ background: 'linear-gradient(90deg, #DC2626, #f9a8d4)', color: '#0a0a14' }}
                  >
                    Core Principle
                  </span>
                </div>
                <p className="text-[20px] font-extrabold tracking-tight text-white mb-1">We Sell Company Goals</p>
                <p className="text-[13px] font-medium" style={{ color: '#f9a8d4' }}>
                  Disguised as temp housing & relocation. Every buyer conversation starts with what the company is trying to achieve.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 border-x border-b rounded-b-xl" style={{ borderColor: 'rgba(251,146,60,.12)', background: '#fff' }}>
              {[
                { icon: '🎯', num: '1', title: "Company's Goals", desc: 'Growth, expansion, new markets, operational efficiency — the C-level agenda driving everything downstream.' },
                { icon: '⚙️', num: '2', title: 'Programs & Initiatives', desc: 'Intern cohorts, LDPs, rotational programs, office launches, project mobilizations.' },
                { icon: '👥', num: '3', title: 'The Talent Moving', desc: 'HR Managers, Department Heads, L&D, Recruiters, Interns — the people who physically need to move.' },
              ].map((step, i) => (
                <div key={step.title} className={`p-5 ${i < 2 ? 'md:border-r' : ''} group/step hover:bg-accent/30 transition-colors`} style={{ borderColor: 'rgba(251,146,60,.08)' }}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-[18px]">{step.icon}</span>
                    <span className="text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center" style={{ background: 'rgba(251,146,60,.1)', color: '#DC2626' }}>{step.num}</span>
                  </div>
                  <p className="text-[13px] font-semibold mb-1 text-foreground">{step.title}</p>
                  <p className="text-[12px] leading-[1.6] text-muted-foreground">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 items-start p-3.5 rounded-lg mt-3" style={{ background: 'rgba(251,146,60,.05)', border: '1px solid rgba(251,146,60,.15)' }}>
            <span className="text-[16px] flex-shrink-0 mt-0.5">📌</span>
            <p className="text-[13px] leading-[1.65] text-foreground">
              <strong>Example — Intern/Trainee Program:</strong> The company goal is growth. The initiative is the intern class. The talent is HR, Department Heads, and L&D coordinating 50 interns arriving in June. That's your signal — and your opening.
            </p>
          </div>
        </section>

        {/* ── Market Intelligence ── */}
        <section>
          <h3 className="text-[18px] font-semibold mb-1 text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px]" style={{ background: 'rgba(251,146,60,.1)' }}>🔍</span>
            Use market intelligence before building lists
          </h3>
          <p className="text-[13px] text-muted-foreground mb-3 ml-9">See where movement is building. Then focus your prospecting there.</p>

          <div className="ml-9 p-4 rounded-xl border" style={{ background: '#fff', borderColor: 'rgba(251,146,60,.12)' }}>
            <p className="text-[11px] font-bold uppercase tracking-[2px] mb-3" style={{ color: '#DC2626' }}>Ask yourself</p>
            <div className="flex flex-col gap-2">
              {['What is changing in my market right now?', 'Does it imply physical people movement?', 'Which companies are tied to it, and who inside owns the problem?'].map((q, i) => (
                <div key={q} className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-accent/30 transition-colors">
                  <span className="text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5" style={{ background: 'rgba(251,146,60,.1)', color: '#DC2626' }}>{i + 1}</span>
                  <p className="text-[13px] text-foreground">{q}</p>
                </div>
              ))}
            </div>
            <p className="text-[12px] text-muted-foreground mt-3 pt-3" style={{ borderTop: '1px solid rgba(251,146,60,.08)' }}>
              Run a territory prompt first to spot where demand is forming. Then go deeper on specific companies, contacts, and angles.
            </p>
          </div>
        </section>

        {/* ── Real Examples ── Tabbed selector */}
        <section>
          <h3 className="text-[18px] font-semibold mb-1 text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px]" style={{ background: 'rgba(251,146,60,.1)' }}>⚡</span>
            Real examples of what this looks like
          </h3>
          <p className="text-[13px] text-muted-foreground mb-3 ml-9">The strongest opportunities come from a business change that is both physical and time-bound.</p>

          <div className="ml-9">
            {/* Selector pills */}
            <div className="flex flex-wrap gap-2 mb-3">
              {EXAMPLES.map((ex, i) => (
                <button
                  key={ex.title}
                  onClick={() => setActiveExample(i)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all duration-200"
                  style={{
                    background: activeExample === i ? 'linear-gradient(135deg, #DC2626, #ea580c)' : 'rgba(251,146,60,.06)',
                    color: activeExample === i ? '#fff' : undefined,
                    border: `1px solid ${activeExample === i ? 'transparent' : 'rgba(251,146,60,.15)'}`,
                  }}
                >
                  <span>{ex.icon}</span>
                  <span>{ex.title}</span>
                </button>
              ))}
            </div>

            {/* Active card */}
            <div className="p-5 rounded-xl border transition-all duration-300" style={{ background: '#FFFFFF', borderColor: 'rgba(251,146,60,.15)' }}>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[20px]">{EXAMPLES[activeExample].icon}</span>
                <strong className="text-[15px] text-foreground">{EXAMPLES[activeExample].title}</strong>
              </div>
              <p className="text-[13px] leading-[1.7] mb-3 text-muted-foreground">{EXAMPLES[activeExample].body}</p>
              <div className="flex items-start gap-2 p-3 rounded-lg" style={{ background: 'rgba(251,146,60,.06)', border: '1px solid rgba(251,146,60,.1)' }}>
                <span className="text-[12px] font-bold flex-shrink-0 mt-0.5" style={{ color: '#DC2626' }}>👀</span>
                <p className="text-[13px] text-foreground"><strong>What to look for:</strong> {EXAMPLES[activeExample].look}</p>
              </div>
            </div>
          </div>
        </section>

        {/* ── What Experienced Reps Miss ── Accordion */}
        <section>
          <h3 className="text-[18px] font-semibold mb-1 text-foreground flex items-center gap-2">
            <span className="w-7 h-7 rounded-lg flex items-center justify-center text-[14px]" style={{ background: 'rgba(251,146,60,.1)' }}>🚫</span>
            What experienced reps often miss
          </h3>
          <p className="text-[13px] text-muted-foreground mb-3 ml-9">These patterns separate the reps who close on signal-based accounts from the ones stuck in follow-up cycles.</p>

          <div className="ml-9">
            <Accordion type="single" collapsible className="space-y-2">
              {MISTAKES.map((m) => (
                <AccordionItem key={m.num} value={m.num} className="border rounded-xl overflow-hidden" style={{ borderColor: 'rgba(251,146,60,.12)', background: '#fff' }}>
                  <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-accent/30 transition-colors">
                    <div className="flex items-center gap-3 text-left">
                      <span className="text-[11px] font-bold rounded-md w-7 h-7 flex items-center justify-center flex-shrink-0"
                        style={{ background: 'linear-gradient(135deg, #DC2626, #ea580c)', color: '#fff' }}
                      >{m.num}</span>
                      <span className="text-[13px] font-semibold text-foreground">{m.title}</span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="ml-10">
                      <p className="text-[13px] leading-[1.7] text-muted-foreground">{m.body}</p>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* ── Closing callout ── */}
        <section>
          <div className="overflow-hidden rounded-xl" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}>
            <div className="relative p-6 overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(251,146,60,.6), transparent 70%)' }} />
              <div className="relative z-10 flex gap-3 items-start">
                <span className="text-[24px] flex-shrink-0">⭐</span>
                <div>
                  <p className="text-[15px] font-bold mb-1.5 text-white">Every account is different. Sell like it.</p>
                  <p className="text-[13px] leading-[1.7]" style={{ color: 'rgba(255,255,255,.75)' }}>
                    When your outreach sounds the same regardless of the account, you're competing on price by default. The rep who tailors the message to the signal, the buyer, and the business moment — that's the one who earns the conversation.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <SectionNav currentTab="mindset" onNavigate={onNavigate} />
    </div>
  );
};

export default MindsetTab;
