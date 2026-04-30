export interface TabConfig {
  id: string;
  icon: string;
  label: string;
}

export const TAB_ORDER: TabConfig[] = [
  { id: 'dashboard', icon: '🏠', label: 'Dashboard' },
  
  { id: 'tracker', icon: '📡', label: 'Prompt Builder' },
  
  { id: 'signals', icon: '📋', label: 'Score Signals' },
  { id: 'contact', icon: '🎯', label: 'Who to Call' },
  { id: 'outreach', icon: '✉️', label: 'Write Outreach' },
  { id: 'mindset', icon: '🧠', label: 'Level Up' },
  { id: 'events', icon: '🎪', label: 'Find Events' },
  { id: 'linkedin', icon: '💼', label: 'LinkedIn Strategy' },
];

export interface VerticalData {
  signal: { label: string; tag: string; title: string; body: string };
  buyer: { label: string; tag: string; title: string; body: string };
  angle: { label: string; tag: string; title: string; body: string };
  email: { subj: string; body: string };
}
