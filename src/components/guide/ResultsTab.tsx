import Eyebrow from './Eyebrow';
import PromptBox from './PromptBox';
import SectionNav from './SectionNav';

interface ResultsTabProps {
  onNavigate: (tabId: string) => void;
}

const ResultsTab = ({ onNavigate }: ResultsTabProps) => {
  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #fb923c, #f97316)">Step 03: Every Morning</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Work Your Results</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(251,146,60,.1)' }}>
        Your overnight Agent Mode search just dropped results. Here's how to move through them quickly and get the strongest signals onto your call list.
      </p>

      {/* ── What a result looks like ── */}
      <Eyebrow>What Each Result Looks Like</Eyebrow>
      <div className="overflow-hidden rounded-xl border mb-6" style={{ background: '#fff', borderColor: 'rgba(251,146,60,.15)', boxShadow: '0 2px 8px rgba(0,0,0,.06)' }}>
        <div className="flex items-center justify-between px-4 py-3.5" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)', borderBottom: '2px solid #fb923c' }}>
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
          <div key={k} className="flex border-b last:border-b-0" style={{ borderColor: 'rgba(251,146,60,.08)' }}>
            <div className="w-[145px] flex-shrink-0 px-3.5 py-2.5 text-[12px] font-semibold border-r" style={{ background: '#FAF7F2', color: '#1E293B', borderColor: 'rgba(251,146,60,.08)' }}>{k}</div>
            <div className="px-3.5 py-2.5 text-[13px] flex-1" style={{ color: '#334155' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* ── Morning workflow ── */}
      <Eyebrow>Your Morning Routine</Eyebrow>
      <h3 className="text-[18px] font-semibold mb-1.5 text-foreground">Three steps, every morning</h3>
      <p className="text-[13px] text-muted-foreground mb-4">Don't overthink it. Open your results, pull the strongest signals, and move them into action.</p>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          { num: 1, gradient: 'linear-gradient(135deg, #fb923c, #f97316)', title: 'Scan for HIGH priority signals.', body: 'Look for defined timelines, real headcount, and identifiable buyers. These go straight onto your call list — don\'t start anywhere else.' },
          { num: 2, gradient: 'linear-gradient(135deg, #f97316, #ea580c)', title: 'Log each signal in your CRM.', body: 'Note the company name, the specific signal, and the likely service line. You\'ll reference this in every touchpoint going forward.' },
          { num: 3, gradient: 'linear-gradient(135deg, #ea580c, #c2410c)', title: 'Research before you reach out.', body: 'Run the Company Research Prompt below on every HIGH account. A call without context is just a cold call.' },
        ].map(s => (
          <div key={s.num} className="flex gap-3 items-start p-3.5 rounded-lg border" style={{ background: '#FAF7F2', borderColor: 'rgba(251,146,60,.12)', boxShadow: '0 1px 3px rgba(0,0,0,.04)' }}>
            <div className="min-w-[27px] h-[27px] rounded-full flex items-center justify-center text-[12px] font-semibold flex-shrink-0 mt-0.5" style={{ background: s.gradient, color: '#fff' }}>{s.num}</div>
            <p className="text-[13px] leading-[1.65] text-muted-foreground"><strong className="text-foreground">{s.title}</strong> {s.body}</p>
          </div>
        ))}
      </div>

      {/* ── Cross-reference tips ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        <button
          onClick={() => onNavigate('signals')}
          className="flex gap-3 items-start p-4 rounded-xl text-left transition-all hover:shadow-md"
          style={{ background: 'rgba(232,190,112,.06)', border: '1px solid rgba(232,190,112,.2)' }}
        >
          <span className="text-[18px] flex-shrink-0">⚡</span>
          <div>
            <p className="text-[13px] font-semibold text-foreground mb-0.5">Not sure if a signal is worth pursuing?</p>
            <p className="text-[12px] text-muted-foreground">Use the <strong className="text-foreground">Signal Scorer</strong> to get an instant HIGH / MEDIUM / LOW rating.</p>
          </div>
        </button>
        <button
          onClick={() => onNavigate('contact')}
          className="flex gap-3 items-start p-4 rounded-xl text-left transition-all hover:shadow-md"
          style={{ background: 'rgba(251,146,60,.06)', border: '1px solid rgba(251,146,60,.2)' }}
        >
          <span className="text-[18px] flex-shrink-0">🎯</span>
          <div>
            <p className="text-[13px] font-semibold text-foreground mb-0.5">Know the signal but not who to call?</p>
            <p className="text-[12px] text-muted-foreground">Jump to <strong className="text-foreground">Who to Call</strong> for buyer titles by vertical and the Discovery Tree.</p>
          </div>
        </button>
      </div>

      {/* ── Research section ── */}
      <div>
        <div className="flex items-center gap-4 px-6 py-4 rounded-t-xl" style={{ background: 'linear-gradient(135deg, #0a0a14 0%, #12082e 40%, #1e1050 100%)' }}>
          <div className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(251,146,60,.15)' }}>
            <span className="text-[16px]">📋</span>
          </div>
          <div>
            <p className="text-[13px] font-bold uppercase tracking-wider" style={{ color: '#fb923c' }}>Before Every Call</p>
            <p className="text-[18px] font-semibold" style={{ color: '#fff' }}>Research the Company First</p>
          </div>
        </div>
        <div className="p-5 border border-t-0 rounded-b-xl" style={{ borderColor: 'rgba(251,146,60,.12)', background: '#fff' }}>
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
          <div className="flex gap-3 items-start p-3.5 rounded-lg" style={{ background: 'rgba(251,146,60,.05)', border: '1px solid rgba(251,146,60,.15)' }}>
            <span className="flex-shrink-0">💡</span>
            <p className="text-[13px] leading-[1.65] text-foreground"><strong>Use the positive news.</strong> When you open a call with something like <em>"I saw [Company] just landed [the contract / won the project], congratulations"</em> — you've shown you're not just another vendor dialing a list.</p>
          </div>
          <div className="flex gap-3 items-start p-3.5 mt-3 rounded-lg" style={{ background: 'rgba(16,185,129,.05)', border: '1px solid rgba(16,185,129,.18)' }}>
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
