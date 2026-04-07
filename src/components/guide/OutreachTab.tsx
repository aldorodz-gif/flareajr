import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import Eyebrow from './Eyebrow';
import AiToolCard from './AiToolCard';
import SectionNav from './SectionNav';

interface OutreachTabProps {
  onNavigate: (tabId: string) => void;
}

const SERVICE_LINES = ['Temporary Housing', 'Travel', 'Hotels', 'Destination Services'];

interface EmailResult {
  subject: string;
  body: string;
}

/* ───── Micro-close data ───── */
const MICRO_CLOSES = [
  {
    num: '01',
    title: 'Confirm the pain is real',
    phrase: '"What happens to your team when housing isn\'t locked in before people arrive?"',
    why: 'You\'re not pitching yet. You\'re getting them to say the problem out loud. Once they articulate it, they own it — and the rest of the call builds on that.',
  },
  {
    num: '02',
    title: 'Confirm the value clicks',
    phrase: '"If someone handled all of that — the sourcing, the lease terms, the move-ins — would that free up bandwidth your team needs right now?"',
    why: 'Don\'t explain value. Ask if they see it. When they say yes, that\'s a commitment — not a feature dump they\'ll forget.',
  },
  {
    num: '03',
    title: 'Confirm there\'s a reason to act now',
    phrase: '"If this doesn\'t get addressed before Q3, what does that look like for your team?"',
    why: 'Urgency isn\'t pressure you create — it\'s a consequence they already feel. Help them connect the timeline to the cost of doing nothing.',
  },
  {
    num: '04',
    title: 'Confirm the next move',
    phrase: '"It sounds like this is already costing your team time. Would it make sense to map out what a solution looks like for your specific setup?"',
    why: 'If you\'ve confirmed the pain, value, and urgency — this isn\'t a hard ask. It\'s the obvious next step.',
  },
];

const BANT = [
  { letter: 'B', label: 'Budget', wrong: '"What\'s your budget?"', right: 'Surfaces when you talk about what the current problem is costing them. Let the number come from their side.' },
  { letter: 'A', label: 'Authority', wrong: '"Are you the decision-maker?"', right: 'Ask how decisions like this typically get made. Map the process — don\'t put them on the spot.' },
  { letter: 'N', label: 'Need', wrong: '"Do you need this?"', right: 'The need should come from them, not you. If you have to convince them there\'s a problem, you\'re too early.' },
  { letter: 'T', label: 'Timing', wrong: '"When do you want to start?"', right: 'Anchor timing to their business events — a mobilization date, a lease ending, a cohort arriving.' },
];

const EMAIL_PARTS = [
  { num: 1, title: 'One specific observation', subtitle: 'proof you actually looked', good: '"Saw [Company] just [landed the contract / kicked off the expansion], congrats, that\'s a big one."', goodLabel: '✓ PERSONAL', bad: '"I came across your company and was impressed by what you do."', badLabel: '✗ GENERIC' },
  { num: 2, title: 'One sentence naming their likely problem', subtitle: 'not your solution', good: '"Mobilizations like that move fast, travel, lodging, or temporary housing for incoming crews is usually the thing that gets figured out last."', goodLabel: '✓ THEIR PROBLEM', bad: '"We help teams get placed quickly with the right mix of temporary housing."', badLabel: '✗ YOUR SOLUTION' },
  { num: 3, title: 'One sentence on what you do', subtitle: 'plain English, outcome-first', good: '"We help get crews placed before they land — temporary housing, hotels, or travel support handled cleanly."', goodLabel: '✓ OUTCOME FIRST', bad: '"We help teams get placed quickly and keep moves, travel, and lodging organized."', badLabel: '✗ COMPANY-FIRST' },
  { num: 4, title: 'One ask', subtitle: 'the smallest possible yes', good: '"Worth a quick 15-minute call to see if it makes sense for your Q2 timeline?"', goodLabel: '✓ LOW FRICTION', bad: '"I\'d love to schedule a 30-minute demo to walk you through our platform."', badLabel: '✗ HIGH FRICTION' },
];

const OutreachTab = ({ onNavigate }: OutreachTabProps) => {
  const [channel, setChannel] = useState<'call' | 'email'>('call');
  const [expandedClose, setExpandedClose] = useState<number | null>(null);

  // Email generator state
  const [company, setCompany] = useState('');
  const [signal, setSignal] = useState('');
  const [buyerTitle, setBuyerTitle] = useState('');
  const [serviceLine, setServiceLine] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailResult | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);

  // Article scraping state
  const [articleContent, setArticleContent] = useState('');
  const [scrapingUrl, setScrapingUrl] = useState(false);
  const [scrapedTitle, setScrapedTitle] = useState('');

  const isUrl = (text: string) => /^https?:\/\/.+/i.test(text.trim());

  const handleSignalChange = useCallback(async (value: string) => {
    setSignal(value);
    setArticleContent('');
    setScrapedTitle('');

    if (isUrl(value.trim()) && value.trim().length > 10) {
      setScrapingUrl(true);
      try {
        const { data, error: fnError } = await supabase.functions.invoke('article-scraper', {
          body: { url: value.trim() },
        });
        if (fnError) throw fnError;
        if (data.error) throw new Error(data.error);
        setArticleContent(data.content || '');
        setScrapedTitle(data.title || '');
      } catch {
        setArticleContent('');
        setScrapedTitle('');
      } finally {
        setScrapingUrl(false);
      }
    }
  }, []);

  const canGenerate = company.trim() && (signal.trim() || articleContent) && buyerTitle.trim() && serviceLine;

  const callApi = useCallback(async (vary = false) => {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    if (!vary) setResult(null);
    try {
      const signalText = articleContent
        ? `Article: "${scrapedTitle}". Content: ${articleContent}`
        : signal.trim();
      const { data, error: fnError } = await supabase.functions.invoke('email-generator', {
        body: { company: company.trim(), signal: signalText, buyer_title: buyerTitle.trim(), service_line: serviceLine, vary },
      });
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
      <h2 className="text-[26px] font-bold mb-2 leading-tight text-foreground">Write Outreach</h2>
      <p className="text-[14px] max-w-[720px] mb-6 text-muted-foreground leading-relaxed">
        Two channels, one goal — start a real conversation. Pick your mode below.
      </p>

      {/* ══════════ Channel Toggle ══════════ */}
      <div className="flex rounded-xl overflow-hidden mb-8 border border-border" style={{ background: 'hsl(var(--card))' }}>
        {[
          { id: 'call' as const, icon: '📞', label: 'When You\'re Calling', desc: 'Live conversation frameworks' },
          { id: 'email' as const, icon: '✉️', label: 'When You\'re Emailing', desc: 'AI generator + writing rules' },
        ].map(ch => (
          <button
            key={ch.id}
            onClick={() => setChannel(ch.id)}
            className="flex-1 flex items-center gap-3 px-5 py-4 transition-all duration-200"
            style={{
              background: channel === ch.id ? '#2F4858' : 'transparent',
              color: channel === ch.id ? '#FAF7F2' : 'hsl(var(--foreground))',
            }}
          >
            <span className="text-[22px]">{ch.icon}</span>
            <div className="text-left">
              <p className="text-[14px] font-semibold">{ch.label}</p>
              <p className="text-[11px] opacity-60">{ch.desc}</p>
            </div>
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/* CHAPTER: CALLING                               */}
      {/* ══════════════════════════════════════════════ */}
      {channel === 'call' && (
        <div className="space-y-8 animate-fade-in">
          {/* Intro */}
          <div className="rounded-xl p-5" style={{ background: '#FAF7F2', border: '1px solid hsl(var(--border))' }}>
            <p className="text-[14px] leading-relaxed text-foreground">
              <strong>These aren't scripts.</strong> They're frameworks — flexible structures that help you build real agreement during a conversation. 
              The goal isn't to "close" — it's to confirm alignment step by step so the next move feels obvious.
            </p>
          </div>

          {/* ── Micro-Closes Accordion ── */}
          <section>
            <h3 className="text-[18px] font-bold mb-1 text-foreground">Build Agreement as You Go</h3>
            <p className="text-[13px] text-muted-foreground mb-4">
              Most deals don't die at the close. They die in the middle. Get small confirmations throughout the call.
            </p>

            <div className="flex flex-col gap-2">
              {MICRO_CLOSES.map((mc, i) => {
                const isOpen = expandedClose === i;
                return (
                  <div
                    key={mc.num}
                    className="rounded-lg overflow-hidden transition-all duration-200 border"
                    style={{
                      borderColor: isOpen ? '#fb923c' : 'hsl(var(--border))',
                      background: isOpen ? '#FAF7F2' : 'hsl(var(--card))',
                      boxShadow: isOpen ? '0 2px 12px rgba(251,146,60,.15)' : 'none',
                    }}
                  >
                    <button
                      onClick={() => setExpandedClose(isOpen ? null : i)}
                      className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                    >
                      <span
                        className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{ background: '#2F4858', color: '#FAF7F2' }}
                      >
                        {mc.num}
                      </span>
                      <span className="text-[14px] font-semibold text-foreground flex-1">{mc.title}</span>
                      <span
                        className="text-[16px] transition-transform duration-200 text-muted-foreground"
                        style={{ transform: isOpen ? 'rotate(180deg)' : 'rotate(0)' }}
                      >
                        ▾
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 ml-10 border-l-2 animate-fade-in" style={{ borderColor: '#fb923c' }}>
                        <p className="text-[14px] font-semibold italic mb-2 text-foreground leading-relaxed">{mc.phrase}</p>
                        <p className="text-[13px] leading-[1.7] text-muted-foreground">{mc.why}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="flex gap-3 items-start p-3.5 mt-3 rounded-lg" style={{ background: 'rgba(91,187,160,.08)', border: '1px solid rgba(91,187,160,.2)' }}>
              <span className="text-[15px] flex-shrink-0 mt-0.5">💡</span>
              <p className="text-[13px] leading-[1.65] text-foreground">
                <strong>Yes/No questions aren't always bad.</strong> If you've built real agreement through the first three steps, a direct "Does that make sense?" isn't risky — it's earned.
              </p>
            </div>
          </section>

          {/* ── BANT Reframed ── */}
          <section>
            <h3 className="text-[18px] font-bold mb-1 text-foreground">Qualify Smarter — BANT Reframed</h3>
            <p className="text-[13px] text-muted-foreground mb-4">Each element should emerge naturally from the conversation — not from a scripted question.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {BANT.map(b => (
                <div key={b.letter} className="rounded-lg p-4 border" style={{ background: '#FAF7F2', borderColor: 'hsl(var(--border))' }}>
                  <div className="flex items-center gap-2.5 mb-2.5">
                    <span className="w-8 h-8 rounded-lg flex items-center justify-center text-[13px] font-bold" style={{ background: '#2F4858', color: '#fb923c' }}>
                      {b.letter}
                    </span>
                    <span className="text-[14px] font-semibold text-foreground">{b.label}</span>
                  </div>
                  <p className="text-[12px] line-through mb-1.5 text-muted-foreground opacity-60">{b.wrong}</p>
                  <p className="text-[13px] leading-[1.6] text-muted-foreground">{b.right}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bottom line */}
          <div className="rounded-xl p-5 flex gap-4 items-start" style={{ background: '#2F4858' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap pt-0.5" style={{ color: '#fb923c' }}>Bottom line</span>
            <p className="text-[13px] leading-[1.7]" style={{ color: 'rgba(250,247,242,.85)' }}>
              Good prospecting starts with a real signal. Good closing starts with alignment you built along the way. When both are working, you don't need to "close hard."
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════ */}
      {/* CHAPTER: EMAILING                              */}
      {/* ══════════════════════════════════════════════ */}
      {channel === 'email' && (
        <div className="space-y-8 animate-fade-in">
          {/* ── AI Email Generator (Hero) ── */}
          <AiToolCard
            icon="✉️"
            title="First Email Generator"
            subtitle="Fill in the details — I'll write your first outreach email"
          >
            <p className="text-[14px] font-medium text-foreground mb-1">Four fields. One click. Your outreach email is ready.</p>
            <p className="text-[13px] text-muted-foreground mb-5">Enter the company, signal, buyer title, and service line. We'll generate a short, personal email ready to send.</p>

                {!result ? (
                  <>
                    <div className="flex flex-col gap-3 mb-5">
                      {[
                        { val: company, set: setCompany, ph: "Company you're reaching out to", icon: '🏢' },
                        { val: signal, set: setSignal, ph: 'What happened — contract win, expansion, new office, etc.', icon: '📡' },
                        { val: buyerTitle, set: setBuyerTitle, ph: "Job title of the person you're contacting", icon: '👤' },
                      ].map((f, i) => (
                        <div key={i} className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px]">{f.icon}</span>
                          <input
                            type="text"
                            value={f.val}
                            onChange={e => f.set(e.target.value)}
                            placeholder={f.ph}
                            className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200"
                            style={{
                              borderColor: f.val ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                              background: f.val ? '#FFF7ED' : '#FAF7F2',
                              boxShadow: f.val ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
                            }}
                            disabled={loading}
                          />
                        </div>
                      ))}
                      <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] pointer-events-none">🎯</span>
                        <select
                          value={serviceLine}
                          onChange={e => setServiceLine(e.target.value)}
                          className="w-full pl-11 pr-4 py-3.5 border text-[14px] focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                          style={{
                            borderColor: serviceLine ? 'rgba(251,146,60,.5)' : 'rgba(155,120,200,.2)',
                            background: serviceLine ? '#FFF7ED' : '#FAF7F2',
                            boxShadow: serviceLine ? '0 0 0 3px rgba(251,146,60,.1)' : 'none',
                            color: serviceLine ? 'inherit' : '#9CA3AF',
                          }}
                          disabled={loading}
                        >
                          <option value="">Select service line</option>
                          {SERVICE_LINES.map(s => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => callApi(false)}
                      disabled={!canGenerate || loading}
                      className="w-full py-4 text-[15px] font-bold tracking-wide transition-all"
                      style={{
                        background: !canGenerate || loading ? '#E2E8F0' : 'linear-gradient(135deg, #fb923c, #f97316)',
                        color: !canGenerate || loading ? '#94A3B8' : '#fff',
                        cursor: !canGenerate || loading ? 'not-allowed' : 'pointer',
                        boxShadow: canGenerate && !loading ? '0 4px 15px rgba(251,146,60,.35)' : 'none',
                      }}
                    >
                      {loading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Writing your email...
                        </span>
                      ) : '✉️  Write My Email'}
                    </button>
                    {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#EF4444' }}>{error}</p>}
                  </>
                ) : (
                  <>
                    <div className="mb-4 px-5 py-4" style={{ background: '#FAF7F2', border: '1px solid rgba(251,146,60,.25)' }}>
                      <p className="text-[11px] font-bold uppercase tracking-[.12em] mb-1 text-muted-foreground">Subject Line</p>
                      <p className="text-[17px] font-bold text-foreground">{result.subject}</p>
                    </div>
                    <div className="relative px-5 py-5" style={{ background: '#FAFAFA', border: '1px solid hsl(var(--border))' }}>
                      <span className="absolute top-3 right-3 text-[11px] font-bold px-2.5 py-1" style={{ background: wordCount > 100 ? 'rgba(201,91,106,.1)' : 'rgba(251,146,60,.15)', color: wordCount > 100 ? '#C95B6A' : '#2F4858', border: `1px solid ${wordCount > 100 ? 'rgba(201,91,106,.25)' : 'rgba(251,146,60,.25)'}` }}>
                        {wordCount} words
                      </span>
                      <p className="text-[14px] leading-[1.8] whitespace-pre-line pr-16 text-foreground">{result.body}</p>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={handleCopy} className="px-6 py-3 text-[13px] font-bold transition-all" style={{ background: copied ? '#10B981' : 'linear-gradient(135deg, #fb923c, #f97316)', color: '#fff', boxShadow: '0 2px 8px rgba(251,146,60,.3)' }}>
                        {copied ? '✓ COPIED' : '📋 COPY'}
                      </button>
                      <button onClick={() => callApi(true)} disabled={loading} className="px-6 py-3 text-[13px] font-bold transition-all" style={{ background: '#FAF7F2', border: '1px solid rgba(251,146,60,.3)', color: '#2F4858' }}>
                        {loading ? 'Thinking...' : '🔄 Different angle'}
                      </button>
                      <button onClick={() => { setResult(null); setError(''); }} className="px-6 py-3 text-[13px] font-bold transition-all text-muted-foreground">
                        Start over
                      </button>
                    </div>
                    {error && <p className="mt-3 text-[13px] font-medium" style={{ color: '#EF4444' }}>{error}</p>}
                  </>
                )}
          </AiToolCard>

          {/* ── Email Rules (collapsible) ── */}
          <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
            <button
              onClick={() => setRulesOpen(!rulesOpen)}
              className="w-full flex items-center justify-between px-5 py-4 text-left transition-colors hover:bg-black/[.02]"
            >
              <div className="flex items-center gap-3">
                <span className="text-[18px]">📐</span>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Email Rules & Guidelines</p>
                  <p className="text-[12px] text-muted-foreground">Stats, tone, mobile tips — everything that makes emails land</p>
                </div>
              </div>
              <span className="text-[16px] transition-transform duration-200 text-muted-foreground" style={{ transform: rulesOpen ? 'rotate(180deg)' : 'rotate(0)' }}>▾</span>
            </button>

            {rulesOpen && (
              <div className="px-5 pb-5 space-y-4 animate-fade-in border-t" style={{ borderColor: 'hsl(var(--border))' }}>
                {/* Quick stats */}
                <div className="flex flex-wrap gap-4 mt-4">
                  {[{ val: '4', label: 'sentences max' }, { val: '<100', label: 'words total' }, { val: '2–4', label: 'word subject' }, { val: '1', label: 'ask only' }].map(s => (
                    <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: '#FAF7F2', border: '1px solid hsl(var(--border))' }}>
                      <span className="text-[16px] font-bold" style={{ color: '#2F4858' }}>{s.val}</span>
                      <span className="text-[11px] text-muted-foreground">{s.label}</span>
                    </div>
                  ))}
                </div>

                {/* Tone rule */}
                <div className="rounded-lg p-4" style={{ background: '#2F4858' }}>
                  <p className="text-[12px] font-bold tracking-wide mb-2" style={{ color: '#fb923c' }}>THE PERSONAL TONE RULE</p>
                  <p className="text-[13px] leading-[1.7]" style={{ color: 'rgba(250,247,242,.88)' }}>
                    Write it like you're texting a colleague about someone you both know. No "I wanted to reach out." No "I hope this finds you well." Just one person talking to another.
                  </p>
                </div>

                {/* Mobile hack */}
                <div className="flex gap-3 items-start p-4 rounded-lg" style={{ background: 'rgba(91,191,160,.06)', border: '1px solid rgba(91,191,160,.2)' }}>
                  <span className="text-[18px] flex-shrink-0">📱</span>
                  <div>
                    <p className="text-[13px] font-semibold text-foreground mb-1">Send yourself the email first — read it on your phone.</p>
                    <p className="text-[12px] leading-[1.6] text-muted-foreground">
                      Most buyers read your email on a 4-inch screen between meetings. If it looks like a wall of text, it's getting skipped.
                    </p>
                  </div>
                </div>

                <p className="text-[12px] text-muted-foreground italic">If you'd never say it out loud to someone's face — cut it.</p>
              </div>
            )}
          </div>

          {/* ── 4-Part Email Structure (timeline style) ── */}
          <section>
            <h3 className="text-[18px] font-bold mb-1 text-foreground">What the Body Should Contain</h3>
            <p className="text-[13px] text-muted-foreground mb-5">Nothing else. No company history. No features. Every sentence has one job.</p>

            <div className="relative pl-8">
              {/* Timeline line */}
              <div className="absolute left-[14px] top-3 bottom-3 w-[2px]" style={{ background: 'linear-gradient(to bottom, #fb923c, #2F4858)' }} />

              <div className="flex flex-col gap-4">
                {EMAIL_PARTS.map(s => (
                  <div key={s.num} className="relative">
                    {/* Dot */}
                    <div
                      className="absolute -left-8 top-4 w-[10px] h-[10px] rounded-full border-2"
                      style={{ borderColor: '#fb923c', background: 'hsl(var(--background))' }}
                    />
                    <div className="rounded-lg border overflow-hidden" style={{ borderColor: 'hsl(var(--border))', background: 'hsl(var(--card))' }}>
                      <div className="px-4 py-3 flex items-center gap-2.5" style={{ borderBottom: '1px solid hsl(var(--border))' }}>
                        <span className="w-6 h-6 rounded flex items-center justify-center text-[12px] font-bold" style={{ background: '#2F4858', color: '#fb923c' }}>{s.num}</span>
                        <div>
                          <span className="text-[14px] font-semibold text-foreground">{s.title}</span>
                          <span className="text-[12px] text-muted-foreground ml-1.5">— {s.subtitle}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
                        <div className="p-3.5 border-r" style={{ background: 'rgba(91,187,160,.04)', borderColor: 'hsl(var(--border))' }}>
                          <p className="text-[10px] font-bold mb-1" style={{ color: '#2F4858' }}>{s.goodLabel}</p>
                          <p className="text-[13px] italic leading-[1.5] text-foreground">{s.good}</p>
                        </div>
                        <div className="p-3.5" style={{ background: 'rgba(201,91,106,.04)' }}>
                          <p className="text-[10px] font-bold mb-1" style={{ color: '#C95B6A' }}>{s.badLabel}</p>
                          <p className="text-[13px] italic leading-[1.5] text-muted-foreground">{s.bad}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Bottom line */}
          <div className="rounded-xl p-5 flex gap-4 items-start" style={{ background: '#2F4858' }}>
            <span className="text-[11px] font-bold uppercase tracking-wider whitespace-nowrap pt-0.5" style={{ color: '#fb923c' }}>Bottom line</span>
            <p className="text-[13px] leading-[1.7]" style={{ color: 'rgba(250,247,242,.85)' }}>
              Good prospecting emails aren't about you. They're about one signal, one problem, and one small ask. If you nail those three, the reply rate takes care of itself.
            </p>
          </div>
        </div>
      )}

      <div className="mt-8">
        <SectionNav currentTab="outreach" onNavigate={onNavigate} />
      </div>
    </div>
  );
};

export default OutreachTab;
