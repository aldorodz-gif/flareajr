export interface TabConfig {
  id: string;
  icon: string;
  label: string;
}

export const TAB_ORDER: TabConfig[] = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  { id: 'opportunities', icon: '⚡', label: 'AI Daily Lead Feed' },
  { id: 'market', icon: '🔥', label: 'Market Heat' },
  { id: 'prospects', icon: '🎯', label: 'Prospects' },
  { id: 'events', icon: '🎪', label: 'Find Events' },
  { id: 'tracker', icon: '📡', label: 'Prompt Builder' },
  { id: 'signals', icon: '📋', label: 'Score Signals' },
  { id: 'outreach', icon: '✉️', label: 'Write Outreach' },
];

export interface VerticalData {
  signal: { label: string; tag: string; title: string; body: string };
  buyer: { label: string; tag: string; title: string; body: string };
  angle: { label: string; tag: string; title: string; body: string };
  email: { subj: string; body: string };
}
