import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Activity, CheckCircle2, XCircle, ExternalLink, RefreshCw, Bell, Send } from 'lucide-react';

const ACCENT = '#0EA5E9';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const OK = '#16A34A';
const BAD = '#DC2626';

type Row = {
  service: 'gemini' | 'tavily' | 'lovable_gateway';
  function_name: string | null;
  success: boolean;
  error_code: string | null;
  created_at: string;
};

const SERVICES: { id: Row['service']; label: string }[] = [
  { id: 'gemini', label: 'Gemini' },
  { id: 'tavily', label: 'Tavily' },
  { id: 'lovable_gateway', label: 'Lovable AI Gateway' },
];

const card: React.CSSProperties = {
  background: '#FFF', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 20, marginBottom: 16,
};
const h2: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: TEXT, margin: '0 0 6px' };
const sub: React.CSSProperties = { fontSize: 12, color: MUTED, margin: '0 0 16px' };

export default function SystemHealth() {
  const [rows, setRows] = useState<Row[]>([]);
  const [runs, setRuns] = useState<Array<{ id: string; ran_at: string; bdrs_scanned: number; leads_inserted: number; errors: number }>>([]);
  const [tavilyLimit, setTavilyLimit] = useState<number>(1000);
  const [editingLimit, setEditingLimit] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [savingLimit, setSavingLimit] = useState(false);
  const [alertRecipient, setAlertRecipient] = useState<string>('aldorodz@gmail.com');
  const [editingRecipient, setEditingRecipient] = useState<string>('aldorodz@gmail.com');
  const [alertsEnabled, setAlertsEnabled] = useState<boolean>(true);
  const [savingAlerts, setSavingAlerts] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<string>('');
  const [alerts, setAlerts] = useState<Array<{ id: string; alert_key: string; subject: string | null; recipient: string | null; sent_at: string }>>([]);

  const load = async () => {
    setLoading(true);
    const since = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString();
    const [u, r, s, ar, ae, al] = await Promise.all([
      supabase.from('api_usage').select('service,function_name,success,error_code,created_at').gte('created_at', since).order('created_at', { ascending: false }).limit(5000),
      supabase.from('scan_runs').select('id,ran_at,bdrs_scanned,leads_inserted,errors').order('ran_at', { ascending: false }).limit(7),
      supabase.from('system_settings').select('value').eq('key', 'tavily_monthly_limit').maybeSingle(),
      supabase.from('system_settings').select('value').eq('key', 'alerts_recipient').maybeSingle(),
      supabase.from('system_settings').select('value').eq('key', 'alerts_enabled').maybeSingle(),
      supabase.from('alert_log').select('id,alert_key,subject,recipient,sent_at').order('sent_at', { ascending: false }).limit(10),
    ]);
    setRows((u.data as Row[]) || []);
    setRuns((r.data as any[]) || []);
    const v = (s.data as any)?.value;
    const n = typeof v === 'number' ? v : Number(v);
    if (Number.isFinite(n)) { setTavilyLimit(n); setEditingLimit(String(n)); }
    const rv = (ar.data as any)?.value;
    if (typeof rv === 'string' && rv) { setAlertRecipient(rv); setEditingRecipient(rv); }
    const ev = (ae.data as any)?.value;
    if (typeof ev === 'boolean') setAlertsEnabled(ev);
    setAlerts((al.data as any[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const now = Date.now();
  const monthStart = useMemo(() => {
    const d = new Date(); d.setDate(1); d.setHours(0, 0, 0, 0); return d.getTime();
  }, []);

  const stats = useMemo(() => {
    const out: Record<string, { total: number; success: number; lastError?: Row }> = {};
    for (const svc of SERVICES) out[svc.id] = { total: 0, success: 0 };
    for (const r of rows) {
      const t = new Date(r.created_at).getTime();
      if (t < monthStart) continue;
      const s = out[r.service]; if (!s) continue;
      s.total++; if (r.success) s.success++;
      else if (!s.lastError) s.lastError = r;
    }
    return out;
  }, [rows, monthStart]);

  const lastBySvc = useMemo(() => {
    const out: Record<string, Row | undefined> = {};
    for (const r of rows) { if (!out[r.service]) out[r.service] = r; }
    return out;
  }, [rows]);

  const chartData = useMemo(() => {
    // 30 days, per-service counts
    const days: { date: string; gemini: number; tavily: number; lovable_gateway: number }[] = [];
    const dayKey = (d: Date) => d.toISOString().slice(0, 10);
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now - i * 24 * 3600 * 1000);
      days.push({ date: dayKey(d), gemini: 0, tavily: 0, lovable_gateway: 0 });
    }
    const map = new Map(days.map((d) => [d.date, d]));
    for (const r of rows) {
      const k = r.created_at.slice(0, 10);
      const d = map.get(k); if (!d) continue;
      (d as any)[r.service] = ((d as any)[r.service] || 0) + 1;
    }
    return days;
  }, [rows, now]);

  const tavilyMonthUsed = stats.tavily?.total || 0;
  const tavilyPct = tavilyLimit > 0 ? Math.min(100, (tavilyMonthUsed / tavilyLimit) * 100) : 0;

  const saveLimit = async () => {
    const n = Number(editingLimit);
    if (!Number.isFinite(n) || n < 0) return;
    setSavingLimit(true);
    const { error } = await supabase.from('system_settings').upsert({ key: 'tavily_monthly_limit', value: n as any, updated_at: new Date().toISOString() });
    if (!error) setTavilyLimit(n);
    setSavingLimit(false);
  };

  const maxBar = Math.max(1, ...chartData.flatMap((d) => [d.gemini, d.tavily, d.lovable_gateway]));

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <h2 style={h2}><Activity size={18} style={{ verticalAlign: -3, marginRight: 6 }} />System Health</h2>
          <p style={sub}>Usage, errors, quotas, and overnight scan results — admin only.</p>
        </div>
        <button onClick={load} disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#FFF', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '6px 12px', fontSize: 12, color: TEXT, cursor: 'pointer' }}>
          <RefreshCw size={12} /> {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      {/* Service status cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        {SERVICES.map((svc) => {
          const s = stats[svc.id];
          const last = lastBySvc[svc.id];
          const healthy = !last || last.success;
          const rate = s.total ? Math.round((s.success / s.total) * 100) : null;
          return (
            <div key={svc.id} style={{ ...card, marginBottom: 0, borderTop: `3px solid ${healthy ? OK : BAD}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: TEXT }}>{svc.label}</div>
                {healthy
                  ? <CheckCircle2 size={16} color={OK} />
                  : <XCircle size={16} color={BAD} />}
              </div>
              <div style={{ fontSize: 24, fontWeight: 700, color: TEXT, marginTop: 6 }}>{s.total.toLocaleString()}</div>
              <div style={{ fontSize: 11, color: MUTED }}>calls this month{rate !== null ? ` · ${rate}% success` : ''}</div>
              {s.lastError ? (
                <div style={{ marginTop: 8, fontSize: 11, color: BAD }}>
                  Last error {s.lastError.error_code || '?'} · {timeAgo(s.lastError.created_at)}
                </div>
              ) : (
                <div style={{ marginTop: 8, fontSize: 11, color: MUTED }}>No errors this month</div>
              )}
            </div>
          );
        })}
      </div>

      {/* Tavily budget */}
      <div style={card}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>Tavily monthly budget</div>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: MUTED }}>Limit:</span>
            <input value={editingLimit} onChange={(e) => setEditingLimit(e.target.value.replace(/[^0-9]/g, ''))}
              style={{ width: 80, padding: '4px 8px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 12 }} />
            <button onClick={saveLimit} disabled={savingLimit || Number(editingLimit) === tavilyLimit}
              style={{ background: ACCENT, color: '#FFF', border: 'none', borderRadius: 4, padding: '4px 10px', fontSize: 12, cursor: 'pointer', opacity: Number(editingLimit) === tavilyLimit ? 0.5 : 1 }}>
              Save
            </button>
          </div>
        </div>
        <div style={{ fontSize: 12, color: MUTED, marginBottom: 8 }}>
          {tavilyMonthUsed.toLocaleString()} of {tavilyLimit.toLocaleString()} monthly searches used
        </div>
        <div style={{ height: 10, background: '#F1F5F9', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${tavilyPct}%`, height: '100%', background: tavilyPct > 90 ? BAD : tavilyPct > 75 ? '#F59E0B' : ACCENT, transition: 'width 200ms' }} />
        </div>
      </div>

      {/* 30-day chart */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Calls per day (last 30 days)</div>
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 4, height: 140 }}>
          {chartData.map((d) => {
            const tot = d.gemini + d.tavily + d.lovable_gateway;
            const h = (tot / maxBar) * 130;
            const seg = (n: number) => (tot ? (n / tot) * h : 0);
            return (
              <div key={d.date} title={`${d.date} — gemini ${d.gemini}, tavily ${d.tavily}, gateway ${d.lovable_gateway}`}
                style={{ flex: 1, display: 'flex', flexDirection: 'column-reverse', alignItems: 'center', gap: 0 }}>
                <div style={{ width: '100%', height: seg(d.gemini), background: ACCENT }} />
                <div style={{ width: '100%', height: seg(d.tavily), background: '#8B5CF6' }} />
                <div style={{ width: '100%', height: seg(d.lovable_gateway), background: '#F59E0B' }} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'flex', gap: 16, marginTop: 10, fontSize: 11, color: MUTED }}>
          <Legend color={ACCENT} label="Gemini" />
          <Legend color="#8B5CF6" label="Tavily" />
          <Legend color="#F59E0B" label="Lovable Gateway" />
        </div>
      </div>

      {/* Overnight scan runs */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 12 }}>Recent overnight scans</div>
        {runs.length === 0 ? (
          <div style={{ fontSize: 12, color: MUTED }}>No scan runs recorded yet.</div>
        ) : (
          <table style={{ width: '100%', fontSize: 12, borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ color: MUTED, textAlign: 'left' }}>
                <th style={th}>Ran at</th>
                <th style={th}>BDRs</th>
                <th style={th}>Leads inserted</th>
                <th style={th}>Errors</th>
              </tr>
            </thead>
            <tbody>
              {runs.map((r) => (
                <tr key={r.id} style={{ borderTop: `1px solid ${BORDER}` }}>
                  <td style={td}>{new Date(r.ran_at).toLocaleString()}</td>
                  <td style={td}>{r.bdrs_scanned}</td>
                  <td style={td}>{r.leads_inserted}</td>
                  <td style={{ ...td, color: r.errors > 0 ? BAD : TEXT }}>{r.errors}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Quick links */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Quick links</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <LinkRow href="https://console.cloud.google.com/billing" label="Gemini billing" />
          <LinkRow href="https://app.tavily.com" label="Tavily dashboard" />
          <LinkRow href="https://lovable.dev/settings/plans" label="Lovable credits" />
        </div>
      </div>
    </div>
  );
}

const th: React.CSSProperties = { padding: '6px 8px', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: 0.5 };
const td: React.CSSProperties = { padding: '8px', color: TEXT };

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <span style={{ width: 10, height: 10, background: color, borderRadius: 2, display: 'inline-block' }} />
      {label}
    </span>
  );
}

function LinkRow({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer"
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: ACCENT, fontSize: 13, textDecoration: 'none' }}>
      <ExternalLink size={13} /> {label}
    </a>
  );
}

function timeAgo(iso: string): string {
  const d = (Date.now() - new Date(iso).getTime()) / 1000;
  if (d < 60) return `${Math.floor(d)}s ago`;
  if (d < 3600) return `${Math.floor(d / 60)}m ago`;
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`;
  return `${Math.floor(d / 86400)}d ago`;
}
