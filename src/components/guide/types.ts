import {
  LayoutDashboard,
  Zap,
  Map,
  Users,
  Calendar,
  type LucideIcon,
} from 'lucide-react';

export interface TabConfig {
  id: string;
  icon: string;          // emoji kept for backward-compat (e.g. WelcomeModal)
  iconNode: LucideIcon;  // Lucide icon used by the top nav
  label: string;
}

export const TAB_ORDER: TabConfig[] = [
  { id: 'dashboard',     icon: '🏠', iconNode: LayoutDashboard, label: 'Dashboard' },
  { id: 'opportunities', icon: '⚡', iconNode: Zap,             label: "Today's Leads" },
  { id: 'prospects',     icon: '👥', iconNode: Users,           label: 'Prospects' },
  { id: 'market',        icon: '🗺️', iconNode: Map,             label: 'Scan a Market' },
  { id: 'events',        icon: '📅', iconNode: Calendar,        label: 'Find Events' },
];

export interface VerticalData {
  signal: { label: string; tag: string; title: string; body: string };
  buyer:  { label: string; tag: string; title: string; body: string };
  angle:  { label: string; tag: string; title: string; body: string };
  email:  { subj: string; body: string };
}
