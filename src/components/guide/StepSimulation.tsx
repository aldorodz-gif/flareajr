import { useEffect, useState } from 'react';

interface Props {
  stepId: string;
}

/**
 * Mini animated simulation that plays inside the WelcomeModal for each step.
 * Each variant is a self-contained "what this tool does" demo on a loop.
 */
const StepSimulation = ({ stepId }: Props) => {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(0);
    const id = setInterval(() => setTick((t) => t + 1), 900);
    return () => clearInterval(id);
  }, [stepId]);

  const frame = tick % 6;

  if (stepId === 'intro') {
    return (
      <div className="relative h-[140px] rounded-md overflow-hidden" style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(251,146,60,.2)' }}>
        <div className="absolute inset-0 flex items-center justify-center gap-3">
          {['📡', '⚡', '🎯', '✉️', '📋'].map((emoji, i) => (
            <div
              key={i}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-xl transition-all duration-500"
              style={{
                background: frame === i ? 'linear-gradient(135deg, #ec4899, #ec4899)' : 'rgba(255,255,255,.05)',
                transform: frame === i ? 'translateY(-6px) scale(1.15)' : 'scale(1)',
                boxShadow: frame === i ? '0 8px 20px rgba(251,146,60,.4)' : 'none',
              }}
            >
              {emoji}
            </div>
          ))}
        </div>
        <div className="absolute bottom-2 left-0 right-0 text-center text-[10px] text-white/40">
          5 tools · 1 daily routine
        </div>
      </div>
    );
  }

  if (stepId === 'tracker') {
    const lines = [
      '> city: Atlanta',
      '> vertical: Construction',
      '> signal: New project award',
      '> generating prompt...',
      '✓ Prompt ready — paste into ChatGPT',
    ];
    return (
      <div className="h-[140px] rounded-md p-3 font-mono text-[11px] overflow-hidden" style={{ background: '#0a0a14', border: '1px solid rgba(251,146,60,.25)' }}>
        {lines.slice(0, Math.min(frame + 1, lines.length)).map((l, i) => (
          <div
            key={i}
            className="leading-[1.6]"
            style={{
              color: l.startsWith('✓') ? '#ec4899' : 'rgba(255,255,255,.7)',
              animation: 'fade-in 0.3s ease-out',
            }}
          >
            {l}
            {i === Math.min(frame, lines.length - 1) && <span className="inline-block w-2 h-3 ml-0.5 bg-pink-400 animate-pulse" />}
          </div>
        ))}
      </div>
    );
  }

  if (stepId === 'results') {
    const rows = [
      { co: 'Apex Builders', sig: 'HIGH', color: '#ef4444' },
      { co: 'Northside Health', sig: 'HIGH', color: '#ef4444' },
      { co: 'Cobb County PD', sig: 'MED', color: '#ec4899' },
    ];
    return (
      <div className="h-[140px] rounded-md p-3 space-y-1.5 overflow-hidden" style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(251,146,60,.2)' }}>
        {rows.map((r, i) => (
          <div
            key={i}
            className="flex items-center justify-between px-2.5 py-1.5 rounded text-[11px] transition-all duration-500"
            style={{
              background: frame % 3 === i ? 'rgba(251,146,60,.15)' : 'rgba(255,255,255,.04)',
              transform: frame % 3 === i ? 'translateX(4px)' : 'translateX(0)',
              border: `1px solid ${frame % 3 === i ? 'rgba(251,146,60,.4)' : 'transparent'}`,
            }}
          >
            <span className="text-white/80 font-medium">{r.co}</span>
            <span className="px-2 py-0.5 rounded text-[9px] font-bold text-white" style={{ background: r.color }}>{r.sig}</span>
          </div>
        ))}
        <div className="text-[10px] text-white/40 text-center pt-1">Click HIGH → research → call</div>
      </div>
    );
  }

  if (stepId === 'contact') {
    const titles = ['HR Director ❌', 'Project Manager ✓', 'Operations Lead ✓', 'Site Superintendent ✓'];
    return (
      <div className="h-[140px] rounded-md p-3 space-y-1.5" style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(251,146,60,.2)' }}>
        {titles.map((t, i) => {
          const active = frame >= i;
          const bad = t.includes('❌');
          return (
            <div
              key={i}
              className="px-2.5 py-1.5 rounded text-[11px] transition-all duration-500"
              style={{
                background: active ? (bad ? 'rgba(239,68,68,.1)' : 'rgba(34,197,94,.12)') : 'rgba(255,255,255,.03)',
                opacity: active ? 1 : 0.3,
                color: active ? (bad ? '#fca5a5' : '#86efac') : 'rgba(255,255,255,.4)',
                border: `1px solid ${active ? (bad ? 'rgba(239,68,68,.3)' : 'rgba(34,197,94,.3)') : 'transparent'}`,
              }}
            >
              {t}
            </div>
          );
        })}
      </div>
    );
  }

  if (stepId === 'outreach') {
    const draft = [
      'Saw Apex broke ground on the',
      'Buckhead tower — 18-month build',
      'usually means rotating crews.',
      'Worth a quick chat on housing?',
    ];
    return (
      <div className="h-[140px] rounded-md p-3 overflow-hidden" style={{ background: '#0a0a14', border: '1px solid rgba(251,146,60,.25)' }}>
        <div className="text-[9px] text-white/40 mb-1.5">To: pm@apexbuilders.com</div>
        <div className="space-y-0.5">
          {draft.slice(0, Math.min(frame + 1, draft.length)).map((line, i) => (
            <div key={i} className="text-[11px] text-white/85 leading-[1.5]" style={{ animation: 'fade-in 0.4s ease-out' }}>
              {line}
              {i === Math.min(frame, draft.length - 1) && i < draft.length - 1 && <span className="inline-block w-1.5 h-3 ml-0.5 bg-pink-400 animate-pulse" />}
            </div>
          ))}
        </div>
        {frame >= draft.length && (
          <div className="text-[10px] text-pink-400 mt-1.5 font-semibold">✓ Under 100 words · ready to send</div>
        )}
      </div>
    );
  }

  if (stepId === 'bonus') {
    const headline = 'Piedmont Hospital opens new 200-bed wing in Q2';
    return (
      <div className="h-[140px] rounded-md p-3 space-y-2" style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(251,146,60,.2)' }}>
        <div className="text-[10px] text-white/50">Pasted headline:</div>
        <div className="text-[11px] text-white/80 italic">"{headline}"</div>
        <div className="flex items-center gap-2 pt-1">
          <span className="text-[10px] text-white/50">Score:</span>
          <span
            className="px-2.5 py-1 rounded text-[10px] font-bold text-white transition-all duration-500"
            style={{
              background: frame >= 2 ? '#ef4444' : 'rgba(255,255,255,.1)',
              transform: frame >= 2 ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {frame >= 2 ? 'HIGH' : '...'}
          </span>
          {frame >= 3 && (
            <span className="text-[10px] text-pink-400" style={{ animation: 'fade-in 0.3s' }}>→ Healthcare · Project Teams</span>
          )}
        </div>
      </div>
    );
  }

  if (stepId === 'dashboard') {
    const stats = [
      { label: 'New today', val: 12, color: '#ec4899' },
      { label: 'HIGH priority', val: 4, color: '#ef4444' },
      { label: 'Markets', val: 7, color: '#86efac' },
    ];
    return (
      <div className="h-[140px] rounded-md p-3" style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(251,146,60,.2)' }}>
        <div className="text-[10px] text-white/50 mb-2">Good morning 👋</div>
        <div className="grid grid-cols-3 gap-2">
          {stats.map((s, i) => (
            <div
              key={i}
              className="rounded p-2 transition-all duration-500"
              style={{
                background: 'rgba(255,255,255,.04)',
                border: `1px solid ${frame % 3 === i ? s.color + '66' : 'transparent'}`,
                transform: frame % 3 === i ? 'translateY(-2px)' : 'translateY(0)',
              }}
            >
              <div className="text-[18px] font-bold" style={{ color: s.color }}>{s.val}</div>
              <div className="text-[9px] text-white/60 leading-tight">{s.label}</div>
            </div>
          ))}
        </div>
        <div className="text-[10px] text-pink-400 mt-2 text-center">→ Start with HIGH priority</div>
      </div>
    );
  }

  if (stepId === 'heat') {
    const cells = Array.from({ length: 21 }, (_, i) => (i * 37 + frame * 11) % 100);
    return (
      <div className="h-[140px] rounded-md p-3" style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(251,146,60,.2)' }}>
        <div className="text-[10px] text-white/50 mb-2">Atlanta · Construction · this week</div>
        <div className="grid grid-cols-7 gap-1">
          {cells.map((v, i) => (
            <div
              key={i}
              className="aspect-square rounded transition-all duration-700"
              style={{
                background: v > 70 ? '#ef4444' : v > 45 ? '#ec4899' : v > 25 ? 'rgba(245,158,11,.4)' : 'rgba(255,255,255,.06)',
              }}
            />
          ))}
        </div>
        <div className="text-[10px] text-white/50 mt-2 flex gap-3">
          <span style={{ color: '#ef4444' }}>■ Hot</span>
          <span style={{ color: '#ec4899' }}>■ Warm</span>
          <span className="text-white/30">■ Quiet</span>
        </div>
      </div>
    );
  }

  if (stepId === 'events') {
    const events = [
      { name: 'AHCA Summit', city: 'Nashville', when: 'May 14' },
      { name: 'AGC Build Expo', city: 'Atlanta', when: 'May 21' },
      { name: 'HIMSS Regional', city: 'Memphis', when: 'Jun 03' },
    ];
    return (
      <div className="h-[140px] rounded-md p-3 space-y-1.5" style={{ background: 'rgba(0,0,0,.25)', border: '1px solid rgba(251,146,60,.2)' }}>
        {events.map((e, i) => (
          <div
            key={i}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[11px] transition-all duration-500"
            style={{
              background: frame % 3 === i ? 'rgba(251,146,60,.15)' : 'rgba(255,255,255,.04)',
              border: `1px solid ${frame % 3 === i ? 'rgba(251,146,60,.4)' : 'transparent'}`,
            }}
          >
            <span className="text-[14px]">🎪</span>
            <div className="flex-1">
              <div className="text-white/85 font-medium">{e.name}</div>
              <div className="text-white/40 text-[9px]">{e.city} · {e.when}</div>
            </div>
            <span className="text-[9px] text-green-400">✓ verified</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

export default StepSimulation;
