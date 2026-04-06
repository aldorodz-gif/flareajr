import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import SectionNav from './SectionNav';

interface OutreachTabProps {
  onNavigate: (tabId: string) => void;
}

const SERVICE_LINES = ['Temporary Housing', 'Travel', 'Hotels', 'Destination Services'];

interface EmailResult {
  subject: string;
  body: string;
}

const OutreachTab = ({ onNavigate }: OutreachTabProps) => {
  const [company, setCompany] = useState('');
  const [signal, setSignal] = useState('');
  const [buyerTitle, setBuyerTitle] = useState('');
  const [serviceLine, setServiceLine] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const canGenerate = company.trim() && signal.trim() && buyerTitle.trim() && serviceLine;

  const callApi = useCallback(async (vary = false) => {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    if (!vary) setResult(null);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('email-generator', {
        body: { company: company.trim(), signal: signal.trim(), buyer_title: buyerTitle.trim(), service_line: serviceLine, vary },
      });
      if (fnError) throw fnError;
      if (data.error) throw new Error(data.error);
      setResult(data as EmailResult);
    } catch {
      setError('Something went wrong. Try again.');
    } finally {
      setLoading(false);
    }
  }, [company, signal, buyerTitle, serviceLine, canGenerate]);

  const wordCount = result ? result.body.split(/\s+/).filter(Boolean).length : 0;

  const handleCopy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(`Subject: ${result.subject}\n\n${result.body}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [result]);

  return (
    <div className="max-w-[900px] mx-auto px-6 py-8 md:px-10">
      <Eyebrow gradient="linear-gradient(90deg, #5BBFA0, #8B8FE8)">Step 07: Make Contact</Eyebrow>
      <h2 className="text-[24px] font-semibold mb-1.5 leading-tight text-foreground">Write Outreach</h2>
      <p className="text-[13px] max-w-[760px] mb-5 pb-3.5 text-muted-foreground" style={{ borderBottom: '1px solid rgba(14,30,58,.08)' }}>
        This tab covers both channels — phone and email. Use the call frameworks when you're dialing. Use the email generator when you're writing. Both start from the same signal.
      </p>

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION A: CALL FRAMEWORKS                     */}
      {/* ══════════════════════════════════════════════ */}
      <div className="flex items-center gap-2.5 mb-4 px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
        <span className="text-[16px]">📞</span>
        <p className="text-[14px] font-semibold" style={{ color: '#fff' }}>When You're Calling</p>
        <p className="text-[12px] ml-auto" style={{ color: 'rgba(255,255,255,.5)' }}>Use these frameworks on live calls</p>
      </div>

      {/* ── Before You Send: Micro-Closes ── */}
      <section className="mb-8">
        <Eyebrow gradient="linear-gradient(90deg, #E8A87A, #EBC980)">Before You Send</Eyebrow>
        <h3 className="text-[20px] font-semibold mb-1 text-foreground">Build Agreement as You Go</h3>
        <p className="text-[13px] text-muted-foreground mb-1.5">Most deals don't die at the close. They die somewhere in the middle — because nobody checked whether the buyer was actually tracking.</p>
        <p className="text-[13px] text-muted-foreground mb-4">The fix is simple: get small confirmations throughout the call. By the time you ask for next steps, you're not closing — you're summarizing what they already said yes to.</p>

        <div className="flex flex-col gap-3">
          {[
            {
              num: '01',
              title: 'Confirm the pain is real',
              gradient: 'linear-gradient(135deg,#9B78C8,#A885D4)',
              phrase: '"What happens to your team when housing isn\'t locked in before people arrive?"',
              example: 'You\'re not pitching yet. You\'re getting them to say the problem out loud. Once they articulate it, they own it — and the rest of the call builds on that.',
            },
            {
              num: '02',
              title: 'Confirm the value clicks',
              gradient: 'linear-gradient(135deg,#C47EAA,#CF8EBB)',
              phrase: '"If someone handled all of that — the sourcing, the lease terms, the move-ins — would that free up bandwidth your team needs right now?"',
              example: 'Don\'t explain value. Ask if they see it. When they say yes, that\'s a commitment — not a feature dump they\'ll forget.',
            },
            {
              num: '03',
              title: 'Confirm there\'s a reason to act now',
              gradient: 'linear-gradient(135deg,#D97895,#DE8AA0)',
              phrase: '"If this doesn\'t get addressed before Q3, what does that look like for your team?"',
              example: 'Urgency isn\'t pressure you create — it\'s a consequence they already feel. Help them connect the timeline to the cost of doing nothing.',
            },
            {
              num: '04',
              title: 'Confirm the next move',
              gradient: 'linear-gradient(135deg,#E8A87A,#EDB880)',
              phrase: '"It sounds like this is already costing your team time. Would it make sense to map out what a solution looks like for your specific setup?"',
              example: 'If you\'ve confirmed the pain, value, and urgency — this isn\'t a hard ask. It\'s the obvious next step. If they hesitate here, something earlier wasn\'t solid.',
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
            <strong>Yes/No questions aren't always bad.</strong> If you've built real agreement through the first three steps, a direct "Does that make sense for your team?" isn't risky — it's earned.
          </p>
        </div>
      </section>

      {/* ── BANT Reframed ── */}
      <section className="mb-8">
        <h3 className="text-[20px] font-semibold mb-1 text-foreground">Qualify Smarter — BANT Reframed</h3>
        <p className="text-[13px] text-muted-foreground mb-4">BANT isn't a checklist you run through. Each element should emerge naturally from the conversation — not from a scripted question.</p>

        <div className="overflow-hidden border" style={{ borderColor: 'rgba(155,120,200,.15)', boxShadow: '0 1px 4px rgba(0,0,0,.06)' }}>
          <div className="px-4 py-3" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
            <p className="text-[12px] font-bold uppercase tracking-wider" style={{ color: 'rgba(255,255,255,.55)' }}>What to uncover — and how</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2">
            {[
              { letter: 'B', label: 'Budget', wrong: '"What\'s your budget?"', right: 'Surfaces when you talk about what the current problem is costing them. Let the number come from their side.' },
              { letter: 'A', label: 'Authority', wrong: '"Are you the decision-maker?"', right: 'Ask how decisions like this typically get made. Map the process — don\'t put them on the spot.' },
              { letter: 'N', label: 'Need', wrong: '"Do you need this?"', right: 'The need should come from them, not you. If you have to convince them there\'s a problem, you\'re too early.' },
              { letter: 'T', label: 'Timing', wrong: '"When do you want to start?"', right: 'Anchor timing to their business events — a mobilization date, a lease ending, a cohort arriving. Not a calendar quarter.' },
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

      {/* ══════════════════════════════════════════════ */}
      {/* SECTION B: EMAIL FRAMEWORKS                    */}
      {/* ══════════════════════════════════════════════ */}
      <div className="flex items-center gap-2.5 mb-4 px-4 py-2.5" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
        <span className="text-[16px]">✉️</span>
        <p className="text-[14px] font-semibold" style={{ color: '#fff' }}>When You're Emailing</p>
        <p className="text-[12px] ml-auto" style={{ color: 'rgba(255,255,255,.5)' }}>Use the generator + rules below for written outreach</p>
      </div>

      {/* ── Interactive Email Generator ── */}
      <div className="mb-12 relative group">
        {/* Animated gradient border */}
        <div
          className="absolute -inset-[2px] rounded-[20px] pointer-events-none"
          style={{
            background: 'linear-gradient(135deg, #9B78C8, #D97FAA, #5BBFA0, #9B78C8)',
            backgroundSize: '300% 300%',
            animation: 'borderGlow 2.5s ease-in-out infinite, shimmer 4s linear infinite',
          }}
        />

        <div
          className="rounded-2xl overflow-hidden relative"
          style={{
            background: 'linear-gradient(135deg, #0E1E3A 0%, #1a1145 50%, #2d1b69 100%)',
            boxShadow: '0 25px 80px rgba(14,30,58,.45), 0 0 60px rgba(155,120,200,.08)',
          }}
        >
          {/* Ambient glow effects */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="absolute top-0 right-0 w-[350px] h-[350px] opacity-30" style={{ background: 'radial-gradient(circle, rgba(155,120,200,.5), transparent 70%)' }} />
            <div className="absolute bottom-0 left-0 w-[250px] h-[250px] opacity-25" style={{ background: 'radial-gradient(circle, rgba(217,127,170,.6), transparent 70%)' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] opacity-[.06]" style={{ background: 'radial-gradient(circle, rgba(255,255,255,.8), transparent 60%)' }} />
          </div>

          {/* Radar ping decoration */}
          <div className="absolute top-6 right-6 pointer-events-none">
            <div className="relative">
              <span className="absolute inset-0 rounded-full animate-radar-ping" style={{ background: 'rgba(155,120,200,.3)', width: '44px', height: '44px' }} />
              <span className="absolute inset-0 rounded-full animate-radar-ping" style={{ background: 'rgba(155,120,200,.2)', width: '44px', height: '44px', animationDelay: '0.8s' }} />
            </div>
          </div>

          {/* Header area */}
          <div className="relative px-6 md:px-8 pt-7 pb-2">
            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl animate-pulse"
                  style={{
                    background: 'linear-gradient(135deg, #9B78C8, #D97FAA)',
                    boxShadow: '0 8px 30px rgba(155,120,200,.45), 0 0 15px rgba(155,120,200,.2)',
                  }}
                >
                  ✉️
                </div>
                <div>
                  <div className="flex items-center gap-3">
                    <p className="text-[22px] font-extrabold tracking-tight" style={{ color: '#fff' }}>First Email Generator</p>
                    <span
                      className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-[.15em] animate-shimmer"
                      style={{
                        background: 'linear-gradient(90deg, rgba(155,120,200,.2), rgba(155,120,200,.4), rgba(155,120,200,.2))',
                        backgroundSize: '200% 100%',
                        color: '#C4A5DE',
                        border: '1px solid rgba(155,120,200,.3)',
                      }}
                    >
                      AI Tool
                    </span>
                  </div>
                  <p className="text-[14px] mt-1 font-medium" style={{ color: 'rgba(196,165,222,.8)' }}>Fill in the details. I'll write your first outreach email.</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3.5 py-2 rounded-full" style={{ background: 'rgba(155,120,200,.15)', border: '1px solid rgba(155,120,200,.3)', boxShadow: '0 0 20px rgba(155,120,200,.15)' }}>
                <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: '#C4A5DE', boxShadow: '0 0 8px rgba(196,165,222,.6)' }} />
                <span className="text-[11px] font-bold tracking-wide" style={{ color: '#C4A5DE' }}>Live</span>
              </div>
            </div>
          </div>

          {/* Interactive body */}
          <div className="relative px-6 md:px-8 pb-8">
            {!result ? (
              <>
                <div className="flex flex-col gap-3 mb-5">
                  {[
                    { val: company, set: setCompany, ph: "Company you're reaching out to", icon: '🏢' },
                    { val: signal, set: setSignal, ph: 'What happened — contract win, expansion, new office, etc.', icon: '📡' },
                    { val: buyerTitle, set: setBuyerTitle, ph: "Job title of the person you're contacting", icon: '👤' },
                  ].map((f, i) => (
                    <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,.06)', border: f.val ? '1px solid rgba(155,120,200,.4)' : '1px solid rgba(255,255,255,.08)', boxShadow: f.val ? '0 0 20px rgba(155,120,200,.1)' : 'none' }}>
                      <span className="text-[16px] flex-shrink-0">{f.icon}</span>
                      <input
                        type="text"
                        value={f.val}
                        onChange={e => f.set(e.target.value)}
                        placeholder={f.ph}
                        className="flex-1 bg-transparent text-[14px] focus:outline-none placeholder:text-white/25"
                        style={{ color: 'rgba(255,255,255,.9)' }}
                        disabled={loading}
                      />
                    </div>
                  ))}
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all" style={{ background: 'rgba(255,255,255,.06)', border: serviceLine ? '1px solid rgba(155,120,200,.4)' : '1px solid rgba(255,255,255,.08)', boxShadow: serviceLine ? '0 0 20px rgba(155,120,200,.1)' : 'none' }}>
                    <span className="text-[16px] flex-shrink-0">🎯</span>
                    <select
                      value={serviceLine}
                      onChange={e => setServiceLine(e.target.value)}
                      className="flex-1 bg-transparent text-[14px] focus:outline-none"
                      style={{ color: serviceLine ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.25)' }}
                      disabled={loading}
                    >
                      <option value="" style={{ color: '#333' }}>Select service line</option>
                      {SERVICE_LINES.map(s => <option key={s} value={s} style={{ color: '#333' }}>{s}</option>)}
                    </select>
                  </div>
                </div>

                <button
                  onClick={() => callApi(false)}
                  disabled={!canGenerate || loading}
                  className="w-full py-4 rounded-xl text-[15px] font-bold tracking-wide transition-all"
                  style={{
                    background: !canGenerate || loading ? 'rgba(255,255,255,.08)' : 'linear-gradient(135deg, #9B78C8, #D97FAA)',
                    color: !canGenerate || loading ? 'rgba(255,255,255,.3)' : '#fff',
                    cursor: !canGenerate || loading ? 'not-allowed' : 'pointer',
                    boxShadow: canGenerate && !loading ? '0 8px 30px rgba(155,120,200,.35)' : 'none',
                  }}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Writing your email...
                    </span>
                  ) : '✉️  Write My Email'}
                </button>
                {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#F87171' }}>{error}</p>}
              </>
            ) : (
              <>
                <div className="mb-4 px-5 py-4 rounded-xl" style={{ background: 'rgba(155,120,200,.1)', border: '1px solid rgba(155,120,200,.25)' }}>
                  <p className="text-[11px] font-bold uppercase tracking-[.12em] mb-1" style={{ color: 'rgba(196,165,222,.6)' }}>Subject Line</p>
                  <p className="text-[17px] font-bold" style={{ color: '#fff' }}>{result.subject}</p>
                </div>
                <div className="relative px-5 py-5 rounded-xl" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                  <span className={`absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1 rounded-md`} style={{ background: wordCount > 100 ? 'rgba(248,113,113,.2)' : 'rgba(155,120,200,.15)', color: wordCount > 100 ? '#F87171' : '#C4A5DE', border: `1px solid ${wordCount > 100 ? 'rgba(248,113,113,.3)' : 'rgba(155,120,200,.25)'}` }}>
                    {wordCount} words
                  </span>
                  <p className="text-[14px] leading-[1.8] whitespace-pre-line pr-16" style={{ color: 'rgba(255,255,255,.85)' }}>{result.body}</p>
                </div>
                <div className="flex gap-3 mt-5">
                  <button
                    onClick={handleCopy}
                    className="px-6 py-3 rounded-xl text-[13px] font-bold transition-all"
                    style={{ background: copied ? 'linear-gradient(135deg, #10B981, #059669)' : 'linear-gradient(135deg, #9B78C8, #D97FAA)', color: '#fff', boxShadow: '0 4px 15px rgba(155,120,200,.3)' }}
                  >
                    {copied ? '✓ COPIED' : '📋 COPY'}
                  </button>
                  <button
                    onClick={() => callApi(true)}
                    disabled={loading}
                    className="px-6 py-3 rounded-xl text-[13px] font-bold transition-all"
                    style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(155,120,200,.3)', color: '#C4A5DE' }}
                  >
                    {loading ? 'Thinking...' : '🔄 Different angle'}
                  </button>
                  <button
                    onClick={() => { setResult(null); setError(''); }}
                    className="px-6 py-3 rounded-xl text-[13px] font-bold transition-all"
                    style={{ color: 'rgba(255,255,255,.4)' }}
                  >
                    Start over
                  </button>
                </div>
                {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#F87171' }}>{error}</p>}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex flex-wrap gap-5 p-3.5 mb-5 border" style={{ background: '#E2E8F0', borderColor: 'rgba(155,120,200,.12)' }}>
        {[{ val: '4', label: 'sentences max' }, { val: '<100', label: 'words total' }, { val: '2–4', label: 'word subject' }, { val: '1', label: 'ask only' }].map(s => (
          <div key={s.label} className="text-center">
            <p className="text-[18px] font-semibold text-foreground">{s.val}</p>
            <p className="text-[11px] text-muted-foreground">{s.label}</p>
          </div>
        ))}
        <div className="flex-1 min-w-[200px] flex items-center">
          <p className="text-[13px] leading-[1.5] text-muted-foreground">If you'd never say it out loud to someone's face — cut it.</p>
        </div>
      </div>

      {/* Personal tone rule */}
      <div className="p-5 mb-6" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
        <p className="text-[13px] font-semibold tracking-wide mb-3" style={{ color: '#C4A5DE' }}>THE PERSONAL TONE RULE</p>
        <p className="text-[14px] leading-[1.75]" style={{ color: 'rgba(255,255,255,.88)' }}>
          Write it like you're texting a colleague about someone you both know. Not like you're sending a sales email. No "I wanted to reach out." No "I hope this finds you well." Just one person talking to another.
        </p>
      </div>

      {/* Mobile-first hack */}
      <div className="flex gap-3 items-start p-4 mb-6 border" style={{ background: 'rgba(91,191,160,.06)', borderColor: 'rgba(91,191,160,.25)' }}>
        <span className="text-[20px] flex-shrink-0">📱</span>
        <div>
          <p className="text-[13px] font-semibold text-foreground mb-1">Hack: Send yourself the email first and read it on your phone.</p>
          <p className="text-[12px] leading-[1.6] text-muted-foreground">
            Most buyers read your email on a 4-inch screen between meetings. If it looks like a wall of text on your phone, it's getting skipped. Short sentences. Short paragraphs. Every line should be scannable in 2 seconds. If you wouldn't read it standing in line at a coffee shop — rewrite it.
          </p>
        </div>
      </div>

      {/* 4 parts */}
      <p className="text-[14px] font-semibold mb-1.5 text-foreground">What the Body Should Contain</p>
      <p className="text-[13px] mb-4 text-muted-foreground">Nothing else. No company history. No features. Every sentence has one job.</p>

      <div className="flex flex-col gap-2.5 mb-6">
        {[
          { num: 1, gradient: 'linear-gradient(160deg,#9B78C8,#A885D4)', title: 'One specific observation: proof you actually looked', good: '"Saw [Company] just [landed the contract / kicked off the expansion], congrats, that\'s a big one."', goodLabel: '✓ PERSONAL', bad: '"I came across your company and was impressed by what you do."', badLabel: '✗ GENERIC' },
          { num: 2, gradient: 'linear-gradient(160deg,#C47EAA,#CF8EBB)', title: 'One sentence naming their likely problem: not your solution', good: '"Mobilizations like that move fast, travel, lodging, or temporary housing for incoming crews is usually the thing that gets figured out last."', goodLabel: '✓ THEIR PROBLEM', bad: '"We help teams get placed quickly with the right mix of temporary housing."', badLabel: '✗ YOUR SOLUTION' },
          { num: 3, gradient: 'linear-gradient(160deg,#E2907A,#E89D85)', title: 'One sentence on what you do: plain English, outcome-first', good: '"We help get crews placed before they land — temporary housing, hotels, or travel support handled cleanly."', goodLabel: '✓ OUTCOME FIRST', bad: '"We help teams get placed quickly and keep moves, travel, and lodging organized."', badLabel: '✗ COMPANY-FIRST' },
          { num: 4, gradient: '#2F4858', title: 'One ask: the smallest possible yes', good: '"Worth a quick 15-minute call to see if it makes sense for your Q2 timeline?"', goodLabel: '✓ LOW FRICTION', bad: '"I\'d love to schedule a 30-minute demo to walk you through our platform."', badLabel: '✗ HIGH FRICTION' },
        ].map(s => (
          <div key={s.num} className="flex flex-col md:flex-row overflow-hidden border" style={{ background: '#fff', borderColor: 'rgba(155,120,200,.12)' }}>
            <div className="md:min-w-[64px] flex md:flex-col items-center justify-center p-4" style={{ background: s.gradient }}>
              <span className="text-[20px] font-semibold" style={{ color: '#fff' }}>{s.num}</span>
            </div>
            <div className="p-4 flex-1">
              <p className="font-semibold mb-1.5 text-foreground">{s.title}</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                <div className="p-3 border-l-[3px]" style={{ background: '#EEF4F1', borderColor: '#1E293B' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#1E293B' }}>{s.goodLabel}</p>
                  <p className="text-[13px] italic leading-[1.5] text-foreground">{s.good}</p>
                </div>
                <div className="p-3 border-l-[3px]" style={{ background: 'rgba(239,68,68,.06)', borderColor: '#EF4444' }}>
                  <p className="text-[11px] font-semibold mb-1" style={{ color: '#EF4444' }}>{s.badLabel}</p>
                  <p className="text-[13px] italic leading-[1.5] text-foreground">{s.bad}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom line */}
      <div className="p-4 flex gap-3.5 items-start mb-6" style={{ background: 'linear-gradient(135deg, #1a1145, #2d1b69)' }}>
        <span className="text-[12px] font-bold uppercase tracking-wide whitespace-nowrap pt-0.5" style={{ color: '#C4A5DE' }}>Bottom line</span>
        <p className="text-[13px] leading-[1.65]" style={{ color: 'rgba(255,255,255,.82)' }}>Good prospecting starts with a real signal. Good closing starts with alignment you built along the way. When both are working, you don't need to "close hard" — you just confirm what's already been agreed.</p>
      </div>

      <SectionNav currentTab="outreach" onNavigate={onNavigate} />
    </div>
  );
};

export default OutreachTab;
