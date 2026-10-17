/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCrowd } from '../context/CrowdContext';
import { ShieldAlert, CheckCircle2, XCircle, AlertTriangle, Send, Eye, FileText } from 'lucide-react';

export const ReviewModal: React.FC = () => {
  const { activeReviewAlert, setActiveReviewAlert, reviewAlert, setActiveEscalateAlert, role } = useCrowd();
  const [reviewNotes, setReviewNotes] = useState<string>('');
  const [checkedGlare, setCheckedGlare] = useState<boolean>(true);
  const [checkedFlow, setCheckedFlow] = useState<boolean>(true);

  if (!activeReviewAlert) return null;

  const handleConfirm = () => {
    reviewAlert(
      activeReviewAlert.id,
      'confirm',
      reviewNotes || 'Confirmed genuine congestion trend via camera visual inspection.'
    );
  };

  const handleConfirmAndEscalate = () => {
    reviewAlert(
      activeReviewAlert.id,
      'confirm',
      reviewNotes || 'Confirmed genuine congestion trend via camera visual inspection. Prompt escalation recommended.'
    );
    // Directly open escalation summary builder
    setActiveEscalateAlert(activeReviewAlert);
  };

  const handleDismiss = () => {
    if (!reviewNotes) {
      alert('Please provide a brief reason for dismissal (e.g. transient surge, light glare).');
      return;
    }
    reviewAlert(activeReviewAlert.id, 'dismiss', reviewNotes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 bg-slate-800/90 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-700/60 font-semibold">
                  Review requested
                </span>
                <span className="font-mono text-xs text-slate-400">{activeReviewAlert.id}</span>
              </div>
              <h3 className="text-base font-bold text-white mt-0.5">
                {activeReviewAlert.zoneName}
              </h3>
            </div>
          </div>
          <button
            onClick={() => setActiveReviewAlert(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
          {/* Key Alert Telemetry Banner */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-lg bg-slate-950/70 border border-slate-800">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Trigger Density</span>
              <span className="text-base font-bold text-amber-400 font-mono">
                {activeReviewAlert.densityValue} <span className="text-[10px] text-slate-400 font-normal">p/m²</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Zone Threshold</span>
              <span className="text-base font-bold text-slate-200 font-mono">
                {activeReviewAlert.thresholdValue} <span className="text-[10px] text-slate-400 font-normal">p/m²</span>
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Estimated People</span>
              <span className="text-base font-bold text-cyan-400 font-mono">
                {activeReviewAlert.count}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Duration</span>
              <span className="text-base font-bold text-slate-200 font-mono">
                {activeReviewAlert.durationSeconds}s
              </span>
            </div>
          </div>

          {/* Trigger Reason Description */}
          <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40 text-amber-200/90 leading-relaxed">
            <span className="font-semibold text-amber-300">System Trigger Reason: </span>
            {activeReviewAlert.triggerReason}
          </div>

          {/* Verification Checklist */}
          <div className="space-y-2 p-3 rounded-lg bg-slate-800/50 border border-slate-700/60">
            <span className="text-[11px] font-bold text-slate-200 uppercase tracking-wider block flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-cyan-400" />
              Trained Reviewer Safety Verification Protocol
            </span>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={checkedGlare}
                onChange={(e) => setCheckedGlare(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Checked live camera feed — verified count is NOT a lighting glare or shadow artifact</span>
            </label>
            <label className="flex items-center gap-2 text-slate-300 cursor-pointer">
              <input
                type="checkbox"
                checked={checkedFlow}
                onChange={(e) => setCheckedFlow(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span>Confirmed sustained congestion buildup rather than temporary rapid transit</span>
            </label>
          </div>

          {/* Reviewer Notes Field */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-semibold text-slate-300">
              Reviewer Assessment Notes (Required for dismissal):
            </label>
            <textarea
              value={reviewNotes}
              onChange={(e) => setReviewNotes(e.target.value)}
              placeholder="e.g. Verified high crowd influx from Gate 2 turnstiles. Recommend stewarding intervention at stairwell corridor."
              className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 min-h-[70px]"
            />
          </div>

          {/* Safety Reminder */}
          <div className="text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              <strong>Review-then-Escalate Standard:</strong> Automated emergency calls are forbidden. 
              Confirming this alert verifies the incident and enables you to dispatch an official Escalation Summary to the Venue Control Room.
            </span>
          </div>
        </div>

        {/* Modal Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-800/80 border-t border-slate-700 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={handleDismiss}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 text-rose-300 border border-rose-900/60 hover:bg-rose-950/40 text-xs font-semibold transition"
          >
            <XCircle className="w-4 h-4 text-rose-400" />
            Dismiss as False Alarm / Benign
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleConfirm}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Confirm Incident Only
            </button>
            <button
              onClick={handleConfirmAndEscalate}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs font-bold shadow-md shadow-amber-950 transition"
            >
              <Send className="w-4 h-4" />
              Confirm & Escalate to Control Room
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
