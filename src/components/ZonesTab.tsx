/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useCrowd } from '../context/CrowdContext';
import {
  Grid3X3,
  Sliders,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  Shield,
  Clock,
  Layers,
  ChevronRight,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { DIURNAL_HISTORY } from '../data/mockData';

export const ZonesTab: React.FC = () => {
  const { zones, selectedZoneId, setSelectedZoneId, updateZone, alerts, role } = useCrowd();

  const selectedZone = zones.find((z) => z.id === selectedZoneId) || zones[1]; // default to Zone B

  const zoneAlerts = alerts.filter((a) => a.zoneId === selectedZone.id);

  return (
    <div className="space-y-5">
      {/* Table & Overview */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Grid3X3 className="w-4 h-4 text-cyan-400" />
              Calibrated Camera Zone Directory
            </h3>
            <p className="text-xs text-slate-400">
              Single camera viewpoint partitioned into 4 distinct physical floor zones (180.0 m² total)
            </p>
          </div>
          <span className="text-[11px] font-mono text-cyan-300 bg-cyan-950/60 px-2.5 py-1 rounded border border-cyan-800/60">
            Total Monitored Area: 180.0 m²
          </span>
        </div>

        {/* Zones Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                <th className="py-2.5 px-3">Zone Identifier</th>
                <th className="py-2.5 px-3">Floor Area</th>
                <th className="py-2.5 px-3">Comfort / Max Cap</th>
                <th className="py-2.5 px-3">Current Count</th>
                <th className="py-2.5 px-3">Density (p/m²)</th>
                <th className="py-2.5 px-3">5m Trend</th>
                <th className="py-2.5 px-3">Threshold</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono">
              {zones.map((zone) => {
                const isSelected = selectedZone.id === zone.id;
                let statusBadge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                if (zone.status === 'critical') statusBadge = 'bg-rose-950 text-rose-300 border-rose-800';
                else if (zone.status === 'warning') statusBadge = 'bg-orange-950 text-orange-300 border-orange-800';
                else if (zone.status === 'elevated') statusBadge = 'bg-amber-950 text-amber-300 border-amber-800';

                return (
                  <tr
                    key={zone.id}
                    onClick={() => setSelectedZoneId(zone.id)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-cyan-950/30 font-medium text-white'
                        : 'hover:bg-slate-850/60 text-slate-300'
                    }`}
                  >
                    <td className="py-3 px-3 font-sans">
                      <div className="font-bold text-white text-xs">{zone.name}</div>
                      <div className="text-[10px] text-slate-400 font-normal">{zone.description}</div>
                    </td>
                    <td className="py-3 px-3 text-slate-300">{zone.floorAreaM2} m²</td>
                    <td className="py-3 px-3 text-slate-300">
                      {zone.comfortableCapacity} / <span className="text-slate-400">{zone.maxCapacity}</span>
                    </td>
                    <td className="py-3 px-3 font-bold text-cyan-400 text-sm">
                      {zone.currentCount}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-100">
                      {zone.density} <span className="text-[10px] text-slate-400 font-normal">p/m²</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`flex items-center text-xs ${zone.trendRate > 0 ? 'text-amber-400' : 'text-slate-400'}`}>
                        {zone.trendRate > 0 ? `+${zone.trendRate}%` : `${zone.trendRate}%`}
                        {zone.trendRate > 0 ? <ArrowUpRight className="w-3.5 h-3.5 inline ml-0.5" /> : null}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {zone.warningThreshold} p/m² ({zone.persistenceSeconds}s)
                    </td>
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold border ${statusBadge}`}>
                        {zone.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedZoneId(zone.id);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 text-xs font-sans transition"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Deep-Dive Inspection Panel for Selected Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left: Zone Telemetry & Diurnal Comparison */}
        <div className="lg:col-span-8 p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div>
              <span className="text-xs font-mono text-cyan-400 uppercase tracking-wider block">Zone Deep Dive</span>
              <h3 className="text-base font-bold text-white">{selectedZone.name}</h3>
            </div>
            <div className="text-right">
              <span className="text-xl font-bold font-mono text-cyan-300">{selectedZone.currentCount}</span>
              <span className="text-xs text-slate-400 ml-1">people ({selectedZone.density} p/m²)</span>
            </div>
          </div>

          {/* Diurnal Hourly Comparison Chart (Today vs 7-day Historical Baseline) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-cyan-400" />
                Hourly Diurnal Comparison (Today vs 7-Day Baseline Average)
              </span>
              <div className="flex items-center gap-3 text-[10px] text-slate-400">
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                  <span>Today Count</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="w-2.5 h-2.5 rounded bg-slate-600" />
                  <span>Baseline Avg</span>
                </div>
              </div>
            </div>

            {/* Simulated Bar Chart */}
            <div className="h-44 bg-slate-950 p-3 rounded-lg border border-slate-800 flex items-end justify-between gap-1.5 pt-6">
              {DIURNAL_HISTORY.map((pt) => {
                const maxBar = 460;
                const todayH = (pt.todayCount / maxBar) * 100;
                const baseH = (pt.baselineAvgCount / maxBar) * 100;
                const isCurrent = pt.label.includes('Now');

                return (
                  <div key={pt.hour} className="flex-1 flex flex-col items-center h-full justify-end group relative">
                    {/* Tooltip */}
                    <div className="hidden group-hover:block absolute bottom-full mb-2 bg-slate-900 border border-slate-700 text-slate-200 text-[10px] p-1.5 rounded z-30 whitespace-nowrap shadow-xl">
                      <div className="font-bold text-white">{pt.label}</div>
                      <div>Today: <span className="text-cyan-400 font-mono">{pt.todayCount}</span></div>
                      <div>Baseline: <span className="text-slate-400 font-mono">{pt.baselineAvgCount}</span></div>
                    </div>

                    <div className="w-full flex items-end justify-center gap-0.5 h-full">
                      <div
                        className={`w-2 sm:w-3 rounded-t transition-all ${
                          isCurrent ? 'bg-amber-400 shadow-md shadow-amber-950' : 'bg-cyan-500'
                        }`}
                        style={{ height: `${todayH}%` }}
                      />
                      <div
                        className="w-2 sm:w-3 bg-slate-700 rounded-t"
                        style={{ height: `${baseH}%` }}
                      />
                    </div>
                    <span className="text-[9px] text-slate-400 font-mono mt-1">
                      {pt.hour}h
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Historical Alert Log for this Zone */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-slate-300 block">
              Recent Review Requests in this Zone:
            </span>
            {zoneAlerts.length > 0 ? (
              <div className="space-y-2">
                {zoneAlerts.map((alt) => (
                  <div
                    key={alt.id}
                    className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-cyan-400 font-semibold">{alt.id}</span>
                        <span className="text-slate-400 font-mono text-[11px]">{alt.timestamp}</span>
                        <span className="px-1.5 py-0.2 rounded bg-amber-950 text-amber-300 text-[10px] font-bold uppercase border border-amber-800">
                          {alt.status}
                        </span>
                      </div>
                      <p className="text-slate-300 text-[11px] mt-0.5">{alt.triggerReason}</p>
                    </div>
                    <span className="font-mono text-amber-400 font-bold">{alt.densityValue} p/m²</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-3 text-center text-slate-400 text-xs bg-slate-950 rounded border border-slate-800">
                No active or historical alerts logged for this zone.
              </div>
            )}
          </div>
        </div>

        {/* Right: Zone Calibration & Threshold Configuration */}
        <div className="lg:col-span-4 p-4 bg-slate-900/80 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Zone Calibration Parameters
            </h4>
            <span className="text-[10px] text-slate-400 font-mono">{selectedZone.id}</span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-[11px] text-slate-400 block font-medium">Floor Area (m²)</label>
              <input
                type="number"
                value={selectedZone.floorAreaM2}
                onChange={(e) => updateZone(selectedZone.id, { floorAreaM2: parseFloat(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Derived from physical laser measurement on camera mounting
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block font-medium">Comfortable Capacity (people)</label>
              <input
                type="number"
                value={selectedZone.comfortableCapacity}
                onChange={(e) => updateZone(selectedZone.id, { comfortableCapacity: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono focus:border-cyan-500"
              />
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block font-medium">Warning Threshold (density p/m²)</label>
              <input
                type="number"
                step="0.1"
                value={selectedZone.warningThreshold}
                onChange={(e) => updateZone(selectedZone.id, { warningThreshold: parseFloat(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-amber-300 mt-1 font-mono focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Triggers "Review requested" alert when sustained
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block font-medium">Persistence Requirement (seconds)</label>
              <input
                type="number"
                value={selectedZone.persistenceSeconds}
                onChange={(e) => updateZone(selectedZone.id, { persistenceSeconds: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Duration density must exceed threshold to prevent frame noise spikes
              </span>
            </div>

            <div>
              <label className="text-[11px] text-slate-400 block font-medium">Cooldown Duration (minutes)</label>
              <input
                type="number"
                value={selectedZone.cooldownMinutes}
                onChange={(e) => updateZone(selectedZone.id, { cooldownMinutes: parseInt(e.target.value) || 1 })}
                className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1.5 text-xs text-white mt-1 font-mono focus:border-cyan-500"
              />
              <span className="text-[10px] text-slate-400 mt-0.5 block">
                Prevents alert fatigue during continuous human handling
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
