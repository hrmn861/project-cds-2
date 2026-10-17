/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCrowd } from '../context/CrowdContext';
import {
  Send,
  Building,
  MapPin,
  Clock,
  Camera,
  CheckCircle2,
  ShieldCheck,
  Radio,
  FileCheck,
  AlertTriangle,
} from 'lucide-react';

export const EscalationTab: React.FC = () => {
  const { escalations } = useCrowd();

  return (
    <div className="space-y-5">
      {/* Safety Procedure Flow Diagram */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Safety Procedure: Review, Then Escalate
          </h3>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800">
            Standard Operating Procedure (SOP-CR-01)
          </span>
        </div>

        {/* 6-Step Visual Journey */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-2 text-xs">
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-mono text-[10px] text-cyan-400 font-bold">Step 1</span>
            <div className="font-semibold text-slate-200 mt-1">System Trigger</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Raises "Review requested" alert to operator.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-mono text-[10px] text-cyan-400 font-bold">Step 2</span>
            <div className="font-semibold text-slate-200 mt-1">Human Review</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Trained reviewer inspects live camera feed.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-mono text-[10px] text-cyan-400 font-bold">Step 3</span>
            <div className="font-semibold text-slate-200 mt-1">Confirm Decision</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Confirms genuine bottleneck or dismisses glare.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-mono text-[10px] text-orange-400 font-bold">Step 4</span>
            <div className="font-semibold text-slate-200 mt-1">Build Summary</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Compiles site address, count, density & snapshot.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-mono text-[10px] text-orange-400 font-bold">Step 5</span>
            <div className="font-semibold text-slate-200 mt-1">Control Room</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Venue control room decides stewarding or 112.</p>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex flex-col justify-between">
            <span className="font-mono text-[10px] text-emerald-400 font-bold">Step 6</span>
            <div className="font-semibold text-slate-200 mt-1">Audit Log</div>
            <p className="text-[11px] text-slate-400 mt-0.5">Logged with who authorized and exact timestamp.</p>
          </div>
        </div>
      </div>

      {/* Escalation Summary Log */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Send className="w-4 h-4 text-orange-400" />
            Dispatched Escalation Summaries (Immutable Record)
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            {escalations.length} records dispatched
          </span>
        </div>

        {escalations.map((esc) => (
          <div
            key={esc.id}
            className="p-5 rounded-xl bg-slate-900/90 border border-slate-700/80 shadow-xl space-y-4"
          >
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-orange-950 text-orange-300 border border-orange-700 font-mono font-bold text-xs">
                  {esc.id}
                </span>
                <div>
                  <h4 className="text-base font-bold text-white flex items-center gap-2">
                    Escalation Summary: {esc.zoneName}
                  </h4>
                  <span className="text-xs text-slate-400 font-mono">
                    Triggered by Alert {esc.alertId} • Dispatched at {esc.dispatchedAt}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800 text-xs font-semibold flex items-center gap-1.5 font-mono">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  {esc.status}
                </span>
              </div>
            </div>

            {/* Core Summary Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              {/* Location & Site */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Building className="w-3.5 h-3.5 text-cyan-400" />
                  Venue Location Identification
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Site Name:</span>
                  <span className="text-white font-medium">{esc.siteName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Physical Address:</span>
                  <span className="text-slate-200 font-mono flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-cyan-400 inline" />
                    {esc.siteAddress}
                  </span>
                </div>
                <div className="pt-1 flex items-center gap-4 text-slate-400 font-mono text-[11px]">
                  <span>Zone Area: <strong className="text-white">{esc.floorAreaM2} m²</strong></span>
                  <span>Trend Rate: <strong className="text-rose-400">+{esc.trendRate}% / 5m</strong></span>
                </div>
              </div>

              {/* Verified Count & Target */}
              <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Radio className="w-3.5 h-3.5 text-cyan-400" />
                  Telemetry & Dispatch Destination
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Verified Count</span>
                    <span className="text-base font-bold text-cyan-300 font-mono">{esc.verifiedCount}</span>
                    <span className="text-[10px] text-slate-400 ml-1">people</span>
                  </div>
                  <div className="bg-slate-900 p-2 rounded">
                    <span className="text-[10px] text-slate-400 block">Measured Density</span>
                    <span className="text-base font-bold text-orange-400 font-mono">{esc.density}</span>
                    <span className="text-[10px] text-slate-400 ml-1">p/m²</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Control Room Recipient:</span>
                  <span className="text-slate-200 font-medium">{esc.targetRecipient}</span>
                </div>
              </div>
            </div>

            {/* Recommended Steward Action & Attached Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
              <div className="md:col-span-8 p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
                <div className="text-[11px] font-semibold text-amber-300 flex items-center gap-1.5">
                  <FileCheck className="w-3.5 h-3.5 text-amber-400" />
                  Reviewer Recommended Action:
                </div>
                <p className="text-slate-200 leading-relaxed font-sans">
                  {esc.actionRecommended}
                </p>
                <div className="pt-2 text-[11px] text-slate-400 flex items-center gap-2 border-t border-slate-900">
                  <span>Authorized by: <strong className="text-cyan-300">{esc.reviewerName}</strong></span>
                  <span>•</span>
                  <span>Role: {esc.reviewerRole}</span>
                </div>
              </div>

              <div className="md:col-span-4 p-3 rounded-lg bg-slate-950 border border-slate-800 flex flex-col items-center justify-center text-center space-y-1 text-slate-400">
                <Camera className="w-5 h-5 text-cyan-400" />
                <span className="text-[11px] font-mono text-slate-200 font-semibold">Incident Snapshot Attached</span>
                <span className="text-[10px] text-slate-400">Watermarked & Retained for 24h</span>
                <span className="text-[9px] text-emerald-400 font-mono">Verified Zero Face Recognition</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
