/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import { useCrowd } from '../context/CrowdContext';
import { Layers, Eye, ShieldAlert, Sparkles, SlidersHorizontal, RefreshCw } from 'lucide-react';

interface Pedestrian {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  conf: number;
  zoneId: string;
}

export const CameraCanvas: React.FC<{
  className?: string;
  showControlsBar?: boolean;
}> = ({ className = '', showControlsBar = true }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const {
    zones,
    selectedZoneId,
    setSelectedZoneId,
    cameraHealth,
    currentTime,
    isPlaying,
    playbackSpeed,
  } = useCrowd();

  // Overlay state toggles
  const [showYoloBoxes, setShowYoloBoxes] = useState<boolean>(true);
  const [showDensityHeatmap, setShowDensityHeatmap] = useState<boolean>(true);
  const [showZonePolygons, setShowZonePolygons] = useState<boolean>(true);
  const [showHeadCentroids, setShowHeadCentroids] = useState<boolean>(false);
  const [heatmapIntensity, setHeatmapIntensity] = useState<number>(0.65);

  // Generate deterministic crowd particles based on zone counts
  const pedestrians = useMemo(() => {
    const list: Pedestrian[] = [];
    zones.forEach((z) => {
      // Find bounding box of polygon
      const minX = Math.min(...z.polygon.map((p) => p.x));
      const maxX = Math.max(...z.polygon.map((p) => p.x));
      const minY = Math.min(...z.polygon.map((p) => p.y));
      const maxY = Math.max(...z.polygon.map((p) => p.y));

      // Limit particle count for software canvas render performance (sample up to 90 particles per zone max)
      const renderCount = Math.min(z.currentCount, 85);
      for (let i = 0; i < renderCount; i++) {
        const px = minX + Math.random() * (maxX - minX);
        const py = minY + Math.random() * (maxY - minY);
        list.push({
          x: px,
          y: py,
          vx: (Math.random() - 0.5) * 0.25,
          vy: (Math.random() - 0.5) * 0.25,
          size: 14 + Math.random() * 8,
          conf: Math.round((0.84 + Math.random() * 0.15) * 100) / 100,
          zoneId: z.id,
        });
      }
    });
    return list;
  }, [zones]);

  const pRef = useRef<Pedestrian[]>(pedestrians);
  useEffect(() => {
    pRef.current = pedestrians;
  }, [pedestrians]);

  // Canvas render loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;

      // 1. Draw Architectural Floor Background
      ctx.fillStyle = '#090e17';
      ctx.fillRect(0, 0, width, height);

      // Perspective floor grid & architectural layout lines
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Check if camera is experiencing anomaly (e.g., lens obstruction)
      if (cameraHealth.unexpectedZeroCountDetected || cameraHealth.status === 'Offline / Anomaly') {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.92)';
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = '#ef4444';
        ctx.font = 'bold 16px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillText('CAM-01 FEED ANOMALY / OBSTRUCTION DETECTED', width / 2, height / 2 - 10);
        ctx.fillStyle = '#94a3b8';
        ctx.font = '12px "Plus Jakarta Sans", sans-serif';
        ctx.fillText('Zero counts recorded during active operational window. Inspect camera optics.', width / 2, height / 2 + 15);
        return;
      }

      // 2. Draw Zone Polygons
      if (showZonePolygons) {
        zones.forEach((z) => {
          const isSelected = selectedZoneId === z.id;
          ctx.beginPath();
          z.polygon.forEach((pt, idx) => {
            const screenX = (pt.x / 100) * width;
            const screenY = (pt.y / 100) * height;
            if (idx === 0) ctx.moveTo(screenX, screenY);
            else ctx.lineTo(screenX, screenY);
          });
          ctx.closePath();

          let strokeColor = '#3b82f6';
          let fillColor = 'rgba(59, 130, 246, 0.08)';

          if (z.status === 'critical') {
            strokeColor = '#f43f5e';
            fillColor = 'rgba(244, 63, 94, 0.18)';
          } else if (z.status === 'warning') {
            strokeColor = '#f97316';
            fillColor = 'rgba(249, 115, 22, 0.15)';
          } else if (z.status === 'elevated') {
            strokeColor = '#eab308';
            fillColor = 'rgba(234, 179, 8, 0.12)';
          } else {
            strokeColor = '#10b981';
            fillColor = 'rgba(16, 185, 129, 0.08)';
          }

          if (isSelected) {
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = '#38bdf8';
            ctx.fillStyle = 'rgba(56, 189, 248, 0.22)';
          } else {
            ctx.lineWidth = 1.5;
            ctx.strokeStyle = strokeColor;
            ctx.fillStyle = fillColor;
          }

          ctx.stroke();
          ctx.fill();

          // Zone Tag in Corner of polygon
          const firstPt = z.polygon[0];
          const tagX = (firstPt.x / 100) * width + 8;
          const tagY = (firstPt.y / 100) * height + 16;

          ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
          ctx.fillRect(tagX - 4, tagY - 12, 140, 22);
          ctx.strokeStyle = strokeColor;
          ctx.lineWidth = 1;
          ctx.strokeRect(tagX - 4, tagY - 12, 140, 22);

          ctx.fillStyle = strokeColor;
          ctx.font = 'bold 10px "JetBrains Mono", monospace';
          ctx.textAlign = 'left';
          ctx.fillText(`${z.name.split('-')[0].trim()} | ${z.currentCount}p (${z.density}p/m²)`, tagX, tagY + 3);
        });
      }

      // Update pedestrian positions if playing
      if (isPlaying) {
        pRef.current.forEach((p) => {
          p.x += p.vx * playbackSpeed;
          p.y += p.vy * playbackSpeed;
          // Boundary bounce within zone roughly
          const zone = zones.find((z) => z.id === p.zoneId);
          if (zone) {
            const minX = Math.min(...zone.polygon.map((pt) => pt.x));
            const maxX = Math.max(...zone.polygon.map((pt) => pt.x));
            const minY = Math.min(...zone.polygon.map((pt) => pt.y));
            const maxY = Math.max(...zone.polygon.map((pt) => pt.y));

            if (p.x < minX || p.x > maxX) p.vx *= -1;
            if (p.y < minY || p.y > maxY) p.vy *= -1;
          }
        });
      }

      // 3. Draw CSRNet Density Heatmap Layer
      if (showDensityHeatmap) {
        ctx.save();
        ctx.globalAlpha = heatmapIntensity;
        ctx.globalCompositeOperation = 'screen';

        pRef.current.forEach((p) => {
          const sx = (p.x / 100) * width;
          const sy = (p.y / 100) * height;
          const rad = 32;

          const grad = ctx.createRadialGradient(sx, sy, 2, sx, sy, rad);
          const zone = zones.find((z) => z.id === p.zoneId);
          const isHigh = zone && (zone.status === 'warning' || zone.status === 'critical');

          if (isHigh) {
            grad.addColorStop(0, 'rgba(239, 68, 68, 0.6)');
            grad.addColorStop(0.4, 'rgba(249, 115, 22, 0.35)');
            grad.addColorStop(0.8, 'rgba(234, 179, 8, 0.15)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          } else {
            grad.addColorStop(0, 'rgba(6, 182, 212, 0.45)');
            grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.25)');
            grad.addColorStop(0.9, 'rgba(59, 130, 246, 0.1)');
            grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          }

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(sx, sy, rad, 0, Math.PI * 2);
          ctx.fill();
        });

        ctx.restore();
      }

      // 4. Draw Pedestrians (Base visual)
      pRef.current.forEach((p) => {
        const sx = (p.x / 100) * width;
        const sy = (p.y / 100) * height;

        // Base head / shoulder circle
        ctx.fillStyle = '#64748b';
        ctx.beginPath();
        ctx.arc(sx, sy, 4.5, 0, Math.PI * 2);
        ctx.fill();

        // 5. Draw YOLO Detection Boxes
        if (showYoloBoxes) {
          const bw = 16;
          const bh = 22;
          ctx.strokeStyle = '#22d3ee';
          ctx.lineWidth = 1;
          ctx.strokeRect(sx - bw / 2, sy - bh / 2, bw, bh);

          // Confidence micro-badge
          ctx.fillStyle = '#0891b2';
          ctx.fillRect(sx - bw / 2, sy - bh / 2 - 8, bw, 8);
          ctx.fillStyle = '#ffffff';
          ctx.font = '7px "JetBrains Mono", monospace';
          ctx.textAlign = 'center';
          ctx.fillText(`${p.conf}`, sx, sy - bh / 2 - 2);
        }

        // 6. Draw Centroid Dots
        if (showHeadCentroids) {
          ctx.fillStyle = '#f43f5e';
          ctx.beginPath();
          ctx.arc(sx, sy, 2.5, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      // 7. Video OSD Overlay (Watermark & Camera Metadata)
      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(8, 8, 310, 24);
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 1;
      ctx.strokeRect(8, 8, 310, 24);

      // Red recording dot
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(20, 20, 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px "JetBrains Mono", monospace';
      ctx.textAlign = 'left';
      ctx.fillText(`CAM-01 | 2026-10-16 ${currentTime} | 3.3 FPS`, 32, 23);

      // Pipeline label badge
      ctx.fillStyle = 'rgba(6, 182, 212, 0.2)';
      ctx.fillRect(width - 215, 8, 207, 24);
      ctx.strokeStyle = '#0891b2';
      ctx.strokeRect(width - 215, 8, 207, 24);
      ctx.fillStyle = '#22d3ee';
      ctx.font = '9px "JetBrains Mono", monospace';
      ctx.textAlign = 'center';
      ctx.fillText('YOLO + CSRNet + DM-COUNT FUSION', width - 111, 23);

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [
    zones,
    selectedZoneId,
    cameraHealth,
    currentTime,
    isPlaying,
    playbackSpeed,
    showYoloBoxes,
    showDensityHeatmap,
    showZonePolygons,
    showHeadCentroids,
    heatmapIntensity,
  ]);

  // Click on canvas to select corresponding zone
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const hit = zones.find((z) => {
      const minX = Math.min(...z.polygon.map((p) => p.x));
      const maxX = Math.max(...z.polygon.map((p) => p.x));
      const minY = Math.min(...z.polygon.map((p) => p.y));
      const maxY = Math.max(...z.polygon.map((p) => p.y));
      return clickX >= minX && clickX <= maxX && clickY >= minY && clickY <= maxY;
    });

    if (hit) {
      setSelectedZoneId(hit.id === selectedZoneId ? null : hit.id);
    }
  };

  return (
    <div className={`flex flex-col bg-slate-900/90 rounded-xl border border-slate-800 overflow-hidden ${className}`}>
      {/* Viewport Frame */}
      <div className="relative aspect-video w-full bg-slate-950 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={800}
          height={450}
          onClick={handleCanvasClick}
          className="w-full h-full object-cover cursor-crosshair"
          title="Click zone to inspect"
        />

        {/* Floating Quick Legend */}
        <div className="absolute bottom-2 left-2 flex items-center gap-2 bg-slate-950/80 backdrop-blur px-2.5 py-1 rounded border border-slate-800 text-[10px] text-slate-300 font-mono">
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Normal</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Elevated</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>Warning</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Critical</span>
          </div>
        </div>
      </div>

      {/* Control Bar */}
      {showControlsBar && (
        <div className="px-3 py-2 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-[11px]">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              <span>Overlays:</span>
            </div>

            <label className="flex items-center gap-1 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showYoloBoxes}
                onChange={(e) => setShowYoloBoxes(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="text-[11px]">YOLO BBoxes</span>
            </label>

            <label className="flex items-center gap-1 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showDensityHeatmap}
                onChange={(e) => setShowDensityHeatmap(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="text-[11px]">CSRNet Heatmap</span>
            </label>

            <label className="flex items-center gap-1 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showZonePolygons}
                onChange={(e) => setShowZonePolygons(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="text-[11px]">Zone Polygons</span>
            </label>

            <label className="flex items-center gap-1 text-slate-300 cursor-pointer hover:text-white">
              <input
                type="checkbox"
                checked={showHeadCentroids}
                onChange={(e) => setShowHeadCentroids(e.target.checked)}
                className="rounded border-slate-700 bg-slate-800 text-cyan-500 focus:ring-0 w-3.5 h-3.5"
              />
              <span className="text-[11px]">Centroid Dots</span>
            </label>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="text-[11px]">Heatmap Alpha:</span>
            <input
              type="range"
              min="0.2"
              max="1.0"
              step="0.05"
              value={heatmapIntensity}
              onChange={(e) => setHeatmapIntensity(parseFloat(e.target.value))}
              className="w-16 accent-cyan-400 cursor-pointer h-1.5 bg-slate-700 rounded-lg"
            />
            <span className="font-mono text-[10px] text-slate-300">{Math.round(heatmapIntensity * 100)}%</span>
          </div>
        </div>
      )}
    </div>
  );
};
