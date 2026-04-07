import { useState } from 'react';
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface ContactTabProps {
  onNavigate: (tabId: string) => void;
}

const verticals = [
  { icon: '🔨', name: 'Construction', signals: 'Mobilization, new site launch, phased buildouts', primary: 'Project Manager · Site Superintendent · Director of Operations', nonTrad: 'Mobilization Manager · Labor Coordinator · Commissioning Manager' },
  { icon: '🛡️', name: 'Defense', signals: 'Program ramp, deployment, contract transition', primary: 'Program Manager · Site Lead · Operations Director', nonTrad: 'Deployment Manager · Gov\'t Services Manager · Contract Transition Manager' },
  { icon: '🏭', name: 'Manufacturing', signals: 'Plant launch, installs, training cohorts, outages', primary: 'Plant Manager · Operations Manager · Training Manager', nonTrad: 'Launch Manager · Production Readiness Manager · Maintenance Outage Lead' },
  { icon: '⚡', name: 'Energy', signals: 'Turnarounds, outages, storm response, field maintenance', primary: 'Outage Manager · Turnaround Manager · Field Operations Manager', nonTrad: 'Crew Logistics Manager · Shutdown Planner · Project Controls Manager' },
  { icon: '🏥', name: 'Healthcare', signals: 'Travel clinicians, physician relocation, residency housing', primary: 'Clinical Staffing Manager · Recruitment Manager · Travel Program Manager', nonTrad: 'Physician Recruitment Manager · GME Coordinator · Workforce Planning Manager' },
  { icon: '💻', name: 'Tech', signals: 'Relocations, intern housing, office launch, deployment teams', primary: 'Global Mobility Manager · People Operations Manager · Program Manager', nonTrad: 'University Recruiting Manager · Employee Experience Manager · Travel Program Manager' },
  { icon: '🏀', name: 'Sports', signals: 'Draft picks, mid-season trades, spring training, front-office hires', primary: 'Director of Team Operations · Player Development Manager · VP of Ops', nonTrad: 'Team Services Coordinator · Player Engagement Manager · Scouting Ops Manager' },
  { icon: '🎭', name: 'Theater', signals: 'Cast arrivals, national tour layovers, seasonal staffing, guest residencies', primary: 'Company Manager · General Manager · Production Manager', nonTrad: 'Artist Housing Coordinator · Touring Ops Manager · Associate Producer' },
];

const discoveryLevels = [
  {
    level: '01', color: '#fb923c', label: 'Situation', desc: 'How are they literally doing the thing today?',
    questions: [
      'When your team travels for this project, how does housing get handled today?',
      'Who typically owns finding and booking accommodations?',
      'Are people sourcing their own places, or is there a central process?',
    ],
    listenFor: ['Hotels', 'Airbnb', 'Per diem', 'Everyone does their own thing', 'Admin handles it'],
    transition: 'Once you hear "everyone does their own thing" — you\'re in. Go to Level 02.',
  },
  {
    level: '02', color: '#f97316', label: 'Operational Problem', desc: 'The daily friction no one wants to own.',
    questions: [
      'How much time does your team spend coordinating housing logistics?',
      'What happens when someone shows up and the unit isn\'t ready — or the commute is 90 minutes?',
      'How do you track what you\'re actually spending across locations?',
    ],
    listenFor: ['Hours per week', 'No-shows', 'Complaints', 'Over budget', 'No visibility'],
    transition: 'When they quantify the pain (hours, dollars, complaints) — escalate to Level 03.',
  },
  {
    level: '03', color: '#ea580c', label: 'Executive Problem', desc: 'The bad news a VP would have to give a CEO.',
    questions: [
      'If this keeps happening, what does your VP have to report up?',
      'Has housing ever delayed a project timeline or lost you a candidate?',
      'What would leadership say if they saw the total spend across all locations?',
    ],
    listenFor: ['Timeline risk', 'Lost candidates', 'Board visibility', 'Audit exposure', 'Inconsistency'],
    transition: 'When it becomes a leadership-level problem — connect it to the business in Level 04.',
  },
  {
    level: '04', color: '#c2410c', label: 'Business Impact', desc: 'The C-level initiative, risk, or KPI at stake.',
    questions: [
      'What\'s the cost of a one-week delay on this project?',
      'How does housing fit into your broader talent retention or recruiting strategy?',
      'If you could eliminate housing as a variable entirely, what would that unlock?',
    ],
    listenFor: ['$M per week', 'Competitive disadvantage', 'Board milestone', 'Growth blocker'],
    transition: 'You\'re at impact. Now position your solution against the KPI they just named.',
  },
];

const workedExamples = [
  {
    icon: '🏭', title: 'Manufacturing Plant Launch',
    rows: [
      { label: 'Situation', text: 'New EV battery plant opening in rural Tennessee — 200+ technicians relocating over 4 months.' },
      { label: 'Operational', text: 'Crews arriving to no-shows, double bookings, and 90-minute commutes. Per diem 40% over budget.' },
      { label: 'Executive', text: '"We\'re three weeks behind on commissioning because we can\'t get crews on-site reliably."' },
      { label: 'Impact', text: 'Delayed production · $2M+/week in lost output · Board-level launch milestone at risk' },
    ],
  },
  {
    icon: '🏥', title: 'Healthcare Fellowship Program',
    rows: [
      { label: 'Situation', text: '35 fellows across 6 teaching hospitals — different start dates, families, 30-day notice windows.' },
      { label: 'Operational', text: 'GME coordinators spending 15+ hours per fellow sourcing apartments and fielding complaints.' },
      { label: 'Executive', text: '"We lost two top candidates to programs that offered better relocation support."' },
      { label: 'Impact', text: 'Weakened physician pipeline · Coordinator turnover · Competitive disadvantage in recruiting' },
    ],
  },
];

const ContactTab = ({ onNavigate }: ContactTabProps) => {
  const [selectedVertical, setSelectedVertical] = useState(0);
  const [openLevel, setOpenLevel] = useState<number | null>(null);
  const [openExample, setOpenExample] = useState<number | null>(null);

  const v = verticals[selectedVertical];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #fb923c, #f97316)">Step 05: Find the Right Person</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Who to Call</h2>
      <p className="text-[13px] max-w-[760px] mb-6 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(251,146,60,.1)' }}>
        The right message to the wrong person still fails. Match the buyer to the signal.
      </p>

      {/* Rule callout */}
      <div className="flex gap-3 items-start p-4 rounded-lg mb-7" style={{ background: 'rgba(251,146,60,.04)', borderLeft: '4px solid #fb923c', border: '1px solid rgba(251,146,60,.12)', borderLeftWidth: '4px' }}>
        <span className="text-[18px] flex-shrink-0">📌</span>
        <p className="text-[13px] leading-[1.65] text-foreground">
          <strong>HR is rarely the first pain owner.</strong> Start with whoever's job breaks if the need isn't solved — the project manager, operations lead, or mobilization coordinator.
        </p>
      </div>

      {/* ── POC Finder: Hero AI Tool ── */}
      <div className="rounded-xl overflow-hidden mb-8" style={{ boxShadow: '0 4px 24px rgba(0,0,0,.12)' }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: 'rgba(251,146,60,.15)' }}>
              <span className="text-[16px]">🎯</span>
            </div>
            <div>
              <p className="text-[14px] font-bold" style={{ color: '#fff' }}>POC Finder Prompt</p>
              <p className="text-[11px]" style={{ color: 'rgba(255,255,255,.5)' }}>Run after your company research</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: 'rgba(251,146,60,.12)', border: '1px solid rgba(251,146,60,.25)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#fb923c' }} />
            <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#fb923c' }}>AI Tool</span>
          </div>
        </div>
        <div className="p-5" style={{ background: '#fff', borderLeft: '1px solid rgba(251,146,60,.12)', borderRight: '1px solid rgba(251,146,60,.12)', borderBottom: '1px solid rgba(251,146,60,.12)', borderRadius: '0 0 12px 12px' }}>
          <PromptBox label="Paste into ChatGPT after your company research">
{`For [COMPANY NAME] — a company that is [DESCRIBE THE SIGNAL] — identify the best person to contact for temporary housing, travel, hotels, or destination services.

1. Based on the signal, which service line is most likely in play?
2. Who most likely owns this problem? Give me the exact title and why.
3. Find the actual person — name, title, LinkedIn URL if available.
4. Their top 3 challenges right now given this signal.
5. What language resonates with this role — what outcomes do they care about?
6. What would make them act now versus letting people figure it out themselves?`}
          </PromptBox>
        </div>
      </div>

      {/* ── Vertical Titles: Filterable ── */}
      <Eyebrow>Best Titles by Vertical</Eyebrow>
      <p className="text-[13px] text-muted-foreground mb-4">Pick the vertical. See who to target first.</p>

      {/* Vertical selector pills */}
      <div className="flex flex-wrap gap-2 mb-4">
        {verticals.map((vert, i) => (
          <button
            key={vert.name}
            onClick={() => setSelectedVertical(i)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-[12px] font-medium transition-all"
            style={{
              background: i === selectedVertical ? 'linear-gradient(135deg, #fb923c, #f97316)' : '#FAF7F2',
              color: i === selectedVertical ? '#fff' : '#64748B',
              border: `1px solid ${i === selectedVertical ? 'transparent' : 'rgba(251,146,60,.15)'}`,
              boxShadow: i === selectedVertical ? '0 4px 12px rgba(251,146,60,.3)' : 'none',
              transform: i === selectedVertical ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <span className="text-[14px]">{vert.icon}</span>
            {vert.name}
          </button>
        ))}
      </div>

      {/* Selected vertical card */}
      <div className="rounded-xl overflow-hidden border mb-8 transition-all" style={{ borderColor: 'rgba(251,146,60,.15)', boxShadow: '0 2px 12px rgba(0,0,0,.06)' }}>
        <div className="px-5 py-3.5 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 50%, #1e1050 100%)' }}>
          <span className="text-[20px]">{v.icon}</span>
          <p className="text-[15px] font-semibold" style={{ color: '#fff' }}>{v.name}</p>
        </div>
        <div className="p-5" style={{ background: '#fff' }}>
          <div className="mb-4 p-3 rounded-lg" style={{ background: '#FAF7F2' }}>
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Common Signals</p>
            <p className="text-[13px] text-foreground">{v.signals}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#fb923c' }}>🎯 Primary Titles</p>
              <div className="space-y-1.5">
                {v.primary.split(' · ').map(t => (
                  <div key={t} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(251,146,60,.04)', border: '1px solid rgba(251,146,60,.1)' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#fb923c' }} />
                    <p className="text-[13px] font-medium text-foreground">{t}</p>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#9B78C8' }}>💡 Non-Traditional</p>
              <div className="space-y-1.5">
                {v.nonTrad.split(' · ').map(t => (
                  <div key={t} className="flex items-center gap-2 p-2.5 rounded-lg" style={{ background: 'rgba(155,120,200,.04)', border: '1px solid rgba(155,120,200,.1)' }}>
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: '#9B78C8' }} />
                    <p className="text-[13px] font-medium text-foreground">{t}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Discovery Tree: Accordion ── */}
      <Eyebrow>Discovery Tree</Eyebrow>
      <p className="text-[13px] text-muted-foreground mb-4">Move from surface situation → business impact. Click each level to explore.</p>

      <div className="rounded-xl overflow-hidden mb-5" style={{ boxShadow: '0 2px 16px rgba(0,0,0,.08)' }}>
        {discoveryLevels.map((step, i) => {
          const isOpen = openLevel === i;
          const isLast = i === discoveryLevels.length - 1;
          return (
            <div key={step.level}>
              <button
                onClick={() => setOpenLevel(isOpen ? null : i)}
                className="w-full flex items-center gap-3.5 p-4 text-left transition-all"
                style={{
                  background: isOpen ? step.color : '#fff',
                  borderBottom: !isLast ? '1px solid rgba(251,146,60,.08)' : 'none',
                }}
              >
                <span
                  className="w-9 h-9 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0"
                  style={{
                    background: isOpen ? 'rgba(255,255,255,.25)' : step.color,
                    color: '#fff',
                    boxShadow: `0 2px 8px ${step.color}40`,
                  }}
                >
                  {step.level}
                </span>
                <div className="flex-1">
                  <p className="text-[14px] font-semibold" style={{ color: isOpen ? '#fff' : 'inherit' }}>{step.label}</p>
                  {!isOpen && <p className="text-[11px] text-muted-foreground mt-0.5">{step.desc}</p>}
                </div>
                <svg
                  className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                  style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)', color: isOpen ? 'rgba(255,255,255,.7)' : '#94A3B8' }}
                  fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}
              >
                <div className="p-5 space-y-4" style={{ background: '#fff', borderLeft: `3px solid ${step.color}` }}>
                  {/* Questions */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-2.5" style={{ color: step.color }}>💬 Ask These Questions</p>
                    <div className="space-y-2">
                      {step.questions.map((q, qi) => (
                        <div key={qi} className="flex gap-2.5 items-start p-2.5 rounded-lg" style={{ background: 'rgba(251,146,60,.03)', border: '1px solid rgba(251,146,60,.08)' }}>
                          <span className="text-[11px] font-bold mt-0.5 flex-shrink-0" style={{ color: step.color }}>{qi + 1}.</span>
                          <p className="text-[12.5px] leading-[1.6] text-foreground">{q}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Listen For */}
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wide mb-2" style={{ color: '#64748B' }}>👂 Listen For</p>
                    <div className="flex flex-wrap gap-1.5">
                      {step.listenFor.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium" style={{ background: `${step.color}12`, color: step.color, border: `1px solid ${step.color}25` }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Transition */}
                  <div className="flex gap-2.5 items-start p-3 rounded-lg" style={{ background: 'rgba(251,146,60,.04)', borderLeft: `3px solid ${step.color}` }}>
                    <span className="text-[13px] flex-shrink-0">→</span>
                    <p className="text-[12px] leading-[1.6] font-medium" style={{ color: step.color }}>{step.transition}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Worked Examples: Expandable ── */}
      <p className="text-[13px] font-semibold text-foreground mb-3">See it in practice</p>
      <div className="flex flex-col gap-3 mb-8">
        {workedExamples.map((ex, i) => (
          <div key={ex.title} className="rounded-xl overflow-hidden border" style={{ borderColor: 'rgba(251,146,60,.12)' }}>
            <button
              onClick={() => setOpenExample(openExample === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors"
              style={{ background: openExample === i ? 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' : '#FAF7F2' }}
            >
              <p className="text-[13px] font-semibold" style={{ color: openExample === i ? '#fff' : 'inherit' }}>
                {ex.icon} {ex.title}
              </p>
              <svg
                className="w-4 h-4 flex-shrink-0 transition-transform duration-200"
                style={{ color: openExample === i ? 'rgba(255,255,255,.5)' : '#94A3B8', transform: openExample === i ? 'rotate(180deg)' : 'rotate(0deg)' }}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            <div
              className="overflow-hidden transition-all duration-300"
              style={{ maxHeight: openExample === i ? '300px' : '0', opacity: openExample === i ? 1 : 0 }}
            >
              <div className="p-4 space-y-3" style={{ background: '#fff' }}>
                {ex.rows.map(r => (
                  <div key={r.label} className="flex gap-3 items-start">
                    <span className="text-[10px] font-bold uppercase tracking-wide mt-0.5 min-w-[70px]" style={{ color: '#f97316' }}>{r.label}</span>
                    <p className="text-[12px] leading-[1.6] text-foreground">{r.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ── Prioritization ── */}
      <div className="rounded-xl overflow-hidden" style={{ boxShadow: '0 4px 20px rgba(0,0,0,.1)' }}>
        <div className="p-5" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}>
          <p className="text-[12px] font-semibold uppercase tracking-wider mb-4" style={{ color: '#fb923c' }}>Outreach Priority Order</p>
          <div className="flex flex-col gap-3">
            {[
              { num: 1, text: 'Pain owner — operations, project leadership, mobility, or field logistics.' },
              { num: 2, text: 'Non-traditional title — whoever coordinates the move, launch, or outage.' },
              { num: 3, text: 'Procurement / travel — later, for vendor setup and invoicing.' },
            ].map((s) => (
              <div key={s.num} className="flex gap-3 items-center p-3 rounded-lg" style={{ background: 'rgba(255,255,255,.05)' }}>
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-bold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: '#fff' }}>{s.num}</div>
                <p className="text-[13px] leading-[1.5]" style={{ color: 'rgba(255,255,255,.85)' }}>{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-3.5 flex gap-3 items-start" style={{ borderTop: '1px solid rgba(255,255,255,.08)' }}>
            <span className="text-[14px] flex-shrink-0">💡</span>
            <p className="text-[12px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.6)' }}>
              <strong style={{ color: 'rgba(255,255,255,.85)' }}>Pattern:</strong> Project-based industries (construction, energy, defense) buy through <strong style={{ color: '#fb923c' }}>operations & field leaders</strong>. Program-based (tech, healthcare) buy through <strong style={{ color: '#fb923c' }}>mobility & people ops</strong>.
            </p>
          </div>
        </div>
      </div>

      <SectionNav currentTab="contact" onNavigate={onNavigate} />
    </div>
  );
};

export default ContactTab;
