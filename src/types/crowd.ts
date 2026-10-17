/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'Security Operator' | 'Safety Reviewer' | 'Venue Administrator';

export type AlertStatus = 'Pending Review' | 'Under Review' | 'Confirmed' | 'Dismissed';

export type ZoneSeverity = 'normal' | 'elevated' | 'warning' | 'critical';

export interface Zone {
  id: string;
  name: string;
  description: string;
  floorAreaM2: number;
  comfortableCapacity: number;
  maxCapacity: number;
  currentCount: number;
  density: number; // people per m2
  status: ZoneSeverity;
  trendRate: number; // % change in last 5 min
  warningThreshold: number; // density p/m2
  criticalThreshold: number; // density p/m2
  persistenceSeconds: number; // required duration before alert
  cooldownMinutes: number; // cooldown before re-alert
  polygon: { x: number; y: number }[]; // % coordinates within 100x100 camera frame
}

export interface CrowdAlert {
  id: string;
  timestamp: string;
  zoneId: string;
  zoneName: string;
  triggerReason: string;
  densityValue: number;
  thresholdValue: number;
  count: number;
  status: AlertStatus;
  durationSeconds: number;
  reviewerNotes?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  escalated?: boolean;
  escalationId?: string;
}

export interface EscalationSummary {
  id: string;
  alertId: string;
  timestamp: string;
  siteName: string;
  siteAddress: string;
  zoneId: string;
  zoneName: string;
  floorAreaM2: number;
  verifiedCount: number;
  density: number;
  trendRate: number;
  reviewerName: string;
  reviewerRole: string;
  targetRecipient: string; // "Venue Central Control Room"
  actionRecommended: string;
  snapshotDataUrl: string;
  status: 'Dispatched to Control Room' | 'Acknowledged by Control Room';
  dispatchedAt: string;
}

export interface CameraHealth {
  status: 'Online & Stable' | 'Warning' | 'Offline / Anomaly';
  lastFrameReceivedMs: number;
  fps: number;
  targetFps: number;
  droppedFramesPercent: number;
  totalFramesProcessed: number;
  resolution: string;
  bitrateMbps: number;
  unexpectedZeroCountDetected: boolean;
  lensObstructionRisk: boolean;
  connectionUptime: string;
}

export interface DiurnalHistoryPoint {
  hour: number;
  label: string;
  todayCount: number;
  baselineAvgCount: number;
  baselineMinCount: number;
  baselineMaxCount: number;
}

export interface ModelComparisonPoint {
  timestamp: string;
  groundTruth: number;
  yoloCount: number;
  csrnetCount: number;
  dmCountCount: number;
  fusedCount: number;
  densityBand: 'Sparse' | 'Medium' | 'Dense';
}

export interface EvaluationMetric {
  band: 'Sparse (<25)' | 'Medium (25-70)' | 'Dense (>70)' | 'Overall';
  sampleCount: number;
  yoloMAE: number;
  yoloMAPE: number;
  yoloBias: number;
  csrnetMAE: number;
  csrnetMAPE: number;
  csrnetBias: number;
  dmCountMAE: number;
  dmCountMAPE: number;
  dmCountBias: number;
  recommendedModel: string;
}

export interface HourlyHeatmapCell {
  hour: number;
  hourLabel: string;
  zoneA: number;
  zoneB: number;
  zoneC: number;
  zoneD: number;
  total: number;
  avgDensity: number;
  yesterdayTotal: number;
  baselineAvg: number;
  status: 'normal' | 'elevated' | 'warning' | 'critical';
}

export interface SimulationScenario {
  id: string;
  name: string;
  description: string;
  totalCrowdTarget: number;
  zoneOverrides: Record<string, { count: number; trend: number }>;
  cameraHealthState?: Partial<CameraHealth>;
  triggerAlerts?: boolean;
}
