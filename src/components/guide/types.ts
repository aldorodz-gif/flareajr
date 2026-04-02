export interface TabConfig {
  id: string;
  icon: string;
  label: string;
}

export const TAB_ORDER: TabConfig[] = [
  { id: 'workflow', icon: '🗺️', label: 'Overview' },
  { id: 'mindset', icon: '🧠', label: 'Mindset' },
  { id: 'setup', icon: '⚙️', label: 'Agent Mode' },
  { id: 'tracker', icon: '📡', label: 'Find Signals' },
  { id: 'results', icon: '⚡', label: 'Work Results' },
  { id: 'deeper', icon: '🔍', label: 'Research' },
  { id: 'contact', icon: '🎯', label: 'Buyer Map' },
  { id: 'outreach', icon: '✉️', label: 'First Email' },
  { id: 'signals', icon: '📋', label: 'Signals Guide' },
];

export interface VerticalData {
  signal: { label: string; tag: string; title: string; body: string };
  buyer: { label: string; tag: string; title: string; body: string };
  angle: { label: string; tag: string; title: string; body: string };
  email: { subj: string; body: string };
}
