import { useEffect, useState } from 'react';
import { Radio, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const ACCENT = '#0EA5E9';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';
const OK = '#16A34A';

type Source = {
  id: string;
  domain: string;
  label: string;
  category: 'news' | 'permits' | 'business_journal' | 'industry' | 'govt';
  active: boolean;
  created_at: string;
};

const CATEGORIES: Source['category'][] = ['news', 'permits', 'business_journal', 'industry', 'govt'];

const card: React.CSSProperties = {
  background: '#FFF', border: `1px solid ${BORDER}`, borderRadius: 8, padding: 20, marginBottom: 16,
};

export default function SignalSourcesPanel() {
  const [rows, setRows] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState('');
  const [label, setLabel] = useState('');
  const [category, setCategory] = useState<Source['category']>('industry');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string>('');

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('signal_sources')
      .select('id,domain,label,category,active,created_at')
      .order('domain', { ascending: true });
    if (error) setError(error.message);
    setRows((data as Source[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const toggleActive = async (s: Source) => {
    const next = !s.active;
    setRows(rs => rs.map(r => r.id === s.id ? { ...r, active: next } : r));
    const { error } = await supabase.from('signal_sources').update({ active: next }).eq('id', s.id);
    if (error) {
      setRows(rs => rs.map(r => r.id === s.id ? { ...r, active: s.active } : r));
      setError(error.message);
    }
  };

  const remove = async (s: Source) => {
    if (!confirm(`Remove ${s.domain}?`)) return;
    const { error } = await supabase.from('signal_sources').delete().eq('id', s.id);
    if (error) { setError(error.message); return; }
    setRows(rs => rs.filter(r => r.id !== s.id));
  };

  const cleanDomain = (raw: string) =>
    raw.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/.*$/, '');

  const addSource = async () => {
    setError('');
    const d = cleanDomain(domain);
    const l = label.trim();
    if (!d || !l) { setError('Domain and label are required.'); return; }
    if (!/^[a-z0-9.-]+\.[a-z]{2,}$/.test(d)) { setError('Enter a valid domain (e.g. bisnow.com).'); return; }
    setSaving(true);
    const { data, error } = await supabase
      .from('signal_sources')
      .insert({ domain: d, label: l, category, active: true })
      .select()
      .single();
    setSaving(false);
    if (error) { setError(error.message); return; }
    setRows(rs => [...rs, data as Source].sort((a, b) => a.domain.localeCompare(b.domain)));
    setDomain(''); setLabel(''); setCategory('industry');
  };

  const grouped = CATEGORIES.map(c => ({ category: c, items: rows.filter(r => r.category === c) }))
    .filter(g => g.items.length > 0);

  return (
    <div>
      <div style={{ marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT, margin: '0 0 6px' }}>
          <Radio size={18} style={{ verticalAlign: -3, marginRight: 6 }} />Signal Sources
        </h2>
        <p style={{ fontSize: 12, color: MUTED, margin: 0 }}>
          High-value publications scans should prioritize. Active domains are passed to Tavily as <code>include_domains</code> on ~40% of queries.
        </p>
      </div>

      {error && (
        <div style={{ ...card, borderColor: '#FCA5A5', background: '#FEF2F2', color: '#991B1B', fontSize: 12 }}>{error}</div>
      )}

      {/* Add new */}
      <div style={card}>
        <div style={{ fontSize: 14, fontWeight: 600, color: TEXT, marginBottom: 10 }}>Add source</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1.5fr 1fr auto', gap: 8 }}>
          <input value={domain} onChange={e => setDomain(e.target.value)} placeholder="domain (bisnow.com)"
            style={{ padding: '8px 10px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 12 }} />
          <input value={label} onChange={e => setLabel(e.target.value)} placeholder="Label (Bisnow)"
            style={{ padding: '8px 10px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 12 }} />
          <select value={category} onChange={e => setCategory(e.target.value as Source['category'])}
            style={{ padding: '8px 10px', border: `1px solid ${BORDER}`, borderRadius: 4, fontSize: 12, background: '#FFF' }}>
            {CATEGORIES.map(c => <option key={c} value={c}>{c.replace('_', ' ')}</option>)}
          </select>
          <button onClick={addSource} disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT, color: '#FFF', border: 'none', borderRadius: 4, padding: '0 14px', fontSize: 12, cursor: 'pointer' }}>
            <Plus size={12} /> {saving ? 'Adding…' : 'Add'}
          </button>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div style={{ ...card, fontSize: 12, color: MUTED }}>Loading…</div>
      ) : rows.length === 0 ? (
        <div style={{ ...card, fontSize: 12, color: MUTED }}>No sources yet — add one above.</div>
      ) : (
        grouped.map(g => (
          <div key={g.category} style={card}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: TEXT, textTransform: 'capitalize' }}>
                {g.category.replace('_', ' ')}
              </div>
              <div style={{ fontSize: 11, color: MUTED }}>{g.items.filter(i => i.active).length} active / {g.items.length}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {g.items.map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', border: `1px solid ${BORDER}`, borderRadius: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.active ? OK : '#CBD5E1', flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>{s.label}</div>
                      <div style={{ fontSize: 11, color: MUTED }}>{s.domain}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={() => toggleActive(s)} aria-pressed={s.active}
                      style={{ width: 38, height: 22, borderRadius: 999, background: s.active ? ACCENT : '#CBD5E1', border: 'none', position: 'relative', cursor: 'pointer', padding: 0 }}>
                      <span style={{ position: 'absolute', top: 2, left: s.active ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#FFF', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
                    </button>
                    <button onClick={() => remove(s)} aria-label={`Remove ${s.domain}`}
                      style={{ background: 'transparent', border: 'none', color: '#94A3B8', cursor: 'pointer', padding: 4, display: 'flex' }}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
