/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  BookOpen,
  Shield,
  EyeOff,
  Cpu,
  Trash2,
  AlertTriangle,
  Send,
  Scale,
  CheckCircle,
} from 'lucide-react';

export const MethodologyTab: React.FC = () => {
  return (
    <div className="space-y-6 max-w-5xl">
      {/* Title */}
      <div className="p-5 bg-slate-900/90 rounded-xl border border-slate-800">
        <h2 className="text-base font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-cyan-400" />
          Methodology, Ethics, and System Architecture
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Open documentation on dual-model computer vision, single-camera perspective geometry, data privacy guarantees, and human safety ethics.
        </p>
      </div>

      {/* 1. Privacy Guarantees & Retention */}
      <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-emerald-400" />
          1. Privacy Safeguards & Data Retention Policy
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <strong className="text-emerald-300 font-semibold block flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Zero Facial Recognition
            </strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              No biometric embeddings, face templates, or individual identities are ever generated or stored. People are detected purely as anonymous spatial centroids and density distribution maps.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <strong className="text-emerald-300 font-semibold block flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Count-Only Database Persistence
            </strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The persistent database (SQLite in WAL mode) retains only numerical counts, calculated densities, camera health logs, and timestamps. Raw video frames are discarded immediately after in-memory inference.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <strong className="text-emerald-300 font-semibold block flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              Escalation Snapshot Standard
            </strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              The only image stored is the single freeze-frame attached when a human reviewer confirms an escalation. It is sent exclusively to the venue's internal control room and deleted after 24 hours.
            </p>
          </div>
        </div>
      </div>

      {/* 2. Tri-Model Architecture */}
      <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Cpu className="w-4 h-4 text-cyan-400" />
          2. Tri-Model Vision Pipeline: YOLOv8 + CSRNet + Pretrained DM-Count
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Standard object detectors drop up to 30% of occupants when mutual body occlusions occur. Conversely, density regression models struggle to isolate sparse individuals. Crowd Monitor solves this through an adaptive 3-tier ensemble:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <strong className="text-cyan-400 font-semibold block font-mono">
              1. Ultralytics YOLOv8s (Sparse &lt;35p)
            </strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Provides millisecond-fast bounding box localization, centroid tracking, and zone mapping. Dominates sparse turnstile and corridor flows with &lt;7% MAPE.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-1.5">
            <strong className="text-orange-400 font-semibold block font-mono">
              2. PyTorch CSRNet (Medium 35–80p)
            </strong>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Dilated convolutions expand the receptive field without loss of spatial resolution, aggregating overlapping heads across medium concourse queues.
            </p>
          </div>

          <div className="p-3.5 rounded-lg bg-purple-950/30 border border-purple-800/80 space-y-1.5">
            <strong className="text-purple-300 font-semibold block font-mono">
              3. Pretrained DM-Count (Dense &gt;80p)
            </strong>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Uses Optimal Transport (Wasserstein metric) distribution matching. Eliminates Gaussian blur variance and head overlap dropouts, preserving &lt;9% MAPE during peak crowd crushes.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Safety Procedure: Why Autonomous 112/911 Dispatch Was Rejected */}
      <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Scale className="w-4 h-4 text-amber-400" />
          3. Human Safety Ethics: "Review requested" vs Autonomous Dispatch
        </h3>
        <p className="text-xs text-slate-300 leading-relaxed">
          Direct automated reporting to municipal emergency services (such as 112 in India or 911 in North America) was thoroughly analyzed and <strong className="text-rose-400">explicitly rejected</strong>:
        </p>
        <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed pl-2">
          <li>
            <strong className="text-slate-200">False reporting risks:</strong> Vision algorithms can misinterpret transient groups, high-contrast shadows, or temporary equipment stages, risking civil defense penalties.
          </li>
          <li>
            <strong className="text-slate-200">Density ≠ Immediate Danger:</strong> A dense crowd moving smoothly through an ingress gate is normal; only a trained human looking at the live feed can determine if movement has stalled dangerously.
          </li>
          <li>
            <strong className="text-slate-200">Venue Stewarding Authority:</strong> The venue's internal control room has ground stewards, turnstile controls, and public address announcements that can resolve congestion minutes before civil emergency intervention is required.
          </li>
        </ul>
      </div>

      {/* 4. Known Technical Limitations */}
      <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3 text-xs">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          4. Known Limitations of Single-Camera Prototypes
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-slate-400 text-[11px]">
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block mb-0.5">Occlusion & Viewpoint Blindspots:</strong>
            People behind pillars or tall crowds are inevitably occluded in a single oblique camera view.
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block mb-0.5">Environmental Factors:</strong>
            Heavy glare, direct spotlight beams, or nighttime low-lux conditions degrade bounding box precision.
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block mb-0.5">Single-Camera Scope:</strong>
            Cannot detect crowd dynamics outside the camera's fixed 84° field of view.
          </div>
          <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
            <strong className="text-slate-200 block mb-0.5">Zero-Count Camera Health:</strong>
            Camera connection drops or frozen frames must be monitored continuously to prevent silent failure.
          </div>
        </div>
      </div>
    </div>
  );
};
