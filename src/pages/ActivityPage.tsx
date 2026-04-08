import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { RefreshCw, Copy, Mail, Phone, Calendar, MessageSquare, CheckCircle } from 'lucide-react';

interface ActivityEntry {
  id: string;
  action_type: string;
  company_name: string | null;
  contact_name: string | null;
  notes: string | null;
  logged_at: string;
}

const ACTION_ICONS: Record<string, any> = {
  email_sent: Mail,
  call_made: Phone,
  call_no_answer: Phone,
  spoke_to_contact: MessageSquare,
  sent_intro_email: Mail,
  booked_meeting: Calendar,
  meeting_booked: Calendar,
  completed: CheckCircle,
};

const ACTION_LABELS: Record<string, string> = {
  email_sent: 'Email Sent',
  call_made: 'Call Made',
  call_no_answer: 'Called — No Answer',
  spoke_to_contact: 'Spoke to Contact',
  sent_intro_email: 'Sent Intro Email',
  booked_meeting: 'Booked Meeting',
  meeting_booked: 'Meeting Booked',
  completed: 'Completed',
};

const ActivityPage = () => {
  const { user } = useAuth();
  const [activities, setActivities] = useState<ActivityEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .eq('user_id', user.id)
      .order('logged_at', { ascending: false })
      .limit(100);
    setActivities((data as ActivityEntry[]) || []);
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchActivity(); }, [fetchActivity]);

  // Stats
  const today = new Date().toISOString().split('T')[0];
  const todayActivities = activities.filter(a => a.logged_at.startsWith(today));
  const calls = todayActivities.filter(a => ['call_made', 'call_no_answer', 'spoke_to_contact'].includes(a.action_type)).length;
  const emails = todayActivities.filter(a => ['email_sent', 'sent_intro_email'].includes(a.action_type)).length;
  const meetings = todayActivities.filter(a => ['booked_meeting', 'meeting_booked'].includes(a.action_type)).length;

  const copySummary = () => {
    const lines = todayActivities.map(a => 
      `${ACTION_LABELS[a.action_type] || a.action_type} — ${a.company_name || 'N/A'}${a.contact_name ? ` (${a.contact_name})` : ''}`
    );
    const summary = `Daily Activity Summary — ${today}\n\nCalls: ${calls}\nEmails: ${emails}\nMeetings: ${meetings}\n\n${lines.join('\n')}`;
    navigator.clipboard.writeText(summary);
    toast.success('Summary copied — paste into Salesforce');
  };

  if (loading) return <div className="flex items-center justify-center py-20"><RefreshCw className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-6">
      {/* Daily Summary */}
      <div className="bg-card rounded-xl border p-5 animate-slide-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Today's Activity</h2>
          <Button size="sm" variant="outline" className="rounded-lg gap-1.5 text-xs" onClick={copySummary}>
            <Copy className="w-3 h-3" /> Copy for Salesforce
          </Button>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-blue-50 dark:bg-blue-950/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-blue-600">{calls}</p>
            <p className="text-xs text-muted-foreground">Calls</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-950/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-purple-600">{emails}</p>
            <p className="text-xs text-muted-foreground">Emails</p>
          </div>
          <div className="bg-green-50 dark:bg-green-950/20 rounded-lg p-3 text-center">
            <p className="text-2xl font-bold text-green-600">{meetings}</p>
            <p className="text-xs text-muted-foreground">Meetings</p>
          </div>
        </div>
      </div>

      {/* Activity Feed */}
      <div>
        <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Recent Activity</h3>
        {activities.length === 0 ? (
          <div className="bg-card rounded-xl border p-10 text-center">
            <p className="text-sm text-muted-foreground">No activity yet. Start executing from Today or Opportunities.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {activities.map((a, i) => {
              const Icon = ACTION_ICONS[a.action_type] || CheckCircle;
              return (
                <div key={a.id} className="bg-card rounded-xl border p-3 flex items-center gap-3 animate-fade-in" style={{ animationDelay: `${i * 0.02}s` }}>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {ACTION_LABELS[a.action_type] || a.action_type}
                      {a.company_name && <span className="text-muted-foreground"> — {a.company_name}</span>}
                    </p>
                    {a.contact_name && <p className="text-xs text-muted-foreground">{a.contact_name}</p>}
                  </div>
                  <span className="text-[11px] text-muted-foreground shrink-0">
                    {new Date(a.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityPage;
