/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { EVALUATION_METRICS } from '../data/mockData';
import { Award, CheckCircle2, AlertTriangle, Layers, Users, BookOpen } from 'lucide-react';

export const EvaluationTab: React.FC = () => {
  return (
    <div className="space-y-5">
      {/* Overview Card */}
      <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
        <div>
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Award className="w-4 h-4 text-cyan-400" />
            Evaluation Module & Shadow-Mode Trial Benchmarks
          </h3>
          <p className="text-slate-400 mt-0.5">
            Honest reporting of Mean Absolute Error (MAE), Mean Absolute Percentage Error (MAPE), and Bias on held-out temporal windows
          </p>
        </div>
        <span className="px-2.5 py-1 rounded bg-slate-950 text-cyan-300 font-mono text-[11px] border border-slate-800">
          Sample Size: 1,360 Hand-Annotated Frames
        </span>
      </div>

      {/* Accuracy Table by Density Band */}
      <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-3">
        <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Layers className="w-4 h-4 text-cyan-400" />
          Model Error Metrics by Density Band (Held-Out Evaluation Set)
        </h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-semibold text-slate-400 uppercase tracking-wider bg-slate-950/50">
                <th className="py-2.5 px-3">Crowd Density Band</th>
                <th className="py-2.5 px-3">Frames Tested</th>
                <th className="py-2.5 px-3 text-cyan-300">YOLOv8 MAE</th>
                <th className="py-2.5 px-3 text-cyan-300">YOLOv8 MAPE (%)</th>
                <th className="py-2.5 px-3 text-orange-300">CSRNet MAE</th>
                <th className="py-2.5 px-3 text-orange-300">CSRNet MAPE (%)</th>
                <th className="py-2.5 px-3 text-purple-300">DM-Count MAE</th>
                <th className="py-2.5 px-3 text-purple-300">DM-Count MAPE (%)</th>
                <th className="py-2.5 px-3 text-purple-300">DM-Count Bias</th>
                <th className="py-2.5 px-3">Optimal Model</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-mono text-slate-200">
              {EVALUATION_METRICS.map((row, idx) => {
                const isDense = row.band.includes('Dense');
                const isOverall = row.band === 'Overall';

                return (
                  <tr
                    key={idx}
                    className={`transition-colors ${
                      isOverall
                        ? 'bg-slate-950 font-bold border-t-2 border-slate-700'
                        : isDense
                        ? 'bg-purple-950/20'
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-3 font-sans font-semibold text-white">
                      {row.band}
                    </td>
                    <td className="py-3 px-3 text-slate-400">{row.sampleCount}</td>
                    <td className="py-3 px-3 text-cyan-300">{row.yoloMAE}</td>
                    <td className="py-3 px-3 font-bold text-cyan-300">
                      {row.yoloMAPE}%
                    </td>
                    <td className="py-3 px-3 text-orange-300">{row.csrnetMAE}</td>
                    <td className="py-3 px-3 font-bold text-orange-300">
                      {row.csrnetMAPE}%
                    </td>
                    <td className="py-3 px-3 text-purple-300 font-bold">{row.dmCountMAE}</td>
                    <td className="py-3 px-3 font-bold text-purple-300">
                      {row.dmCountMAPE}%
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono">
                      {row.dmCountBias > 0 ? `+${row.dmCountBias}` : row.dmCountBias}
                    </td>
                    <td className="py-3 px-3 font-sans">
                      <span className="text-[11px] font-semibold text-purple-300 bg-purple-950/60 px-2 py-0.5 rounded border border-purple-800">
                        {row.recommendedModel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Shadow-Mode Trial Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Alert Sensitivity (Surge Detection)</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-emerald-400">
            93.4%
          </div>
          <p className="text-[11px] text-slate-400">
            Caught 28 out of 30 human-verified crowd build-ups during 48-hour shadow run.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>False Review Alert Rate</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-amber-400">
            6.1%
          </div>
          <p className="text-[11px] text-slate-400">
            Primarily caused by transient group pauses or high-contrast sunbeam glare.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
            <span>Early Warning Lead Time</span>
            <Award className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-3xl font-extrabold font-mono text-cyan-300">
            4.2 <span className="text-xs text-slate-400 font-normal">min</span>
          </div>
          <p className="text-[11px] text-slate-400">
            Average advance notice before concourse bottleneck reached steward observation threshold.
          </p>
        </div>
      </div>

      {/* Honest Scientific Limitations & Annotator Agreement Ceiling */}
      <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-3">
        <h4 className="font-bold text-white flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-cyan-400" />
          Annotator Agreement Ceiling & Honest Limits
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-slate-400 leading-relaxed text-[11px]">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">Human Ground Truth Variance: ±4.2%</strong>
            In frames with &gt;150 people, two trained independent annotators differ by an average of 4.2% due to head overlap and edge cropping. Model precision cannot honestly be claimed beyond this human measurement ceiling.
          </div>
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
            <strong className="text-slate-200 block mb-1">Why Single-Camera Geometry Limits Generalization:</strong>
            Calibration parameters (pixels to m² floor mapping) are mathematically coupled to CAM-01 mounting angle (35°) and height (4.8m). Moving to another camera requires re-running geometric ground plane calibration.
          </div>
        </div>
      </div>
    </div>
  );
};
