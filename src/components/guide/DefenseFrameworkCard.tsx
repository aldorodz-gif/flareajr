import { useState } from 'react';
import Eyebrow from './Eyebrow';

const SECTIONS = [
  {
    id: 'logic',
    label: 'Market Logic',
    icon: '🎯',
    body: (
      <>
        <p className="text-[13px] leading-[1.7] text-foreground mb-3">
          The primary opportunity is <strong>not</strong> the large prime contractor itself — it's the
          SMB subcontractors supporting active projects, mobilizations, shipyard work, cybersecurity
          programs, federal modernization efforts, infrastructure expansion, and temporary workforce
          deployments.
        </p>
        <p className="text-[12px] text-muted-foreground">
          Prioritize companies showing project-based labor movement, federal contract activity,
          temporary team deployment, hiring surges, or operational expansion.
        </p>
      </>
    ),
  },
  {
    id: 'regions',
    label: 'Regions',
    icon: '📍',
    body: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid rgba(168,85,247,.15)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#0EA5E9' }}>Northern Virginia</p>
          <ul className="text-[12px] text-foreground space-y-0.5">
            <li>Tysons</li><li>Reston</li><li>Arlington</li>
            <li>Crystal City</li><li>Herndon</li><li>Ashburn</li>
          </ul>
        </div>
        <div className="p-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid rgba(45,212,191,.18)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: '#0d9488' }}>Southern Virginia</p>
          <ul className="text-[12px] text-foreground space-y-0.5">
            <li>Norfolk</li><li>Newport News</li>
            <li>Virginia Beach</li><li>Hampton Roads</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'verticals',
    label: 'Verticals',
    icon: '🏛️',
    body: (
      <div className="flex flex-wrap gap-1.5">
        {[
          'Defense subcontractors','Cleared staffing firms','Ship repair vendors',
          'Federal IT consultants','Engineering firms','Data center construction',
          'Navy support contractors','Infrastructure modernization','Cybersecurity support',
          'Federal mobility & relocation vendors',
        ].map(v => (
          <span key={v} className="text-[11px] px-2.5 py-1 rounded-full font-medium"
            style={{ background: 'rgba(236,72,153,.08)', color: '#DC2626', border: '1px solid rgba(236,72,153,.2)' }}>
            {v}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: 'triggers',
    label: 'Buying Triggers',
    icon: '⚡',
    body: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
        {[
          'New contract awards','Hiring surges','Traveling project teams',
          'Temporary assignments','Mobilization projects','Federal modernization',
          'Shipyard overhaul','Data center expansion','Infrastructure upgrades',
          'Relocation overflow','Multi-phase construction','Cleared staffing deployments',
          'Field operations expansion',
        ].map(t => (
          <div key={t} className="flex items-center gap-2 text-[12px] text-foreground">
            <span style={{ color: '#0EA5E9' }}>▸</span>{t}
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'profile',
    label: 'Target Profile',
    icon: '🏢',
    body: (
      <>
        <p className="text-[13px] text-foreground mb-2">
          <strong>SMB subcontractors, 50–500 employees</strong>, supporting larger defense ecosystems.
          Ideal stay length: <strong>30–180+ days</strong>.
        </p>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-2 mt-3" style={{ color: '#DC2626' }}>Anchor ecosystems</p>
        <div className="flex flex-wrap gap-1.5">
          {['CACI','Leidos','SAIC','ManTech','Newport News Shipbuilding','Navy support vendors','Federal systems integrators'].map(a => (
            <span key={a} className="text-[11px] px-2 py-0.5 rounded font-semibold"
              style={{ background: 'rgba(14,30,58,.06)', color: '#0e1e3a' }}>{a}</span>
          ))}
        </div>
      </>
    ),
  },
  {
    id: 'titles',
    label: 'Job Titles',
    icon: '👤',
    body: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
        {[
          'Program Managers','Project Managers','Operations Managers',
          'Mobility Specialists','Relocation Coordinators','Procurement Managers',
          'Facility Security Officers','Talent Acquisition Managers','Travel Coordinators',
          'Contracts Administrators','Site Leads','Project Engineers','Field Operations Managers',
        ].map(t => (
          <div key={t} className="text-[12px] text-foreground">• {t}</div>
        ))}
      </div>
    ),
  },
  {
    id: 'positioning',
    label: 'Positioning',
    icon: '🎤',
    body: (
      <>
        <div className="p-3 rounded-lg mb-3" style={{ background: 'rgba(168,85,247,.08)', border: '1px solid rgba(168,85,247,.2)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1" style={{ color: '#0EA5E9' }}>Positioning Statement</p>
          <p className="text-[14px] font-semibold text-foreground italic">
            "The outsourced housing department for project-based teams and mobilized workforce operations."
          </p>
        </div>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#DC2626' }}>Do NOT position as apartment providers</p>
        <p className="text-[12px] text-muted-foreground mb-2">Position as operational support for project execution, workforce deployment, mission readiness, and mobilized workforce housing.</p>
        <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5 mt-3" style={{ color: '#DC2626' }}>Core messaging angles</p>
        <ul className="text-[12px] text-foreground space-y-1">
          <li>• Move-in ready furnished housing near project sites</li>
          <li>• Flexible terms aligned with contract timelines</li>
          <li>• Housing within GSA per diem ranges</li>
          <li>• Fast deployment for project teams</li>
          <li>• Simplified logistics for rotating labor</li>
          <li>• Reliable accommodations for cleared personnel</li>
          <li>• Housing aligned with government project cycles</li>
        </ul>
      </>
    ),
  },
  {
    id: 'usecases',
    label: 'Use Cases',
    icon: '🛠️',
    body: (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0EA5E9' }}>Northern Virginia</p>
          <ul className="text-[12px] text-foreground space-y-1">
            <li>• Cybersecurity teams on federal contracts</li>
            <li>• Data center construction labor mobilization</li>
            <li>• Federal consultants awaiting relocation</li>
            <li>• Cleared IT teams on modernization</li>
            <li>• Temporary deployment teams for federal agencies</li>
          </ul>
        </div>
        <div>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0d9488' }}>Southern Virginia</p>
          <ul className="text-[12px] text-foreground space-y-1">
            <li>• Navy shipyard modernization</li>
            <li>• Rotating engineering teams</li>
            <li>• Traveling welders on vessel overhaul</li>
            <li>• Marine contractor labor deployments</li>
            <li>• Temporary infrastructure crews</li>
            <li>• Drydock support teams (extended stay)</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: 'discovery',
    label: 'Discovery',
    icon: '❓',
    body: (
      <ul className="text-[13px] text-foreground space-y-2">
        {[
          'Are your teams currently using hotels or furnished housing?',
          'Do you support rotating project labor or temporary deployments?',
          'Are your teams tied to project timelines or phased mobilizations?',
          'Do you currently manage temporary housing internally?',
          'Are there upcoming project expansions requiring additional workforce support?',
          'Are your project teams operating within government travel budgets or per diem guidelines?',
        ].map((q, i) => (
          <li key={q} className="flex gap-2.5">
            <span className="text-[11px] font-bold rounded-full w-5 h-5 flex items-center justify-center flex-shrink-0 mt-0.5"
              style={{ background: 'rgba(168,85,247,.12)', color: '#0EA5E9' }}>{i + 1}</span>
            <span className="leading-snug">{q}</span>
          </li>
        ))}
      </ul>
    ),
  },
  {
    id: 'tone',
    label: 'Email Tone',
    icon: '✉️',
    body: (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 rounded-lg" style={{ background: 'rgba(45,212,191,.08)', border: '1px solid rgba(45,212,191,.2)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#0d9488' }}>✓ Sound like</p>
          <ul className="text-[12px] text-foreground space-y-0.5">
            <li>• Operational</li><li>• Professional</li><li>• Efficient</li>
            <li>• Logistics-focused</li><li>• Direct</li><li>• Non-salesy</li>
          </ul>
        </div>
        <div className="p-3 rounded-lg" style={{ background: 'rgba(236,72,153,.06)', border: '1px solid rgba(236,72,153,.2)' }}>
          <p className="text-[11px] font-bold uppercase tracking-wider mb-1.5" style={{ color: '#DC2626' }}>✗ Avoid</p>
          <ul className="text-[12px] text-foreground space-y-0.5">
            <li>• Hospitality language</li>
            <li>• Lifestyle-focused messaging</li>
            <li>• Generic apartment terms</li>
            <li>• Overly promotional copy</li>
          </ul>
        </div>
      </div>
    ),
  },
];

export default function DefenseFrameworkCard() {
  const [active, setActive] = useState('logic');
  const section = SECTIONS.find(s => s.id === active) ?? SECTIONS[0];

  return (
    <section>
      <div className="overflow-hidden rounded-xl shadow-lg">
        <div className="relative px-6 py-5 overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #1a0d3e 40%, #2d1565 70%, #4a1d7a 100%)' }}>
          <div className="absolute top-0 right-1/4 w-44 h-44 opacity-20 pointer-events-none"
            style={{ background: 'radial-gradient(circle, rgba(168,85,247,.6), transparent 70%)' }} />
          <div className="relative z-10">
            <div className="flex items-center gap-2.5 mb-2 flex-wrap">
              <span className="text-[20px]">🛡️</span>
              <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-sm"
                style={{ background: 'linear-gradient(90deg, #0EA5E9, #DC2626)', color: '#fff' }}>
                Milo · WDC Playbook
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-white/60">
                Defense Vertical Intelligence
              </span>
            </div>
            <p className="text-[18px] font-extrabold tracking-tight text-white mb-1">
              Sell to the SMB subs powering the prime ecosystem
            </p>
            <p className="text-[12px]" style={{ color: '#d8b4fe' }}>
              Virginia defense, federal IT, shipyard, and data-center subcontractors with project-based labor movement.
            </p>
          </div>
        </div>

        <div className="border-x border-b rounded-b-xl bg-white" style={{ borderColor: 'rgba(168,85,247,.15)' }}>
          <div className="flex flex-wrap gap-1 p-3 border-b" style={{ borderColor: 'rgba(168,85,247,.1)' }}>
            {SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActive(s.id)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-semibold transition-all"
                style={{
                  background: active === s.id ? 'linear-gradient(135deg, #0EA5E9, #DC2626)' : 'rgba(168,85,247,.06)',
                  color: active === s.id ? '#fff' : '#0e1e3a',
                  border: `1px solid ${active === s.id ? 'transparent' : 'rgba(168,85,247,.15)'}`,
                }}>
                <span>{s.icon}</span><span>{s.label}</span>
              </button>
            ))}
          </div>
          <div className="p-5">{section.body}</div>
        </div>
      </div>
    </section>
  );
}
