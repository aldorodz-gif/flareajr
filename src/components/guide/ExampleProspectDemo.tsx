import { useState } from 'react';
import { toast } from 'sonner';
import DiscoBallCelebration from './DiscoBallCelebration';
import { SEQUENCE_STEPS } from './sequenceConfig';

const CONNECTION_TYPES = [
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'email',    label: 'Email',    icon: '✉️' },
  { id: 'phone',    label: 'Phone',    icon: '📞' },
  { id: 'inperson', label: 'In-person',icon: '🤝' },
  { id: 'referral', label: 'Referral', icon: '🌟' },
] as const;

const stepBg = (status: 'done' | 'today' | 'overdue' | 'future') => {
  switch (status) {
    case 'done':    return { bg: 'rgba(20,184,166,.15)', fg: '#0f766e', border: 'rgba(20,184,166,.4)' };
    case 'today':   return { bg: 'rgba(236,72,153,.15)', fg: '#be185d', border: 'rgba(236,72,153,.5)' };
    case 'overdue': return { bg: 'rgba(239,68,68,.15)',  fg: '#b91c1c', border: 'rgba(239,68,68,.5)' };
    default:        return { bg: '#F8FAFC',              fg: '#64748b', border: 'rgba(14,30,58,.08)' };
  }
};

// Pretend "today" for the demo so days line up nicely.
type DemoStatus = 'done' | 'today' | 'overdue' | 'future';
const DEMO_STATUSES: DemoStatus[] = ['done', 'today', 'future', 'future', 'future'];

interface DemoState {
  connection: string | null;
  meetingType: 'disco' | 'inperson' | null;
  followups: number;
  archived: boolean;
  notes: string;
  doneSteps: boolean[]; // length 5
}

const INITIAL: DemoState = {
  connection: null,
  meetingType: null,
  followups: 0,
  archived: false,
  notes: '',
  doneSteps: [true, false, false, false, false],
};

const ExampleProspectDemo = () => {
  const [open, setOpen] = useState(false);
  const [s, setS] = useState<DemoState>(INITIAL);
  const [celebrate, setCelebrate] = useState<null | 'disco' | 'inperson'>(null);
  const [editingNotes, setEditingNotes] = useState(false);

  const reset = () => { setS(INITIAL); setEditingNotes(false); toast.success('Example reset'); };

  const toggleStep = (i: number) => {
    setS(p => {
      const next = [...p.doneSteps]; next[i] = !next[i];
      return { ...p, doneSteps: next };
    });
    toast.success('Touch toggled (demo)');
  };

  const setConnection = (id: string) => {
    setS(p => ({ ...p, connection: p.connection === id ? null : id }));
    toast.success(s.connection === id ? 'Connection cleared (demo)' : `Logged via ${id} (demo)`);
  };

  const book = (type: 'disco' | 'inperson') => {
    setS(p => ({ ...p, meetingType: type }));
    setCelebrate(type);
  };
  const undoBook = () => { setS(p => ({ ...p, meetingType: null })); toast.success('↶ Meeting undone (demo)'); };

  const followup = () => {
    setS(p => ({ ...p, followups: p.followups + 1 }));
    toast.success(`🔁 Follow-up #${s.followups + 1} logged (demo)`);
  };

  const toggleArchive = () => {
    setS(p => ({ ...p, archived: !p.archived }));
    toast.success(s.archived ? '↩ Restored (demo)' : '📦 Archived (demo)');
  };

  return (
    <div className="mb-5">
      <DiscoBallCelebration
        open={!!celebrate}
        variant={celebrate ?? 'disco'}
        company="Acme Relocation (demo)"
        onClose={() => setCelebrate(null)}
      />

      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between p-3 rounded-lg transition-colors"
        style={{
          background: open
            ? 'linear-gradient(135deg, rgba(45,212,191,.18), rgba(168,85,247,.12))'
            : 'linear-gradient(135deg, rgba(45,212,191,.10), rgba(168,85,247,.06))',
          border: '1px dashed rgba(45,212,191,.45)',
        }}
      >
        <div className="flex items-center gap-2">
          <span className="text-[16px]">👀</span>
          <span className="text-[13px] font-bold" style={{ color: '#0f766e' }}>See an example — try every option safely</span>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#fff', color: '#0f766e' }}>
            DEMO · nothing saved
          </span>
        </div>
        <span className="text-[12px]" style={{ color: '#0f766e' }}>{open ? '▲ Hide' : '▼ Show'}</span>
      </button>

      {open && (
        <div className="mt-3 p-4 rounded-lg bg-white border" style={{ borderColor: 'rgba(45,212,191,.35)', opacity: s.archived ? 0.85 : 1 }}>
          <div className="flex items-center justify-between mb-3">
            <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#0f766e' }}>
              💡 Click anything below to see what happens
            </div>
            <button onClick={reset} className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ background: '#F1F5F9', color: '#475569' }}>
              ↻ Reset demo
            </button>
          </div>

          {/* Mock card — same layout as a real ProspectCard */}
          <div className="p-4 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid rgba(14,30,58,.08)' }}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
              <div>
                <div className="text-[15px] font-extrabold" style={{ color: '#0e1e3a' }}>Acme Relocation</div>
                <div className="text-[12px] text-muted-foreground">Targeting: <strong style={{ color: '#0e1e3a' }}>Director of Mobility</strong></div>
              </div>
              <div className="flex items-center gap-2">
                {s.meetingType && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(168,85,247,.15)', color: '#7c3aed' }}>
                    {s.meetingType === 'inperson' ? '🤝 In-person booked' : '🪩 Disco call booked'}
                    <button onClick={undoBook} className="ml-1 px-1.5 py-0.5 rounded hover:bg-white/60" style={{ color: '#7c3aed' }}>↶ undo</button>
                  </span>
                )}
                {s.followups > 0 && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(45,212,191,.15)', color: '#0f766e' }}>
                    🔁 {s.followups} follow-up{s.followups === 1 ? '' : 's'}
                  </span>
                )}
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(155,120,200,.1)', color: '#9B78C8' }}>
                  {s.archived ? 'archived' : s.meetingType ? 'meeting_booked' : 'working'}
                </span>
              </div>
            </div>

            {/* Sequence */}
            <div className="grid grid-cols-5 gap-2">
              {SEQUENCE_STEPS.map((step, i) => {
                const status: DemoStatus = s.doneSteps[i] ? 'done' : DEMO_STATUSES[i];
                const c = stepBg(status);
                const labelDate = new Date(Date.now() + (step.day - 1) * 86400000);
                return (
                  <button
                    key={step.task_type}
                    onClick={() => toggleStep(i)}
                    className="p-2 rounded text-center transition-all hover:-translate-y-0.5"
                    style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
                  >
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                      <span>{s.doneSteps[i] ? '☑' : '☐'}</span>
                      <span>{step.label.split(' · ')[0]}</span>
                    </div>
                    <div className="text-[10px] mt-0.5">{labelDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</div>
                    <div className="text-[9px] opacity-80 mt-0.5">
                      {status === 'done' ? 'Sent' : status === 'today' ? 'Due today' : status === 'overdue' ? 'Overdue' : 'Scheduled'}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Connection + meeting + archive */}
            <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(14,30,58,.06)' }}>
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Connected via:</span>
                {CONNECTION_TYPES.map(ct => {
                  const active = s.connection === ct.id;
                  return (
                    <button
                      key={ct.id}
                      onClick={() => setConnection(ct.id)}
                      className="text-[11px] font-semibold px-2 py-1 rounded-full transition-all"
                      style={{
                        background: active ? 'rgba(45,212,191,.18)' : '#fff',
                        color: active ? '#0f766e' : '#64748b',
                        border: `1px solid ${active ? 'rgba(45,212,191,.5)' : 'rgba(14,30,58,.08)'}`,
                      }}
                    >
                      {ct.icon} {ct.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2 ml-auto">
                {!s.archived && !s.meetingType && (
                  <>
                    <button
                      onClick={() => book('disco')}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-md text-white transition-all hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, #DC2626, #0EA5E9)', boxShadow: '0 2px 8px rgba(168,85,247,.3)' }}
                    >🪩 Book Disco Call</button>
                    <button
                      onClick={() => book('inperson')}
                      className="text-[11px] font-bold px-3 py-1.5 rounded-md transition-all hover:-translate-y-0.5"
                      style={{ background: 'rgba(45,212,191,.15)', color: '#0f766e', border: '1px solid rgba(45,212,191,.4)' }}
                    >🤝 In-person</button>
                  </>
                )}
                {!s.archived && s.meetingType && (
                  <button
                    onClick={followup}
                    className="text-[11px] font-bold px-3 py-1.5 rounded-md transition-all hover:-translate-y-0.5"
                    style={{ background: 'rgba(168,85,247,.15)', color: '#7c3aed', border: '1px solid rgba(168,85,247,.4)' }}
                  >🔁 Log follow-up</button>
                )}
                <button
                  onClick={toggleArchive}
                  className="text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all"
                  style={{ background: '#F1F5F9', color: '#475569', border: '1px solid rgba(14,30,58,.08)' }}
                >{s.archived ? '↩ Restore' : '📦 Archive'}</button>
              </div>
            </div>

            {/* Notes */}
            <div className="mt-3">
              {!editingNotes ? (
                <button
                  onClick={() => setEditingNotes(true)}
                  className="w-full text-left p-3 rounded text-[12px] hover:bg-white transition-colors"
                  style={{ background: '#fff', color: '#1e293b', border: '1px dashed rgba(14,30,58,.12)' }}
                >
                  <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">📝 Notes</div>
                  {s.notes
                    ? <pre className="whitespace-pre-wrap font-sans text-[12px]">{s.notes}</pre>
                    : <span className="text-muted-foreground italic">Click to try the notes editor — type anything, hit save.</span>}
                </button>
              ) : (
                <div className="rounded p-2" style={{ background: '#fff', border: '1px solid rgba(14,30,58,.12)' }}>
                  <textarea
                    autoFocus
                    value={s.notes}
                    onChange={e => setS(p => ({ ...p, notes: e.target.value }))}
                    rows={3}
                    placeholder="Try it: 'Spoke with Jane — hiring 30 in Q3, wants Phoenix housing intro.'"
                    className="w-full text-[12px] p-2 rounded bg-white border resize-y"
                    style={{ borderColor: 'rgba(14,30,58,.1)', color: '#1e293b' }}
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <button onClick={() => setEditingNotes(false)} className="text-[11px] px-2.5 py-1 rounded text-muted-foreground">Cancel</button>
                    <button
                      onClick={() => { setEditingNotes(false); toast.success('Notes saved (demo)'); }}
                      className="text-[11px] font-bold px-3 py-1 rounded text-white"
                      style={{ background: '#0e1e3a' }}
                    >Save notes</button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="mt-3 text-[11px] leading-relaxed" style={{ color: '#475569' }}>
            <strong style={{ color: '#0f766e' }}>What to try:</strong> tap a touch tile (☐ → ☑), pick a connection type, hit <em>Book Disco Call</em> for the celebration, then <em>↶ undo</em>, log a follow-up, archive + restore, and edit notes. None of it touches your real pipeline.
          </div>
        </div>
      )}
    </div>
  );
};

export default ExampleProspectDemo;
