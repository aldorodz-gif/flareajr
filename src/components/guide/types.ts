import {
  LayoutDashboard,
  Zap,
  Flame,
  Target,
  CalendarRange,
  Sparkles,
  ListChecks,
  Mail,
  type LucideIcon,
} from 'lucide-react';

export interface TabConfig {
  id: string;
  icon: string;          // emoji kept for backward-compat (e.g. WelcomeModal)
  iconNode: LucideIcon;  // new Lucide icon used by the top nav
  label: string;
}

export const TAB_ORDER: TabConfig[] = [
  { id: 'dashboard',     icon: '🏠', iconNode: LayoutDashboard, label: 'Dashboard' },
  { id: 'opportunities', icon: '⚡', iconNode: Zap,             label: "Today's Leads" },
  { id: 'market',        icon: '🔥', iconNode: Flame,           label: 'Scan a Market' },
  { id: 'prospects',     icon: '🎯', iconNode: Target,          label: 'Prospects' },
  { id: 'events',        icon: '🎪', iconNode: CalendarRange,   label: 'Find Events' },
  { id: 'tracker',       icon: '📡', iconNode: Sparkles,        label: 'Prompt Builder' },
  { id: 'signals',       icon: '📋', iconNode: ListChecks,      label: 'Score Signals' },
  { id: 'outreach',      icon: '✉️', iconNode: Mail,            label: 'Write Outreach' },
];

export interface VerticalData {
  signal: { label: string; tag: string; title: string; body: string };
  buyer:  { label: string; tag: string; title: string; body: string };
  angle:  { label: string; tag: string; title: string; body: string };
  email:  { subj: string; body: string };
}
