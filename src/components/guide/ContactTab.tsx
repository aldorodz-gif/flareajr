import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface ContactTabProps {
  onNavigate: (tabId: string) => void;
}

const verticalTitles = [
  { cols: [
    { icon: '🔨', name: 'Construction', signals: 'Mobilization, new site launch, phased buildouts', primary: 'Project Manager · Site Superintendent · Director of Operations', nonTrad: 'Mobilization Manager · Labor Coordinator · Commissioning Manager' },
    { icon: '🛡️', name: 'Defense & Gov\'t Contractors', signals: 'Program ramp, deployment, contract transition', primary: 'Program Manager · Site Lead · Operations Director', nonTrad: 'Deployment Manager · Gov\'t Services Manager · Contract Transition Manager' },
  ]},
  { cols: [
    { icon: '🏭', name: 'Manufacturing & Industrial', signals: 'Plant launch, installs, training cohorts, outages', primary: 'Plant Manager · Operations Manager · Training Manager', nonTrad: 'Launch Manager · Production Readiness Manager · Maintenance Outage Lead' },
    { icon: '⚡', name: 'Energy & Utilities', signals: 'Turnarounds, outages, storm response, field maintenance', primary: 'Outage Manager · Turnaround Manager · Field Operations Manager', nonTrad: 'Crew Logistics Manager · Shutdown Planner · Project Controls Manager' },
  ]},
  { cols: [
    { icon: '🏥', name: 'Healthcare', signals: 'Travel clinicians, physician relocation, residency housing', primary: 'Clinical Staffing Manager · Recruitment Manager · Travel Program Manager', nonTrad: 'Physician Recruitment Manager · GME Coordinator · Workforce Planning Manager' },
    { icon: '💻', name: 'Technology & Consulting', signals: 'Relocations, intern housing, office launch, deployment teams', primary: 'Global Mobility Manager · People Operations Manager · Program Manager', nonTrad: 'University Recruiting Manager · Employee Experience Manager · Travel Program Manager' },
  ]},
  { cols: [
    { icon: '🏀', name: 'Sports & Entertainment', signals: 'Draft picks relocating, mid-season trades, spring training rosters, front-office hires across markets', primary: 'Director of Team Operations · Player Development Manager · VP of Basketball/Football Ops', nonTrad: 'Team Services Coordinator · Player Engagement Manager · Scouting Operations Manager' },
    { icon: '🎭', name: 'Theater / Performing Arts', signals: 'Out-of-town cast arriving for rehearsals, national tour layovers, seasonal repertory staffing, guest artist residencies', primary: 'Company Manager · General Manager · Production Manager', nonTrad: 'Artist Housing Coordinator · Touring Operations Manager · Associate Producer · Resident Stage Manager' },
  ]},
];

const ContactTab = ({ onNavigate }: ContactTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #fb923c, #f97316)">Step 06: Find the Right Person</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Service Line Buyer Map</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(251,146,60,.1)' }}>
        Match the buyer to the signal. Start with whoever's job breaks if the need isn't solved. Not whoever has the most obvious title.
      </p>

      <div className="flex gap-3 items-start p-3.5 rounded-lg mb-6" style={{ background: 'rgba(251,146,60,.05)', border: '1px solid rgba(251,146,60,.15)' }}>
        <span className="flex-shrink-0">📌</span>
        <p className="text-[13px] leading-[1.65] text-foreground">
          <strong>The rule:</strong> In most accounts, HR is not the first pain owner. Match the buyer to the signal. Start with whoever's job breaks if the need is not solved.
        </p>
      </div>

      <PromptBox label="POC Finder Prompt — Run this after your company research">
{`For [COMPANY NAME] — a company that is [DESCRIBE THE SIGNAL] — identify the best person to contact for temporary housing, travel, hotels, or destination services.

1. Based on the signal, which service line is most likely in play?
2. Given that signal and service line, who most likely owns this problem? Give me the exact title and why.
3. Find the actual person in that role — name, title, LinkedIn URL if available.
4. What are their top 3 challenges right now given this expansion, project, move, or traveler demand?
5. What language resonates with this role — what outcomes do they care about most?
6. What would make them act now versus letting employees, crews, or travelers figure it out themselves?`}
      </PromptBox>

      <p className="text-[14px] font-semibold mb-1.5 text-foreground">Who Owns the Pain</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Start with the signal and service line. Pick the lane that owns the pain first.</p>

      {/* Discovery Tree Framework */}
      <div className="overflow-hidden rounded-xl border mb-6" style={{ borderColor: 'rgba(251,146,60,.12)' }}>
        <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}>
          <p className="text-[12px] font-bold uppercase tracking-[2px] mb-1" style={{ color: '#fb923c' }}>Discovery Tree</p>
          <p className="text-[13px] leading-[1.5]" style={{ color: 'rgba(255,255,255,.7)' }}>Move from surface-level situation to the business impact that gets executive attention.</p>
        </div>
        <div className="flex flex-col">
          {[
            { level: '01', color: '#fb923c', label: 'Situation', desc: 'How are they literally doing the thing today?', hint: 'Sourcing own housing · Staging own apartments · Putting people in hotels' },
            { level: '02', color: '#f97316', label: 'Operational Problem', desc: 'Something no one would want to do — the daily friction.', hint: 'Manual sourcing · Scattered expense reports · No consistency across locations' },
            { level: '03', color: '#ea580c', label: 'Executive Problem', desc: 'The bad news a VP would have to give a CEO.', hint: 'Recruiting inequities · Housing bottlenecks · Imbalanced spending across programs' },
            { level: '04', color: '#c2410c', label: 'Business Impact', desc: 'The C-level initiative, risk, or KPI that\'s at stake.', hint: 'Overspend · Reduced talent pipeline · Slow market growth · Lose top recruits' },
          ].map((step, i) => (
            <div key={step.level} className={`grid items-center p-4 ${i < 3 ? 'border-b' : ''}`} style={{ gridTemplateColumns: '44px 1fr', borderColor: 'rgba(251,146,60,.08)', background: '#fff' }}>
              <span className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0" style={{ background: step.color, color: '#fff' }}>{step.level}</span>
              <div>
                <p className="text-[13px] font-semibold text-foreground">{step.label}</p>
                <p className="text-[12px] text-muted-foreground mb-1">{step.desc}</p>
                <p className="text-[11px] italic" style={{ color: '#f97316' }}>{step.hint}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Worked Examples */}
      <p className="text-[14px] font-semibold mb-1.5 text-foreground">Discovery Tree in Practice</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Two real examples showing how to climb from surface situation to business impact.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        {[
          {
            icon: '🏭', title: 'Manufacturing Plant Launch',
            rows: [
              { label: 'Situation', text: 'New EV battery plant opening in rural Tennessee — 200+ technicians relocating over 4 months for commissioning and production ramp.' },
              { label: 'Operational', text: 'Site managers coordinating housing individually; crews arriving to no-shows, double bookings, and 90-minute commutes from the nearest hotel cluster.' },
              { label: 'Executive', text: '"We\'re three weeks behind on commissioning because we can\'t get crews on-site reliably — and per diem costs are 40% over budget."' },
              { label: 'Business Impact', text: 'Delayed production timeline · $2M+/week in lost output · Board-level launch milestone at risk' },
            ],
          },
          {
            icon: '🏥', title: 'Healthcare Fellowship Program',
            rows: [
              { label: 'Situation', text: 'Regional health system onboarding 35 fellows across 6 teaching hospitals — each arriving on different start dates with families, pets, and 30-day notice windows.' },
              { label: 'Operational', text: 'GME coordinators spending 15+ hours per fellow sourcing furnished apartments, negotiating short leases, and fielding complaints about quality.' },
              { label: 'Executive', text: '"We lost two top fellowship candidates to competing programs that offered better relocation support — and our coordinators are burning out."' },
              { label: 'Business Impact', text: 'Weakened physician pipeline · Increased coordinator turnover · Competitive disadvantage in GME recruiting' },
            ],
          },
        ].map(ex => (
          <div key={ex.title} className="overflow-hidden rounded-xl border" style={{ background: '#fff', borderColor: 'rgba(251,146,60,.12)' }}>
            <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}>
              <p className="text-[13px] font-semibold" style={{ color: '#fff' }}>{ex.icon} {ex.title}</p>
            </div>
            <div className="p-4 space-y-2.5">
              {ex.rows.map(r => (
                <div key={r.label}>
                  <p className="text-[11px] font-bold uppercase tracking-wide" style={{ color: '#f97316' }}>{r.label}</p>
                  <p className="text-[12px] leading-[1.55] text-foreground">{r.text}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Best Titles by Vertical */}
      <p className="text-[14px] font-semibold mb-1.5 text-foreground">Best Titles by Vertical</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Use the signal type to decide where to start: operations, project, mobility, or facilities.</p>

      <div className="flex flex-col gap-2 mb-6">
        {verticalTitles.map((row, ri) => (
          <div key={ri} className="overflow-hidden rounded-xl border" style={{ background: '#fff', borderColor: 'rgba(251,146,60,.12)' }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
              {row.cols.map((col, ci) => (
                <div key={ci} className={`p-4 ${ci === 0 ? 'md:border-r' : ''}`} style={{ borderColor: 'rgba(251,146,60,.08)' }}>
                  <p className="text-[12px] font-semibold mb-1.5 text-foreground">{col.icon} {col.name}</p>
                  <p className="text-[12px] text-muted-foreground mb-1"><strong>Signals:</strong> {col.signals}</p>
                  <p className="text-[12px] text-foreground"><strong>Primary:</strong> {col.primary}</p>
                  <p className="text-[12px] mt-1" style={{ color: '#f97316' }}><strong>Non-traditional:</strong> {col.nonTrad}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Prioritization */}
      <div className="p-5 rounded-xl" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}>
        <p className="text-[12px] font-semibold uppercase tracking-wider mb-3.5" style={{ color: '#fb923c' }}>How to Prioritize Your Outreach</p>
        <div className="flex flex-col gap-2.5">
          {[
            'Start with the pain owner in operations, project leadership, mobility, facilities, or field logistics.',
            'Add the non-traditional title that coordinates the move, launch, outage, or training wave.',
            'Bring in procurement or travel later when you need policy alignment, vendor setup, or invoicing support.',
          ].map((text, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="min-w-[22px] h-[22px] rounded-full flex items-center justify-center text-[11px] font-semibold flex-shrink-0" style={{ background: 'linear-gradient(135deg, #fb923c, #f97316)', color: '#fff' }}>{i + 1}</div>
              <p className="text-[13px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.8)' }}>{text}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-3.5" style={{ borderTop: '1px solid rgba(255,255,255,.1)' }}>
          <p className="text-[12px] font-semibold uppercase tracking-wide mb-1.5" style={{ color: '#fb923c' }}>Pattern to watch</p>
          <p className="text-[13px] leading-[1.6]" style={{ color: 'rgba(255,255,255,.75)' }}>Project-based industries (construction, energy, defense) buy through <strong style={{ color: '#fff' }}>operations and field leaders</strong>. Program-based industries (tech, consulting, healthcare) buy through <strong style={{ color: '#fff' }}>mobility, travel, facilities, or people operations</strong>.</p>
        </div>
      </div>

      <SectionNav currentTab="contact" onNavigate={onNavigate} />
    </div>
  );
};

export default ContactTab;