import { useEffect, useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase } from '@/integrations/supabase/client';

// Admin-only banner. Shows a warning if any service logged a quota/credit error
// (HTTP 429 or 402) in the last 24 hours.
export default function QuotaBanner() {
  const { isAdmin } = useAuth();
  const [hit, setHit] = useState<{ service: string; code: string } | null>(null);

  useEffect(() => {
    if (!isAdmin) return;
    const since = new Date(Date.now() - 24 * 3600 * 1000).toISOString();
    supabase.from('api_usage')
      .select('service,error_code')
      .gte('created_at', since)
      .eq('success', false)
      .in('error_code', ['429', '402'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
      .then(({ data }) => {
        if (data) setHit({ service: data.service as string, code: data.error_code as string });
      });
  }, [isAdmin]);

  if (!isAdmin || !hit) return null;
  const label = hit.service === 'gemini' ? 'Gemini'
    : hit.service === 'tavily' ? 'Tavily'
    : 'Lovable AI Gateway';

  return (
    <div style={{
      background: '#FEF3C7', border: '1px solid #FCD34D', color: '#78350F',
      borderRadius: 8, padding: '10px 14px', margin: '0 auto 16px', maxWidth: 1400,
      display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontFamily: 'Inter, system-ui, sans-serif',
    }}>
      <AlertTriangle size={16} />
      <span>
        <strong>{label}</strong> hit a quota limit recently (HTTP {hit.code}) — check{' '}
        <strong>Settings → System Health</strong>.
      </span>
    </div>
  );
}
