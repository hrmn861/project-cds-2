/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCrowd, AppTab } from '../context/CrowdContext';
import {
  LayoutDashboard,
  Video,
  Grid3X3,
  TrendingUp,
  BellRing,
  Send,
  HeartPulse,
  Award,
  BookOpen,
  Settings2,
} from 'lucide-react';

export const Navigation: React.FC = () => {
  const { activeTab, setActiveTab, alerts, escalations, cameraHealth } = useCrowd();

  const pendingAlertCount = alerts.filter((a) => a.status === 'Pending Review').length;
  const isHealthWarn = cameraHealth.status !== 'Online & Stable';

  const navItems: { id: AppTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: number; alertDot?: boolean }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'replay', label: 'Live & Replay', icon: Video },
    { id: 'zones', label: 'Zones Map', icon: Grid3X3 },
    { id: 'trends', label: 'Density & Trends', icon: TrendingUp },
    { id: 'alerts', label: 'Review Alerts', icon: BellRing, badge: pendingAlertCount },
    { id: 'escalation', label: 'Safety Escalation', icon: Send, badge: escalations.length },
    { id: 'health', label: 'Camera Health', icon: HeartPulse, alertDot: isHealthWarn },
    { id: 'evaluation', label: 'Model Evaluation', icon: Award },
    { id: 'methodology', label: 'Methodology & Ethics', icon: BookOpen },
    { id: 'admin', label: 'Administration', icon: Settings2 },
  ];

  return (
    <nav className="border-b border-slate-800 bg-slate-900/60 px-4 sm:px-6 overflow-x-auto scrollbar-none">
      <div className="flex items-center space-x-1 min-w-max py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2 text-xs font-medium rounded-lg transition-all relative ${
                isActive
                  ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
              <span>{item.label}</span>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                    item.id === 'alerts'
                      ? 'bg-amber-500 text-slate-950 font-mono animate-pulse'
                      : 'bg-slate-700 text-slate-200 font-mono'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {item.alertDot && (
                <span className="w-2 h-2 rounded-full bg-amber-400 ml-1 animate-ping" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
