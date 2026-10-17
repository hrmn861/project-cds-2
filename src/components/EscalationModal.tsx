/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCrowd } from '../context/CrowdContext';
import { Send, Camera, ShieldCheck, MapPin, Building, Clock, Users, ArrowUpRight, CheckCircle } from 'lucide-react';

export const EscalationModal: React.FC = () => {
  const {
    activeEscalateAlert,
    setActiveEscalateAlert,
    dispatchEscalation,
    zones,
    role,
    currentTime,
  } = useCrowd();

  const [siteName, setSiteName] = useState<string>('Olympic Arena & Exhibition Center');
  const [siteAddress, setSiteAddress] = useState<string>('Gate 4 Concourse, Level 2, 500 Stadium Blvd');
  const [targetRecipient, setTargetRecipient] = useState<string>(
    'Venue Central Operations & Security Dispatch (Radio Ch. 1)'
  );
  const [recommendedAction, setRecommendedAction] = useState<string>(
    'Deploy secondary stewards to entrance bottleneck; hold Turnstiles 3-4 and redirect ingress flow to East corridor.'
  );
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!activeEscalateAlert) return null;

  const zone = zones.find((z) => z.id === activeEscalateAlert.zoneId);
  const floorArea = zone ? zone.floorAreaM2 : 45.0;
  const trendRate = zone ? zone.trendRate : 25.0;

  const reviewerName =
    role === 'Safety Reviewer'
      ? 'A. Vasquez (Certified Safety Reviewer #84)'
      : role === 'Security Operator'
      ? 'J. Miller (Security Operator)'
      : 'S. Patel (Venue Administrator)';

  const handleDispatch = () => {
    dispatchEscalation({
      alertId: activeEscalateAlert.id,
      siteName,
      siteAddress,
      zoneId: activeEscalateAlert.zoneId,
      zoneName: activeEscalateAlert.zoneName,
      floorAreaM2: floorArea,
      verifiedCount: activeEscalateAlert.count,
      density: activeEscalateAlert.densityValue,
      trendRate,
      reviewerName,
      reviewerRole: role,
      targetRecipient,
      actionRecommended: recommendedAction,
      snapshotDataUrl: 'snapshot-cam01-escalation.png',
    });
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setActiveEscalateAlert(null);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header - Stated strictly "Escalation summary" */}
        <div className="px-5 py-4 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-b border-slate-700 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-orange-600/20 border border-orange-500/40 flex items-center justify-center text-orange-400">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs px-2 py-0.5 rounded bg-orange-950 text-orange-300 border border-orange-700/70 font-bold uppercase tracking-wider">
                  Escalation summary
                </span>
                <span className="text-xs text-slate-400 font-mono">Ref: {activeEscalateAlert.id}</span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Dispatch verified incident report to Venue Control Room
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveEscalateAlert(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 text-sm font-semibold"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 overflow-y-auto text-xs text-slate-300">
          {isSubmitted ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 animate-bounce">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Escalation Summary Dispatched</h4>
              <p className="text-xs text-slate-300 max-w-md">
                Successfully routed to {targetRecipient}. Logged in the audit trail with reviewer signature and snapshot.
              </p>
            </div>
          ) : (
            <>
              {/* Telemetry Summary Card */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs">
                    <Building className="w-4 h-4" />
                    <span>Location Identification</span>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {currentTime}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Site Name</label>
                    <input
                      type="text"
                      value={siteName}
                      onChange={(e) => setSiteName(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5 focus:border-cyan-500"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 uppercase tracking-wider block font-medium">Physical Address / Gate</label>
                    <input
                      type="text"
                      value={siteAddress}
                      onChange={(e) => setSiteAddress(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 mt-0.5 focus:border-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-900">
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Monitored Zone</span>
                    <span className="font-bold text-white text-xs block truncate">{activeEscalateAlert.zoneName.split('-')[0]}</span>
                    <span className="text-[10px] text-slate-400 font-mono">{floorArea} m²</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Verified Count</span>
                    <span className="font-bold text-cyan-400 text-sm font-mono">{activeEscalateAlert.count}</span>
                    <span className="text-[10px] text-slate-400">people</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Current Density</span>
                    <span className="font-bold text-orange-400 text-sm font-mono">{activeEscalateAlert.densityValue}</span>
                    <span className="text-[10px] text-slate-400">people/m²</span>
                  </div>
                  <div className="bg-slate-900/80 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-400 block">Trend Rate</span>
                    <span className="font-bold text-rose-400 text-sm font-mono flex items-center">
                      +{trendRate}% <ArrowUpRight className="w-3.5 h-3.5 inline" />
                    </span>
                    <span className="text-[10px] text-slate-400">last 5 min</span>
                  </div>
                </div>
              </div>

              {/* Verified Camera Snapshot Preview Box */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span className="flex items-center gap-1.5 font-semibold text-slate-300">
                    <Camera className="w-3.5 h-3.5 text-cyan-400" />
                    Attached Incident Snapshot (Single Frame)
                  </span>
                  <span className="text-[10px] font-mono text-slate-400">
                    CAM-01 • Timestamp Watermarked • Face Blurred
                  </span>
                </div>
                <div className="h-28 rounded bg-slate-900 border border-slate-800 flex items-center justify-center relative overflow-hidden text-center p-3">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent z-10" />
                  <div className="z-20 text-slate-300 text-xs">
                    <div className="font-mono text-cyan-400 text-xs font-semibold">
                      [VERIFIED INCIDENT FRAME SNAPSHOT - CAM-01]
                    </div>
                    <div className="text-[11px] text-slate-400 mt-1">
                      {activeEscalateAlert.zoneName} • Density: {activeEscalateAlert.densityValue} p/m² • {currentTime}
                    </div>
                    <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                      ✓ Zero Facial Storage Compliance Certified
                    </div>
                  </div>
                </div>
              </div>

              {/* Target Venue Recipient */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Control Room Dispatch Target:
                </label>
                <input
                  type="text"
                  value={targetRecipient}
                  onChange={(e) => setTargetRecipient(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:border-cyan-500"
                />
              </div>

              {/* Recommended Steward Action */}
              <div className="space-y-1">
                <label className="text-[11px] font-semibold text-slate-300 block">
                  Safety Reviewer Recommended Action:
                </label>
                <textarea
                  value={recommendedAction}
                  onChange={(e) => setRecommendedAction(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-xs text-slate-200 focus:border-cyan-500 min-h-[60px]"
                />
              </div>

              {/* Reviewer Signature */}
              <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Authorized Signer</span>
                  <span className="font-semibold text-cyan-300">{reviewerName}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Authorization Standard</span>
                  <span className="text-emerald-400 font-semibold text-[11px]">Human-Verified Protocol</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        {!isSubmitted && (
          <div className="px-5 py-3.5 bg-slate-800/90 border-t border-slate-700 flex items-center justify-between">
            <span className="text-[11px] text-slate-400">
              Summary will be recorded into the persistent venue incident log.
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveEscalateAlert(null)}
                className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDispatch}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold shadow-md shadow-orange-950 transition"
              >
                <Send className="w-4 h-4" />
                Dispatch Escalation Summary
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
