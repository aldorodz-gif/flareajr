import { useState, useEffect, useMemo } from 'react';
import {
  Target, Send, BarChart2, Users, Map, Calendar, User, X, Plus, Trash2,
} from 'lucide-react';

interface SettingsPageProps {
  onClose: () => void;
}

const SECTIONS = [
  { id: 'lead-criteria',    label: 'Lead Criteria',         icon: Target },
  { id: 'outreach',         label: 'Outreach Defaults',     icon: Send },
  { id: 'scoring',          label: 'Scoring Preferences',   icon: BarChart2 },
  { id: 'pipeline',         label: 'Prospects Pipeline',    icon: Users },
  { id: 'market',           label: 'Market Scan Defaults',  icon: Map },
  { id: 'events',           label: 'Event Preferences',     icon: Calendar },
  { id: 'account',          label: 'Account',               icon: User },
];

const ACCENT = '#0EA5E9';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const BORDER = '#E2E8F0';

const MARKETS = ['Georgia', 'New York City', 'Nashville', 'Huntsville', 'Other'];
const INDUSTRIES = ['Construction', 'Consulting', 'Healthcare', 'Energy', 'Legal', 'Financial Services', 'Technology', 'Government'];
const SIGNAL_TYPES = ['Hiring Surge', 'New Office Lease', 'Executive Hire', 'Funding Round', 'Corporate Relocation'];
const PROPERTY_TYPES = ['High-Rise Residential', 'Mixed Use', 'Extended Stay', 'Hotel Conversion'];
const EVENT_TYPES = ['Trade Show', 'Networking Event', 'Conference', 'Chamber of Commerce', 'Industry Association'];
const TONES = ['Direct', 'Consultative', 'Urgent'];
const FREQUENCIES = ['Daily', 'Every 12 Hours', 'Manual Only'];
const SORT_ORDERS = ['Score High to Low', 'Date Added', 'Last Touched'];
const RADII = ['25 miles', '50 miles', '100 miles', 'Any'];
const MIN_SCORES = ['Any', '60+', '70+', '80+', '90+'];

const STORAGE_KEY = 'flare:settings:v1';

interface SettingsState {
  leadCriteria: {
    markets: string[];
    industries: string[];
    sizeMin: number;
    sizeMax: number;
    signals: Record<string, boolean>;
    minScore: string;
    keywords: string[];
    frequency: string;
  };
  outreach: {
    tone: string;
    signature: string;
    templates: { id: string; name: string; body: string }[];
  };
  scoring: {
    weights: Record<string, number>;
    minScore: number;
    decayEnabled: boolean;
    decayDays: number;
  };
  pipeline: {
    stages: string[];
    sortOrder: string;
    autoArchive: boolean;
    archiveDays: number;
  };
  market: {
    markets: string[];
    propertyTypes: string[];
    minBuildingSize: number;
  };
  events: {
    region: string;
    types: string[];
    radius: string;
  };
  account: {
    name: string;
    email: string;
    region: string;
  };
}

const DEFAULTS: SettingsState = {
  leadCriteria: {
    markets: ['Georgia'],
    industries: [],
    sizeMin: 50,
    sizeMax: 5000,
    signals: Object.fromEntries(SIGNAL_TYPES.map(s => [s, true])),
    minScore: '70+',
    keywords: [],
    frequency: 'Daily',
  },
  outreach: {
    tone: 'Consultative',
    signature: '',
    templates: [],
  },
  scoring: {
    weights: Object.fromEntries(SIGNAL_TYPES.map(s => [s, 50])),
    minScore: 70,
    decayEnabled: false,
    decayDays: 30,
  },
  pipeline: {
    stages: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'],
    sortOrder: 'Score High to Low',
    autoArchive: false,
    archiveDays: 90,
  },
  market: {
    markets: [],
    propertyTypes: [],
    minBuildingSize: 100,
  },
  events: {
    region: '',
    types: [],
    radius: '50 miles',
  },
  account: {
    name: '',
    email: '',
    region: 'Georgia',
  },
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    return { ...DEFAULTS, ...JSON.parse(raw) };
  } catch {
    return DEFAULTS;
  }
}

// ===== Shared UI atoms =====

const sectionHeaderStyle: React.CSSProperties = {
  color: TEXT,
  fontSize: 14,
  fontWeight: 600,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  marginBottom: 16,
};

const cardStyle: React.CSSProperties = {
  background: '#FFFFFF',
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 24,
  marginBottom: 20,
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 500,
  color: TEXT,
  marginBottom: 8,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  height: 38,
  padding: '0 12px',
  border: `1px solid ${BORDER}`,
  borderRadius: 6,
  fontSize: 13,
  color: TEXT,
  background: '#FFFFFF',
  outline: 'none',
};

function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: TEXT, padding: '6px 0' }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        style={{ width: 16, height: 16, accentColor: ACCENT, cursor: 'pointer' }}
      />
      {label}
    </label>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      style={{
        width: 38,
        height: 22,
        borderRadius: 999,
        background: on ? ACCENT : '#CBD5E1',
        border: 'none',
        position: 'relative',
        cursor: 'pointer',
        transition: 'background 0.15s',
        padding: 0,
      }}
      aria-pressed={on}
    >
      <span
        style={{
          position: 'absolute',
          top: 2,
          left: on ? 18 : 2,
          width: 18,
          height: 18,
          borderRadius: '50%',
          background: '#FFFFFF',
          transition: 'left 0.15s',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
        }}
      />
    </button>
  );
}

function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: TEXT, padding: '6px 0' }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ accentColor: ACCENT, cursor: 'pointer' }} />
      {label}
    </label>
  );
}

function Slider({ value, onChange, min = 0, max = 100, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return (
    <input
      type="range"
      min={min}
      max={max}
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      style={{ width: '100%', accentColor: ACCENT, cursor: 'pointer' }}
    />
  );
}

function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
      <button
        onClick={onClick}
        style={{
          background: ACCENT,
          color: '#FFFFFF',
          border: 'none',
          borderRadius: 6,
          padding: '10px 20px',
          fontSize: 13,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        {saved ? 'Saved ✓' : 'Save Changes'}
      </button>
    </div>
  );
}

// ===== Main =====

export default function SettingsPage({ onClose }: SettingsPageProps) {
  const [activeSection, setActiveSection] = useState('lead-criteria');
  const [state, setState] = useState<SettingsState>(() => loadSettings());
  const [savedSection, setSavedSection] = useState<string | null>(null);

  const save = (section: string) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    setSavedSection(section);
    setTimeout(() => setSavedSection(null), 1500);
  };

  const update = <K extends keyof SettingsState>(key: K, patch: Partial<SettingsState[K]>) => {
    setState(s => ({ ...s, [key]: { ...s[key], ...patch } }));
  };

  const initials = useMemo(() => {
    const name = state.account.name.trim();
    if (!name) return '?';
    return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  }, [state.account.name]);

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Page header */}
      <div style={{ background: '#FFFFFF', borderBottom: `1px solid ${BORDER}`, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 13, color: MUTED, margin: '4px 0 0 0' }}>Configure how Flare works for you.</p>
        </div>
        <button
          onClick={onClose}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px', fontSize: 13, color: TEXT, cursor: 'pointer' }}
        >
          <X size={14} /> Close
        </button>
      </div>

      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
        {/* Left rail */}
        <aside style={{ width: 240, padding: '24px 0', borderRight: `1px solid ${BORDER}`, background: '#FFFFFF', minHeight: 'calc(100vh - 56px - 81px)' }}>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = s.id === activeSection;
            return (
              <button
                key={s.id}
                onClick={() => setActiveSection(s.id)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '10px 20px',
                  background: active ? '#F0F9FF' : 'transparent',
                  borderLeft: `3px solid ${active ? ACCENT : 'transparent'}`,
                  border: 'none',
                  borderLeftWidth: 3,
                  borderLeftStyle: 'solid',
                  borderLeftColor: active ? ACCENT : 'transparent',
                  color: active ? ACCENT : TEXT,
                  fontSize: 13,
                  fontWeight: active ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <Icon size={15} />
                {s.label}
              </button>
            );
          })}
        </aside>

        {/* Content */}
        <main style={{ flex: 1, padding: '32px 40px', maxWidth: 880 }}>
          {activeSection === 'lead-criteria' && (
            <LeadCriteriaSection state={state.leadCriteria} update={(p) => update('leadCriteria', p)} save={() => save('lead-criteria')} saved={savedSection === 'lead-criteria'} />
          )}
          {activeSection === 'outreach' && (
            <OutreachSection state={state.outreach} update={(p) => update('outreach', p)} save={() => save('outreach')} saved={savedSection === 'outreach'} />
          )}
          {activeSection === 'scoring' && (
            <ScoringSection state={state.scoring} update={(p) => update('scoring', p)} save={() => save('scoring')} saved={savedSection === 'scoring'} />
          )}
          {activeSection === 'pipeline' && (
            <PipelineSection state={state.pipeline} update={(p) => update('pipeline', p)} save={() => save('pipeline')} saved={savedSection === 'pipeline'} />
          )}
          {activeSection === 'market' && (
            <MarketSection state={state.market} update={(p) => update('market', p)} save={() => save('market')} saved={savedSection === 'market'} />
          )}
          {activeSection === 'events' && (
            <EventsSection state={state.events} update={(p) => update('events', p)} save={() => save('events')} saved={savedSection === 'events'} />
          )}
          {activeSection === 'account' && (
            <AccountSection state={state.account} update={(p) => update('account', p)} save={() => save('account')} saved={savedSection === 'account'} initials={initials} />
          )}
        </main>
      </div>
    </div>
  );
}

// ===== Sections =====

function LeadCriteriaSection({ state, update, save, saved }: any) {
  const [kwInput, setKwInput] = useState('');
  const toggleArr = (key: string, item: string) => {
    const arr = state[key] as string[];
    update({ [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] });
  };
  const addKw = () => {
    const v = kwInput.trim();
    if (v && !state.keywords.includes(v)) update({ keywords: [...state.keywords, v] });
    setKwInput('');
  };
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Lead Criteria</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Target Markets</label>
        <div>{MARKETS.map(m => <Checkbox key={m} label={m} checked={state.markets.includes(m)} onChange={() => toggleArr('markets', m)} />)}</div>
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Target Industries</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>
          {INDUSTRIES.map(i => <Checkbox key={i} label={i} checked={state.industries.includes(i)} onChange={() => toggleArr('industries', i)} />)}
        </div>
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Company Size: {state.sizeMin.toLocaleString()} – {state.sizeMax >= 10000 ? '10,000+' : state.sizeMax.toLocaleString()} employees</label>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Min</div>
            <Slider value={state.sizeMin} onChange={(v) => update({ sizeMin: Math.min(v, state.sizeMax) })} min={10} max={10000} step={10} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 11, color: MUTED, marginBottom: 4 }}>Max</div>
            <Slider value={state.sizeMax} onChange={(v) => update({ sizeMax: Math.max(v, state.sizeMin) })} min={10} max={10000} step={10} />
          </div>
        </div>
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Signal Types</label>
        {SIGNAL_TYPES.map(s => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: TEXT }}>{s}</span>
            <Toggle on={!!state.signals[s]} onChange={() => update({ signals: { ...state.signals, [s]: !state.signals[s] } })} />
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Minimum Signal Score</label>
        <select style={inputStyle} value={state.minScore} onChange={(e) => update({ minScore: e.target.value })}>
          {MIN_SCORES.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Keywords</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input
            style={{ ...inputStyle, flex: 1 }}
            value={kwInput}
            onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKw(); } }}
            placeholder="Type a keyword and press Enter"
          />
          <button onClick={addKw} style={{ background: ACCENT, color: '#FFF', border: 'none', borderRadius: 6, padding: '0 14px', fontSize: 13, cursor: 'pointer' }}>Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {state.keywords.map((k: string) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#F0F9FF', color: ACCENT, fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 999 }}>
              {k}
              <button onClick={() => update({ keywords: state.keywords.filter((x: string) => x !== k) })} style={{ background: 'transparent', border: 'none', color: ACCENT, cursor: 'pointer', padding: 0, display: 'flex' }}><X size={12} /></button>
            </span>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Refresh Frequency</label>
        {FREQUENCIES.map(f => <Radio key={f} label={f} checked={state.frequency === f} onChange={() => update({ frequency: f })} />)}
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function OutreachSection({ state, update, save, saved }: any) {
  const addTemplate = () => update({ templates: [...state.templates, { id: crypto.randomUUID(), name: 'New Template', body: '' }] });
  const updateTemplate = (id: string, patch: any) => update({ templates: state.templates.map((t: any) => t.id === id ? { ...t, ...patch } : t) });
  const removeTemplate = (id: string) => update({ templates: state.templates.filter((t: any) => t.id !== id) });

  return (
    <div>
      <h2 style={sectionHeaderStyle}>Outreach Defaults</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Default Tone</label>
        {TONES.map(t => <Radio key={t} label={t} checked={state.tone === t} onChange={() => update({ tone: t })} />)}
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>BDR Signature Block</label>
        <textarea
          value={state.signature}
          onChange={(e) => update({ signature: e.target.value })}
          placeholder={'Name\nTitle\nPhone\nEmail'}
          style={{ ...inputStyle, height: 120, padding: 12, resize: 'vertical', fontFamily: 'inherit' }}
        />
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Saved Templates</label>
          <button onClick={addTemplate} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: ACCENT, color: '#FFF', border: 'none', borderRadius: 6, padding: '6px 12px', fontSize: 12, cursor: 'pointer' }}>
            <Plus size={12} /> Add New
          </button>
        </div>
        {state.templates.length === 0 && <div style={{ fontSize: 13, color: MUTED, padding: '12px 0' }}>No templates yet.</div>}
        {state.templates.map((t: any) => (
          <div key={t.id} style={{ border: `1px solid ${BORDER}`, borderRadius: 8, padding: 12, marginBottom: 10 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input style={{ ...inputStyle, flex: 1 }} value={t.name} onChange={(e) => updateTemplate(t.id, { name: e.target.value })} placeholder="Template name" />
              <button onClick={() => removeTemplate(t.id)} style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '0 10px', cursor: 'pointer', color: '#DC2626' }}>
                <Trash2 size={14} />
              </button>
            </div>
            <textarea
              value={t.body}
              onChange={(e) => updateTemplate(t.id, { body: e.target.value })}
              placeholder="Email body…"
              style={{ ...inputStyle, height: 100, padding: 10, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>
        ))}
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function ScoringSection({ state, update, save, saved }: any) {
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Scoring Preferences</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Signal Weights</label>
        {SIGNAL_TYPES.map(s => (
          <div key={s} style={{ padding: '10px 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: TEXT, marginBottom: 6 }}>
              <span>{s}</span>
              <span style={{ color: MUTED }}>{state.weights[s] ?? 50}</span>
            </div>
            <Slider value={state.weights[s] ?? 50} onChange={(v) => update({ weights: { ...state.weights, [s]: v } })} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: MUTED, marginTop: 2 }}>
              <span>Low</span><span>High</span>
            </div>
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Minimum Score to Surface as Lead</label>
        <input type="number" min={0} max={100} value={state.minScore} onChange={(e) => update({ minScore: Number(e.target.value) })} style={{ ...inputStyle, width: 120 }} />
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>Score Decay</div>
            <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>Reduce score if no activity after X days</div>
          </div>
          <Toggle on={state.decayEnabled} onChange={() => update({ decayEnabled: !state.decayEnabled })} />
        </div>
        {state.decayEnabled && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <input type="number" min={1} value={state.decayDays} onChange={(e) => update({ decayDays: Number(e.target.value) })} style={{ ...inputStyle, width: 100 }} />
            <span style={{ fontSize: 13, color: MUTED }}>days</span>
          </div>
        )}
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function PipelineSection({ state, update, save, saved }: any) {
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Prospects Pipeline</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Stage Names</label>
        {state.stages.map((s: string, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <span style={{ fontSize: 12, color: MUTED, width: 60 }}>Stage {i + 1}</span>
            <input style={{ ...inputStyle, flex: 1 }} value={s} onChange={(e) => {
              const next = [...state.stages]; next[i] = e.target.value; update({ stages: next });
            }} />
          </div>
        ))}
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Default Sort Order</label>
        <select style={inputStyle} value={state.sortOrder} onChange={(e) => update({ sortOrder: e.target.value })}>
          {SORT_ORDERS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: TEXT, fontWeight: 500 }}>Auto-Archive Stale Prospects</div>
          <Toggle on={state.autoArchive} onChange={() => update({ autoArchive: !state.autoArchive })} />
        </div>
        {state.autoArchive && (
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: MUTED }}>After</span>
            <input type="number" min={1} value={state.archiveDays} onChange={(e) => update({ archiveDays: Number(e.target.value) })} style={{ ...inputStyle, width: 100 }} />
            <span style={{ fontSize: 13, color: MUTED }}>days of inactivity</span>
          </div>
        )}
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function MarketSection({ state, update, save, saved }: any) {
  const toggleArr = (key: string, item: string) => {
    const arr = state[key] as string[];
    update({ [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] });
  };
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Market Scan Defaults</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Default Markets</label>
        {MARKETS.map(m => <Checkbox key={m} label={m} checked={state.markets.includes(m)} onChange={() => toggleArr('markets', m)} />)}
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Property Type</label>
        {PROPERTY_TYPES.map(p => <Checkbox key={p} label={p} checked={state.propertyTypes.includes(p)} onChange={() => toggleArr('propertyTypes', p)} />)}
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Minimum Building Size (units / rooms)</label>
        <input type="number" min={0} value={state.minBuildingSize} onChange={(e) => update({ minBuildingSize: Number(e.target.value) })} style={{ ...inputStyle, width: 160 }} />
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function EventsSection({ state, update, save, saved }: any) {
  const toggle = (item: string) => {
    update({ types: state.types.includes(item) ? state.types.filter((x: string) => x !== item) : [...state.types, item] });
  };
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Event Preferences</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Default City / Region</label>
        <input style={inputStyle} value={state.region} onChange={(e) => update({ region: e.target.value })} placeholder="e.g. Atlanta, GA" />
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Event Types</label>
        {EVENT_TYPES.map(t => <Checkbox key={t} label={t} checked={state.types.includes(t)} onChange={() => toggle(t)} />)}
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Radius</label>
        <select style={inputStyle} value={state.radius} onChange={(e) => update({ radius: e.target.value })}>
          {RADII.map(r => <option key={r}>{r}</option>)}
        </select>
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function AccountSection({ state, update, save, saved, initials }: any) {
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Account</h2>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{
            width: 56, height: 56, borderRadius: '50%', background: ACCENT, color: '#FFF',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600,
          }}>{initials}</div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: TEXT }}>{state.name || 'Your name'}</div>
            <div style={{ fontSize: 12, color: MUTED }}>{state.email || 'email@company.com'}</div>
          </div>
        </div>

        <label style={labelStyle}>BDR Name</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} value={state.name} onChange={(e) => update({ name: e.target.value })} />

        <label style={labelStyle}>Email</label>
        <input style={{ ...inputStyle, marginBottom: 14 }} type="email" value={state.email} onChange={(e) => update({ email: e.target.value })} />

        <label style={labelStyle}>Region</label>
        <select style={inputStyle} value={state.region} onChange={(e) => update({ region: e.target.value })}>
          {MARKETS.map(m => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Password</label>
        <button
          disabled
          style={{
            background: '#F1F5F9', color: MUTED, border: `1px solid ${BORDER}`,
            borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'not-allowed',
          }}
          title="Available once auth is wired"
        >Reset Password</button>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Available once authentication is connected.</div>
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}
