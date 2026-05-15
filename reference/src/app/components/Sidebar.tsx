import { useState } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Users,
  Boxes,
  Sparkles,
  Target,
  MessageSquare,
  Plug,
  Settings,
} from 'lucide-react';
import { useApp } from '../contexts/AppContext';
import { translations } from '../data/translations';

const navigationItems = [
  { key: 'overview', icon: LayoutDashboard },
  { key: 'costAnalytics', icon: DollarSign },
  { key: 'roiEfficiency', icon: TrendingUp },
  { key: 'teams', icon: Users },
  { key: 'toolsModels', icon: Boxes },
  { key: 'aiInsights', icon: Sparkles },
  { key: 'optimizationCenter', icon: Target },
  { key: 'queryAssistant', icon: MessageSquare },
  { key: 'integrations', icon: Plug },
  { key: 'settings', icon: Settings },
];

export function Sidebar() {
  const { language, isRTL } = useApp();
  const [activeItem, setActiveItem] = useState('overview');
  const t = translations[language];

  return (
    <div className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col" style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
      <div className="p-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-tight">AI Cost & Usage</h1>
            <p className="text-xs text-slate-500 dark:text-slate-500">Intelligence Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeItem === item.key;
            return (
              <li key={item.key}>
                <button
                  onClick={() => setActiveItem(item.key)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  <span>{t[item.key as keyof typeof t]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="text-xs text-slate-500 dark:text-slate-500 text-center">
          © 2026 AI Intelligence Platform
        </div>
      </div>
    </div>
  );
}
