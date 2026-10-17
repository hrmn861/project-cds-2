/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { useCrowd } from '../context/CrowdContext';
import {
  TrendingUp,
  Activity,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
} from 'lucide-react';

interface HistoryPoint {
  timeStr: string;
  total: number;
  totalDensity: number;
  zoneCounts: Record<string, number>;
  zoneDensities: Record<string, number>;
}

export const LiveFluctuationChart: React.FC = () => {
  const { zones, totalPeopleCount, currentTime, isPlaying, playbackSpeed } = useCrowd();

  const [timeWindow, setTimeWindow] = useState<'30s' | '60s' | '5m'>('30s');
  const [metricMode, setMetricMode] = useState<'count' | 'density'>('count');
  const [activeZoneFilter, setActiveZoneFilter] = useState<string>('all');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const totalArea = zones.reduce((sum, z) => sum + z.floorAreaM2, 0);
  const avgDensity = Math.round((totalPeopleCount / totalArea) * 100) / 100;

  // Sliding history window for real-time fluctuation points
  const [history, setHistory] = useState<HistoryPoint[]>(() => {
    // Generate initial synthetic 30-point baseline curve ending at current values
    const initial: HistoryPoint[] = [];
    const now = new Date();
    const count = 30;

    for (let i = count - 1; i >= 0; i--) {
      const pastSec = new Date(now.getTime() - i * 1000);
      const timeStr = pastSec.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });

      // Realistic minor historical fluctuation around current count
      const variance = Math.sin(i * 0.4) * 8 + (Math.random() - 0.5) * 4;
      const baseTotal = Math.max(0, Math.round(totalPeopleCount - variance * (i / 10)));

      const zCounts: Record<string, number> = {};
      const zDensities: Record<string, number> = {};

      zones.forEach((z) => {
        const zVar = Math.sin(i * 0.5 + z.floorAreaM2) * 3 + (Math.random() - 0.5) * 2;
        const c = Math.max(0, Math.round(z.currentCount - zVar * (i / 15)));
        zCounts[z.id] = c;
        zDensities[z.id] = Math.round((c / z.floorAreaM2) * 100) / 100;
      });

      initial.push({
        timeStr,
        total: baseTotal,
        totalDensity: Math.round((baseTotal / totalArea) * 100) / 100,
        zoneCounts: zCounts,
        zoneDensities: zDensities,
      });
    }
    return initial;
  });

  // Ticker: append new live data point every second when playing
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setHistory((prev) => {
        // Micro fluctuation noise to simulate pedestrian footsteps & live gate flow
        const zCounts: Record<string, number> = {};
        const zDensities: Record<string, number> = {};
        let sumCounts = 0;

        zones.forEach((z) => {
          // Micro step fluctuation ±2
          const microDelta = Math.round((Math.random() - 0.48) * 3);
          const c = Math.max(0, z.currentCount + microDelta);
          zCounts[z.id] = c;
          zDensities[z.id] = Math.round((c / z.floorAreaM2) * 100) / 100;
          sumCounts += c;
        });

        const newPoint: HistoryPoint = {
          timeStr: currentTime,
          total: sumCounts,
          totalDensity: Math.round((sumCounts / totalArea) * 100) / 100,
          zoneCounts: zCounts,
          zoneDensities: zDensities,
        };

        const maxPoints = timeWindow === '30s' ? 30 : timeWindow === '60s' ? 60 : 120;
        const updated = [...prev, newPoint];
        if (updated.length > maxPoints) {
          return updated.slice(-maxPoints);
        }
        return updated;
      });
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed, zones, currentTime, totalArea, timeWindow]);

  // Compute instantaneous velocity (rate of change over the last 10 seconds)
  const currentTotal = history.length > 0 ? history[history.length - 1].total : totalPeopleCount;
  const pastTenTotal = history.length >= 10 ? history[history.length - 10].total : currentTotal;
  const deltaRecent = currentTotal - pastTenTotal;
  const momentumLabel =
    deltaRecent > 6
      ? 'Surging (+ High Ingress)'
      : deltaRecent > 1
      ? 'Gradual Growth'
      : deltaRecent < -6
      ? 'Rapid Egress'
      : deltaRecent < -1
      ? 'Gradual Egress'
      : 'Steady-State';

  // Zone colors palette
  const zoneColors: Record<string, { stroke: string; fill: string; dot: string }> = {
    'zone-a': { stroke: '#38bdf8', fill: 'rgba(56, 189, 248, 0.1)', dot: 'bg-sky-400' },
    'zone-b': { stroke: '#f97316', fill: 'rgba(249, 115, 22, 0.15)', dot: 'bg-orange-500' },
    'zone-c': { stroke: '#10b981', fill: 'rgba(16, 185, 129, 0.1)', dot: 'bg-emerald-400' },
    'zone-d': { stroke: '#eab308', fill: 'rgba(234, 179, 8, 0.1)', dot: 'bg-amber-400' },
  };

  // Determine scaling min/max
  const valuesToScale = history.map((pt) => {
    if (metricMode === 'density') {
      return activeZoneFilter === 'all'
        ? pt.totalDensity
        : pt.zoneDensities[activeZoneFilter] || 0;
    }
    return activeZoneFilter === 'all'
      ? pt.total
      : pt.zoneCounts[activeZoneFilter] || 0;
  });

  const rawMin = Math.min(...valuesToScale, 0);
  const rawMax = Math.max(...valuesToScale, metricMode === 'density' ? 3.0 : 100);
  const minVal = Math.max(0, Math.floor(rawMin * 0.85));
  const maxVal = Math.ceil(rawMax * 1.15) || 10;
  const range = maxVal - minVal || 1;

  // Generate SVG path points
  const svgWidth = 800;
  const svgHeight = 200;
  const paddingX = 45;
  const paddingY = 25;
  const graphWidth = svgWidth - paddingX * 2;
  const graphHeight = svgHeight - paddingY * 2;

  const getCoordinates = (val: number, idx: number, totalPts: number) => {
    const x = paddingX + (idx / Math.max(1, totalPts - 1)) * graphWidth;
    const y = svgHeight - paddingY - ((val - minVal) / range) * graphHeight;
    return { x, y };
  };

  // Build SVG polygon area & polyline
  const activePts = history.map((pt, idx) => {
    const val =
      metricMode === 'density'
        ? activeZoneFilter === 'all'
          ? pt.totalDensity
          : pt.zoneDensities[activeZoneFilter] || 0
        : activeZoneFilter === 'all'
        ? pt.total
        : pt.zoneCounts[activeZoneFilter] || 0;
    return getCoordinates(val, idx, history.length);
  });

  const pathD = activePts.reduce(
    (acc, curr, idx) => (idx === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`),
    ''
  );

  const areaD =
    activePts.length > 0
      ? `${pathD} L ${activePts[activePts.length - 1].x} ${svgHeight - paddingY} L ${
          activePts[0].x
        } ${svgHeight - paddingY} Z`
      : '';

  const hoveredPoint =
    hoveredIndex !== null && history[hoveredIndex] ? history[hoveredIndex] : null;

  return (
    <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 shadow-md space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="h-8 w-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Live Crowd Fluctuations & Influx Stream
              </h3>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Live 1s Tick
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Instantaneous real-time occupancy oscillations and velocity across monitored camera FOV
            </p>
          </div>
        </div>

        {/* Action Controls & Filters */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Time Window */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
            <span className="text-slate-400 px-1.5">Window:</span>
            {(['30s', '60s', '5m'] as const).map((win) => (
              <button
                key={win}
                onClick={() => setTimeWindow(win)}
                className={`px-2 py-0.5 rounded transition ${
                  timeWindow === win
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {win}
              </button>
            ))}
          </div>

          {/* Metric Mode */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setMetricMode('count')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                metricMode === 'count'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Headcount (p)
            </button>
            <button
              onClick={() => setMetricMode('density')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                metricMode === 'density'
                  ? 'bg-cyan-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Density (p/m²)
            </button>
          </div>
        </div>
      </div>

      {/* Real-Time Telemetry Micro-Pills */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
            Instantaneous Total
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-white">{currentTotal}</span>
            <span className="text-[11px] text-slate-400 font-sans">people</span>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
            10-Second Delta
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span
              className={`text-lg font-bold flex items-center ${
                deltaRecent > 0
                  ? 'text-amber-400'
                  : deltaRecent < 0
                  ? 'text-emerald-400'
                  : 'text-slate-300'
              }`}
            >
              {deltaRecent > 0 ? `+${deltaRecent}` : deltaRecent}
              {deltaRecent > 0 ? (
                <ArrowUpRight className="w-4 h-4 ml-0.5" />
              ) : deltaRecent < 0 ? (
                <ArrowDownRight className="w-4 h-4 ml-0.5" />
              ) : null}
            </span>
            <span className="text-[10px] text-slate-400 font-sans">last 10s</span>
          </div>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
            Flow Momentum
          </span>
          <div className="mt-0.5 text-xs font-bold text-cyan-300 font-sans truncate">
            {momentumLabel}
          </div>
          <span className="text-[10px] text-slate-400">rate velocity</span>
        </div>

        <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80">
          <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-sans">
            Mean FOV Density
          </span>
          <div className="flex items-baseline gap-1 mt-0.5">
            <span className="text-lg font-bold text-orange-400">{avgDensity}</span>
            <span className="text-[10px] text-slate-400 font-sans">p/m²</span>
          </div>
        </div>
      </div>

      {/* Zone Series Selector Pills */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-[11px] text-slate-400 font-semibold mr-1">Display Stream:</span>
        <button
          onClick={() => setActiveZoneFilter('all')}
          className={`px-2.5 py-1 rounded text-[11px] font-semibold transition ${
            activeZoneFilter === 'all'
              ? 'bg-cyan-500 text-slate-950 shadow-sm'
              : 'bg-slate-950 text-slate-300 hover:bg-slate-800 border border-slate-800'
          }`}
        >
          Total Monitored Area (All Zones)
        </button>

        {zones.map((zone) => {
          const isFilterActive = activeZoneFilter === zone.id;
          const colorInfo = zoneColors[zone.id] || { dot: 'bg-slate-400' };

          return (
            <button
              key={zone.id}
              onClick={() => setActiveZoneFilter(zone.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium transition border ${
                isFilterActive
                  ? 'bg-slate-800 text-white border-cyan-500 shadow-sm'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${colorInfo.dot}`} />
              <span>{zone.name.split('-')[0].trim()}</span>
              <span className="font-mono text-[10px] text-slate-400">
                ({metricMode === 'density' ? `${zone.density}p/m²` : `${zone.currentCount}p`})
              </span>
            </button>
          );
        })}
      </div>

      {/* Primary SVG Live Waveform Chart */}
      <div className="relative bg-slate-950 rounded-xl border border-slate-800/90 p-2 overflow-hidden">
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 select-none"
          onMouseLeave={() => setHoveredIndex(null)}
        >
          <defs>
            <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
              <stop offset="70%" stopColor="#0891b2" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#0891b2" stopOpacity="0" />
            </linearGradient>

            <linearGradient id="gridGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.1" />
            </linearGradient>
          </defs>

          {/* Horizontal grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((pct, idx) => {
            const y = paddingY + pct * graphHeight;
            const gridVal = Math.round(maxVal - pct * range);
            return (
              <g key={idx}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={svgWidth - paddingX}
                  y2={y}
                  stroke="#1e293b"
                  strokeDasharray="3 3"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  fill="#64748b"
                  fontSize="9"
                  fontFamily="JetBrains Mono"
                  textAnchor="end"
                >
                  {gridVal}
                  {metricMode === 'density' ? 'p' : ''}
                </text>
              </g>
            );
          })}

          {/* Capacity warning threshold reference line (if viewing total or specific zone) */}
          {activeZoneFilter === 'all' && (
            <g>
              <line
                x1={paddingX}
                y1={svgHeight - paddingY - ((250 - minVal) / range) * graphHeight}
                x2={svgWidth - paddingX}
                y2={svgHeight - paddingY - ((250 - minVal) / range) * graphHeight}
                stroke="#f59e0b"
                strokeWidth="1"
                strokeDasharray="4 4"
                opacity="0.6"
              />
              <text
                x={svgWidth - paddingX - 4}
                y={svgHeight - paddingY - ((250 - minVal) / range) * graphHeight - 4}
                fill="#f59e0b"
                fontSize="8"
                fontFamily="JetBrains Mono"
                textAnchor="end"
              >
                Safe Comfort Threshold (250p)
              </text>
            </g>
          )}

          {/* Area fill */}
          {areaD && <path d={areaD} fill="url(#areaGradient)" />}

          {/* Line stroke */}
          {pathD && (
            <path
              d={pathD}
              fill="none"
              stroke="#22d3ee"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {/* Interactive Data Points & Hover Targets */}
          {activePts.map((pt, idx) => {
            const isHovered = hoveredIndex === idx;
            const isLatest = idx === activePts.length - 1;

            return (
              <g
                key={idx}
                onMouseEnter={() => setHoveredIndex(idx)}
                className="cursor-pointer"
              >
                {/* Transparent wider hit zone */}
                <circle cx={pt.x} cy={pt.y} r={10} fill="transparent" />

                {/* Point */}
                {(isHovered || isLatest) && (
                  <>
                    <circle
                      cx={pt.x}
                      cy={pt.y}
                      r={isHovered ? 5 : 3.5}
                      fill={isHovered ? '#f59e0b' : '#38bdf8'}
                      stroke="#0f172a"
                      strokeWidth="2"
                    />
                    {isLatest && (
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={7}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth="1.5"
                        opacity="0.75"
                        className="animate-ping"
                      />
                    )}
                  </>
                )}
              </g>
            );
          })}

          {/* Hover Crosshair Line */}
          {hoveredIndex !== null && activePts[hoveredIndex] && (
            <line
              x1={activePts[hoveredIndex].x}
              y1={paddingY}
              x2={activePts[hoveredIndex].x}
              y2={svgHeight - paddingY}
              stroke="#38bdf8"
              strokeWidth="1"
              strokeDasharray="2 2"
            />
          )}

          {/* Bottom Time Axis Labels */}
          {history.length > 0 && (
            <>
              <text
                x={paddingX}
                y={svgHeight - 6}
                fill="#64748b"
                fontSize="9"
                fontFamily="JetBrains Mono"
                textAnchor="start"
              >
                {history[0].timeStr}
              </text>
              <text
                x={svgWidth - paddingX}
                y={svgHeight - 6}
                fill="#38bdf8"
                fontSize="9"
                fontFamily="JetBrains Mono"
                fontWeight="bold"
                textAnchor="end"
              >
                Now ({history[history.length - 1].timeStr})
              </text>
            </>
          )}
        </svg>

        {/* Floating Tooltip details when hovering */}
        {hoveredPoint && hoveredIndex !== null && (
          <div className="absolute top-3 right-3 bg-slate-900/95 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono z-20 pointer-events-none">
            <div className="flex items-center gap-1.5 text-cyan-400 font-bold border-b border-slate-800 pb-1">
              <Clock className="w-3 h-3" />
              <span>Snapshot at {hoveredPoint.timeStr}</span>
            </div>
            <div className="mt-1.5 space-y-0.5 text-[11px]">
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-sans">Total Count:</span>
                <span className="font-bold text-white">{hoveredPoint.total} p</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400 font-sans">Mean Density:</span>
                <span className="font-bold text-orange-400">{hoveredPoint.totalDensity} p/m²</span>
              </div>
              <div className="border-t border-slate-800/80 my-1 pt-1 space-y-0.5">
                {zones.map((z) => (
                  <div key={z.id} className="flex justify-between gap-4 text-[10px]">
                    <span className="text-slate-400">{z.name.split('-')[0].trim()}:</span>
                    <span className="text-slate-200">
                      {hoveredPoint.zoneCounts[z.id] || 0}p ({hoveredPoint.zoneDensities[z.id] || 0}p/m²)
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
