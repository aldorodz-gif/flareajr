import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AiToolCard from './AiToolCard';
import { SEQUENCE_STEPS } from './sequenceConfig';
import DiscoBallCelebration from './DiscoBallCelebration';

interface PipelineItem {
  id: string;
  company_name: string;
  contact_title: string | null;
  contact_name: string | null;
  stage: string;
  notes: string | null;
  created_at: string;
  connection_type: string | null;
  archived_at: string | null;
  meeting_booked_at: string | null;
  meeting_type: string | null;
}

interface TaskRow {
  id: string;
  company_name: string;
  contact_title: string | null;
  task_type: string;
  status: string;
  due_date: string | null;
  notes: string | null;
}

const TODAY = () => new Date().toISOString().slice(0, 10);

const CONNECTION_TYPES = [
  { id: 'linkedin', label: 'LinkedIn', icon: '💼' },
  { id: 'email',    label: 'Email',    icon: '✉️' },
  { id: 'phone',    label: 'Phone',    icon: '📞' },
  { id: 'inperson', label: 'In-person',icon: '🤝' },
  { id: 'referral', label: 'Referral', icon: '🌟' },
] as const;

const stepBg = (status: 'done' | 'today' | 'overdue' | 'future') => {
  switch (status) {
    case 'done':    return { bg: 'rgba(20,184,166,.15)',  fg: '#0f766e', border: 'rgba(20,184,166,.4)' };
    case 'today':   return { bg: 'rgba(236,72,153,.15)',  fg: '#be185d', border: 'rgba(236,72,153,.5)' };
    case 'overdue': return { bg: 'rgba(239,68,68,.15)',   fg: '#b91c1c', border: 'rgba(239,68,68,.5)' };
    default:        return { bg: '#F8FAFC',               fg: '#64748b', border: 'rgba(14,30,58,.08)' };
  }
};

const ProspectCard = ({
  item,
  itemTasks,
  todayStr,
  onTaskToggle,
  onUpdate,
  onBookMeeting,
}: {
  item: PipelineItem;
  itemTasks: TaskRow[];
  todayStr: string;
  onTaskToggle: (t: TaskRow) => void;
  onUpdate: (id: string, patch: Partial<PipelineItem>) => Promise<void>;
  onBookMeeting: (item: PipelineItem, type: 'disco' | 'inperson') => void;
}) => {
  const isArchived = !!item.archived_at;
  const [notesDraft, setNotesDraft] = useState(item.notes ?? '');
  const [editingNotes, setEditingNotes] = useState(false);

  return (
    <div className="p-4 rounded-lg bg-white border" style={{ borderColor: 'rgba(14,30,58,.08)', opacity: isArchived ? 0.85 : 1 }}>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div>
          <div className="text-[15px] font-extrabold" style={{ color: '#0e1e3a' }}>{item.company_name}</div>
          <div className="text-[12px] text-muted-foreground">
            {item.contact_title ? <>Targeting: <strong style={{ color: '#0e1e3a' }}>{item.contact_title}</strong></> : 'No target title set'}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {item.meeting_booked_at && (
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(168,85,247,.15)', color: '#7c3aed' }}>
              {item.meeting_type === 'inperson' ? '🤝 In-person booked' : '🪩 Disco call booked'}
              <button
                onClick={() => onUpdate(item.id, { meeting_booked_at: null, meeting_type: null, stage: 'working' })}
                title="Undo meeting"
                className="ml-1 px-1.5 py-0.5 rounded hover:bg-white/60 transition-colors"
                style={{ color: '#7c3aed' }}
              >
                ↶ undo
              </button>
            </span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(155,120,200,.1)', color: '#9B78C8' }}>
            {isArchived ? 'archived' : item.stage}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-2">
        {SEQUENCE_STEPS.map(step => {
          const t = itemTasks.find(tt => tt.task_type === step.task_type);
          if (!t) {
            return (
              <div key={step.task_type} className="p-2 rounded text-center text-[10px] text-muted-foreground" style={{ background: '#F8FAFC', border: '1px dashed rgba(14,30,58,.1)' }}>
                <div className="font-semibold">{step.label.split(' · ')[0]}</div>
                <div>—</div>
              </div>
            );
          }
          const isDone = t.status === 'done';
          const status: 'done' | 'today' | 'overdue' | 'future' =
            isDone ? 'done'
            : t.due_date === todayStr ? 'today'
            : (t.due_date && t.due_date < todayStr) ? 'overdue'
            : 'future';
          const c = stepBg(status);
          return (
            <button
              key={step.task_type}
              onClick={() => onTaskToggle(t)}
              title={t.notes ?? step.reason}
              className="p-2 rounded text-center transition-all hover:-translate-y-0.5"
              style={{ background: c.bg, color: c.fg, border: `1px solid ${c.border}` }}
            >
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-wider">
                <span>{isDone ? '☑' : '☐'}</span>
                <span>{step.label.split(' · ')[0]}</span>
              </div>
              <div className="text-[10px] mt-0.5">
                {t.due_date ? new Date(t.due_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : '—'}
              </div>
              <div className="text-[9px] opacity-80 mt-0.5">
                {status === 'done' ? 'Sent' : status === 'today' ? 'Due today' : status === 'overdue' ? 'Overdue' : 'Scheduled'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Connection type + meeting + archive controls */}
      <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t" style={{ borderColor: 'rgba(14,30,58,.06)' }}>
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mr-1">Connected via:</span>
          {CONNECTION_TYPES.map(ct => {
            const active = item.connection_type === ct.id;
            return (
              <button
                key={ct.id}
                onClick={() => onUpdate(item.id, { connection_type: active ? null : ct.id })}
                className="text-[11px] font-semibold px-2 py-1 rounded-full transition-all"
                style={{
                  background: active ? 'rgba(45,212,191,.18)' : '#F8FAFC',
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
          {!isArchived && !item.meeting_booked_at && (
            <>
              <button
                onClick={() => onBookMeeting(item, 'disco')}
                className="text-[11px] font-bold px-3 py-1.5 rounded-md text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg, #ec4899, #a855f7)', boxShadow: '0 2px 8px rgba(168,85,247,.3)' }}
              >
                🪩 Book Disco Call
              </button>
              <button
                onClick={() => onBookMeeting(item, 'inperson')}
                className="text-[11px] font-bold px-3 py-1.5 rounded-md transition-all hover:-translate-y-0.5"
                style={{ background: 'rgba(45,212,191,.15)', color: '#0f766e', border: '1px solid rgba(45,212,191,.4)' }}
              >
                🤝 In-person
              </button>
            </>
          )}
          <button
            onClick={() => onUpdate(item.id, { archived_at: isArchived ? null : new Date().toISOString() })}
            className="text-[11px] font-semibold px-3 py-1.5 rounded-md transition-all"
            style={{ background: '#F1F5F9', color: '#475569', border: '1px solid rgba(14,30,58,.08)' }}
          >
            {isArchived ? '↩ Restore' : '📦 Archive'}
          </button>
        </div>
      </div>

      {/* Notes editor */}
      <div className="mt-3">
        {!editingNotes ? (
          <button
            onClick={() => { setNotesDraft(item.notes ?? ''); setEditingNotes(true); }}
            className="w-full text-left p-3 rounded text-[12px] hover:bg-slate-50 transition-colors"
            style={{ background: '#FAF7F2', color: '#1e293b', border: '1px dashed rgba(14,30,58,.12)' }}
          >
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">📝 Notes</div>
            {item.notes
              ? <pre className="whitespace-pre-wrap font-sans text-[12px]">{item.notes}</pre>
              : <span className="text-muted-foreground italic">Click to add notes about this lead — context, what was said, next steps…</span>}
          </button>
        ) : (
          <div className="rounded p-2" style={{ background: '#FAF7F2', border: '1px solid rgba(14,30,58,.12)' }}>
            <textarea
              autoFocus
              value={notesDraft}
              onChange={e => setNotesDraft(e.target.value)}
              rows={4}
              placeholder="What did they say? Pain points, timing, next step…"
              className="w-full text-[12px] p-2 rounded bg-white border resize-y"
              style={{ borderColor: 'rgba(14,30,58,.1)', color: '#1e293b' }}
            />
            <div className="flex justify-end gap-2 mt-2">
              <button onClick={() => setEditingNotes(false)} className="text-[11px] px-2.5 py-1 rounded text-muted-foreground">Cancel</button>
              <button
                onClick={async () => { await onUpdate(item.id, { notes: notesDraft }); setEditingNotes(false); }}
                className="text-[11px] font-bold px-3 py-1 rounded text-white"
                style={{ background: '#0e1e3a' }}
              >
                Save notes
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ProspectsTab = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showArchive, setShowArchive] = useState(false);
  const [celebration, setCelebration] = useState<{ company: string; type: 'disco' | 'inperson' } | null>(null);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setItems([]); setTasks([]); setLoading(false); return; }
    setUserId(user.id);

    const [pi, tk] = await Promise.all([
      supabase.from('pipeline_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('tasks').select('id, company_name, contact_title, task_type, status, due_date, notes').eq('user_id', user.id),
    ]);
    setItems((pi.data ?? []) as PipelineItem[]);
    setTasks(tk.data ?? []);
    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
    const h = () => refresh();
    window.addEventListener('flare:tasks-updated', h);
    return () => window.removeEventListener('flare:tasks-updated', h);
  }, [refresh]);

  const toggleTask = async (task: TaskRow) => {
    const isDone = task.status === 'done';
    const next = isDone ? { status: 'pending', completed_at: null } : { status: 'done', completed_at: new Date().toISOString() };
    const { error } = await supabase.from('tasks').update(next).eq('id', task.id);
    if (error) { toast.error(error.message); return; }
    if (!isDone && userId) {
      await supabase.from('activity_log').insert({
        user_id: userId,
        task_id: task.id,
        action_type: task.task_type,
        company_name: task.company_name,
        contact_name: task.contact_title,
        notes: `Marked ${task.task_type} sent`,
      });
    }
    toast.success(isDone ? 'Marked pending' : 'Marked sent');
    window.dispatchEvent(new CustomEvent('flare:tasks-updated'));
    refresh();
  };

  const updateItem = async (id: string, patch: Partial<PipelineItem>) => {
    const { error } = await supabase.from('pipeline_items').update(patch).eq('id', id);
    if (error) { toast.error(error.message); return; }
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...patch } as PipelineItem : i));
    if ('archived_at' in patch) toast.success(patch.archived_at ? '📦 Archived' : '↩ Restored');
    else if ('meeting_booked_at' in patch && !patch.meeting_booked_at) toast.success('↶ Meeting undone');
    else if ('connection_type' in patch) toast.success(patch.connection_type ? 'Connection logged' : 'Connection cleared');
    else if ('notes' in patch) toast.success('Notes saved');
  };

  const bookMeeting = async (item: PipelineItem, type: 'disco' | 'inperson') => {
    const patch = { meeting_booked_at: new Date().toISOString(), meeting_type: type, stage: 'meeting_booked' };
    const { error } = await supabase.from('pipeline_items').update(patch).eq('id', item.id);
    if (error) { toast.error(error.message); return; }
    if (userId) {
      await supabase.from('activity_log').insert({
        user_id: userId,
        action_type: type === 'disco' ? 'disco_call_booked' : 'inperson_meeting_booked',
        company_name: item.company_name,
        contact_name: item.contact_title,
        notes: type === 'disco' ? '🪩 Disco call booked' : '🤝 In-person meeting booked',
      });
    }
    setItems(prev => prev.map(i => i.id === item.id ? { ...i, ...patch } as PipelineItem : i));
    setCelebration({ company: item.company_name, type });
  };

  const todayStr = TODAY();
  const activeItems = useMemo(() => items.filter(i => !i.archived_at), [items]);
  const archivedItems = useMemo(() => items.filter(i => !!i.archived_at), [items]);

  const dueCount = tasks.filter(t => t.status === 'pending' && t.due_date && t.due_date <= todayStr).length;

  const stageStats = SEQUENCE_STEPS.map(step => {
    const stepTasks = tasks.filter(t => t.task_type === step.task_type);
    const total = stepTasks.length;
    const done = stepTasks.filter(t => t.status === 'done').length;
    const dueToday = stepTasks.filter(t => t.status === 'pending' && t.due_date === todayStr).length;
    const overdue = stepTasks.filter(t => t.status === 'pending' && t.due_date && t.due_date < todayStr).length;
    const scheduled = stepTasks.filter(t => t.status === 'pending' && t.due_date && t.due_date > todayStr).length;
    return { step, total, done, dueToday, overdue, scheduled };
  });
  const totalOverdue = stageStats.reduce((s, x) => s + x.overdue, 0);
  const totalDueToday = stageStats.reduce((s, x) => s + x.dueToday, 0);
  const nextOverdue = tasks
    .filter(t => t.status === 'pending' && t.due_date && t.due_date < todayStr)
    .sort((a, b) => (a.due_date ?? '').localeCompare(b.due_date ?? ''))[0];

  const meetingsBooked = items.filter(i => i.meeting_booked_at).length;

  return (
    <section className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <DiscoBallCelebration
        open={!!celebration}
        variant={celebration?.type ?? 'disco'}
        company={celebration?.company ?? ''}
        onClose={() => setCelebration(null)}
      />

      <div className="mb-5">
        <AiToolCard
          icon="🎯"
          title="Prospects"
          subtitle={`${activeItems.length} active · ${archivedItems.length} archived · ${meetingsBooked} meeting${meetingsBooked === 1 ? '' : 's'} booked · ${dueCount} email${dueCount === 1 ? '' : 's'} due`}
        >
          <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>
            Each prospect runs a 5-touch sequence over 21 days. Log how you connected, take notes, and book the meeting when they're ready.
          </p>
        </AiToolCard>
      </div>

      {!loading && activeItems.length > 0 && (
        <div className="mb-5 p-4 rounded-xl bg-white border" style={{ borderColor: 'rgba(14,30,58,.08)' }}>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider" style={{ color: '#0e1e3a' }}>📊 Sequence Journey</div>
              <div className="text-[12px] text-muted-foreground">Where every touch sits across the 21-day cadence.</div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(236,72,153,.12)', color: '#be185d' }}>⏰ {totalDueToday} due today</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full" style={{ background: 'rgba(239,68,68,.12)', color: '#b91c1c' }}>🚨 {totalOverdue} overdue</span>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {stageStats.map(({ step, total, done, dueToday, overdue, scheduled }) => (
              <div key={step.task_type} className="p-3 rounded-lg" style={{ background: '#FAF7F2', border: '1px solid rgba(14,30,58,.08)' }}>
                <div className="flex items-baseline justify-between mb-1.5">
                  <div className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#0e1e3a' }}>
                    Day {step.day} · {step.label.split(' · ')[1]}
                  </div>
                  <div className="text-[14px] font-extrabold" style={{ color: '#0e1e3a' }}>{total}</div>
                </div>
                <div className="flex flex-wrap gap-1">
                  {done > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(20,184,166,.15)', color: '#0f766e' }}>✓ {done}</span>}
                  {dueToday > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(236,72,153,.15)', color: '#be185d' }}>⏰ {dueToday}</span>}
                  {overdue > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: 'rgba(239,68,68,.15)', color: '#b91c1c' }}>🚨 {overdue}</span>}
                  {scheduled > 0 && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: '#F1F5F9', color: '#64748b' }}>📅 {scheduled}</span>}
                  {total === 0 && <span className="text-[10px] text-muted-foreground">—</span>}
                </div>
              </div>
            ))}
          </div>

          {nextOverdue && (
            <div className="mt-3 p-2.5 rounded-lg flex items-center gap-2 text-[12px]" style={{ background: 'rgba(239,68,68,.08)', border: '1px solid rgba(239,68,68,.25)' }}>
              <span>🔔</span>
              <span style={{ color: '#1e293b' }}>
                <strong style={{ color: '#b91c1c' }}>Reminder:</strong> oldest overdue is{' '}
                <strong>{nextOverdue.company_name}</strong> — {nextOverdue.task_type.replace(/_/g, ' ')} was due{' '}
                {nextOverdue.due_date && new Date(nextOverdue.due_date + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}.
              </span>
            </div>
          )}
        </div>
      )}

      {loading && <div className="py-12 text-center text-[13px] text-muted-foreground">Loading prospects…</div>}

      {!loading && items.length === 0 && (
        <div className="p-10 text-center rounded-xl" style={{ background: '#FAF7F2', border: '1px dashed rgba(14,30,58,.15)' }}>
          <p className="text-[14px] font-semibold text-foreground mb-1">No prospects yet</p>
          <p className="text-[12px] text-muted-foreground">Add leads from <strong>Scan a Market</strong> or <strong>Today's Leads</strong> with the <strong>+ Pipeline</strong> button.</p>
        </div>
      )}

      <div className="grid gap-3">
        {activeItems.map(item => {
          const itemTasks = tasks.filter(t => t.company_name === item.company_name && (t.contact_title ?? '') === (item.contact_title ?? ''));
          return (
            <ProspectCard
              key={item.id}
              item={item}
              itemTasks={itemTasks}
              todayStr={todayStr}
              onTaskToggle={toggleTask}
              onUpdate={updateItem}
              onBookMeeting={bookMeeting}
            />
          );
        })}
      </div>

      {/* Archive section */}
      {archivedItems.length > 0 && (
        <div className="mt-8">
          <button
            onClick={() => setShowArchive(s => !s)}
            className="w-full flex items-center justify-between p-3 rounded-lg bg-white border hover:bg-slate-50 transition-colors"
            style={{ borderColor: 'rgba(14,30,58,.08)' }}
          >
            <div className="flex items-center gap-2">
              <span className="text-[16px]">📦</span>
              <span className="text-[13px] font-bold" style={{ color: '#0e1e3a' }}>Archive</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: '#F1F5F9', color: '#475569' }}>
                {archivedItems.length} completed
              </span>
            </div>
            <span className="text-[12px] text-muted-foreground">{showArchive ? '▲ Hide' : '▼ Show'}</span>
          </button>

          {showArchive && (
            <div className="grid gap-3 mt-3">
              {archivedItems.map(item => {
                const itemTasks = tasks.filter(t => t.company_name === item.company_name && (t.contact_title ?? '') === (item.contact_title ?? ''));
                return (
                  <ProspectCard
                    key={item.id}
                    item={item}
                    itemTasks={itemTasks}
                    todayStr={todayStr}
                    onTaskToggle={toggleTask}
                    onUpdate={updateItem}
                    onBookMeeting={bookMeeting}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
};

export default ProspectsTab;
