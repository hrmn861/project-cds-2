/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useCrowd } from '../context/CrowdContext';
import {
  MODEL_COMPARISON_TIMELINE,
  HOURLY_HEATMAP_24H,
} from '../data/mockData';
import {
  ResponsiveContainer,
  ComposedChart,
  Area,
  Line,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  Layers,
  HelpCircle,
  Activity,
  Clock,
  Sparkles,
  Calendar,
  Filter,
  BarChart3,
  Cpu,
  CheckCircle2,
  Info,
} from 'lucide-react';

export const TrendsTab: React.FC = () => {
  const { zones } = useCrowd();

  // Dashboard state controls
  const [chartViewMode, setChartViewMode] = useState<'comparative' | 'stacked'>('comparative');
  const [hourFilter, setHourFilter] = useState<'all' | 'ingress' | 'egress'>('all');
  const [selectedHeatmapHour, setSelectedHeatmapHour] = useState<number>(11); // 11:00 (Now)
  const [modelTimelineMetric, setModelTimelineMetric] = useState<'count' | 'error'>('count');

  // Filter 24-hour heatmap data based on selected range
  const filteredHeatmapData = HOURLY_HEATMAP_24H.filter((cell) => {
    if (hourFilter === 'ingress') return cell.hour >= 6 && cell.hour <= 14;
    if (hourFilter === 'egress') return cell.hour >= 15 && cell.hour <= 23;
    return true;
  });

  const activeHourDetails = HOURLY_HEATMAP_24H.find((c) => c.hour === selectedHeatmapHour) || HOURLY_HEATMAP_24H[11];

  // Custom Recharts Tooltip for 24h occupancy chart
  const CustomOccupancyTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 border border-slate-700 p-3 rounded-lg shadow-2xl text-xs font-mono space-y-1.5 z-40">
          <div className="flex items-center justify-between border-b border-slate-800 pb-1 gap-4">
            <span className="font-bold text-white flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              {data.hourLabel}
            </span>
            <span
              className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-bold ${
                data.status === 'critical'
                  ? 'bg-rose-950 text-rose-300 border border-rose-800'
                  : data.status === 'warning'
                  ? 'bg-orange-950 text-orange-300 border border-orange-800'
                  : data.status === 'elevated'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              }`}
            >
              {data.status}
            </span>
          </div>

          {chartViewMode === 'comparative' ? (
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between gap-4">
                <span className="text-cyan-400">Today Count:</span>
                <span className="font-bold text-white">{data.total} p ({data.avgDensity} p/m²)</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-purple-400">Yesterday:</span>
                <span className="font-medium text-slate-300">{data.yesterdayTotal} p</span>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-slate-400">7-Day Baseline:</span>
                <span className="font-medium text-slate-400">{data.baselineAvg} p</span>
              </div>
              <div className="flex justify-between gap-4 border-t border-slate-800 pt-1 text-[10px]">
                <span className="text-slate-400">Delta vs Yesterday:</span>
                <span className={`font-bold ${data.total >= data.yesterdayTotal ? 'text-amber-400' : 'text-emerald-400'}`}>
                  {data.total >= data.yesterdayTotal ? `+${data.total - data.yesterdayTotal}` : data.total - data.yesterdayTotal} p
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-1 text-[11px] pt-1">
              <div className="flex justify-between gap-4 text-sky-400">
                <span>Zone A (Turnstiles):</span>
                <span className="font-bold">{data.zoneA} p</span>
              </div>
              <div className="flex justify-between gap-4 text-orange-400">
                <span>Zone B (Concourse):</span>
                <span className="font-bold">{data.zoneB} p</span>
              </div>
              <div className="flex justify-between gap-4 text-emerald-400">
                <span>Zone C (Merch/Food):</span>
                <span className="font-bold">{data.zoneC} p</span>
              </div>
              <div className="flex justify-between gap-4 text-amber-400">
                <span>Zone D (Stairwell):</span>
                <span className="font-bold">{data.zoneD} p</span>
              </div>
              <div className="border-t border-slate-800 pt-1 flex justify-between font-bold text-white">
                <span>Total Concourse:</span>
                <span>{data.total} p</span>
              </div>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Overview Header */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            24-Hour Comparative Occupancy & Tri-Model Trend Intelligence
          </h3>
          <p className="text-slate-400 mt-0.5">
            Interactive Recharts comparative diurnal heatmaps and pretrained DM-Count optimal transport crowd benchmarking
          </p>
        </div>

        {/* View Mode & Filter Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Hour range filter */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 font-mono text-[11px]">
            <span className="text-slate-400 px-1.5">Hours:</span>
            <button
              onClick={() => setHourFilter('all')}
              className={`px-2 py-0.5 rounded transition ${
                hourFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All 24h
            </button>
            <button
              onClick={() => setHourFilter('ingress')}
              className={`px-2 py-0.5 rounded transition ${
                hourFilter === 'ingress' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Ingress (06-14h)
            </button>
            <button
              onClick={() => setHourFilter('egress')}
              className={`px-2 py-0.5 rounded transition ${
                hourFilter === 'egress' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Egress (15-23h)
            </button>
          </div>

          {/* Chart Display Mode */}
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-[11px]">
            <button
              onClick={() => setChartViewMode('comparative')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                chartViewMode === 'comparative' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Multi-Day Compare
            </button>
            <button
              onClick={() => setChartViewMode('stacked')}
              className={`px-2.5 py-1 rounded font-medium transition ${
                chartViewMode === 'stacked' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Zone Stacking
            </button>
          </div>
        </div>
      </div>

      {/* 1. Primary Recharts 24-Hour Comparative Interactive Dashboard Panel */}
      <div className="p-5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              24-Hour Continuous Concourse Occupancy Trajectory
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {chartViewMode === 'comparative'
                ? 'Comparing Today vs Yesterday vs 7-Day Baseline Average with safe capacity thresholds'
                : 'Stacked zone contribution across Turnstiles (A), Main Concourse (B), Concessions (C), and Stairwell (D)'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-xs font-mono">
            {chartViewMode === 'comparative' ? (
              <>
                <span className="flex items-center gap-1.5 text-cyan-400 font-semibold">
                  <span className="w-2.5 h-2.5 rounded bg-cyan-400" />
                  Today (Area)
                </span>
                <span className="flex items-center gap-1.5 text-purple-400 font-semibold">
                  <span className="w-2.5 h-1 bg-purple-400" />
                  Yesterday (Line)
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded bg-slate-600" />
                  7-Day Baseline (Bar)
                </span>
              </>
            ) : (
              <>
                <span className="flex items-center gap-1.5 text-sky-400">Zone A</span>
                <span className="flex items-center gap-1.5 text-orange-400">Zone B</span>
                <span className="flex items-center gap-1.5 text-emerald-400">Zone C</span>
                <span className="flex items-center gap-1.5 text-amber-400">Zone D</span>
              </>
            )}
          </div>
        </div>

        {/* Recharts Composed Chart */}
        <div className="w-full h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={filteredHeatmapData}
              margin={{ top: 15, right: 20, left: -10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="todayAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="zoneAGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="zoneBGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.7} />
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="zoneCGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="zoneDGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.7} />

              <XAxis
                dataKey="hourLabel"
                stroke="#64748b"
                fontSize={10}
                fontFamily="JetBrains Mono"
                tickLine={false}
              />
              <YAxis
                stroke="#64748b"
                fontSize={10}
                fontFamily="JetBrains Mono"
                tickLine={false}
              />

              <Tooltip content={<CustomOccupancyTooltip />} />

              {/* Threshold Lines */}
              <ReferenceLine
                y={250}
                stroke="#f59e0b"
                strokeDasharray="4 4"
                label={{ value: 'Comfort Capacity (250p)', fill: '#f59e0b', fontSize: 9, position: 'insideTopRight' }}
              />
              <ReferenceLine
                y={400}
                stroke="#ef4444"
                strokeDasharray="3 3"
                label={{ value: 'Critical Warning (400p)', fill: '#ef4444', fontSize: 9, position: 'insideTopRight' }}
              />

              {chartViewMode === 'comparative' ? (
                <>
                  <Bar
                    dataKey="baselineAvg"
                    name="7-Day Baseline"
                    fill="#334155"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={20}
                    opacity={0.6}
                  />
                  <Area
                    type="monotone"
                    dataKey="total"
                    name="Today"
                    stroke="#22d3ee"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#todayAreaGrad)"
                  />
                  <Line
                    type="monotone"
                    dataKey="yesterdayTotal"
                    name="Yesterday"
                    stroke="#c084fc"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </>
              ) : (
                <>
                  <Area
                    type="monotone"
                    dataKey="zoneA"
                    stackId="1"
                    stroke="#38bdf8"
                    fill="url(#zoneAGrad)"
                    name="Zone A"
                  />
                  <Area
                    type="monotone"
                    dataKey="zoneB"
                    stackId="1"
                    stroke="#f97316"
                    fill="url(#zoneBGrad)"
                    name="Zone B"
                  />
                  <Area
                    type="monotone"
                    dataKey="zoneC"
                    stackId="1"
                    stroke="#10b981"
                    fill="url(#zoneCGrad)"
                    name="Zone C"
                  />
                  <Area
                    type="monotone"
                    dataKey="zoneD"
                    stackId="1"
                    stroke="#eab308"
                    fill="url(#zoneDGrad)"
                    name="Zone D"
                  />
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. 24-Hour Comparative Heatmap Matrix Grid */}
      <div className="p-5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-2">
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400" />
              24-Hour Comparative Heatmap Matrix
            </h4>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hour-by-hour occupancy heatmap colored by density status. Click any hour block to view zone breakdown.
            </p>
          </div>

          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-emerald-500/30 border border-emerald-500" /> Normal
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-amber-500/30 border border-amber-500" /> Elevated
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-orange-500/40 border border-orange-500" /> Warning
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded bg-rose-500/40 border border-rose-500" /> Critical
            </span>
          </div>
        </div>

        {/* 24 Heatmap Tiles */}
        <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-12 gap-2">
          {HOURLY_HEATMAP_24H.map((cell) => {
            const isSelected = selectedHeatmapHour === cell.hour;
            const isCurrent = cell.hour === 11;

            let tileBg = 'bg-slate-950 border-slate-800 text-slate-300';
            if (cell.status === 'critical') {
              tileBg = 'bg-rose-950/60 border-rose-700 text-rose-200';
            } else if (cell.status === 'warning') {
              tileBg = 'bg-orange-950/60 border-orange-700 text-orange-200';
            } else if (cell.status === 'elevated') {
              tileBg = 'bg-amber-950/40 border-amber-800 text-amber-200';
            } else {
              tileBg = 'bg-slate-950/80 border-slate-800 text-slate-300';
            }

            return (
              <button
                key={cell.hour}
                onClick={() => setSelectedHeatmapHour(cell.hour)}
                className={`p-2 rounded-lg border text-left transition-all relative flex flex-col justify-between ${tileBg} ${
                  isSelected ? 'ring-2 ring-cyan-400 shadow-lg scale-105 z-10' : 'hover:border-slate-600'
                }`}
              >
                {isCurrent && (
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                )}
                <div className="flex items-center justify-between text-[10px] font-mono">
                  <span className={isCurrent ? 'font-bold text-cyan-300' : 'text-slate-400'}>
                    {cell.hourLabel.split(' ')[0]}
                  </span>
                  {isCurrent && (
                    <span className="text-[8px] bg-cyan-950 text-cyan-300 px-1 rounded font-bold">NOW</span>
                  )}
                </div>
                <div className="mt-1">
                  <span className="text-sm font-bold font-mono block text-white">{cell.total}</span>
                  <span className="text-[9px] text-slate-400 block font-mono">{cell.avgDensity} p/m²</span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Hour Detail Drawer / Card */}
        {activeHourDetails && (
          <div className="p-3.5 bg-slate-950 rounded-lg border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs animate-in fade-in">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-lg bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold font-mono">
                {activeHourDetails.hour}h
              </div>
              <div>
                <span className="font-bold text-white text-xs block">
                  Snapshot Breakdown: {activeHourDetails.hourLabel}
                </span>
                <span className="text-[11px] text-slate-400">
                  Total: <strong className="text-cyan-300">{activeHourDetails.total} people</strong> ({activeHourDetails.avgDensity} p/m²) • Status: <span className="uppercase text-amber-300 font-mono font-semibold">{activeHourDetails.status}</span>
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
              <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-sky-300">
                Turnstiles (A): <strong>{activeHourDetails.zoneA}p</strong>
              </span>
              <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-orange-300">
                Concourse (B): <strong>{activeHourDetails.zoneB}p</strong>
              </span>
              <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-emerald-300">
                Merch (C): <strong>{activeHourDetails.zoneC}p</strong>
              </span>
              <span className="bg-slate-900 px-2 py-1 rounded border border-slate-800 text-amber-300">
                Stairwell (D): <strong>{activeHourDetails.zoneD}p</strong>
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 3. Pretrained ML Model DM-Count + Tri-Model Ensemble (YOLO + CSRNet + DM-Count) */}
      <div className="p-5 bg-slate-900/90 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Cpu className="w-4 h-4 text-purple-400" />
                Pretrained DM-Count Dense Model & Tri-Model Pipeline
              </h4>
              <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] font-mono font-bold">
                NeurIPS 2020 SOTA
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Distribution Matching via Optimal Transport (Wasserstein metric) solves dense head occlusion where bounding boxes fail.
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px]">
            <span className="text-slate-400">Ensemble:</span>
            <span className="text-cyan-300 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
              YOLOv8s + CSRNet + DM-Count
            </span>
          </div>
        </div>

        {/* Technical Explainer Pills */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-cyan-400 font-mono block">1. Ultralytics YOLOv8s</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sparse Regime (&lt;35 people)</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Provides millisecond-fast bounding boxes and centroid tracking. Dominates low-density flows with MAPE &lt;7%.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 space-y-1">
            <span className="font-bold text-orange-400 font-mono block">2. PyTorch CSRNet / P2PNet</span>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Medium Regime (35 - 80 people)</span>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dilated convolutional backend maintains receptive field without loss of resolution. Handles early head overlap.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-800/60 space-y-1">
            <span className="font-bold text-purple-300 font-mono block flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              3. Pretrained DM-Count Model
            </span>
            <span className="text-[10px] text-purple-300 uppercase tracking-wider block">Large Dense Crowds (&gt;80 people)</span>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Uses Optimal Transport distribution matching to measure probability mass differences, eliminating Gaussian blur annotation errors in ultra-dense surges ($8.9\%$ MAPE vs YOLO's $28.7\%$).
            </p>
          </div>
        </div>

        {/* Recharts Model Performance Curve on Dense Ingress Timeline */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-slate-200">
              Model Performance Comparison on Held-Out Concourse Surge (11:00 - 11:35):
            </span>
            <div className="flex items-center gap-3 text-[10px] font-mono">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-emerald-400" /> Ground Truth
              </span>
              <span className="text-cyan-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-cyan-400" /> YOLOv8s
              </span>
              <span className="text-orange-400 flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-orange-400" /> CSRNet
              </span>
              <span className="text-purple-400 font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-purple-400" /> DM-Count
              </span>
              <span className="text-white font-bold flex items-center gap-1">
                <span className="w-2 h-2 rounded bg-white" /> Tri-Model Fused
              </span>
            </div>
          </div>

          <div className="w-full h-64 bg-slate-950 p-2 rounded-xl border border-slate-800">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={MODEL_COMPARISON_TIMELINE}
                margin={{ top: 10, right: 15, left: -15, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                <YAxis stroke="#64748b" fontSize={10} fontFamily="JetBrains Mono" />
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const d = payload[0].payload;
                      const yoloLoss = d.groundTruth - d.yoloCount;
                      return (
                        <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs font-mono space-y-1">
                          <div className="text-slate-300 font-bold border-b border-slate-800 pb-1">
                            {d.timestamp} • {d.densityBand} Crowd
                          </div>
                          <div className="text-emerald-400">Ground Truth: {d.groundTruth}p</div>
                          <div className="text-cyan-400">YOLOv8: {d.yoloCount}p {yoloLoss > 20 ? `(-${yoloLoss} undercount)` : ''}</div>
                          <div className="text-orange-400">CSRNet: {d.csrnetCount}p</div>
                          <div className="text-purple-400 font-bold">DM-Count: {d.dmCountCount}p (OT Match)</div>
                          <div className="text-white font-bold border-t border-slate-800 pt-1">
                            Tri-Model Fused: {d.fusedCount}p
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />

                <Line type="monotone" dataKey="groundTruth" stroke="#10b981" strokeWidth={2} dot={{ r: 3 }} name="Ground Truth" />
                <Line type="monotone" dataKey="yoloCount" stroke="#22d3ee" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} name="YOLOv8" />
                <Line type="monotone" dataKey="csrnetCount" stroke="#f97316" strokeWidth={2} strokeDasharray="3 3" dot={{ r: 3 }} name="CSRNet" />
                <Line type="monotone" dataKey="dmCountCount" stroke="#c084fc" strokeWidth={2.5} dot={{ r: 4 }} name="DM-Count" />
                <Line type="monotone" dataKey="fusedCount" stroke="#ffffff" strokeWidth={2.5} dot={{ r: 3 }} name="Tri-Model Fused" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Verification Summary Banner */}
        <div className="p-3 bg-purple-950/20 rounded-lg border border-purple-900/60 flex items-start gap-2.5 text-xs text-slate-300">
          <Info className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
          <p className="leading-relaxed text-[11px]">
            <strong className="text-purple-300">Why DM-Count is essential for safety:</strong> Standard crowd algorithms suffer from severe undercounting during bottleneck rushes because mutual body occlusion blocks body contours. DM-Count reformulates counting as finding the optimal transport plan between normalized predicted density and point annotations, preserving high detection fidelity up to 4.5 people/m².
          </p>
        </div>
      </div>
    </div>
  );
};
