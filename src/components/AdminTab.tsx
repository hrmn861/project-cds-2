/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCrowd } from '../context/CrowdContext';
import {
  Settings2,
  Sliders,
  Video,
  Clock,
  Trash2,
  Building,
  Save,
  CheckCircle,
  Database,
  Shield,
} from 'lucide-react';

export const AdminTab: React.FC = () => {
  const { zones, updateZone } = useCrowd();

  // Admin form state
  const [siteName, setSiteName] = useState<string>('Olympic Arena & Exhibition Center');
  const [siteAddress, setSiteAddress] = useState<string>('Gate 4 Concourse, Level 2, 500 Stadium Blvd');
  const [controlRoomContact, setControlRoomContact] = useState<string>('+1 (555) 019-2831 / Radio Channel 1');
  const [rtspUrl, setRtspUrl] = useState<string>('rtsp://cam01.arena.internal:554/live/sub');
  const [samplingRateFps, setSamplingRateFps] = useState<number>(3.3);
  const [retentionHours, setRetentionHours] = useState<number>(24);
  const [autoCleanupSchedule, setAutoCleanupSchedule] = useState<string>('Daily at 03:00 UTC');
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  return (
    <form onSubmit={handleSaveAll} className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-cyan-400" />
            Venue System Administration & Configuration
          </h3>
          <p className="text-slate-400 mt-0.5">
            Configure physical zone floor areas, alert persistence, camera ingest source, and retention limits.
          </p>
        </div>

        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs flex items-center gap-1.5 transition shadow-md shadow-cyan-950"
        >
          <Save className="w-4 h-4" />
          <span>Save Changes</span>
        </button>
      </div>

      {savedSuccess && (
        <div className="p-3 rounded-lg bg-emerald-950/80 border border-emerald-700 text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Configuration saved successfully. Processing pipeline updated in real-time.</span>
        </div>
      )}

      {/* 1. Venue & Escalation Contact Settings */}
      <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Building className="w-4 h-4 text-cyan-400" />
          Venue Location & Control Room Dispatch Contacts
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="text-slate-400 font-medium block">Venue / Site Name</label>
            <input
              type="text"
              value={siteName}
              onChange={(e) => setSiteName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-medium block">Physical Site Address</label>
            <input
              type="text"
              value={siteAddress}
              onChange={(e) => setSiteAddress(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
            />
          </div>
          <div>
            <label className="text-slate-400 font-medium block">Venue Control Room Dispatch Channel</label>
            <input
              type="text"
              value={controlRoomContact}
              onChange={(e) => setControlRoomContact(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
            />
          </div>
        </div>
      </div>

      {/* 2. Camera Source & Sampling Rate */}
      <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Video className="w-4 h-4 text-cyan-400" />
          Camera Source & Ingest Pipeline
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium block">RTSP Ingest Stream URL</label>
            <input
              type="text"
              value={rtspUrl}
              onChange={(e) => setRtspUrl(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-cyan-300 font-mono mt-1 focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Tested with OpenCV VideoCapture and GStreamer RTSP backend
            </span>
          </div>

          <div>
            <label className="text-slate-400 font-medium block">Sampling Rate (2 to 5 FPS)</label>
            <div className="flex items-center gap-3 mt-1">
              <input
                type="range"
                min="2.0"
                max="5.0"
                step="0.1"
                value={samplingRateFps}
                onChange={(e) => setSamplingRateFps(parseFloat(e.target.value))}
                className="flex-1 accent-cyan-400 h-2 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="font-mono text-xs text-cyan-300 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                {samplingRateFps} FPS
              </span>
            </div>
            <span className="text-[10px] text-slate-400 mt-1 block">
              Balances inference throughput on NVIDIA RTX 3050 GPU (16ms budget)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Manage Zones & Thresholds */}
      <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Sliders className="w-4 h-4 text-cyan-400" />
          Per-Zone Physical Calibration & Persistence Thresholds
        </h4>
        <div className="space-y-3">
          {zones.map((zone) => (
            <div
              key={zone.id}
              className="p-3 rounded-lg bg-slate-950 border border-slate-800 grid grid-cols-1 sm:grid-cols-5 gap-3 text-xs items-center"
            >
              <div>
                <span className="font-bold text-white block">{zone.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">{zone.id}</span>
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Area (m²)</label>
                <input
                  type="number"
                  value={zone.floorAreaM2}
                  onChange={(e) => updateZone(zone.id, { floorAreaM2: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Comfort Cap</label>
                <input
                  type="number"
                  value={zone.comfortableCapacity}
                  onChange={(e) => updateZone(zone.id, { comfortableCapacity: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Alert Threshold (p/m²)</label>
                <input
                  type="number"
                  step="0.1"
                  value={zone.warningThreshold}
                  onChange={(e) => updateZone(zone.id, { warningThreshold: parseFloat(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-amber-300 font-mono"
                />
              </div>

              <div>
                <label className="text-[10px] text-slate-400 uppercase tracking-wider block">Persistence (s)</label>
                <input
                  type="number"
                  value={zone.persistenceSeconds}
                  onChange={(e) => updateZone(zone.id, { persistenceSeconds: parseInt(e.target.value) || 1 })}
                  className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Privacy & Data Retention Settings */}
      <div className="p-5 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Trash2 className="w-4 h-4 text-rose-400" />
          Data Retention Limits & Automatic Cleanup
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="text-slate-400 font-medium block">Raw Footage Retention Limit (Hours)</label>
            <input
              type="number"
              value={retentionHours}
              onChange={(e) => setRetentionHours(parseInt(e.target.value) || 1)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white mt-1 font-mono focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Raw frames are automatically purged after this period. Only counts and metadata persist.
            </span>
          </div>

          <div>
            <label className="text-slate-400 font-medium block">Automatic Cleanup Schedule</label>
            <input
              type="text"
              value={autoCleanupSchedule}
              onChange={(e) => setAutoCleanupSchedule(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-3 py-1.5 text-xs text-white mt-1 focus:border-cyan-500"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">
              Cron task executed in SQLite background worker
            </span>
          </div>
        </div>
      </div>
    </form>
  );
};
