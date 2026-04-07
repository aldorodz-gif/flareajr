import { useState } from 'react';
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface ContactTabProps {
  onNavigate: (tabId: string) => void;
}

const verticals = [
  {
    icon: '🔨', name: 'Construction',
    signals: 'Mobilization, new site launch, phased buildouts',
    primary: [
      { title: 'Project Manager', cares: 'On-time delivery, crew readiness', opener: '"I saw you\'re mobilizing crews for [PROJECT] — how are you handling housing for the ramp?"' },
      { title: 'Site Superintendent', cares: 'Daily ops, crew availability', opener: '"When crews arrive on-site, who\'s making sure they have a place to stay that\'s close enough to be productive?"' },
      { title: 'Director of Operations', cares: 'Cost control, multi-site consistency', opener: '"Across your active sites, how consistent is the housing experience for traveling crews?"' },
    ],
    nonTrad: ['Mobilization Manager', 'Labor Coordinator', 'Commissioning Manager'],
    linkedInTip: 'Search: "mobilization" OR "site operations" + company name',
  },
  {
    icon: '🛡️', name: 'Defense',
    signals: 'Program ramp, deployment, contract transition',
    primary: [
      { title: 'Program Manager', cares: 'Contract milestones, team readiness', opener: '"With the [CONTRACT] transition, how are you staging housing for the incoming team?"' },
      { title: 'Site Lead', cares: 'On-ground ops, personnel welfare', opener: '"For your team deploying to [LOCATION], what\'s the current plan for 30+ day stays?"' },
      { title: 'Operations Director', cares: 'Cost, compliance, continuity', opener: '"How do you handle housing when you\'re ramping 50+ people into a new program site?"' },
    ],
    nonTrad: ['Deployment Manager', 'Gov\'t Services Manager', 'Contract Transition Manager'],
    linkedInTip: 'Search: "program operations" OR "deployment" + company name',
  },
  {
    icon: '🏭', name: 'Manufacturing',
    signals: 'Plant launch, installs, training cohorts, outages',
    primary: [
      { title: 'Plant Manager', cares: 'Launch timeline, production output', opener: '"With the new plant opening in [CITY], how are you housing the commissioning crews?"' },
      { title: 'Operations Manager', cares: 'Workforce availability, daily rhythm', opener: '"During install phase, what happens when a tech arrives and housing falls through?"' },
      { title: 'Training Manager', cares: 'Cohort logistics, retention', opener: '"For your training cohorts rotating through [FACILITY], who handles their accommodations?"' },
    ],
    nonTrad: ['Launch Manager', 'Production Readiness Manager', 'Maintenance Outage Lead'],
    linkedInTip: 'Search: "plant launch" OR "commissioning" OR "outage" + company name',
  },
  {
    icon: '⚡', name: 'Energy',
    signals: 'Turnarounds, outages, storm response, field maintenance',
    primary: [
      { title: 'Outage Manager', cares: 'Schedule adherence, crew logistics', opener: '"During your next turnaround, how are you planning to house 100+ contractors within commuting distance?"' },
      { title: 'Turnaround Manager', cares: 'Compressed timelines, cost per day', opener: '"What\'s your current setup for housing during the spring outage season?"' },
      { title: 'Field Operations Manager', cares: 'Crew welfare, retention in remote areas', opener: '"For your field crews in [REGION], how do you keep housing quality consistent?"' },
    ],
    nonTrad: ['Crew Logistics Manager', 'Shutdown Planner', 'Project Controls Manager'],
    linkedInTip: 'Search: "turnaround" OR "outage manager" OR "field operations" + company name',
  },
  {
    icon: '🏥', name: 'Healthcare',
    signals: 'Travel clinicians, physician relocation, residency housing',
    primary: [
      { title: 'Clinical Staffing Manager', cares: 'Fill rates, clinician satisfaction', opener: '"For your travel nurses on 13-week assignments, how does housing get handled today?"' },
      { title: 'Recruitment Manager', cares: 'Offer competitiveness, candidate experience', opener: '"When a top candidate asks about relocation support, what can you offer them today?"' },
      { title: 'Travel Program Manager', cares: 'Cost per assignment, quality control', opener: '"Across your travel program, how do you ensure housing quality without spending hours per placement?"' },
    ],
    nonTrad: ['Physician Recruitment Manager', 'GME Coordinator', 'Workforce Planning Manager'],
    linkedInTip: 'Search: "travel nurse program" OR "GME coordinator" OR "physician recruitment" + org name',
  },
  {
    icon: '💻', name: 'Tech',
    signals: 'Relocations, intern housing, office launch, deployment teams',
    primary: [
      { title: 'Global Mobility Manager', cares: 'Policy compliance, employee experience', opener: '"With [COMPANY] expanding to [CITY], how are you handling temporary housing during the transition?"' },
      { title: 'People Operations Manager', cares: 'Employee satisfaction, onboarding', opener: '"For new hires relocating, what does the first 30 days of housing look like?"' },
      { title: 'Program Manager', cares: 'Deployment logistics, team readiness', opener: '"When you deploy a team to a client site for 3+ months, who owns the housing piece?"' },
    ],
    nonTrad: ['University Recruiting Manager', 'Employee Experience Manager', 'Travel Program Manager'],
    linkedInTip: 'Search: "global mobility" OR "people operations" OR "intern program" + company name',
  },
  {
    icon: '🏀', name: 'Sports',
    signals: 'Draft picks, mid-season trades, spring training, front-office hires',
    primary: [
      { title: 'Director of Team Operations', cares: 'Player readiness, family experience', opener: '"When you bring in a mid-season trade, how quickly can you get them settled with housing?"' },
      { title: 'Player Development Manager', cares: 'Player focus, off-field stability', opener: '"For your draft picks arriving this summer, what does the housing setup look like?"' },
      { title: 'VP of Ops', cares: 'Brand experience, cost management', opener: '"Across spring training and the regular season, how do you manage housing for 20+ players and staff?"' },
    ],
    nonTrad: ['Team Services Coordinator', 'Player Engagement Manager', 'Scouting Ops Manager'],
    linkedInTip: 'Search: "team operations" OR "player services" + team name',
  },
  {
    icon: '🎭', name: 'Theater',
    signals: 'Cast arrivals, national tour layovers, seasonal staffing, guest residencies',
    primary: [
      { title: 'Company Manager', cares: 'Cast welfare, per diem budgets', opener: '"For your upcoming production, how are you housing out-of-town cast for the run?"' },
      { title: 'General Manager', cares: 'Production budget, vendor relationships', opener: '"Across your season, what does housing spend look like for guest artists and touring casts?"' },
      { title: 'Production Manager', cares: 'Logistics, timeline, rehearsal proximity', opener: '"When cast arrives for rehearsals, who makes sure they\'re close to the venue and settled in?"' },
    ],
    nonTrad: ['Artist Housing Coordinator', 'Touring Ops Manager', 'Associate Producer'],
    linkedInTip: 'Search: "company manager" OR "production manager" + theater/company name',
  },
];

const discoveryLevels = [
  {
    level: '01', label: 'Situation', desc: 'How are they literally doing the thing today?',
    questions: [
      'When your team travels for this project, how does housing get handled today?',
      'Who typically owns finding and booking accommodations?',
      'Are people sourcing their own places, or is there a central process?',
    ],
    listenFor: ['Hotels', 'Airbnb', 'Per diem', 'Everyone does their own thing', 'Admin handles it'],
    transition: 'Once you hear "everyone does their own thing" — you\'re in. Go to Level 02.',
  },
  {
    level: '02', label: 'Operational Problem', desc: 'The daily friction no one wants to own.',
    questions: [
      'How much time does your team spend coordinating housing logistics?',
      'What happens when someone shows up and the unit isn\'t ready — or the commute is 90 minutes?',
      'How do you track what you\'re actually spending across locations?',
    ],
    listenFor: ['Hours per week', 'No-shows', 'Complaints', 'Over budget', 'No visibility'],
    transition: 'When they quantify the pain (hours, dollars, complaints) — escalate to Level 03.',
  },
  {
    level: '03', label: 'Executive Problem', desc: 'The bad news a VP would have to give a CEO.',
    questions: [
      'If this keeps happening, what does your VP have to report up?',
      'Has housing ever delayed a project timeline or lost you a candidate?',
      'What would leadership say if they saw the total spend across all locations?',
    ],
    listenFor: ['Timeline risk', 'Lost candidates', 'Board visibility', 'Audit exposure', 'Inconsistency'],
    transition: 'When it becomes a leadership-level problem — connect it to the business in Level 04.',
  },
  {
    level: '04', label: 'Business Impact', desc: 'The C-level initiative, risk, or KPI at stake.',
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
    scenario: 'New EV battery plant opening in rural Tennessee — 200+ technicians relocating over 4 months.',
    rows: [
      { level: '01', label: 'Situation', text: 'Crews sourcing their own housing on Airbnb. Some commuting 90+ minutes. No central process.' },
      { level: '02', label: 'Operational', text: 'No-shows, double bookings, per diem 40% over budget. HR fielding 10+ complaints/week.' },
      { level: '03', label: 'Executive', text: '"We\'re three weeks behind on commissioning because we can\'t get crews on-site reliably."' },
      { level: '04', label: 'Impact', text: 'Delayed production · $2M+/week in lost output · Board-level launch milestone at risk.' },
    ],
    keyInsight: 'The Plant Manager doesn\'t think of this as a "housing" problem — it\'s a "why aren\'t my crews on-site" problem.',
    suggestedOpener: '"I saw your Tennessee plant is ramping commissioning — when 200 techs arrive over the next 4 months, who\'s making sure they have a place to stay that keeps them productive?"',
    bestContact: 'Plant Manager or Launch Manager',
  },
  {
    icon: '🏥', title: 'Healthcare Fellowship Program',
    scenario: '35 fellows across 6 teaching hospitals — different start dates, families, 30-day notice windows.',
    rows: [
      { level: '01', label: 'Situation', text: 'GME coordinators manually sourcing apartments. Fellows finding their own housing.' },
      { level: '02', label: 'Operational', text: '15+ hours per fellow on housing logistics. Quality inconsistent across sites.' },
      { level: '03', label: 'Executive', text: '"We lost two top candidates to programs that offered better relocation support."' },
      { level: '04', label: 'Impact', text: 'Weakened physician pipeline · Coordinator burnout · Competitive disadvantage in recruiting.' },
    ],
    keyInsight: 'The GME Coordinator is drowning but doesn\'t have budget authority. The DIO or Recruitment Manager does.',
    suggestedOpener: '"I work with teaching hospitals that have streamlined fellow housing — are your GME coordinators still spending 15+ hours per fellow on apartment sourcing?"',
    bestContact: 'Physician Recruitment Manager or DIO',
  },
];

// Consistent accent colors from design system
const ORANGE = 'hsl(25, 95%, 53%)'; // #f97316
const ORANGE_LIGHT = 'hsl(30, 96%, 62%)'; // #fb923c

const ContactTab = ({ onNavigate }: ContactTabProps) => {
  const [selectedVertical, setSelectedVertical] = useState(0);
  const [openLevel, setOpenLevel] = useState<number | null>(null);
  const [openExample, setOpenExample] = useState<number | null>(null);
  const [expandedTitle, setExpandedTitle] = useState<number | null>(null);

  const v = verticals[selectedVertical];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10 space-y-8">
      {/* ── Header ── */}
      <div>
        <Eyebrow gradient="linear-gradient(90deg, #fb923c, #f97316)">Step 05: Find the Right Person</Eyebrow>
        <h2 className="text-2xl font-semibold mb-1.5 leading-tight text-foreground">Who to Call</h2>
        <p className="text-sm text-muted-foreground max-w-[760px] pb-4 border-b border-border/40">
          The right message to the wrong person still fails. Match the buyer to the signal.
        </p>
      </div>

      {/* ── Rule callout ── */}
      <div className="flex gap-3 items-start p-4 rounded-lg bg-card border border-border/60" style={{ borderLeftWidth: 4, borderLeftColor: ORANGE }}>
        <span className="text-lg shrink-0">📌</span>
        <p className="text-sm leading-relaxed text-foreground">
          <strong>HR is rarely the first pain owner.</strong> Start with whoever's job breaks if the need isn't solved — the project manager, operations lead, or mobilization coordinator.
        </p>
      </div>

      {/* ── POC Finder: Hero AI Tool ── */}
      <div className="rounded-xl overflow-hidden shadow-lg">
        <div className="px-5 py-4 flex items-center justify-between bg-gradient-to-br from-[hsl(var(--navy))] to-[#1e1050]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full flex items-center justify-center bg-orange-500/15">
              <span className="text-base">🎯</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">POC Finder Prompt</p>
              <p className="text-[11px] text-white/50">Run after your company research</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-orange-500/12 border border-orange-500/25">
            <span className="w-2 h-2 rounded-full animate-pulse bg-orange-500" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-500">AI Tool</span>
          </div>
        </div>
        <div className="p-5 bg-card border border-t-0 border-border/40 rounded-b-xl">
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
      <div>
        <Eyebrow>Best Titles by Vertical</Eyebrow>
        <p className="text-sm text-muted-foreground mb-4">Pick the vertical. See who to target — and exactly what to say.</p>

        {/* Vertical selector pills */}
        <div className="flex flex-wrap gap-2 mb-4">
          {verticals.map((vert, i) => {
            const active = i === selectedVertical;
            return (
              <button
                key={vert.name}
                onClick={() => { setSelectedVertical(i); setExpandedTitle(null); }}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  active
                    ? 'text-white shadow-md scale-105'
                    : 'bg-card text-muted-foreground border border-border/60 hover:border-orange-500/30'
                }`}
                style={active ? { background: `linear-gradient(135deg, ${ORANGE_LIGHT}, ${ORANGE})` } : undefined}
              >
                <span className="text-sm">{vert.icon}</span>
                {vert.name}
              </button>
            );
          })}
        </div>

        {/* Selected vertical card */}
        <div className="rounded-xl overflow-hidden border border-border/60 shadow-sm">
          <div className="px-5 py-3.5 flex items-center gap-2.5 bg-gradient-to-br from-[hsl(var(--navy))] to-[#1e1050]">
            <span className="text-xl">{v.icon}</span>
            <p className="text-base font-semibold text-white">{v.name}</p>
          </div>
          <div className="p-5 bg-card space-y-5">
            {/* Signals */}
            <div className="p-3 rounded-lg bg-background/60">
              <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Common Signals</p>
              <p className="text-sm text-foreground">{v.signals}</p>
            </div>

            {/* Primary Titles — expandable */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-3 text-orange-500">🎯 Primary Titles — click for opener</p>
              <div className="space-y-1.5">
                {v.primary.map((t, ti) => {
                  const isExp = expandedTitle === ti;
                  return (
                    <div key={t.title} className="rounded-lg overflow-hidden border border-border/40 transition-all">
                      <button
                        onClick={() => setExpandedTitle(isExp ? null : ti)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                          isExp ? 'text-white' : 'bg-card hover:bg-background/60'
                        }`}
                        style={isExp ? { background: `linear-gradient(135deg, ${ORANGE_LIGHT}, ${ORANGE})` } : undefined}
                      >
                        <span className={`w-2 h-2 rounded-full shrink-0 ${isExp ? 'bg-white' : 'bg-orange-500'}`} />
                        <span className="text-sm font-medium flex-1">{t.title}</span>
                        <svg
                          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isExp ? 'text-white/70' : 'text-muted-foreground'}`}
                          style={{ transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)' }}
                          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      <div
                        className="overflow-hidden transition-all duration-300"
                        style={{ maxHeight: isExp ? '200px' : '0', opacity: isExp ? 1 : 0 }}
                      >
                        <div className="px-4 py-3 ml-5 space-y-2.5 border-l-2 border-orange-500/20 bg-card">
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">They care about</p>
                            <p className="text-xs text-foreground">{t.cares}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">Sample opener</p>
                            <p className="text-xs leading-relaxed italic text-orange-500">{t.opener}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Non-traditional */}
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wide mb-2 text-purple-400">💡 Non-Traditional Titles</p>
              <div className="flex flex-wrap gap-1.5">
                {v.nonTrad.map(t => (
                  <span key={t} className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-purple-500/5 border border-purple-500/15 text-purple-400">
                    {t}
                  </span>
                ))}
              </div>
            </div>

            {/* LinkedIn search tip */}
            <div className="flex gap-2.5 items-start p-3 rounded-lg bg-background/60 border-l-[3px] border-orange-500">
              <span className="text-sm shrink-0">🔍</span>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide text-muted-foreground mb-0.5">LinkedIn Search Tip</p>
                <p className="text-xs leading-snug font-mono text-orange-500">{v.linkedInTip}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Discovery Tree ── */}
      <div>
        <Eyebrow>Discovery Tree</Eyebrow>
        <p className="text-sm text-muted-foreground mb-4">Move from surface situation → business impact. Click each level for questions to ask.</p>

        <div className="rounded-xl overflow-hidden shadow-md border border-border/40">
          {discoveryLevels.map((step, i) => {
            const isOpen = openLevel === i;
            const isLast = i === discoveryLevels.length - 1;
            // Gradient from light to dark orange across levels
            const levelColors = ['hsl(30,96%,62%)', 'hsl(25,95%,53%)', 'hsl(22,90%,47%)', 'hsl(20,85%,40%)'];
            const color = levelColors[i];
            return (
              <div key={step.level}>
                <button
                  onClick={() => setOpenLevel(isOpen ? null : i)}
                  className="w-full flex items-center gap-4 p-4 text-left transition-all"
                  style={{
                    background: isOpen ? color : 'hsl(var(--card))',
                    borderBottom: !isLast ? '1px solid hsl(var(--border) / 0.4)' : 'none',
                  }}
                >
                  <span
                    className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white shadow-md"
                    style={{ background: isOpen ? 'rgba(255,255,255,.25)' : color }}
                  >
                    {step.level}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${isOpen ? 'text-white' : 'text-foreground'}`}>{step.label}</p>
                    {!isOpen && <p className="text-xs text-muted-foreground mt-0.5 truncate">{step.desc}</p>}
                  </div>
                  <svg
                    className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'text-white/70' : 'text-muted-foreground'}`}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? '500px' : '0', opacity: isOpen ? 1 : 0 }}
                >
                  <div className="p-5 space-y-4 bg-card" style={{ borderLeft: `3px solid ${color}` }}>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide mb-2.5" style={{ color }}>💬 Ask These Questions</p>
                      <div className="space-y-1.5">
                        {step.questions.map((q, qi) => (
                          <div key={qi} className="flex gap-2.5 items-start p-2.5 rounded-lg bg-background/40 border border-border/30">
                            <span className="text-[11px] font-bold mt-0.5 shrink-0" style={{ color }}>{qi + 1}.</span>
                            <p className="text-xs leading-relaxed text-foreground">{q}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-wide mb-2 text-muted-foreground">👂 Listen For</p>
                      <div className="flex flex-wrap gap-1.5">
                        {step.listenFor.map(tag => (
                          <span key={tag} className="px-2.5 py-1 rounded-full text-[11px] font-medium border" style={{ color, borderColor: `${color}40`, background: `${color}10` }}>
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2.5 items-start p-3 rounded-lg bg-background/40" style={{ borderLeft: `3px solid ${color}` }}>
                      <span className="text-sm shrink-0">→</span>
                      <p className="text-xs leading-relaxed font-medium" style={{ color }}>{step.transition}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Worked Examples ── */}
      <div>
        <Eyebrow>See It In Practice</Eyebrow>
        <p className="text-sm text-muted-foreground mb-4">Full discovery walkthroughs with the opener you'd actually use.</p>

        <div className="space-y-3">
          {workedExamples.map((ex, i) => {
            const isOpen = openExample === i;
            const levelColors = ['hsl(30,96%,62%)', 'hsl(25,95%,53%)', 'hsl(22,90%,47%)', 'hsl(20,85%,40%)'];
            return (
              <div key={ex.title} className="rounded-xl overflow-hidden shadow-md border border-border/40">
                <button
                  onClick={() => setOpenExample(isOpen ? null : i)}
                  className="w-full flex items-center justify-between px-5 py-4 text-left transition-all"
                  style={{ background: isOpen ? 'linear-gradient(135deg, hsl(var(--navy)), #1e1050)' : 'hsl(var(--card))' }}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold ${isOpen ? 'text-white' : 'text-foreground'}`}>
                      {ex.icon} {ex.title}
                    </p>
                    <p className={`text-xs mt-0.5 truncate ${isOpen ? 'text-white/50' : 'text-muted-foreground'}`}>
                      {ex.scenario.substring(0, 65)}…
                    </p>
                  </div>
                  <svg
                    className={`w-4 h-4 shrink-0 ml-3 transition-transform duration-200 ${isOpen ? 'text-white/50' : 'text-muted-foreground'}`}
                    style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                <div
                  className="overflow-hidden transition-all duration-300"
                  style={{ maxHeight: isOpen ? '800px' : '0', opacity: isOpen ? 1 : 0 }}
                >
                  <div className="p-5 space-y-4 bg-card border-l-[3px] border-orange-500">
                    {/* Scenario */}
                    <div className="p-3 rounded-lg bg-background/60">
                      <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground mb-1">Scenario</p>
                      <p className="text-sm leading-relaxed text-foreground">{ex.scenario}</p>
                    </div>

                    {/* Discovery progression */}
                    <div className="space-y-1.5">
                      {ex.rows.map((r, ri) => (
                        <div key={r.label} className="flex gap-3 items-start p-3 rounded-lg bg-background/30 border border-border/30">
                          <span
                            className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5 text-white"
                            style={{ background: levelColors[ri] }}
                          >
                            {r.level}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5" style={{ color: levelColors[ri] }}>{r.label}</p>
                            <p className="text-xs leading-relaxed text-foreground">{r.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Key Insight */}
                    <div className="flex gap-2.5 items-start p-3 rounded-lg bg-orange-500/5 border-l-[3px] border-orange-600">
                      <span className="text-sm shrink-0">💡</span>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wide mb-0.5 text-orange-600">Key Insight</p>
                        <p className="text-xs leading-relaxed text-foreground">{ex.keyInsight}</p>
                      </div>
                    </div>

                    {/* Suggested Opener */}
                    <div className="p-4 rounded-lg bg-gradient-to-br from-[hsl(var(--navy))] to-[#1e1050]">
                      <p className="text-[10px] font-bold uppercase tracking-wide mb-1.5 text-orange-500">✉️ Suggested Opener</p>
                      <p className="text-xs leading-relaxed italic text-white/85">{ex.suggestedOpener}</p>
                      <p className="text-[11px] mt-2.5 text-white/40">Best contact: <strong className="text-orange-500">{ex.bestContact}</strong></p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Outreach Priority Order ── */}
      <div className="rounded-xl overflow-hidden shadow-lg">
        <div className="p-6 bg-gradient-to-br from-[hsl(var(--navy))] to-[#1e1050] space-y-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-orange-500">Outreach Priority Order</p>
          <div className="space-y-3">
            {[
              {
                num: 1, title: 'Pain Owner',
                who: 'Operations, project leadership, mobility, or field logistics.',
                say: '"I work with companies like yours that are [SIGNAL] — the teams I support usually need housing handled before crews arrive. Is that something you\'re dealing with?"',
              },
              {
                num: 2, title: 'Non-Traditional Title',
                who: 'Whoever coordinates the move, launch, or outage.',
                say: '"I noticed [COMPANY] is [SIGNAL]. I often work with the person coordinating logistics for these kinds of moves — is that you, or can you point me to the right person?"',
              },
              {
                num: 3, title: 'Procurement / Travel',
                who: 'Later — for vendor setup, invoicing, and compliance.',
                say: '"We\'re already working with [PAIN OWNER NAME] on housing for [PROJECT]. They suggested I reach out to get us set up as a vendor — what\'s the best way to start that process?"',
              },
            ].map((s) => (
              <div key={s.num} className="p-4 rounded-lg bg-white/5 space-y-2.5">
                <div className="flex gap-3 items-center">
                  <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white" style={{ background: `linear-gradient(135deg, ${ORANGE_LIGHT}, ${ORANGE})` }}>{s.num}</div>
                  <div>
                    <p className="text-sm font-semibold text-white">{s.title}</p>
                    <p className="text-[11px] text-white/50">{s.who}</p>
                  </div>
                </div>
                <div className="ml-11 p-3 rounded-lg bg-orange-500/8 border-l-2 border-orange-500/30">
                  <p className="text-[10px] font-bold uppercase tracking-wide mb-1 text-orange-500">What to say</p>
                  <p className="text-xs leading-relaxed italic text-white/75">{s.say}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="pt-4 flex gap-3 items-start border-t border-white/8">
            <span className="text-sm shrink-0">💡</span>
            <p className="text-xs leading-relaxed text-white/60">
              <strong className="text-white/85">Pattern:</strong> Project-based industries (construction, energy, defense) buy through <strong className="text-orange-500">operations & field leaders</strong>. Program-based (tech, healthcare) buy through <strong className="text-orange-500">mobility & people ops</strong>.
            </p>
          </div>
        </div>
      </div>

      <SectionNav currentTab="contact" onNavigate={onNavigate} />
    </div>
  );
};

export default ContactTab;
