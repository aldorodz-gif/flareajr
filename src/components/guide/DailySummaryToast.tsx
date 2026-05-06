import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useBdr } from './BdrContext';

const STORAGE_KEY = 'flare:lastSummaryDate';

export default function DailySummaryToast() {
  const { selected } = useBdr();

  useEffect(() => {
    if (!selected) return;
    const today = new Date().toISOString().slice(0, 10);
    if (localStorage.getItem(STORAGE_KEY) === `${selected.id}:${today}`) return;

    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    (async () => {
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

      localStorage.setItem(STORAGE_KEY, `${selected.id}:${today}`);

      if (total === 0) {
        toast.info('Morning briefing', {
          description: 'No new opportunities in the last 24 hours. Next auto-scan is on schedule.',
          duration: 8000,
        });
        return;
      }

      toast.success(`Morning briefing — ${total} new opportunities`, {
        description:
          highPriority.length > 0
            ? `${highPriority.length} high-priority${top.length ? `: ${top.join(', ')}` : ''}.`
            : 'No high-priority hits — review the new list in Opportunities.',
        duration: 10000,
      });
    })();
  }, [selected]);

  return null;
}
