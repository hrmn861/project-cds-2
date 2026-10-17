/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCrowd } from '../context/CrowdContext';
import { CrowdAlert } from '../types/crowd';
import {
  BellRing,
  ShieldAlert,
  CheckCircle2,
  XCircle,
  Eye,
  Send,
  Clock,
  Filter,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const AlertsTab: React.FC = () => {
  const { alerts, setActiveReviewAlert, setActiveEscalateAlert, role } = useCrowd();
  const [filterStatus, setFilterStatus] = useState<string>('All');

  const filteredAlerts = alerts.filter((a) => {
    if (filterStatus === 'All') return true;
    return a.status === filterStatus;
  });

  return (
    <div className="space-y-4">
      {/* Header & Standard Doctrine Notice */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BellRing className="w-4 h-4 text-amber-400" />
              Safety Review Queue
            </h3>
            <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] font-mono font-bold">
              Standard: "Review requested"
            </span>
          </div>
          <p className="text-slate-400 mt-1">
            Every notification requires a trained human operator or safety reviewer to verify against the camera feed before escalation.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
          {['All', 'Pending Review', 'Confirmed', 'Dismissed'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                filterStatus === st
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Alert Feed Table / Cards */}
      <div className="space-y-3">
        {filteredAlerts.length > 0 ? (
          filteredAlerts.map((alert) => {
            const isPending = alert.status === 'Pending Review';
            const isConfirmed = alert.status === 'Confirmed';
            const isDismissed = alert.status === 'Dismissed';

            return (
              <div
                key={alert.id}
                className={`p-4 rounded-xl border transition-all ${
                  isPending
                    ? 'bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border-amber-600/70 shadow-lg'
                    : isConfirmed
                    ? 'bg-slate-900/90 border-orange-800/60'
                    : 'bg-slate-900/50 border-slate-800 opacity-80'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800/80 pb-2.5">
                  <div className="flex items-center gap-2.5">
                    <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-950 border border-slate-700 text-cyan-300">
                      {alert.id}
                    </span>
                    <span className="font-bold text-sm text-white">
                      {alert.zoneName}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border font-mono ${
                        isPending
                          ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                          : isConfirmed
                          ? 'bg-orange-950 text-orange-300 border-orange-700'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {alert.status === 'Pending Review' ? 'Review requested' : alert.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-cyan-400" />
                      {alert.timestamp}
                    </span>
                    <span>•</span>
                    <span>Duration: {alert.durationSeconds}s</span>
                  </div>
                </div>

                {/* Alert Details & Action Buttons */}
                <div className="mt-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
                  <div className="space-y-1 max-w-2xl">
                    <p className="text-slate-200 leading-relaxed font-medium">
                      {alert.triggerReason}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono">
                      <span>Density: <strong className="text-amber-300">{alert.densityValue} p/m²</strong> (Limit: {alert.thresholdValue})</span>
                      <span>•</span>
                      <span>Occupants: <strong className="text-cyan-300">{alert.count}</strong></span>
                    </div>

                    {alert.reviewedBy && (
                      <div className="mt-2 text-[11px] text-slate-400 bg-slate-950/80 p-2 rounded border border-slate-800">
                        <strong className="text-slate-300 font-semibold">Review Assessment: </strong>
                        {alert.reviewerNotes || 'Verified via live feed.'}
                        <span className="text-slate-500 block text-[10px] mt-0.5">
                          By {alert.reviewedBy} at {alert.reviewedAt}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                      <button
                        onClick={() => setActiveReviewAlert(alert)}
                        className="px-3.5 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-amber-950"
                      >
                        <Eye className="w-4 h-4" />
                        Review Feed & Verify
                      </button>
                    )}

                    {isConfirmed && !alert.escalated && (
                      <button
                        onClick={() => setActiveEscalateAlert(alert)}
                        className="px-3.5 py-2 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs transition flex items-center gap-1.5 shadow-md shadow-orange-950"
                      >
                        <Send className="w-4 h-4" />
                        Escalate to Control Room
                      </button>
                    )}

                    {alert.escalated && (
                      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/80 border border-emerald-800/80 text-emerald-300 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Escalated ({alert.escalationId})</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-slate-400 text-xs bg-slate-900/50 rounded-xl border border-slate-800">
            No alerts match status "{filterStatus}".
          </div>
        )}
      </div>

      {/* Safety Doctrine Card */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-200 font-semibold">
          <Info className="w-4 h-4 text-cyan-400" />
          <span>Why Alerts are Strictly "Review requested" (Never Emergency)</span>
        </div>
        <p className="leading-relaxed">
          Occlusion, camera angle changes, moving shadows, and localized bottlenecks can cause models to under- or over-count. An automatic call to emergency services can waste civil defense resources and breach regulatory guidelines. Crowd Monitor enforces a strict Human-In-The-Loop paradigm where trained personnel visually verify before dispatching an Escalation Summary.
        </p>
      </div>
    </div>
  );
};
