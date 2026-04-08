import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Mail, Phone, Check, ChevronRight, MessageSquare, Calendar, RefreshCw } from 'lucide-react';

interface Task {
  id: string;
  task_type: string;
  company_name: string;
  contact_name: string | null;
  contact_title: string | null;
  reason: string | null;
  signal: string | null;
  status: string;
  due_date: string;
  notes: string | null;
}

const QUICK_LOGS = [
  { label: 'Called — No Answer', action: 'call_no_answer', icon: Phone },
  { label: 'Spoke to Contact', action: 'spoke_to_contact', icon: MessageSquare },
  { label: 'Sent Intro Email', action: 'sent_intro_email', icon: Mail },
  { label: 'Booked Meeting', action: 'booked_meeting', icon: Calendar },
];

const Today = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const today = new Date().toISOString().split('T')[0];
    const { data } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .lte('due_date', today)
      .eq('status', 'pending')
      .order('due_date', { ascending: true });
    setTasks((data as Task[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const completeTask = async (task: Task, actionType: string) => {
    if (!user) return;
    await supabase.from('tasks').update({ status: 'completed', completed_at: new Date().toISOString() }).eq('id', task.id);
    await supabase.from('activity_log').insert({
      user_id: user.id,
      task_id: task.id,
      action_type: actionType,
      company_name: task.company_name,
      contact_name: task.contact_name,
    });
    setTasks(prev => prev.filter(t => t.id !== task.id));
    toast.success(`Logged: ${actionType.replace(/_/g, ' ')}`);
  };

  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length + completed;
  const pct = total > 0 ? Math.round((completed / total) * 100) : 0;

  const outreach = tasks.filter(t => t.task_type === 'outreach');
  const followups = tasks.filter(t => t.task_type === 'follow_up');
  const calls = tasks.filter(t => t.task_type === 'call');

  const TaskCard = ({ task }: { task: Task }) => (
    <div className="bg-card rounded-xl border p-4 animate-fade-in hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground truncate">{task.company_name}</p>
          {task.contact_name && (
            <p className="text-sm text-muted-foreground">{task.contact_name}{task.contact_title ? ` · ${task.contact_title}` : ''}</p>
          )}
          {task.reason && (
            <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
              <ChevronRight className="w-3 h-3 text-primary shrink-0" />
              {task.reason}
            </p>
          )}
          {task.signal && (
            <span className="inline-block mt-2 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {task.signal}
            </span>
          )}
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" onClick={() => completeTask(task, 'email_sent')} title="Send Email">
            <Mail className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" onClick={() => completeTask(task, 'call_made')} title="Call">
            <Phone className="w-3.5 h-3.5" />
          </Button>
          <Button size="sm" className="h-8 w-8 p-0 rounded-lg" onClick={() => completeTask(task, 'completed')} title="Complete">
            <Check className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );

  const Section = ({ title, items, emptyText }: { title: string; items: Task[]; emptyText: string }) => (
    <div>
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">{title} ({items.length})</h3>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground bg-card rounded-xl border p-4 text-center">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.map(t => <TaskCard key={t.id} task={t} />)}
        </div>
      )}
    </div>
  );

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="bg-card rounded-xl border p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-foreground">Today's Plan</h2>
          <span className="text-sm font-medium text-muted-foreground">{tasks.length} remaining</span>
        </div>
        <Progress value={pct} className="h-2 rounded-full" />
        {tasks.length === 0 && (
          <div className="text-center mt-4">
            <p className="text-success font-semibold text-lg">🎉 All done!</p>
            <p className="text-sm text-muted-foreground">Your daily plan is complete. Check Opportunities for more.</p>
          </div>
        )}
      </div>

      {/* Quick Log */}
      <div className="flex flex-wrap gap-2">
        {QUICK_LOGS.map(q => (
          <Button key={q.action} size="sm" variant="outline" className="rounded-full text-xs h-8 gap-1.5" onClick={() => toast.info('Select a task above to log activity')}>
            <q.icon className="w-3 h-3" /> {q.label}
          </Button>
        ))}
      </div>

      {/* Sections */}
      <Section title="New Outreach" items={outreach} emptyText="No new outreach today — add from Opportunities" />
      <Section title="Follow-Ups" items={followups} emptyText="No follow-ups due" />
      <Section title="Calls" items={calls} emptyText="No calls scheduled" />
    </div>
  );
};

export default Today;
