import { useState } from 'react';
import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';
import type { VerticalData } from './types';

interface ResultsTabProps {
  onNavigate: (tabId: string) => void;
}

const verticals: Record<string, VerticalData> = {
  construction: {
    signal: { label: "Signal", tag: "HIGH", title: "New site mobilization. Q2 launch", body: "A regional GC just landed a $28M contract for a phased industrial build outside Nashville. Engineering and field crews mobilize in 6 weeks. No housing solution in place yet." },
    buyer: { label: "Who to call", tag: "Project Manager", title: "Marcus Reid. Project Manager", body: "He owns the timeline. If crews can't get placed quickly, his schedule slips. Start with him before going to HR or procurement." },
    angle: { label: "Outreach angle", tag: "Temp Housing + Hotels", title: "Crew placement before they land", body: "Mobilizations move fast and housing is always what gets sorted last. Lead with the contract win, connect it to the crew placement problem, offer to solve it clean." },
    email: { subj: "Nashville build, crew housing", body: "Marcus,\n\nSaw your team just landed the Phase 1 contract, big win.\n\nMobilizations like this move fast and housing for incoming crews is usually the last thing to get locked in. We work with project teams to get that sorted before they land.\n\nWorth a 15-minute call before your Q2 kickoff?" }
  },
  defense: {
    signal: { label: "Signal", tag: "HIGH", title: "Contract award, program ramp", body: "A mid-size defense contractor just received a major Army program award. Engineering and program staff deploy over 90 days across two phases." },
    buyer: { label: "Who to call", tag: "Program Manager", title: "Program Manager or Site Lead", body: "They own readiness. Delays in housing or travel setup become their problem on day one. Operations director is a strong secondary." },
    angle: { label: "Outreach angle", tag: "Temp Housing + Travel", title: "Program readiness from day one", body: "Frame it around the deployment timeline, not housing. They care about people being ready to work. Not scrambling for a place to stay or figuring out travel." },
    email: { subj: "Program housing", body: "Jennifer,\n\nCongrats on the contract award. That's a strong program win for your team.\n\nWhen engineering staff deploy in phases like this, getting housing and travel sorted early is what keeps the program on track. We handle that for teams so day one isn't spent on logistics.\n\nWorth a quick call before your first deployment wave?" }
  },
  energy: {
    signal: { label: "Signal", tag: "HIGH", title: "Planned outage or turnaround", body: "A utility operator in the Southeast is running a 6-week planned outage at a generation facility. 40+ contractors rotating on 2-week shifts. No travel or lodging program in place." },
    buyer: { label: "Who to call", tag: "Outage Manager", title: "Outage or Turnaround Manager", body: "They coordinate the entire crew logistics puzzle. Hotels, shuttles, shift overlap: it all lands on them. Start here before going to procurement." },
    angle: { label: "Outreach angle", tag: "Hotels + Travel", title: "Shift logistics handled cleanly", body: "Rotating crews on a tight outage schedule need lodging that works around shift times, not standard hotel check-in windows. Lead with that pain." },
    email: { subj: "Outage crew lodging — [Facility]", body: "Brian,\n\nHeard about the planned outage coming up this spring, looks like a significant one.\n\nRotating crews on shift schedules usually run into hotel issues fast, standard check-in windows don't work when your shifts don't line up with them. We handle lodging setups built around how your crew actually operates.\n\nWorth a quick call before you finalize your contractor logistics?" }
  },
  healthcare: {
    signal: { label: "Signal", tag: "MEDIUM", title: "Travel nurse cohort or residency launch", body: "A regional hospital system in Atlanta is onboarding 30 travel nurses for a 13-week assignment. HR is scrambling to find furnished housing close to the facility." },
    buyer: { label: "Who to call", tag: "Clinical Staffing or HR", title: "Clinical Staffing Manager or HR Manager", body: "They made the hire and now own the housing problem. Travel program managers are a strong second call once interest is confirmed." },
    angle: { label: "Outreach angle", tag: "Temp Housing + DS", title: "Housing that keeps nurses focused on the job", body: "Travel nurses who spend week one sorting out their living situation aren't focused on patient care. Lead with that, it's a quality and retention angle, not just a logistics one." },
    email: { subj: "Housing for your travel nurse cohort", body: "Diane,\n\nSaw your system is onboarding a travel nurse cohort next quarter. That's a real staffing commitment.\n\nWhen nurses arrive without housing locked in, the first week usually goes sideways. We work with healthcare teams to have furnished housing ready before they land, close to the facility, move-in ready.\n\nHappy to share how we've supported similar cohorts, worth a quick call?" }
  },
  tech: {
    signal: { label: "Signal", tag: "MEDIUM", title: "Office launch or intern cohort", body: "A Series C tech company is opening a second office in Austin and relocating 15 engineers from their SF HQ. Intern class of 22 starts in June. No relocation or housing program exists yet." },
    buyer: { label: "Who to call", tag: "People Ops or Global Mobility", title: "People Operations or Global Mobility Manager", body: "They own both the relocation and the intern experience. If there's no mobility function, go to the HR Manager directly. Facilities is a strong secondary for the office launch." },
    angle: { label: "Outreach angle", tag: "Temp Housing + DS", title: "Relocation that doesn't slow down hiring momentum", body: "Engineers who take 3 weeks to find an apartment are distracted engineers. Lead with the experience angle, housing that lets them show up ready." },
    email: { subj: "Austin office relocation housing", body: "Alex,\n\nSaw the Austin expansion announcement, exciting move for the team.\n\nRelocating engineers while standing up a new office is a lot to manage at once. We handle furnished housing for incoming teams so the transition stays clean and people land focused on the work.\n\nWorth a 15-minute call before your first relocation wave?" }
  },
  manufacturing: {
    signal: { label: "Signal", tag: "HIGH", title: "Plant launch or training cohort", body: "An industrial manufacturer is launching a new production line in your market. They're running 3 onboarding cohorts of 20 technicians over 6 months, all coming from out of state." },
    buyer: { label: "Who to call", tag: "Training or Plant Manager", title: "Training Manager or Plant Manager", body: "They own the readiness of each cohort. If technicians show up distracted by housing, it costs them time and ramp speed. Operations Manager is a strong second." },
    angle: { label: "Outreach angle", tag: "Temp Housing", title: "Cohort housing locked in before each wave", body: "Phased cohorts mean phased housing needs. Lead with the operational efficiency angle, pre-arranged housing means faster ramp, less distraction." },
    email: { subj: "Cohort housing", body: "Kevin,\n\nSaw you're ramping production with phased technician cohorts. That's a significant launch.\n\nBringing in out-of-state techs in waves usually means housing gets re-solved every time. We set it up in advance by cohort so each group lands ready to work.\n\nWorth a quick call before your first wave arrives?" }
  },
  sports: {
    signal: { label: "Signal", tag: "HIGH", title: "Player housing or fellowship program", body: "An NBA G-League affiliate is launching a rotational player development program. 12 players plus coaching staff need furnished housing for a 5-month season. Fellowship and intern cohorts also need placement." },
    buyer: { label: "Who to call", tag: "Team Operations", title: "Director of Team Operations or Player Services", body: "They coordinate everything off the court — housing, travel, settling in. For fellowship programs, the HR or program coordinator owns the housing need." },
    angle: { label: "Outreach angle", tag: "Temp Housing + DS", title: "Turnkey player and staff housing", body: "Teams need flexible, furnished housing that works around unpredictable schedules — trades, call-ups, mid-season roster changes. Lead with flexibility and proximity to the facility." },
    email: { subj: "Player housing program", body: "Jordan,\n\nSaw your team is gearing up for next season with a full roster plus a new fellowship cohort.\n\nHousing for players and staff on unpredictable schedules usually means a lot of last-minute scrambling. We handle furnished, flexible accommodations built around how sports teams actually operate.\n\nWorth a quick call to see if it fits your setup?" }
  },
  theater: {
    signal: { label: "Signal", tag: "HIGH", title: "Production season — rehearsals + runs with out-of-town talent", body: "A LORT theater is staging 3 productions this spring/summer. Each show has a 3–4 week rehearsal period plus a 30–60+ day run. Cast, directors, creative teams, and production crew are hired from out of town and need furnished housing near the venue." },
    buyer: { label: "Who to call", tag: "Company Manager", title: "Company Manager or General Manager", body: "The company manager coordinates all artist logistics — housing, travel, per diem. They're the first person who feels the pain when housing isn't sorted. Production Manager is a strong secondary. At smaller companies, the Artistic Director often makes housing decisions." },
    angle: { label: "Outreach angle", tag: "Temp Housing", title: "One partner across the full season", body: "Each production brings a new wave of out-of-town talent — cast, directors, creative teams, production and technical crew, touring staff. One housing partner across the full season means they solve this once, not show by show." },
    email: { subj: "Season housing", body: "Michael,\n\nSaw your theater has several productions coming up with extended rehearsal periods and 30+ day runs.\n\nThat's a lot of out-of-town talent cycling through — cast, directors, creative teams, production crew — each needing furnished housing on different timelines. We work with theater companies to handle all of that across the full season so you solve it once, not show by show.\n\nWorth a quick call to see if it fits your upcoming season?" }
  }
};

const verticalBtns = [
  { id: 'construction', label: '🔨 Construction' },
  { id: 'defense', label: '🛡️ Defense' },
  { id: 'energy', label: '⚡ Energy' },
  { id: 'healthcare', label: '🏥 Healthcare' },
  { id: 'tech', label: '💻 Tech & Consulting' },
  { id: 'manufacturing', label: '🏭 Manufacturing' },
  { id: 'sports', label: '🏀 Sports' },
  { id: 'theater', label: '🎭 Theater' },
];

const ResultsTab = ({ onNavigate }: ResultsTabProps) => {
  const [activeVertical, setActiveVertical] = useState('construction');
  const v = verticals[activeVertical];

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #E8BE70, #E8A87A)">Step 03: Every Morning</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Work Your Results</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Review overnight results. Prioritize the strongest signals. Move the right accounts into action.
      </p>

      {/* Sample result */}
      <Eyebrow>What Each Result Looks Like</Eyebrow>
      <div className="overflow-hidden border mb-6" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div className="flex items-center justify-between px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)', borderBottom: '2px solid #6366F1' }}>
          <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>Sample Daily Result — swap with your market</span>
          <span className="text-[11px] font-semibold uppercase tracking-wide px-3 py-1 rounded-full animate-priority-pulse" style={{ color: '#fff' }}>HIGH PRIORITY</span>
        </div>
        {[
          ['Company', 'Meridian Defense Systems'],
          ['City', 'Huntsville, AL'],
          ['Signal', 'Awarded $40M Army contract at Redstone Arsenal. Mobilization begins Q2'],
          ['Housing Use Case', '60+ engineers and contractors relocating for a 9-month build phase'],
          ['Estimated Stay', '6–12 months, phased arrivals'],
          ['Priority', 'HIGH. Defined timeline, large headcount, identifiable housing buyer.'],
        ].map(([k, val]) => (
          <div key={k} className="flex border-b last:border-b-0" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-[145px] flex-shrink-0 px-3.5 py-2.5 text-[12px] font-semibold border-r" style={{ background: '#F8FAFC', color: '#1E293B', borderColor: '#E2E8F0' }}>{k}</div>
            <div className="px-3.5 py-2.5 text-[13px] flex-1" style={{ color: '#334155' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Triage framework */}
      <div className="overflow-hidden border mb-4" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
        <div className="px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
          <span className="text-[12px] uppercase tracking-wider font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>Simple Triage Framework</span>
        </div>
        {[
          ['HIGH', 'Clear timeline, real people movement, and a likely buyer you can identify now. Call and research today.'],
          ['MEDIUM', 'Real change, but timing or ownership is not fully clear yet. Log it and keep watching.'],
          ['LOW', 'Interesting headline, but no defined movement, timing, or housing use case yet. Skip unless another signal confirms it.'],
        ].map(([k, val]) => (
          <div key={k} className="flex border-b last:border-b-0" style={{ borderColor: '#E2E8F0' }}>
            <div className="w-[120px] flex-shrink-0 px-3.5 py-4 text-[12px] font-bold tracking-wide border-r flex items-center" style={{ background: '#F8FAFC', color: '#1E293B', borderColor: '#E2E8F0' }}>{k}</div>
            <div className="px-4 py-4 text-[13px] flex-1 leading-[1.6]" style={{ color: '#334155' }}>{val}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          { num: 1, gradient: 'linear-gradient(135deg,#9B78C8,#A885D4)', text: 'Pull High priority first. These go straight onto your call list. Don\'t start anywhere else.' },
          { num: 2, gradient: 'linear-gradient(135deg,#D97895,#DE8AA0)', text: 'Log it in your CRM. Note the company name and the specific signal. You\'ll use it in every touchpoint.' },
          { num: 3, gradient: 'linear-gradient(135deg,#EBC980,#F0D490)', text: 'Scroll down to Research the Company before you call. Run the prompt on every HIGH account.' },
        ].map(s => (
          <div key={s.num} className="flex gap-3 items-start p-3.5 border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.05)' }}>
            <div className="min-w-[27px] h-[27px] rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5" style={{ background: s.gradient, color: '#fff' }}>{s.num}</div>
            <p className="text-[13px] leading-[1.65] text-muted-foreground"><strong className="text-foreground">{s.text.split('.')[0]}.</strong>{s.text.substring(s.text.indexOf('.') + 1)}</p>
          </div>
        ))}
      </div>

      {/* Call vs Email Decision Tree */}
      <Eyebrow>First Move Decision</Eyebrow>
      <h3 className="text-[18px] font-semibold mb-1.5 text-foreground">Call first or email first?</h3>
      <p className="text-[13px] text-muted-foreground mb-4">For every HIGH priority signal, your first move depends on the signal type. Not personal preference.</p>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        <div className="overflow-hidden border" style={{ borderColor: 'rgba(155,120,200,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
            <span>📞</span>
            <span className="text-[14px] font-bold" style={{ color: '#fff' }}>Call First</span>
          </div>
          <div className="p-4" style={{ background: '#fff' }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide mb-2 text-foreground">When the signal is time-bound</p>
            <div className="flex flex-col gap-1.5">
              {['🏗️ Contract award or mobilization starting soon', '⚡ Outage or turnaround with a defined start date', '🎓 Cohort or onboarding class arriving in weeks'].map(t => (
                <div key={t} className="text-[12px] p-2 border-l-[3px]" style={{ background: '#F8FAFC', borderColor: '#9B78C8', color: '#475569' }}>{t}</div>
              ))}
            </div>
            <p className="text-[12px] italic mt-2.5 text-muted-foreground">Time pressure = phone. They need a solution now and email gives them room to ignore it.</p>
          </div>
        </div>
        <div className="overflow-hidden border" style={{ borderColor: 'rgba(155,120,200,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div className="px-4 py-3 flex items-center gap-2" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
            <span>✉️</span>
            <span className="text-[14px] font-bold" style={{ color: '#fff' }}>Email First</span>
          </div>
          <div className="p-4" style={{ background: '#fff' }}>
            <p className="text-[12px] font-semibold uppercase tracking-wide mb-2 text-foreground">When the signal is early-stage</p>
            <div className="flex flex-col gap-1.5">
              {['🏢 Office opening or market entry: planning phase', '💰 Funding round. No confirmed move timeline yet', '🤝 M&A announcement: integration still being planned'].map(t => (
                <div key={t} className="text-[12px] p-2 border-l-[3px]" style={{ background: '#F8FAFC', borderColor: '#10B981', color: '#475569' }}>{t}</div>
              ))}
            </div>
            <p className="text-[12px] italic mt-2.5 text-muted-foreground">Longer timeline = email first. Warm them up, earn the call.</p>
          </div>
        </div>
      </div>

      {/* Vertical selector */}
      <Eyebrow>See It In Action</Eyebrow>
      <h3 className="text-[18px] font-semibold mb-1.5 text-foreground">What does this look like in your vertical?</h3>
      <p className="text-[13px] mb-4 text-muted-foreground">Pick the industry you're working and see exactly how the full flow applies: signal, buyer, and outreach angle.</p>

      <div className="flex flex-wrap gap-2 mb-5">
        {verticalBtns.map(b => (
          <button
            key={b.id}
            onClick={() => setActiveVertical(b.id)}
            className="px-4 py-2 text-[12px] font-semibold border-2 rounded-full transition-all duration-200"
            style={{
              background: activeVertical === b.id ? 'linear-gradient(135deg, #8B8FE8, #9B78C8)' : '#fff',
              borderColor: activeVertical === b.id ? '#6366F1' : '#E2E8F0',
              color: activeVertical === b.id ? '#fff' : '#64748B',
            }}
          >
            {b.label}
          </button>
        ))}
      </div>

      <div className="overflow-hidden border transition-all duration-300" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.2)', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
          {[v.signal, v.buyer, v.angle].map((col, i) => (
            <div key={i} className="p-5 md:border-r last:border-r-0" style={{ borderColor: '#D8E0EC' }}>
              <Eyebrow>{col.label}</Eyebrow>
              <span className="inline-block text-[11px] font-semibold px-2 py-0.5 mb-2" style={{ background: 'rgba(155,120,200,.12)', color: '#9B78C8' }}>{col.tag}</span>
              <h4 className="text-[14px] font-semibold mb-1.5 text-foreground">{col.title}</h4>
              <p className="text-[13px] leading-[1.65] text-muted-foreground">{col.body}</p>
            </div>
          ))}
        </div>
        <div className="p-5 border-t" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)', borderColor: 'rgba(155,120,200,.2)' }}>
          <div className="text-[10px] font-semibold uppercase tracking-[1.8px] mb-2.5" style={{ color: '#C4A5DE' }}>Sample first email</div>
          <div className="text-[12px] font-semibold mb-2" style={{ color: 'rgba(255,255,255,.55)' }}>Subject: {v.email.subj}</div>
          <div className="text-[13px] leading-[1.85] whitespace-pre-line" style={{ color: 'rgba(255,255,255,.9)' }}>{v.email.body}</div>
        </div>
      </div>

      {/* Research section (merged from deeper tab) */}
      <div className="mt-12">
        <div className="flex items-center gap-4 px-6 py-4" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(99,102,241,.2)' }}>
            <span className="text-[16px]">📋</span>
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.5)' }}>Before Every Call</p>
            <p className="text-[18px] font-semibold" style={{ color: '#fff' }}>Research the Company First</p>
          </div>
        </div>
        <div className="p-5 border border-t-0" style={{ borderColor: 'rgba(155,120,200,.12)', background: '#fff' }}>
          <p className="text-[13px] text-muted-foreground mb-4">A call without context is just a cold call. Run this on every HIGH priority account before you pick up the phone.</p>
          <PromptBox label="Company Research Prompt">
{`Give me a full intelligence brief on [COMPANY NAME] in [CITY] for a sales call.

1. What they do — industry, size, what they're known for
2. The specific trigger — the expansion, contract, move, or program that flagged them
3. ⭐ Recent positive news — 2–3 wins or milestones I can open my call with
4. Most likely service line — temp housing, travel, hotels, or destination services, and why
5. Estimated people, timing, and duration
6. Likely pain points for their team
7. Biggest logistical challenge this movement creates

Concise and scannable. I'm preparing for a call, not writing a report.`}
          </PromptBox>
          <div className="flex gap-3 items-start p-3.5" style={{ background: 'rgba(251,191,36,.06)', border: '1px solid rgba(251,191,36,.2)' }}>
            <span className="flex-shrink-0">💡</span>
            <p className="text-[13px] leading-[1.65] text-foreground"><strong>Use the positive news.</strong> When you open a call with something like <em>"I saw [Company] just landed [the contract / won the project], congratulations"</em> — you've shown you're not just another vendor dialing a list.</p>
          </div>
          <div className="flex gap-3 items-start p-3.5 mt-3" style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.18)' }}>
            <span className="flex-shrink-0">🔗</span>
            <p className="text-[13px] leading-[1.65] text-foreground">You can also <strong>paste a LinkedIn URL or news article directly</strong> and ask: <em>"Analyze this for temporary housing, travel, hotel, or destination services signals."</em></p>
          </div>
        </div>
      </div>

      <SectionNav currentTab="results" onNavigate={onNavigate} />
    </div>
  );
};

export default ResultsTab;
