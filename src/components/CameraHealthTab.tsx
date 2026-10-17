/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCrowd } from '../context/CrowdContext';
import {
  HeartPulse,
  Camera,
  Activity,
  AlertTriangle,
  CheckCircle,
  Wifi,
  HardDrive,
  RefreshCw,
  Cpu,
  Layers,
  ShieldAlert,
} from 'lucide-react';

export const CameraHealthTab: React.FC = () => {
  const { cameraHealth, selectScenario, activeScenarioId } = useCrowd();

  const isAnomaly = cameraHealth.status !== 'Online & Stable' || cameraHealth.unexpectedZeroCountDetected;

  return (
    <div className="space-y-5">
      {/* Primary Health Status Banner */}
      <div
        className={`p-5 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all ${
          isAnomaly
            ? 'bg-gradient-to-r from-rose-950/70 via-slate-900 to-slate-900 border-rose-600/80 shadow-xl'
            : 'bg-slate-900/90 border-slate-800'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              isAnomaly
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-400'
                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
            }`}
          >
            <Camera className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white">
                CAM-01: Overhead Concourse 4K Optical Sensor
              </h3>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider font-mono border ${
                  isAnomaly
                    ? 'bg-rose-950 text-rose-300 border-rose-700 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border-emerald-700'
                }`}
              >
                {cameraHealth.status}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Fixed Mount • 4.8m elevation • 35° tilt angle • High-angle concourse FOV
            </p>
          </div>
        </div>

        {/* Quick Diagnostic Trigger for Evaluation */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => selectScenario(activeScenarioId === 'zero-anomaly' ? 'surge' : 'zero-anomaly')}
            className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition border flex items-center gap-1.5 ${
              activeScenarioId === 'zero-anomaly'
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-400'
                : 'bg-rose-950/60 hover:bg-rose-900/60 text-rose-300 border-rose-800/80'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>
              {activeScenarioId === 'zero-anomaly' ? 'Clear Simulated Anomaly' : 'Simulate Lens Obstruction / Zero Count'}
            </span>
          </button>
        </div>
      </div>

      {/* Critical Anomaly Warning Card if Active */}
      {cameraHealth.unexpectedZeroCountDetected && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-700/80 text-xs text-rose-200 space-y-2 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-300 text-sm">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            Silent Failure Warning: Unexpected Zero Count Anomaly Detected
          </div>
          <p className="leading-relaxed">
            The processing pipeline recorded 0 people across all active zones for 4 consecutive sample cycles during a high-activity operational window (11:00-12:00). This indicates a possible silent hardware failure, frozen RTSP buffer, black frame output, or physical lens obstruction rather than an actual empty venue.
          </p>
          <div className="pt-1 flex items-center gap-3 font-mono text-[11px] text-rose-300">
            <span>• Recommended Action: Dispatch security technician to inspect CAM-01 hardware mount.</span>
          </div>
        </div>
      )}

      {/* Hardware & Stream Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Sampling FPS */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Sampled Processing Rate</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {cameraHealth.fps} <span className="text-xs text-slate-400 font-normal">FPS</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Target: 3.5 FPS (from 30fps RTSP)</div>
        </div>

        {/* Dropped Frames */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Dropped Frames Loss</span>
            <Wifi className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400 mt-1">
            {cameraHealth.droppedFramesPercent}%
          </div>
          <div className="text-[11px] text-slate-400 font-mono">18 frames lost in 142k total</div>
        </div>

        {/* Network & Ingest Latency */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Frame Ingest Latency</span>
            <HeartPulse className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            {cameraHealth.lastFrameReceivedMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
          <div className="text-[11px] text-slate-400 font-mono">Camera-to-dashboard delay</div>
        </div>

        {/* Stream Uptime */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Feed Connection Uptime</span>
            <CheckCircle className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-lg font-bold font-mono text-white mt-1">
            {cameraHealth.connectionUptime.split(' ')[0]}
          </div>
          <div className="text-[11px] text-slate-400 font-mono">42h 18m continuous session</div>
        </div>
      </div>

      {/* Detailed Technical Specification */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            Hardware & Video Stream Specification
          </h4>
          <div className="space-y-2 text-slate-300 font-mono text-[11px]">
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Stream Resolution:</span>
              <span className="text-white">3840 x 2160 (Native) / 1920 x 1080 (Ingest)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Encoding / Bitrate:</span>
              <span className="text-white">H.264 High Profile @ 4.6 Mbps</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Lens Focal Length:</span>
              <span className="text-white">4mm Fixed Wide-Angle (84° HFOV)</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-800">
              <span className="text-slate-400">Inference Hardware:</span>
              <span className="text-white">NVIDIA RTX 3050 (6 GB) / TensorRT FP16</span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-400">Database Engine:</span>
              <span className="text-emerald-400">SQLite in WAL mode (concurrent read/write)</span>
            </div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
          <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            Silent Failure Detection Algorithms
          </h4>
          <div className="space-y-2.5 text-slate-300 text-xs">
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-semibold text-white block">1. Zero-Count Anomaly Filter</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Compares recent multi-frame zero counts against historical diurnal baseline (expected minimum 5 occupants during operational hours).
              </span>
            </div>
            <div className="p-2.5 rounded bg-slate-950 border border-slate-800">
              <span className="font-semibold text-white block">2. Frame Jitter & Dropped Frame Monitor</span>
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                Calculates timestamp deltas between sequential frames. Raises warning if frame interval exceeds 1500ms.
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
