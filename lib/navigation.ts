import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Boxes,
  ClipboardList,
  DollarSign,
  LayoutDashboard,
  MessageSquare,
  Newspaper,
  Plug,
  Settings,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

export interface NavItem {
  key: string;
  href: string;
  icon: LucideIcon;
}

export const navigationItems: NavItem[] = [
  { key: "overview", href: "/", icon: LayoutDashboard },
  { key: "costAnalytics", href: "/cost-analytics", icon: DollarSign },
  { key: "roiEfficiency", href: "/roi-efficiency", icon: TrendingUp },
  { key: "teams", href: "/teams", icon: Users },
  { key: "toolsModels", href: "/tools-models", icon: Boxes },
  { key: "toolsDirectory", href: "/tools-directory", icon: BookOpen },
  { key: "aiNews", href: "/ai-news", icon: Newspaper },
  { key: "usageLogs", href: "/usage-logs", icon: ClipboardList },
  { key: "aiInsights", href: "/ai-insights", icon: Sparkles },
  { key: "optimizationCenter", href: "/optimization", icon: Target },
  { key: "queryAssistant", href: "/query", icon: MessageSquare },
  { key: "integrations", href: "/integrations", icon: Plug },
  { key: "settings", href: "/settings", icon: Settings },
];
