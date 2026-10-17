import React, { useState } from 'react';
import { useCrowd } from '../context/CrowdContext';
import { CameraCanvas } from './CameraCanvas';
import { LiveFluctuationChart } from './LiveFluctuationChart';
import { generateCsvReport } from '../utils/crowdMath';
import { 
  Users, 
  AlertTriangle, 
  ShieldCheck, 
  HeartPulse, 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Layers, 
  BellRing, 
  Send,
  Eye,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  CheckCircle
} from 'lucide-react';

export const OverviewTab: React.FC = () => {
  const {
    zones,
    totalPeopleCount,
    zonesAboveNormalCount,
    alerts,
    cameraHealth,
    currentTime,
    setActiveTab,
    setActiveReviewAlert,
    setActiveEscalateAlert,
    setSelectedZoneId,
  } = useCrowd();

  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const pendingAlerts = alerts.filter((a) => a.status === 'Pending Review');
  const activeWarningAlert = pendingAlerts[0];

  const handleExportCsv = () => {
    try {
      const csvContent = generateCsvReport(zones, alerts, cameraHealth, currentTime);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const sanitizedTime = currentTime.replace(/:/g, '-');
      const fileName = `crowd_monitor_snapshot_${sanitizedTime}.csv`;
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportNotice(`Exported ${fileName} (${zones.length} zones, ${alerts.length} alerts)`);
      setTimeout(() => setExportNotice(null), 4000);
    } catch (err) {
      console.error('Failed to export CSV report:', err);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Actions Bar with Export Report */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Live Monitored Concourse Overview
          </span>
          <span className="text-[10px] text-slate-400 font-mono">
            CAM-01 • Single Viewpoint (180.0 m²)
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          {exportNotice && (
            <span className="text-[11px] text-emerald-300 font-mono bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800 flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              {exportNotice}
            </span>
          )}

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition shadow-md shadow-cyan-950 border border-cyan-400/40"
            title="Download CSV snapshot of current zone counts, densities, thresholds, and alert history"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Top Banner Alert (if review requested) */}
      {activeWarningAlert && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 border border-amber-600/70 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-amber-500/20 border border-amber-400/40 flex items-center justify-center text-amber-400 shrink-0">
              <BellRing className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-amber-500 text-slate-950 text-[10px] font-bold uppercase tracking-wider">
                  Review requested
                </span>
                <span className="text-xs text-amber-200/80 font-mono">
                  Triggered at {activeWarningAlert.timestamp}
                </span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                {activeWarningAlert.zoneName}: {activeWarningAlert.triggerReason}
              </h3>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveReviewAlert(activeWarningAlert)}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition flex items-center gap-1.5 shadow-md shadow-amber-950"
            >
              <Eye className="w-4 h-4" />
              Review Feed & Verify
            </button>
          </div>
        </div>
      )}

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Total People */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total People (CAM-01 View)</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-extrabold text-white font-mono tracking-tight">
              {totalPeopleCount}
            </span>
            <span className="text-xs text-cyan-400 font-medium">in 180 m² monitored</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span className="text-emerald-400 font-semibold flex items-center">
              +18.4% <ArrowUpRight className="w-3 h-3 inline" />
            </span>
            <span>vs same hour yesterday</span>
          </div>
        </div>

        {/* Zones Above Normal */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Zones Above Normal</span>
            <AlertTriangle className={`w-4 h-4 ${zonesAboveNormalCount > 0 ? 'text-amber-400' : 'text-slate-500'}`} />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className={`text-2xl sm:text-3xl font-extrabold font-mono tracking-tight ${zonesAboveNormalCount > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {zonesAboveNormalCount}
            </span>
            <span className="text-xs text-slate-400">of 4 zones</span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span>{zonesAboveNormalCount > 0 ? 'Review alerts active' : 'All zones within comfortable level'}</span>
          </div>
        </div>

        {/* Camera Health & Pipeline */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Camera Health</span>
            <HeartPulse className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-emerald-300">
              {cameraHealth.status}
            </span>
            <span className="text-xs font-mono text-slate-400">3.3 FPS</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>Drop: {cameraHealth.droppedFramesPercent}%</span>
            <span>Latency: {cameraHealth.lastFrameReceivedMs}ms</span>
          </div>
        </div>

        {/* Time of Last Update & Status */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 shadow-sm relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Pipeline Status</span>
            <Clock className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-base sm:text-lg font-bold text-cyan-300 font-mono">
              {currentTime}
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800">
              WAL DB
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
            <span>Dual Model: YOLOv8s & CSRNet</span>
          </div>
        </div>
      </div>

      {/* Live Crowd Fluctuation Waveform & Momentum Chart */}
      <LiveFluctuationChart />

      {/* Main Content Layout: Camera Viewport + Zone Occupancy Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Interactive Camera Canvas Viewport */}
        <div className="lg:col-span-7 flex flex-col space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Live Camera Feed (Overhead 4K Sampled)
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700 font-mono">
                FOV calibrated
              </span>
            </div>
            <button
              onClick={() => setActiveTab('replay')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center gap-1"
            >
              Expand to Replay Studio →
            </button>
          </div>

          <CameraCanvas />

          <div className="p-3 bg-slate-900/60 rounded-lg border border-slate-800 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              <span>Live sampling at 3.3 fps from RTSP feed</span>
            </div>
            <span className="font-mono text-slate-400 text-[11px]">No face vectors stored</span>
          </div>
        </div>

        {/* Right: Zone Occupancy Cards & Actions */}
        <div className="lg:col-span-5 flex flex-col space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Zone Occupancy & Density Breakdown
            </span>
            <button
              onClick={() => setActiveTab('zones')}
              className="text-xs text-cyan-400 hover:text-cyan-300 font-medium"
            >
              Full Zone Table →
            </button>
          </div>

          <div className="space-y-2.5">
            {zones.map((zone) => {
              const occupancyPct = Math.min(Math.round((zone.currentCount / zone.comfortableCapacity) * 100), 180);
              const isAbove = zone.status !== 'normal';

              let badgeColor = 'bg-emerald-950 text-emerald-300 border-emerald-800';
              let barColor = 'bg-emerald-500';
              if (zone.status === 'critical') {
                badgeColor = 'bg-rose-950 text-rose-300 border-rose-800';
                barColor = 'bg-rose-500';
              } else if (zone.status === 'warning') {
                badgeColor = 'bg-orange-950 text-orange-300 border-orange-800';
                barColor = 'bg-orange-500';
              } else if (zone.status === 'elevated') {
                badgeColor = 'bg-amber-950 text-amber-300 border-amber-800';
                barColor = 'bg-amber-500';
              }

              return (
                <div
                  key={zone.id}
                  onClick={() => setSelectedZoneId(zone.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isAbove
                      ? 'bg-slate-900/90 border-slate-700 hover:border-slate-500 shadow-md'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                        {zone.name}
                      </h4>
                      <span className="text-[11px] text-slate-400">{zone.floorAreaM2} m² area</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${badgeColor}`}>
                      {zone.status}
                    </span>
                  </div>

                  <div className="mt-3 flex items-baseline justify-between">
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-lg font-bold text-white font-mono">{zone.currentCount}</span>
                      <span className="text-xs text-slate-400">people</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-cyan-300">{zone.density}</span>
                      <span className="text-[10px] text-slate-400 ml-1">p/m² (thresh: {zone.warningThreshold})</span>
                    </div>
                  </div>

                  {/* Density Bar */}
                  <div className="mt-2 w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                      style={{ width: `${Math.min(occupancyPct, 100)}%` }}
                    />
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Capacity: {occupancyPct}% of comfortable</span>
                    <span className={`font-mono flex items-center ${zone.trendRate > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                      {zone.trendRate > 0 ? `+${zone.trendRate}%` : `${zone.trendRate}%`} / 5m
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Review-Then-Escalate Flow Guide Banner */}
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs space-y-2">
            <span className="font-semibold text-slate-200 block text-[11px] uppercase tracking-wider flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Safety Standard: Review, Then Escalate
            </span>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              1. System raises <strong className="text-amber-300">"Review requested"</strong> (never auto-emergency).
              <br />
              2. Reviewer confirms crowd reality against camera feed.
              <br />
              3. Reviewer generates <strong className="text-orange-300">"Escalation summary"</strong> with snapshot for Venue Control Room.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
