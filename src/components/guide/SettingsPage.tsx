import { useState, useMemo, useRef } from 'react';
import {
  Target, Send, BarChart2, Users, Map, Calendar, User, X, Plus, Trash2, Brain,
  ChevronDown, ChevronRight, GripVertical, ArrowUp, ArrowDown, RotateCcw,
} from 'lucide-react';

interface SettingsPageProps {
  onClose: () => void;
}

const SECTIONS = [
  { id: 'lead-criteria', label: 'Lead Criteria',        icon: Target },
  { id: 'outreach',      label: 'Outreach Defaults',    icon: Send },
  { id: 'scoring',       label: 'Scoring Preferences',  icon: BarChart2 },
  { id: 'pipeline',      label: 'Prospects Pipeline',   icon: Users },
  { id: 'market',        label: 'Market Scan Defaults', icon: Map },
  { id: 'events',        label: 'Event Preferences',    icon: Calendar },
  { id: 'account',       label: 'Account',              icon: User },
  { id: 'ai-behavior',   label: 'AI Behavior',          icon: Brain },
];

const ACCENT = '#0EA5E9';
const ACCENT_BG = '#F0F9FF';
const TEXT = '#0F172A';
const MUTED = '#64748B';
const SOFT_MUTED = '#94A3B8';
const BORDER = '#E2E8F0';

const PRESET_MARKETS = ['Georgia', 'New York City', 'Nashville', 'Huntsville', 'Other'];
const PRESET_INDUSTRIES = ['Construction', 'Consulting', 'Healthcare', 'Energy', 'Legal', 'Financial Services', 'Technology', 'Government'];
const PRESET_SIGNALS = ['Hiring Surge', 'New Office Lease', 'Executive Hire', 'Funding Round', 'Corporate Relocation'];
const PRESET_PROPERTY_TYPES = ['High-Rise Residential', 'Mixed Use', 'Extended Stay', 'Hotel Conversion'];
const PRESET_EVENT_TYPES = ['Trade Show', 'Networking Event', 'Conference', 'Chamber of Commerce', 'Industry Association'];
const PRESET_TONES = ['Direct', 'Consultative', 'Urgent'];
const FREQUENCIES = ['Daily', 'Every 12 Hours', 'Manual Only'];
const SORT_ORDERS = ['Score High to Low', 'Date Added', 'Last Touched'];
const RADII = ['25 miles', '50 miles', '100 miles', 'Any'];
const MIN_SCORES = ['Any', '60+', '70+', '80+', '90+'];

const STORAGE_KEY = 'flare:settings:v2';

interface AiPrompt { value: string; lastEdited: number | null }

interface SettingsState {
  customMarkets: string[];
  customIndustries: string[];
  customSignals: string[];
  customPropertyTypes: string[];
  customEventTypes: string[];
  customTones: string[];

  leadCriteria: {
    markets: string[]; industries: string[];
    sizeMin: number; sizeMax: number;
    signals: Record<string, boolean>;
    minScore: string; keywords: string[]; frequency: string;
  };
  outreach: { tone: string; signature: string; templates: { id: string; name: string; body: string }[] };
  scoring: { weights: Record<string, number>; minScore: number; decayEnabled: boolean; decayDays: number };
  pipeline: { stages: string[]; sortOrder: string; autoArchive: boolean; archiveDays: number };
  market: { markets: string[]; propertyTypes: string[]; minBuildingSize: number };
  events: { cities: string[]; types: string[]; radius: string };
  account: { name: string; email: string; region: string };
  ai: Record<string, AiPrompt>;
}

const AI_FUNCTIONS = [
  {
    id: 'lead-discovery', name: 'Lead Discovery',
    description: 'Controls how FLARE identifies and qualifies new companies as leads. Edit this to change what makes a good lead for your market.',
    default: "You are a corporate housing lead discovery engine for National Corporate Housing. Identify companies that are likely to need temporary furnished housing for employees. Look for signals like: hiring surges in target markets, new office openings, corporate relocations, construction projects, consulting engagements, government contracts, and executive moves. Prioritize companies with 50+ employees in Georgia, New York City, Nashville, and Huntsville. Weight signals higher when multiple triggers appear for the same company within a 30-day window.",
  },
  {
    id: 'signal-scoring', name: 'Signal Scoring',
    description: 'Controls how FLARE scores and ranks signals. Edit this to change how signals are weighted and what score threshold surfaces a lead.',
    default: "You are a signal scoring engine for a corporate housing sales team. Score each company signal on a scale of 0-100 based on likelihood to need furnished housing. Hiring surge above 10 open roles scores 80+. New office lease or permit scores 85+. Executive hire at VP level or above scores 70+. Funding round above $10M scores 75+. Corporate relocation announcement scores 90+. Combine multiple signals additively up to a maximum of 100. Decay scores by 10 points for every 30 days without new activity.",
  },
  {
    id: 'outreach-writing', name: 'Outreach Writing',
    description: 'Controls how FLARE writes prospecting emails and messages. Edit this to match your voice, style, and approach.',
    default: "You are a B2B outreach writer for National Corporate Housing, a corporate furnished housing company. Write short, direct prospecting emails under 80 words. Never use filler phrases like 'I hope this finds you well' or 'reaching out to connect.' Lead with the specific signal that triggered the outreach. Make one clear value statement tied to furnished housing. End with a single low-friction question. Write for a senior decision maker — HR leader, VP of Real Estate, or CFO. Sound like a human, not a SaaS tool.",
  },
  {
    id: 'market-scanning', name: 'Market Scanning',
    description: 'Controls how FLARE scans and evaluates new markets for corporate housing opportunity. Edit this to change what makes a market worth pursuing.',
    default: "You are a market intelligence engine for a corporate housing company. Evaluate markets for short-term furnished housing demand. Look for: large employer concentration, active construction projects, government or military presence, major hospital or healthcare systems, consulting firm offices, energy or utility company headquarters. Flag markets where multiple demand drivers overlap. Prioritize markets within the Southeast US, New York City metro, and Tennessee. Note any new developments, permits, or announcements that suggest incoming workforce.",
  },
  {
    id: 'event-finding', name: 'Event Finding',
    description: 'Controls how FLARE identifies relevant industry events. Edit this to match the types of events worth attending or tracking.',
    default: "You are an event research engine for a corporate housing sales team. Find trade shows, conferences, networking events, and industry association meetings where corporate housing buyers are likely to attend. Target events for: HR professionals, real estate and facilities managers, construction project managers, energy sector executives, consulting firm partners, and government contractors. Prioritize events in Georgia, New York City, Nashville, and Huntsville. Flag events with more than 300 attendees. Return event name, date, location, estimated attendance, and relevance reason.",
  },
  {
    id: 'prospect-qualification', name: 'Prospect Qualification',
    description: 'Controls how FLARE evaluates and qualifies prospects already in the pipeline. Edit this to change how prospects are prioritized and advanced.',
    default: "You are a prospect qualification engine for a corporate housing sales team. Evaluate pipeline prospects and recommend next actions. Score each prospect on: signal strength, company size, market fit, engagement level, and days since last touch. Flag prospects that are going cold (no activity in 14+ days). Recommend move to next stage when: company has confirmed a hiring event or relocation, contact has responded to outreach, or a meeting has been booked. Recommend archive when: no response after 5 touches, company downsizing signals detected, or prospect has been in same stage for 60+ days.",
  },
];

const DEFAULTS: SettingsState = {
  customMarkets: [], customIndustries: [], customSignals: [],
  customPropertyTypes: [], customEventTypes: [], customTones: [],
  leadCriteria: {
    markets: ['Georgia'], industries: [], sizeMin: 50, sizeMax: 5000,
    signals: Object.fromEntries(PRESET_SIGNALS.map(s => [s, true])),
    minScore: '70+', keywords: [], frequency: 'Daily',
  },
  outreach: { tone: 'Consultative', signature: '', templates: [] },
  scoring: { weights: Object.fromEntries(PRESET_SIGNALS.map(s => [s, 50])), minScore: 70, decayEnabled: false, decayDays: 30 },
  pipeline: { stages: ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Closed'], sortOrder: 'Score High to Low', autoArchive: false, archiveDays: 90 },
  market: { markets: [], propertyTypes: [], minBuildingSize: 100 },
  events: { cities: [], types: [], radius: '50 miles' },
  account: { name: '', email: '', region: 'Georgia' },
  ai: Object.fromEntries(AI_FUNCTIONS.map(f => [f.id, { value: f.default, lastEdited: null } as AiPrompt])),
};

function loadSettings(): SettingsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULTS;
    const parsed = JSON.parse(raw);
    return { ...DEFAULTS, ...parsed, ai: { ...DEFAULTS.ai, ...(parsed.ai || {}) } };
  } catch { return DEFAULTS; }
}

// ===== Shared atoms =====
const sectionHeaderStyle: React.CSSProperties = { color: TEXT, fontSize: 14, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 16 };
const cardStyle: React.CSSProperties = { background: '#FFFFFF', border: `1px solid ${BORDER}`, borderRadius: 10, padding: 24, marginBottom: 20 };
const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 500, color: TEXT, marginBottom: 8 };
const inputStyle: React.CSSProperties = { width: '100%', height: 38, padding: '0 12px', border: `1px solid ${BORDER}`, borderRadius: 6, fontSize: 13, color: TEXT, background: '#FFFFFF', outline: 'none' };

function Toggle({ on, onChange }: { on: boolean; onChange: () => void }) {
  return (
    <button type="button" onClick={onChange} aria-pressed={on}
      style={{ width: 38, height: 22, borderRadius: 999, background: on ? ACCENT : '#CBD5E1', border: 'none', position: 'relative', cursor: 'pointer', transition: 'background .15s', padding: 0 }}>
      <span style={{ position: 'absolute', top: 2, left: on ? 18 : 2, width: 18, height: 18, borderRadius: '50%', background: '#FFF', transition: 'left .15s', boxShadow: '0 1px 2px rgba(0,0,0,0.2)' }} />
    </button>
  );
}
function Radio({ checked, onChange, label }: { checked: boolean; onChange: () => void; label: string }) {
  return (
    <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: TEXT, padding: '6px 0' }}>
      <input type="radio" checked={checked} onChange={onChange} style={{ accentColor: ACCENT, cursor: 'pointer' }} />{label}
    </label>
  );
}
function Slider({ value, onChange, min = 0, max = 100, step = 1 }: { value: number; onChange: (v: number) => void; min?: number; max?: number; step?: number }) {
  return <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} style={{ width: '100%', accentColor: ACCENT, cursor: 'pointer' }} />;
}
function SaveButton({ onClick, saved }: { onClick: () => void; saved: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 24 }}>
      <button onClick={onClick} style={{ background: ACCENT, color: '#FFF', border: 'none', borderRadius: 6, padding: '10px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
        {saved ? 'Saved ✓' : 'Save Changes'}
      </button>
    </div>
  );
}

// Checkbox row with optional X to remove (for custom items)
function CheckboxRow({ checked, onChange, label, onRemove }: { checked: boolean; onChange: () => void; label: string; onRemove?: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
      <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: TEXT, flex: 1 }}>
        <input type="checkbox" checked={checked} onChange={onChange} style={{ width: 16, height: 16, accentColor: ACCENT, cursor: 'pointer' }} />
        {onRemove ? (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '2px 10px', borderRadius: 999, background: ACCENT_BG, border: `1px solid ${ACCENT}`, color: ACCENT, fontWeight: 500 }}>{label}</span>
        ) : label}
      </label>
      {onRemove && (
        <button onClick={onRemove} aria-label={`Remove ${label}`} style={{ background: 'transparent', border: 'none', color: SOFT_MUTED, cursor: 'pointer', padding: 4, display: 'flex' }}>
          <X size={14} />
        </button>
      )}
    </div>
  );
}

// Generic "Add Custom" input
function AddCustomInput({ placeholder, onAdd }: { placeholder: string; onAdd: (v: string) => void }) {
  const [v, setV] = useState('');
  const submit = () => { const t = v.trim(); if (!t) return; onAdd(t); setV(''); };
  return (
    <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
      <input style={{ ...inputStyle, flex: 1 }} value={v} placeholder={placeholder}
        onChange={(e) => setV(e.target.value)}
        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); submit(); } }} />
      <button onClick={submit} style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 6, padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        <Plus size={14} /> Add
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

  const update = <K extends keyof SettingsState>(key: K, patch: Partial<SettingsState[K]> | ((cur: SettingsState[K]) => Partial<SettingsState[K]>)) => {
    setState(s => {
      const cur = s[key] as any;
      const p = typeof patch === 'function' ? (patch as any)(cur) : patch;
      return { ...s, [key]: { ...cur, ...p } };
    });
  };

  const setTop = (patch: Partial<SettingsState>) => setState(s => ({ ...s, ...patch }));

  const initials = useMemo(() => {
    const name = state.account.name.trim();
    if (!name) return '?';
    return name.split(/\s+/).slice(0, 2).map(w => w[0]?.toUpperCase() || '').join('');
  }, [state.account.name]);

  const allMarkets = [...PRESET_MARKETS, ...state.customMarkets];
  const allIndustries = [...PRESET_INDUSTRIES, ...state.customIndustries];
  const allSignals = [...PRESET_SIGNALS, ...state.customSignals];
  const allPropertyTypes = [...PRESET_PROPERTY_TYPES, ...state.customPropertyTypes];
  const allEventTypes = [...PRESET_EVENT_TYPES, ...state.customEventTypes];
  const allTones = [...PRESET_TONES, ...state.customTones];

  return (
    <div style={{ minHeight: 'calc(100vh - 56px)', background: '#F8FAFC', fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ background: '#FFF', borderBottom: `1px solid ${BORDER}`, padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: TEXT, margin: 0 }}>Settings</h1>
          <p style={{ fontSize: 13, color: MUTED, margin: '4px 0 0' }}>Configure how Flare works for you.</p>
        </div>
        <button onClick={onClose} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 12px', fontSize: 13, color: TEXT, cursor: 'pointer' }}>
          <X size={14} /> Close
        </button>
      </div>

      <div style={{ display: 'flex', maxWidth: 1400, margin: '0 auto' }}>
        <aside style={{ width: 240, padding: '24px 0', borderRight: `1px solid ${BORDER}`, background: '#FFF', minHeight: 'calc(100vh - 56px - 81px)' }}>
          {SECTIONS.map(s => {
            const Icon = s.icon;
            const active = s.id === activeSection;
            return (
              <button key={s.id} onClick={() => setActiveSection(s.id)}
                style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 20px',
                  background: active ? ACCENT_BG : 'transparent', border: 'none',
                  borderLeft: `3px solid ${active ? ACCENT : 'transparent'}`,
                  color: active ? ACCENT : TEXT, fontSize: 13, fontWeight: active ? 600 : 500, cursor: 'pointer', textAlign: 'left' }}>
                <Icon size={15} />{s.label}
              </button>
            );
          })}
        </aside>

        <main style={{ flex: 1, padding: '32px 40px', maxWidth: 920 }}>
          {activeSection === 'lead-criteria' && (
            <LeadCriteriaSection
              state={state.leadCriteria} update={(p) => update('leadCriteria', p)}
              allMarkets={allMarkets} allIndustries={allIndustries} allSignals={allSignals}
              customMarkets={state.customMarkets} customIndustries={state.customIndustries} customSignals={state.customSignals}
              addCustomMarket={(v) => setTop({ customMarkets: [...state.customMarkets, v] })}
              removeCustomMarket={(v) => setTop({ customMarkets: state.customMarkets.filter(x => x !== v) })}
              addCustomIndustry={(v) => setTop({ customIndustries: [...state.customIndustries, v] })}
              removeCustomIndustry={(v) => setTop({ customIndustries: state.customIndustries.filter(x => x !== v) })}
              addCustomSignal={(v) => { setState(s => ({ ...s, customSignals: [...s.customSignals, v], leadCriteria: { ...s.leadCriteria, signals: { ...s.leadCriteria.signals, [v]: true } }, scoring: { ...s.scoring, weights: { ...s.scoring.weights, [v]: 50 } } })); }}
              removeCustomSignal={(v) => { setState(s => { const sig = { ...s.leadCriteria.signals }; delete sig[v]; const w = { ...s.scoring.weights }; delete w[v]; return { ...s, customSignals: s.customSignals.filter(x => x !== v), leadCriteria: { ...s.leadCriteria, signals: sig }, scoring: { ...s.scoring, weights: w } }; }); }}
              save={() => save('lead-criteria')} saved={savedSection === 'lead-criteria'} />
          )}

          {activeSection === 'outreach' && (
            <OutreachSection state={state.outreach} update={(p) => update('outreach', p)} allTones={allTones}
              customTones={state.customTones}
              addCustomTone={(v) => setTop({ customTones: [...state.customTones, v] })}
              removeCustomTone={(v) => setTop({ customTones: state.customTones.filter(x => x !== v) })}
              save={() => save('outreach')} saved={savedSection === 'outreach'} />
          )}

          {activeSection === 'scoring' && (
            <ScoringSection state={state.scoring} update={(p) => update('scoring', p)} allSignals={allSignals} save={() => save('scoring')} saved={savedSection === 'scoring'} />
          )}

          {activeSection === 'pipeline' && (
            <PipelineSection state={state.pipeline} update={(p) => update('pipeline', p)} save={() => save('pipeline')} saved={savedSection === 'pipeline'} />
          )}

          {activeSection === 'market' && (
            <MarketSection state={state.market} update={(p) => update('market', p)}
              allMarkets={allMarkets} allPropertyTypes={allPropertyTypes}
              customMarkets={state.customMarkets} customPropertyTypes={state.customPropertyTypes}
              addCustomMarket={(v) => setTop({ customMarkets: [...state.customMarkets, v] })}
              removeCustomMarket={(v) => setTop({ customMarkets: state.customMarkets.filter(x => x !== v) })}
              addCustomPropertyType={(v) => setTop({ customPropertyTypes: [...state.customPropertyTypes, v] })}
              removeCustomPropertyType={(v) => setTop({ customPropertyTypes: state.customPropertyTypes.filter(x => x !== v) })}
              save={() => save('market')} saved={savedSection === 'market'} />
          )}

          {activeSection === 'events' && (
            <EventsSection state={state.events} update={(p) => update('events', p)}
              allEventTypes={allEventTypes} customEventTypes={state.customEventTypes}
              addCustomEventType={(v) => setTop({ customEventTypes: [...state.customEventTypes, v] })}
              removeCustomEventType={(v) => setTop({ customEventTypes: state.customEventTypes.filter(x => x !== v) })}
              save={() => save('events')} saved={savedSection === 'events'} />
          )}

          {activeSection === 'account' && (
            <AccountSection state={state.account} update={(p) => update('account', p)} allMarkets={allMarkets} save={() => save('account')} saved={savedSection === 'account'} initials={initials} />
          )}

          {activeSection === 'ai-behavior' && (
            <AiBehaviorSection ai={state.ai} update={(p) => update('ai', p)} save={() => save('ai-behavior')} saved={savedSection === 'ai-behavior'} />
          )}
        </main>
      </div>
    </div>
  );
}

// ===== Sections =====

function LeadCriteriaSection({ state, update, allMarkets, allIndustries, allSignals, customMarkets, customIndustries, customSignals, addCustomMarket, removeCustomMarket, addCustomIndustry, removeCustomIndustry, addCustomSignal, removeCustomSignal, save, saved }: any) {
  const [kwInput, setKwInput] = useState('');
  const toggleArr = (key: string, item: string) => {
    const arr = state[key] as string[];
    update({ [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] });
  };
  const addKw = () => { const v = kwInput.trim(); if (v && !state.keywords.includes(v)) update({ keywords: [...state.keywords, v] }); setKwInput(''); };

  return (
    <div>
      <h2 style={sectionHeaderStyle}>Lead Criteria</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Target Markets</label>
        {allMarkets.map((m: string) => (
          <CheckboxRow key={m} label={m} checked={state.markets.includes(m)} onChange={() => toggleArr('markets', m)}
            onRemove={customMarkets.includes(m) ? () => { removeCustomMarket(m); update({ markets: state.markets.filter((x: string) => x !== m) }); } : undefined} />
        ))}
        <AddCustomInput placeholder="Add Market" onAdd={addCustomMarket} />
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Target Industries</label>
        {allIndustries.map((i: string) => (
          <CheckboxRow key={i} label={i} checked={state.industries.includes(i)} onChange={() => toggleArr('industries', i)}
            onRemove={customIndustries.includes(i) ? () => { removeCustomIndustry(i); update({ industries: state.industries.filter((x: string) => x !== i) }); } : undefined} />
        ))}
        <AddCustomInput placeholder="Add Industry" onAdd={addCustomIndustry} />
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Company Size: {state.sizeMin.toLocaleString()} – {state.sizeMax >= 10000 ? '10,000+' : state.sizeMax.toLocaleString()} employees</label>
        <div style={{ display: 'flex', gap: 16 }}>
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
        {allSignals.map((s: string) => (
          <div key={s} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0' }}>
            <span style={{ fontSize: 13, color: TEXT, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              {customSignals.includes(s) ? (
                <span style={{ padding: '2px 10px', borderRadius: 999, background: ACCENT_BG, border: `1px solid ${ACCENT}`, color: ACCENT, fontWeight: 500 }}>{s}</span>
              ) : s}
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Toggle on={!!state.signals[s]} onChange={() => update({ signals: { ...state.signals, [s]: !state.signals[s] } })} />
              {customSignals.includes(s) && (
                <button onClick={() => removeCustomSignal(s)} aria-label={`Remove ${s}`} style={{ background: 'transparent', border: 'none', color: SOFT_MUTED, cursor: 'pointer', padding: 4, display: 'flex' }}>
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
        <AddCustomInput placeholder="Add Signal Type" onAdd={addCustomSignal} />
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
          <input style={{ ...inputStyle, flex: 1 }} value={kwInput} onChange={(e) => setKwInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKw(); } }} placeholder="Type a keyword and press Enter" />
          <button onClick={addKw} style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 6, padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}><Plus size={14} /> Add</button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {state.keywords.map((k: string) => (
            <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT_BG, color: ACCENT, fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 999, border: `1px solid ${ACCENT}` }}>
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

function OutreachSection({ state, update, allTones, customTones, addCustomTone, removeCustomTone, save, saved }: any) {
  const addTemplate = () => update({ templates: [...state.templates, { id: crypto.randomUUID(), name: 'New Template', body: '' }] });
  const updateTemplate = (id: string, patch: any) => update({ templates: state.templates.map((t: any) => t.id === id ? { ...t, ...patch } : t) });
  const removeTemplate = (id: string) => update({ templates: state.templates.filter((t: any) => t.id !== id) });

  return (
    <div>
      <h2 style={sectionHeaderStyle}>Outreach Defaults</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Default Tone</label>
        {allTones.map((t: string) => (
          <div key={t} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Radio label={t} checked={state.tone === t} onChange={() => update({ tone: t })} />
            {customTones.includes(t) && (
              <button onClick={() => { removeCustomTone(t); if (state.tone === t) update({ tone: PRESET_TONES[0] }); }} style={{ background: 'transparent', border: 'none', color: SOFT_MUTED, cursor: 'pointer', padding: 4, display: 'flex' }}>
                <X size={14} />
              </button>
            )}
          </div>
        ))}
        <AddCustomInput placeholder="Add Tone" onAdd={addCustomTone} />
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>BDR Signature Block</label>
        <textarea value={state.signature} onChange={(e) => update({ signature: e.target.value })}
          placeholder={'Name\nTitle\nPhone\nEmail'}
          style={{ ...inputStyle, height: 120, padding: 12, resize: 'vertical', fontFamily: 'inherit' }} />
      </div>

      <div style={cardStyle}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <label style={{ ...labelStyle, marginBottom: 0 }}>Saved Templates</label>
          <button onClick={addTemplate} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: ACCENT_BG, color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 6, padding: '6px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
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
            <textarea value={t.body} onChange={(e) => updateTemplate(t.id, { body: e.target.value })}
              placeholder="Email body…" style={{ ...inputStyle, height: 100, padding: 10, resize: 'vertical', fontFamily: 'inherit' }} />
          </div>
        ))}
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function ScoringSection({ state, update, allSignals, save, saved }: any) {
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Scoring Preferences</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Signal Weights</label>
        {allSignals.map((s: string) => (
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
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= state.stages.length) return;
    const next = [...state.stages];
    [next[i], next[j]] = [next[j], next[i]];
    update({ stages: next });
  };
  const remove = (i: number) => update({ stages: state.stages.filter((_: any, idx: number) => idx !== i) });
  const add = () => update({ stages: [...state.stages, 'New Stage'] });
  const setName = (i: number, v: string) => { const next = [...state.stages]; next[i] = v; update({ stages: next }); };

  return (
    <div>
      <h2 style={sectionHeaderStyle}>Prospects Pipeline</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Stage Names</label>
        {state.stages.map((s: string, i: number) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
            <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
              <GripVertical size={16} color={SOFT_MUTED} />
            </span>
            <button onClick={() => move(i, -1)} disabled={i === 0} title="Move up" style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 4, padding: 4, cursor: i === 0 ? 'not-allowed' : 'pointer', opacity: i === 0 ? 0.4 : 1, display: 'flex' }}><ArrowUp size={12} /></button>
            <button onClick={() => move(i, 1)} disabled={i === state.stages.length - 1} title="Move down" style={{ background: 'transparent', border: `1px solid ${BORDER}`, borderRadius: 4, padding: 4, cursor: i === state.stages.length - 1 ? 'not-allowed' : 'pointer', opacity: i === state.stages.length - 1 ? 0.4 : 1, display: 'flex' }}><ArrowDown size={12} /></button>
            <span style={{ fontSize: 11, color: MUTED, width: 50 }}>Stage {i + 1}</span>
            <input style={{ ...inputStyle, flex: 1 }} value={s} onChange={(e) => setName(i, e.target.value)} />
            <button onClick={() => remove(i)} aria-label="Remove stage" style={{ background: 'transparent', border: 'none', color: SOFT_MUTED, cursor: 'pointer', padding: 4, display: 'flex' }}><X size={16} /></button>
          </div>
        ))}
        <button onClick={add} style={{ marginTop: 8, background: ACCENT_BG, color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 6, padding: '8px 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <Plus size={14} /> Add Stage
        </button>
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

function MarketSection({ state, update, allMarkets, allPropertyTypes, customMarkets, customPropertyTypes, addCustomMarket, removeCustomMarket, addCustomPropertyType, removeCustomPropertyType, save, saved }: any) {
  const toggleArr = (key: string, item: string) => {
    const arr = state[key] as string[];
    update({ [key]: arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item] });
  };
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Market Scan Defaults</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Default Markets</label>
        {allMarkets.map((m: string) => (
          <CheckboxRow key={m} label={m} checked={state.markets.includes(m)} onChange={() => toggleArr('markets', m)}
            onRemove={customMarkets.includes(m) ? () => { removeCustomMarket(m); update({ markets: state.markets.filter((x: string) => x !== m) }); } : undefined} />
        ))}
        <AddCustomInput placeholder="Add Market" onAdd={addCustomMarket} />
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Property Type</label>
        {allPropertyTypes.map((p: string) => (
          <CheckboxRow key={p} label={p} checked={state.propertyTypes.includes(p)} onChange={() => toggleArr('propertyTypes', p)}
            onRemove={customPropertyTypes.includes(p) ? () => { removeCustomPropertyType(p); update({ propertyTypes: state.propertyTypes.filter((x: string) => x !== p) }); } : undefined} />
        ))}
        <AddCustomInput placeholder="Add Property Type" onAdd={addCustomPropertyType} />
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Minimum Building Size (units / rooms)</label>
        <input type="number" min={0} value={state.minBuildingSize} onChange={(e) => update({ minBuildingSize: Number(e.target.value) })} style={{ ...inputStyle, width: 160 }} />
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function EventsSection({ state, update, allEventTypes, customEventTypes, addCustomEventType, removeCustomEventType, save, saved }: any) {
  const [city, setCity] = useState('');
  const addCity = () => { const v = city.trim(); if (v && !state.cities.includes(v)) update({ cities: [...state.cities, v] }); setCity(''); };
  const toggle = (item: string) => update({ types: state.types.includes(item) ? state.types.filter((x: string) => x !== item) : [...state.types, item] });

  return (
    <div>
      <h2 style={sectionHeaderStyle}>Event Preferences</h2>

      <div style={cardStyle}>
        <label style={labelStyle}>Default City / Region</label>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input style={{ ...inputStyle, flex: 1 }} value={city} onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCity(); } }} placeholder="e.g. Atlanta, GA" />
          <button onClick={addCity} style={{ background: ACCENT_BG, color: ACCENT, border: `1px solid ${ACCENT}`, borderRadius: 6, padding: '0 14px', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            <Plus size={14} /> Add City
          </button>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {state.cities.map((c: string) => (
            <span key={c} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: ACCENT_BG, color: ACCENT, fontSize: 12, fontWeight: 500, padding: '4px 10px', borderRadius: 999, border: `1px solid ${ACCENT}` }}>
              {c}
              <button onClick={() => update({ cities: state.cities.filter((x: string) => x !== c) })} style={{ background: 'transparent', border: 'none', color: ACCENT, cursor: 'pointer', padding: 0, display: 'flex' }}><X size={12} /></button>
            </span>
          ))}
        </div>
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Event Types</label>
        {allEventTypes.map((t: string) => (
          <CheckboxRow key={t} label={t} checked={state.types.includes(t)} onChange={() => toggle(t)}
            onRemove={customEventTypes.includes(t) ? () => { removeCustomEventType(t); update({ types: state.types.filter((x: string) => x !== t) }); } : undefined} />
        ))}
        <AddCustomInput placeholder="Add Event Type" onAdd={addCustomEventType} />
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

function AccountSection({ state, update, allMarkets, save, saved, initials }: any) {
  return (
    <div>
      <h2 style={sectionHeaderStyle}>Account</h2>

      <div style={cardStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20 }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: ACCENT, color: '#FFF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 600 }}>{initials}</div>
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
          {allMarkets.map((m: string) => <option key={m}>{m}</option>)}
        </select>
      </div>

      <div style={cardStyle}>
        <label style={labelStyle}>Password</label>
        <button disabled title="Available once auth is wired"
          style={{ background: '#F1F5F9', color: MUTED, border: `1px solid ${BORDER}`, borderRadius: 6, padding: '8px 14px', fontSize: 13, cursor: 'not-allowed' }}>
          Reset Password
        </button>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 6 }}>Available once authentication is connected.</div>
      </div>

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function AiBehaviorSection({ ai, update, save, saved }: any) {
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const allExpanded = AI_FUNCTIONS.every(f => expanded[f.id]);
  const toggleAll = () => {
    const next = !allExpanded;
    setExpanded(Object.fromEntries(AI_FUNCTIONS.map(f => [f.id, next])));
  };
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2 style={{ ...sectionHeaderStyle, marginBottom: 0 }}>AI Behavior</h2>
        <button onClick={toggleAll} style={{ background: 'transparent', border: 'none', color: ACCENT, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
          {allExpanded ? 'Collapse All' : 'Expand All'}
        </button>
      </div>

      {AI_FUNCTIONS.map(f => (
        <AiBehaviorCard key={f.id} func={f} entry={ai[f.id] || { value: f.default, lastEdited: null }}
          expanded={!!expanded[f.id]} onToggle={() => setExpanded(e => ({ ...e, [f.id]: !e[f.id] }))}
          onChange={(value: string) => update({ ...ai, [f.id]: { value, lastEdited: ai[f.id]?.lastEdited ?? null } })}
          onSaveOne={(value: string) => { update({ ...ai, [f.id]: { value, lastEdited: Date.now() } }); setTimeout(() => save(), 0); }}
          onReset={() => update({ ...ai, [f.id]: { value: f.default, lastEdited: Date.now() } })} />
      ))}

      <SaveButton onClick={save} saved={saved} />
    </div>
  );
}

function AiBehaviorCard({ func, entry, expanded, onToggle, onChange, onSaveOne, onReset }: any) {
  const [focused, setFocused] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const taRef = useRef<HTMLTextAreaElement | null>(null);
  const last = entry.lastEdited ? new Date(entry.lastEdited).toLocaleString() : 'Never';

  return (
    <div style={cardStyle}>
      <button onClick={onToggle} style={{ width: '100%', background: 'transparent', border: 'none', cursor: 'pointer', padding: 0, textAlign: 'left' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          {expanded ? <ChevronDown size={18} color={MUTED} /> : <ChevronRight size={18} color={MUTED} />}
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700, color: TEXT }}>{func.name}</div>
            <div style={{ fontSize: 12, color: SOFT_MUTED, marginTop: 4 }}>{func.description}</div>
          </div>
        </div>
      </button>

      {expanded && (
        <div style={{ marginTop: 14 }}>
          <div style={{ position: 'relative' }}>
            <textarea ref={taRef} value={entry.value} onChange={(e) => onChange(e.target.value)}
              onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
              style={{
                width: '100%', minHeight: 160, padding: 12, fontFamily: 'inherit', fontSize: 13, color: TEXT,
                background: '#F8FAFC', border: `1px solid ${focused ? ACCENT : BORDER}`, borderRadius: 6, outline: 'none', resize: 'vertical',
              }} />
            <div style={{ position: 'absolute', right: 10, bottom: 8, fontSize: 11, color: SOFT_MUTED, pointerEvents: 'none', background: '#F8FAFC', padding: '0 4px' }}>
              {entry.value.length} chars
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 12 }}>
            <div style={{ position: 'relative' }}>
              <button onClick={() => { if (confirmReset) { onReset(); setConfirmReset(false); } else { setConfirmReset(true); setTimeout(() => setConfirmReset(false), 3000); } }}
                style={{ background: 'transparent', border: 'none', color: SOFT_MUTED, fontSize: 12, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <RotateCcw size={12} /> {confirmReset ? 'Click again to confirm' : 'Reset to Default'}
              </button>
            </div>
            <button onClick={() => onSaveOne(entry.value)}
              style={{ background: ACCENT, color: '#FFF', border: 'none', borderRadius: 6, padding: '8px 16px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
              Save
            </button>
          </div>

          <div style={{ fontSize: 11, color: SOFT_MUTED, marginTop: 8 }}>Last edited: {last}</div>
        </div>
      )}
    </div>
  );
}
