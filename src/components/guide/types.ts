export interface TabConfig {
  id: string;
  icon: string;
  label: string;
}

export const TAB_ORDER: TabConfig[] = [
  { id: 'workflow', icon: '🗺️', label: 'Overview' },
  { id: 'setup', icon: '⚙️', label: 'Setup' },
  { id: 'tracker', icon: '📡', label: 'Prompt Builder' },
  { id: 'results', icon: '⚡', label: 'Work Your List' },
  { id: 'contact', icon: '🎯', label: 'Who to Call' },
  { id: 'outreach', icon: '✉️', label: 'Write Outreach' },
  { id: 'mindset', icon: '🧠', label: 'Mindset' },
  { id: 'signals', icon: '📋', label: 'Score Signals' },
];

export interface VerticalData {
  signal: { label: string; tag: string; title: string; body: string };
  buyer: { label: string; tag: string; title: string; body: string };
  angle: { label: string; tag: string; title: string; body: string };
  email: { subj: string; body: string };
}
