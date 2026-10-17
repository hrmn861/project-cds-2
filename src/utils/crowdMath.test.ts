/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateDensity,
  determineZoneStatus,
  selectModelPipeline,
  computeModelMetrics,
  evaluateAlertPersistence,
  calculateRateOfChange,
  detectZeroCountAnomaly,
  generateCsvReport,
  fuseTriModelPredictions,
} from './crowdMath.ts';

test('calculateDensity computes people per square meter accurately', () => {
  assert.equal(calculateDensity(50, 25), 2.0);
  assert.equal(calculateDensity(75, 50), 1.5);
  assert.equal(calculateDensity(10, 30), 0.33);
  assert.equal(calculateDensity(0, 50), 0);
  assert.equal(calculateDensity(50, 0), 0);
});

test('determineZoneStatus assigns correct severity stages', () => {
  const warn = 2.0;
  const crit = 3.5;
  assert.equal(determineZoneStatus(1.0, warn, crit), 'normal');
  assert.equal(determineZoneStatus(1.6, warn, crit), 'elevated');
  assert.equal(determineZoneStatus(2.2, warn, crit), 'warning');
  assert.equal(determineZoneStatus(3.8, warn, crit), 'critical');
});

test('selectModelPipeline switches based on crowd magnitude and density regime', () => {
  // Sparse zones (< 35): YOLO detector
  assert.equal(selectModelPipeline(20), 'YOLO');
  // Medium crowded zones (35 - 80): CSRNet density model
  assert.equal(selectModelPipeline(60), 'CSRNet');
  // Large dense crowds (> 80): DM-Count Optimal Transport model
  assert.equal(selectModelPipeline(120), 'DM-Count');
});

test('fuseTriModelPredictions computes weighted ensemble based on density regime', () => {
  // Sparse crowd: YOLO dominates (weight 85%)
  const sparseFused = fuseTriModelPredictions(20, 25, 22, 20);
  assert.equal(sparseFused, 21);

  // Large dense crowd: DM-Count dominates (weight 70%) while YOLO undercounts due to occlusion
  const denseFused = fuseTriModelPredictions(100, 140, 160, 150);
  // 100 * 0.05 (5) + 140 * 0.25 (35) + 160 * 0.70 (112) = 152
  assert.equal(denseFused, 152);
});

test('computeModelMetrics calculates MAE, MAPE, and bias accurately', () => {
  const preds = [48, 52, 90, 20];
  const truth = [50, 50, 100, 20];
  const metrics = computeModelMetrics(preds, truth);

  // Absolute errors: |48-50|=2, |52-50|=2, |90-100|=10, |20-20|=0 -> sum = 14 / 4 = 3.5
  assert.equal(metrics.mae, 3.5);
  // Percentage errors: 2/50=4%, 2/50=4%, 10/100=10%, 0/20=0% -> sum = 18 / 4 = 4.5%
  assert.equal(metrics.mape, 4.5);
  // Signed differences: -2 + 2 - 10 + 0 = -10 / 4 = -2.5 (slight undercount bias)
  assert.equal(metrics.bias, -2.5);
});

test('evaluateAlertPersistence filters transient frame blips', () => {
  const threshold = 2.5;
  // Transient blip
  assert.equal(evaluateAlertPersistence([1.5, 2.6, 1.8], threshold, 3), false);
  // Continuous persistence over 3 samples
  assert.equal(evaluateAlertPersistence([2.6, 2.7, 2.8], threshold, 3), true);
  // Insufficient history
  assert.equal(evaluateAlertPersistence([3.0, 3.2], threshold, 3), false);
});

test('calculateRateOfChange computes trend delta', () => {
  assert.equal(calculateRateOfChange(100, 125), 25);
  assert.equal(calculateRateOfChange(100, 80), -20);
  assert.equal(calculateRateOfChange(0, 10), 100);
});

test('detectZeroCountAnomaly flags silent camera freezes and black frame drops', () => {
  // Sudden drop to zeros after consistent high crowd occupancy
  const historyWithFailure = [45, 48, 52, 50, 47, 0, 0, 0];
  assert.equal(detectZeroCountAnomaly(historyWithFailure, 10), true);

  // Normal empty venue (always low)
  const normalEmpty = [0, 1, 0, 0, 0];
  assert.equal(detectZeroCountAnomaly(normalEmpty, 10), false);
});

test('generateCsvReport outputs valid structured CSV formatted report', () => {
  const dummyZones = [
    {
      id: 'zone-a',
      name: 'Zone A - Ingress',
      floorAreaM2: 32,
      comfortableCapacity: 45,
      maxCapacity: 95,
      currentCount: 38,
      density: 1.19,
      status: 'normal',
      trendRate: 4.2,
      warningThreshold: 2.0,
    },
  ];
  const dummyAlerts = [
    {
      id: 'ALT-101',
      timestamp: '11:30:00',
      zoneName: 'Zone A - Ingress',
      triggerReason: 'Density spike',
      densityValue: 2.1,
      thresholdValue: 2.0,
      status: 'Pending Review',
    },
  ];
  const dummyHealth = {
    status: 'Online & Stable',
    fps: 3.3,
    droppedFramesPercent: 0.1,
    lastFrameReceivedMs: 120,
  };

  const csv = generateCsvReport(dummyZones, dummyAlerts, dummyHealth, '2026-10-16 11:38:00');
  assert.ok(csv.includes('# CROWD MONITOR - ZONE OCCUPANCY & ALERT SNAPSHOT REPORT'));
  assert.ok(csv.includes('Zone ID,Zone Name,Floor Area (m2)'));
  assert.ok(csv.includes('zone-a,"Zone A - Ingress",32,38,1.19,2,normal,4.2%,45,84%'));
  assert.ok(csv.includes('ALT-101,11:30:00,"Zone A - Ingress",Pending Review,2.1,2,"Density spike",Pending Review'));
});
