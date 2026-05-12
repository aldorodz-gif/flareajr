import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Number of email tasks that are pending and due today or earlier (overdue).
export function useDueTaskCount() {
  const [count, setCount] = useState(0);

  const refresh = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCount(0); return; }
    const today = new Date().toISOString().slice(0, 10);
    const { count: c } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('status', 'pending')
      .lte('due_date', today);
    setCount(c ?? 0);
  };

  useEffect(() => {
    refresh();
    const handler = () => refresh();
    window.addEventListener('flare:tasks-updated', handler);
    const id = window.setInterval(refresh, 60_000); // refresh every minute
    return () => {
      window.removeEventListener('flare:tasks-updated', handler);
      window.clearInterval(id);
    };
  }, []);

  return count;
}
