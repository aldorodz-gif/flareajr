import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface SignalsTabProps {
  onNavigate: (tabId: string) => void;
}

const pursue = [
  { icon: '🏢', title: 'HQ or Regional Office Relocation', body: 'Teams moving cities — extended stays needed during transition.' },
  { icon: '🏗️', title: 'New Facility, Plant Launch or Expansion', body: 'Management and contractors on-site for months.' },
  { icon: '📋', title: 'Defense, Gov\'t or Commercial Contract Award', body: 'Engineering and field teams deployed for a defined period.' },
  { icon: '🏟️', title: 'Infrastructure Build Phase', body: 'Airport, stadium, or large construction — rotating crews across phases.' },
  { icon: '🎓', title: 'Intern Cohort / Training Academy', body: 'Defined group arriving at the same time for a fixed period.' },
  { icon: '⚡', title: 'Outage, Turnaround, or Seasonal Surge', body: 'Rotating crews on tight shift schedules need lodging and travel.' },
  { icon: '🏥', title: 'Travel Nurse / Clinical Staffing Cohort', body: '13-week assignments, residency classes, locum deployments.' },
  { icon: '🚀', title: 'New Market Entry / Branch Opening', body: 'Real physical footprint and real personnel movement.' },
];

const skip = [
  { icon: '📰', title: 'Vague "Growth" Headlines', body: 'No specific project, timeline, or people movement mentioned.' },
  { icon: '💼', title: 'Generic Hiring Posts', body: 'Job listings alone do not mean temporary housing or travel demand.' },
  { icon: '📈', title: 'Revenue or Funding Announcements', body: 'Unless tied to a physical expansion or relocation.' },
  { icon: '🏆', title: 'Awards or Brand Mentions', body: 'Good for openers, but not a demand signal by themselves.' },
];

const SignalsTab = ({ onNavigate }: SignalsTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #E8BE70, #E07878)">Quick Reference</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight" style={{ color: '#1E293B' }}>Signals Guide — What Counts as a Real Demand Signal</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5" style={{ color: '#64748B', borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        Use this as a fast filter. If the signal points to real people movement, pursue it. If it does not, move on.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4.5">
        {/* Pursue */}
        <div className="border overflow-hidden" style={{ background: '#fff', borderColor: 'rgba(0,0,0,.08)', boxShadow: '0 2px 10px rgba(0,0,0,.10)' }}>
          <h3 className="px-3 py-2 text-[14px] font-semibold" style={{ background: 'rgba(16,185,129,.12)', color: '#059669' }}>✅ Pursue These</h3>
          <div className="p-4 flex flex-col gap-2.5">
            {pursue.map(s => (
              <div key={s.title} className="p-3.5 border-l-[3px]" style={{ background: '#fff', borderColor: '#10B981', border: '1px solid rgba(99,102,241,.08)', borderLeftWidth: '3px', borderLeftColor: '#10B981' }}>
                <h4 className="text-[12px] font-semibold mb-1" style={{ color: '#1E293B' }}>{s.icon} {s.title}</h4>
                <p className="text-[12px] leading-[1.6]" style={{ color: '#64748B' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Skip */}
        <div className="border overflow-hidden" style={{ background: '#fff', borderColor: 'rgba(0,0,0,.08)', boxShadow: '0 2px 10px rgba(0,0,0,.10)' }}>
          <h3 className="px-3 py-2 text-[14px] font-semibold" style={{ background: 'rgba(239,68,68,.1)', color: '#DC2626' }}>❌ Skip These</h3>
          <div className="p-4 flex flex-col gap-2.5">
            {skip.map(s => (
              <div key={s.title} className="p-3.5 border-l-[3px]" style={{ background: 'rgba(239,68,68,.03)', borderColor: '#EF4444', border: '1px solid rgba(99,102,241,.08)', borderLeftWidth: '3px', borderLeftColor: '#EF4444' }}>
                <h4 className="text-[12px] font-semibold mb-1" style={{ color: '#DC2626' }}>{s.icon} {s.title}</h4>
                <p className="text-[12px] leading-[1.6]" style={{ color: '#64748B' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      <SectionNav currentTab="signals" onNavigate={onNavigate} />
    </div>
  );
};

export default SignalsTab;
