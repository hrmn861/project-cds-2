/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCrowd } from '../context/CrowdContext';
import { CameraCanvas } from './CameraCanvas';
import {
  Play,
  Pause,
  RotateCcw,
  FastForward,
  Flag,
  Film,
  Sparkles,
  Cpu,
  Layers,
  Radio,
  Clock,
  Maximize2,
} from 'lucide-react';

export const LiveReplayTab: React.FC = () => {
  const {
    isPlaying,
    setIsPlaying,
    playbackSpeed,
    setPlaybackSpeed,
    timelineSeconds,
    setTimelineSeconds,
    currentTime,
    zones,
    cameraHealth,
  } = useCrowd();

  const [selectedSource, setSelectedSource] = useState<string>('clip-1');
  const [activeModelMode, setActiveModelMode] = useState<'Dual-Adaptive' | 'YOLO-Only' | 'CSRNet-Only'>('Dual-Adaptive');

  // Timeline events/markers (seconds from 0 to 3600)
  const timelineMarkers = [
    { sec: 900, label: '11:15 - Ingress Surge Influx', type: 'warning' },
    { sec: 1260, label: '11:21 - Escalation ESC-042 Dispatched', type: 'escalation' },
    { sec: 2040, label: '11:34 - Peak Density in Zone B (2.87 p/m²)', type: 'alert' },
  ];

  const formatTimelineTime = (seconds: number) => {
    const startHour = 11;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${startHour}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Top Controls: Source & Stream Info */}
      <div className="p-3.5 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <Film className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-200">Video Source:</span>
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-mono focus:border-cyan-500"
          >
            <option value="clip-1">CAM-01_20261016_1100_Ingress.mp4 (High Angle 4K)</option>
            <option value="clip-2">CAM-01_20261016_1130_PeakCrowd.mp4 (Pre-Show Rush)</option>
            <option value="rtsp">RTSP Stream (rtsp://cam01.arena.internal:554/live)</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 font-mono text-[11px] text-slate-300">
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>Sampled: 3.3 fps</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded border border-slate-800 text-[11px]">
            <span className="text-slate-400">Model Pipeline:</span>
            <select
              value={activeModelMode}
              onChange={(e) => setActiveModelMode(e.target.value as any)}
              className="bg-transparent text-cyan-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="Tri-Model" className="bg-slate-900">Tri-Model Ensemble (YOLO + CSRNet + DM-Count)</option>
              <option value="DM-Count" className="bg-slate-900">DM-Count (Pretrained Dense OT Matching)</option>
              <option value="YOLO-Only" className="bg-slate-900">YOLOv8s Only (Sparse BBoxes)</option>
              <option value="CSRNet-Only" className="bg-slate-900">CSRNet Only (Dilated Conv Density Map)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Primary Video Canvas */}
      <div className="relative">
        <CameraCanvas className="shadow-2xl" />
      </div>

      {/* Timeline Scrubber & Playback Bar */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
        {/* Scrubber Track with Incident Flags */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>11:00:00</span>
            <span className="text-cyan-300 font-bold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
              Scrubber Position: {formatTimelineTime(timelineSeconds)}
            </span>
            <span>12:00:00 (1h Window)</span>
          </div>

          <div className="relative w-full py-2">
            <input
              type="range"
              min="0"
              max="3600"
              step="1"
              value={timelineSeconds}
              onChange={(e) => setTimelineSeconds(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />

            {/* Incident Markers on Timeline */}
            <div className="relative w-full h-4 mt-1">
              {timelineMarkers.map((m, idx) => {
                const leftPct = (m.sec / 3600) * 100;
                return (
                  <button
                    key={idx}
                    onClick={() => setTimelineSeconds(m.sec)}
                    style={{ left: `${leftPct}%` }}
                    className="absolute -translate-x-1/2 flex items-center gap-1 group text-[10px]"
                    title={`Jump to ${m.label}`}
                  >
                    <Flag
                      className={`w-3.5 h-3.5 ${
                        m.type === 'escalation'
                          ? 'text-orange-400'
                          : m.type === 'alert'
                          ? 'text-rose-400'
                          : 'text-amber-400'
                      }`}
                    />
                    <span className="hidden group-hover:block absolute bottom-5 left-1/2 -translate-x-1/2 bg-slate-950 text-slate-200 px-2 py-0.5 rounded border border-slate-700 whitespace-nowrap z-30 font-mono">
                      {m.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Playback Controls & Speed */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="p-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold transition flex items-center gap-1.5"
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              <span>{isPlaying ? 'Pause Feed' : 'Resume Playback'}</span>
            </button>

            <button
              onClick={() => setTimelineSeconds(2280)}
              className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition flex items-center gap-1"
            >
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Jump to Live</span>
            </button>
          </div>

          {/* Speed Buttons */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
            <span className="text-[10px] text-slate-400 px-2">Speed:</span>
            {[0.5, 1, 2].map((spd) => (
              <button
                key={spd}
                onClick={() => setPlaybackSpeed(spd)}
                className={`px-2 py-1 rounded text-xs font-mono font-semibold transition ${
                  playbackSpeed === spd
                    ? 'bg-cyan-500 text-slate-950'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {spd}x
              </button>
            ))}
          </div>

          {/* Inference Latency Breakdown */}
          <div className="hidden lg:flex items-center gap-2.5 text-[11px] text-slate-400 font-mono">
            <span>YOLOv8s: <strong className="text-cyan-300">14.2ms</strong></span>
            <span>•</span>
            <span>CSRNet: <strong className="text-orange-300">22.8ms</strong></span>
            <span>•</span>
            <span>DM-Count: <strong className="text-purple-300">28.1ms</strong></span>
            <span>•</span>
            <span>Fused: <strong className="text-emerald-300">48.5ms</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
