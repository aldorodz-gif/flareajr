import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBdr } from './BdrContext';

const SHOWN_KEY = 'flare:lastSummaryDate';
const SNOOZE_KEY = 'flare:summarySnoozeUntil';

export default function DailySummaryToast() {
  const { selected } = useBdr();

  useEffect(() => {
    if (!selected) return;

    const today = new Date().toISOString().slice(0, 10);
    const shownToken = `${selected.id}:${today}`;
    if (localStorage.getItem(SHOWN_KEY) === shownToken) return;

    // Respect an active snooze
    const snoozeUntil = Number(localStorage.getItem(SNOOZE_KEY) || 0);
    if (snoozeUntil && Date.now() < snoozeUntil) {
      const delay = snoozeUntil - Date.now();
      const t = setTimeout(() => show(), delay);
      return () => clearTimeout(t);
    }

    show();

    async function show() {
      const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const { data, error } = await supabase
        .from('opportunities')
        .select('company, priority, discovery_score')
        .eq('assigned_bdr', selected.id)
        .gte('created_at', since)
        .order('discovery_score', { ascending: false });

      if (error || !data) return;
      const total = data.length;
      const highPriority = data.filter(d => d.priority === 'Top Priority');
      const top = highPriority.slice(0, 3).map(d => d.company);

      const markShown = () => {
        localStorage.setItem(SHOWN_KEY, shownToken);
        localStorage.removeItem(SNOOZE_KEY);
      };

      const snooze = (hours: number) => {
        const until = Date.now() + hours * 60 * 60 * 1000;
        localStorage.setItem(SNOOZE_KEY, String(until));
        // Don't mark as shown — it'll re-fire after snooze
        toast.dismiss(toastId);
        toast.info(`Snoozed for ${hours}h`, { duration: 3000 });
        setTimeout(() => show(), hours * 60 * 60 * 1000);
      };

      const description =
        total === 0
          ? 'No new opportunities in the last 24 hours. Next auto-scan is on schedule.'
          : highPriority.length > 0
            ? `${highPriority.length} high-priority${top.length ? `: ${top.join(', ')}` : ''}.`
            : 'No high-priority hits — review the new list in Opportunities.';

      const title =
        total === 0 ? 'Morning briefing' : `Morning briefing — ${total} new opportunities`;

      const toastId = toast(title, {
        description,
        duration: Infinity,
        action: {
          label: 'Got it',
          onClick: () => markShown(),
        },
        cancel: {
          label: 'Remind me in 1h',
          onClick: () => snooze(1),
        },
        onDismiss: () => markShown(),
        onAutoClose: () => markShown(),
      });

      // Offer a longer snooze via a follow-up toast trigger
      setTimeout(() => {
        // no-op; primary actions handle it
      }, 0);
    }
  }, [selected]);

  return null;
}
