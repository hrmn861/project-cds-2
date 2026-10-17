/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Pure mathematical, statistical, and algorithmic utilities for Crowd Monitor
 */

export type ZoneStatus = 'normal' | 'elevated' | 'warning' | 'critical';
export type ModelPipeline = 'YOLO' | 'CSRNet' | 'DM-Count' | 'Tri-Model Ensemble';

/**
 * Calculates crowd density in people per square metre
 */
export function calculateDensity(count: number, areaM2: number): number {
  if (areaM2 <= 0) return 0;
  if (count <= 0) return 0;
  const density = count / areaM2;
  return Math.round(density * 100) / 100;
}

/**
 * Classifies density status based on zone safety thresholds
 */
export function determineZoneStatus(
  density: number,
  warningThreshold: number,
  criticalThreshold: number
): ZoneStatus {
  if (density >= criticalThreshold) {
    return 'critical';
  }
  if (density >= warningThreshold) {
    return 'warning';
  }
  if (density >= warningThreshold * 0.75) {
    return 'elevated';
  }
  return 'normal';
}

/**
 * Automatically determines whether YOLO (sparse detection), CSRNet (medium density regression),
 * or DM-Count (large dense crowd with optimal transport matching) is optimal for the regime.
 */
export function selectModelPipeline(countEstimate: number): ModelPipeline {
  if (countEstimate < 35) {
    return 'YOLO';
  }
  if (countEstimate <= 80) {
    return 'CSRNet';
  }
  return 'DM-Count';
}

/**
 * Tri-Model Ensemble Fusion (YOLOv8 + CSRNet + DM-Count)
 * Dynamically weights models based on crowd density regime:
 * - Sparse (<35): YOLOv8 dominates (fast localization)
 * - Medium (35-80): CSRNet dominates (dilated convs for overlapping heads)
 * - Large Dense (>80): DM-Count dominates (Optimal Transport distribution matching)
 */
export function fuseTriModelPredictions(
  yoloCount: number,
  csrnetCount: number,
  dmCount: number,
  countEstimate?: number
): number {
  const est = countEstimate !== undefined ? countEstimate : (yoloCount + csrnetCount + dmCount) / 3;

  let wYolo = 0.33;
  let wCsr = 0.33;
  let wDm = 0.34;

  if (est < 35) {
    wYolo = 0.85;
    wCsr = 0.10;
    wDm = 0.05;
  } else if (est <= 80) {
    wYolo = 0.20;
    wCsr = 0.50;
    wDm = 0.30;
  } else {
    // Dense crowd regime: YOLO drops severely due to occlusion, DM-Count excels
    wYolo = 0.05;
    wCsr = 0.25;
    wDm = 0.70;
  }

  const weighted = yoloCount * wYolo + csrnetCount * wCsr + dmCount * wDm;
  return Math.round(weighted);
}

/**
 * Computes statistical evaluation metrics:
 * - MAE (Mean Absolute Error)
 * - MAPE (Mean Absolute Percentage Error in %)
 * - Bias (Mean Signed Difference: positive = overcounting, negative = undercounting)
 */
export function computeModelMetrics(
  predictions: number[],
  groundTruth: number[]
): { mae: number; mape: number; bias: number } {
  if (predictions.length === 0 || groundTruth.length === 0) {
    return { mae: 0, mape: 0, bias: 0 };
  }
  const n = Math.min(predictions.length, groundTruth.length);
  let totalAbsError = 0;
  let totalPercentageError = 0;
  let totalSignedDiff = 0;
  let validPercentCount = 0;

  for (let i = 0; i < n; i++) {
    const pred = predictions[i];
    const actual = groundTruth[i];
    const diff = pred - actual;

    totalAbsError += Math.abs(diff);
    totalSignedDiff += diff;

    if (actual > 0) {
      totalPercentageError += (Math.abs(diff) / actual) * 100;
      validPercentCount++;
    }
  }

  const mae = Math.round((totalAbsError / n) * 100) / 100;
  const mape = validPercentCount > 0 ? Math.round((totalPercentageError / validPercentCount) * 100) / 100 : 0;
  const bias = Math.round((totalSignedDiff / n) * 100) / 100;

  return { mae, mape, bias };
}

/**
 * Checks whether an alert condition persists continuously across consecutive window samples
 * Prevents alert spikes from single transient frame noise
 */
export function evaluateAlertPersistence(
  recentDensities: number[],
  threshold: number,
  minRequiredSamples = 3
): boolean {
  if (recentDensities.length < minRequiredSamples) {
    return false;
  }
  const slice = recentDensities.slice(-minRequiredSamples);
  return slice.every((density) => density >= threshold);
}

/**
 * Calculates percentage rate of change over time windows
 */
export function calculateRateOfChange(previousCount: number, currentCount: number): number {
  if (previousCount <= 0) {
    return currentCount > 0 ? 100 : 0;
  }
  const change = ((currentCount - previousCount) / previousCount) * 100;
  return Math.round(change * 10) / 10;
}
/**
 * Detects silent camera failure (unexpected zero count drop during active venue hours)
 */
export function detectZeroCountAnomaly(
  history: number[],
  expectedMinOccupancy = 5
): boolean {
  if (history.length < 4) return false;
  // If recent 3 samples are 0 while historical mean was above expected min occupancy
  const recentThree = history.slice(-3);
  const isRecentAllZero = recentThree.every((val) => val === 0);
  if (!isRecentAllZero) return false;

  const prior = history.slice(0, -3);
  if (prior.length === 0) return false;
  const priorAvg = prior.reduce((a, b) => a + b, 0) / prior.length;

  return priorAvg >= expectedMinOccupancy;
}

/**
 * Generates structured CSV snapshot of current zone occupancy, alert queue, and camera health
 */
export function generateCsvReport(
  zones: {
    id: string;
    name: string;
    floorAreaM2: number;
    comfortableCapacity: number;
    maxCapacity: number;
    currentCount: number;
    density: number;
    status: string;
    trendRate: number;
    warningThreshold: number;
  }[],
  alerts: {
    id: string;
    timestamp: string;
    zoneName: string;
    triggerReason: string;
    densityValue: number;
    thresholdValue: number;
    status: string;
    reviewedBy?: string;
  }[],
  cameraHealth: {
    status: string;
    fps: number;
    droppedFramesPercent: number;
    lastFrameReceivedMs: number;
  },
  timestamp: string
): string {
  const lines: string[] = [];

  // Metadata Header
  lines.push('# CROWD MONITOR - ZONE OCCUPANCY & ALERT SNAPSHOT REPORT');
  lines.push(`# Generated At: ${timestamp}`);
  lines.push('# Camera Source: CAM-01 (Concourse North Gate - Overhead 4K)');
  lines.push(`# Camera Status: ${cameraHealth.status} | FPS: ${cameraHealth.fps} | Drop Rate: ${cameraHealth.droppedFramesPercent}% | Latency: ${cameraHealth.lastFrameReceivedMs}ms`);
  lines.push('');

  // Zone Occupancy Section
  lines.push('--- ZONE OCCUPANCY AND DENSITY METRICS ---');
  lines.push('Zone ID,Zone Name,Floor Area (m2),Current Count,Density (p/m2),Warning Threshold (p/m2),Status,5m Trend Rate (%),Comfortable Capacity,Capacity Occupancy (%)');

  zones.forEach((z) => {
    const occPct = z.comfortableCapacity > 0 ? Math.round((z.currentCount / z.comfortableCapacity) * 100) : 0;
    const escapedName = `"${z.name.replace(/"/g, '""')}"`;
    lines.push(
      `${z.id},${escapedName},${z.floorAreaM2},${z.currentCount},${z.density},${z.warningThreshold},${z.status},${z.trendRate}%,${z.comfortableCapacity},${occPct}%`
    );
  });

  lines.push('');

  // Alerts Section
  lines.push('--- ACTIVE AND HISTORICAL REVIEW ALERTS ---');
  lines.push('Alert ID,Timestamp,Zone Name,Status,Density Value (p/m2),Threshold (p/m2),Trigger Reason,Reviewed By');

  if (alerts.length === 0) {
    lines.push('No alerts logged,N/A,N/A,N/A,0,0,N/A,N/A');
  } else {
    alerts.forEach((a) => {
      const escapedZone = `"${a.zoneName.replace(/"/g, '""')}"`;
      const escapedReason = `"${a.triggerReason.replace(/"/g, '""')}"`;
      const reviewer = a.reviewedBy ? `"${a.reviewedBy.replace(/"/g, '""')}"` : 'Pending Review';
      lines.push(
        `${a.id},${a.timestamp},${escapedZone},${a.status},${a.densityValue},${a.thresholdValue},${escapedReason},${reviewer}`
      );
    });
  }

  return lines.join('\n');
}
