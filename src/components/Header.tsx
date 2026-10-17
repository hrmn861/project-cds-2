/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCrowd } from '../context/CrowdContext';
import { UserRole } from '../types/crowd';
import { 
  Camera, 
  ShieldCheck, 
  UserCheck, 
  Sliders, 
  Activity, 
  Info,
  Clock
} from 'lucide-react';

export const Header: React.FC = () => {
  const {
    role,
    setRole,
    activeScenarioId,
    selectScenario,
    scenarios,
    cameraHealth,
    currentTime,
  } = useCrowd();

  const isHealthWarn = cameraHealth.status !== 'Online & Stable';

  return (
    <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        {/* Brand & Camera Identity */}
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center shadow-lg shadow-cyan-950/50 border border-cyan-400/30">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                Crowd Monitor
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/80 uppercase tracking-wider">
                  Decision Support
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <span>Live Crowd Counting & Zone Occupancy Review</span>
              <span className="text-slate-600">•</span>
              <span className="font-mono text-cyan-400 flex items-center gap-1">
                <Camera className="w-3.5 h-3.5 inline" />
                CAM-01 (Concourse North Gate - Overhead 4K)
              </span>
            </p>
          </div>
        </div>

        {/* Global Status Bar & Controls */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 text-xs">
          {/* Camera Health Quick Pill */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-md border font-medium ${
              isHealthWarn
                ? 'bg-amber-950/60 border-amber-800/80 text-amber-300'
                : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isHealthWarn ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'
              }`}
            />
            <span>{cameraHealth.status}</span>
            <span className="text-slate-400 font-mono">({cameraHealth.fps} fps)</span>
          </div>

          {/* Current System Time */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-800/90 border border-slate-700 font-mono text-slate-200">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>{currentTime}</span>
          </div>

          {/* Scenario Selector */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-md border border-slate-700">
            <span className="text-slate-400 text-[11px] font-medium">Scenario:</span>
            <select
              value={activeScenarioId}
              onChange={(e) => selectScenario(e.target.value)}
              className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer pr-1"
            >
              {scenarios.map((s) => (
                <option key={s.id} value={s.id} className="bg-slate-900 text-slate-200">
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* Role Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-800/90 px-2.5 py-1 rounded-md border border-slate-700">
            <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400 text-[11px]">Role:</span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              className="bg-transparent text-cyan-300 font-semibold text-xs focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="Safety Reviewer" className="bg-slate-900 text-slate-200">
                Safety Reviewer
              </option>
              <option value="Security Operator" className="bg-slate-900 text-slate-200">
                Security Operator
              </option>
              <option value="Venue Administrator" className="bg-slate-900 text-slate-200">
                Venue Administrator
              </option>
            </select>
          </div>
        </div>
      </div>

      {/* Safety Compliance Banner */}
      <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>
            <strong className="text-slate-300 font-semibold">Safety Protocol:</strong> Every alert is a{' '}
            <span className="text-amber-300 font-mono font-medium underline decoration-amber-500/50">
              "Review requested"
            </span>
            . No direct emergency dispatch — human review required before venue control room escalation.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-400">
          <span>YOLOv8s + CSRNet + DM-Count Tri-Model Pipeline</span>
          <span>•</span>
          <span>Zero Face Recognition</span>
          <span>•</span>
          <span>Count-Only Persistence</span>
        </div>
      </div>
    </header>
  );
};
