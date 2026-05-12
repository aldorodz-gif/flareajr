import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import AiToolCard from './AiToolCard';
import { SEQUENCE_STEPS } from './sequenceConfig';

interface PipelineItem {
  id: string;
  company_name: string;
  contact_title: string | null;
  contact_name: string | null;
  stage: string;
  notes: string | null;
  created_at: string;
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

const stepBg = (status: 'done' | 'today' | 'overdue' | 'future') => {
  switch (status) {
    case 'done':    return { bg: 'rgba(20,184,166,.15)',  fg: '#0f766e', border: 'rgba(20,184,166,.4)' };
    case 'today':   return { bg: 'rgba(236,72,153,.15)',  fg: '#be185d', border: 'rgba(236,72,153,.5)' };
    case 'overdue': return { bg: 'rgba(239,68,68,.15)',   fg: '#b91c1c', border: 'rgba(239,68,68,.5)' };
    default:        return { bg: '#F8FAFC',               fg: '#64748b', border: 'rgba(14,30,58,.08)' };
  }
};

const ProspectsTab = () => {
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<PipelineItem[]>([]);
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setItems([]); setTasks([]); setLoading(false); return; }
    setUserId(user.id);

    const [pi, tk] = await Promise.all([
      supabase.from('pipeline_items').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('tasks').select('id, company_name, contact_title, task_type, status, due_date, notes').eq('user_id', user.id),
    ]);
    setItems(pi.data ?? []);
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

  const todayStr = TODAY();
  const dueCount = tasks.filter(t => t.status === 'pending' && t.due_date && t.due_date <= todayStr).length;

  return (
    <section className="px-6 md:px-12 py-8 max-w-[1400px] mx-auto">
      <div className="mb-5">
        <AiToolCard
          icon="🎯"
          title="Prospects"
          subtitle={`${items.length} prospect${items.length === 1 ? '' : 's'} in your pipeline · ${dueCount} email${dueCount === 1 ? '' : 's'} due today or overdue`}
        >
          <p className="text-[13px] leading-relaxed" style={{ color: '#475569' }}>
            Each prospect runs a 5-touch sequence over 21 days. Check the box when you've sent that email — overdue touches show in red.
          </p>
        </AiToolCard>
      </div>

      {loading && <div className="py-12 text-center text-[13px] text-muted-foreground">Loading prospects…</div>}

      {!loading && items.length === 0 && (
        <div className="p-10 text-center rounded-xl" style={{ background: '#FAF7F2', border: '1px dashed rgba(14,30,58,.15)' }}>
          <p className="text-[14px] font-semibold text-foreground mb-1">No prospects yet</p>
          <p className="text-[12px] text-muted-foreground">Add leads from <strong>Market Heat</strong> or <strong>AI Daily Lead Feed</strong> with the <strong>+ Pipeline</strong> button.</p>
        </div>
      )}

      <div className="grid gap-3">
        {items.map(item => {
          const itemTasks = tasks.filter(t => t.company_name === item.company_name && (t.contact_title ?? '') === (item.contact_title ?? ''));
          return (
            <div key={item.id} className="p-4 rounded-lg bg-white border" style={{ borderColor: 'rgba(14,30,58,.08)' }}>
              <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                <div>
                  <div className="text-[15px] font-extrabold" style={{ color: '#0e1e3a' }}>{item.company_name}</div>
                  <div className="text-[12px] text-muted-foreground">
                    {item.contact_title ? <>Targeting: <strong style={{ color: '#0e1e3a' }}>{item.contact_title}</strong></> : 'No target title set'}
                  </div>
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: 'rgba(155,120,200,.1)', color: '#9B78C8' }}>
                  {item.stage}
                </span>
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
                      onClick={() => toggleTask(t)}
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

              {item.notes && (
                <details className="mt-3">
                  <summary className="text-[11px] font-semibold cursor-pointer text-muted-foreground hover:text-foreground">
                    View Email 1 draft & signal
                  </summary>
                  <pre className="mt-2 p-3 rounded text-[12px] whitespace-pre-wrap font-sans" style={{ background: '#FAF7F2', color: '#1e293b', border: '1px solid rgba(14,30,58,.08)' }}>
                    {item.notes}
                  </pre>
                </details>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default ProspectsTab;
