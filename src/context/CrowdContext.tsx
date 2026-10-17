/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Zone,
  CrowdAlert,
  EscalationSummary,
  CameraHealth,
  UserRole,
  SimulationScenario,
} from '../types/crowd';
import {
  INITIAL_ZONES,
  INITIAL_ALERTS,
  INITIAL_ESCALATIONS,
  INITIAL_CAMERA_HEALTH,
  SCENARIOS,
} from '../data/mockData';
import { calculateDensity, determineZoneStatus } from '../utils/crowdMath';

export type AppTab =
  | 'overview'
  | 'replay'
  | 'zones'
  | 'trends'
  | 'alerts'
  | 'escalation'
  | 'health'
  | 'evaluation'
  | 'methodology'
  | 'admin';

interface CrowdContextType {
  activeTab: AppTab;
  setActiveTab: (tab: AppTab) => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  activeScenarioId: string;
  selectScenario: (scenarioId: string) => void;
  zones: Zone[];
  alerts: CrowdAlert[];
  escalations: EscalationSummary[];
  cameraHealth: CameraHealth;
  currentTime: string;
  totalPeopleCount: number;
  zonesAboveNormalCount: number;
  selectedZoneId: string | null;
  setSelectedZoneId: (id: string | null) => void;
  activeReviewAlert: CrowdAlert | null;
  setActiveReviewAlert: (alert: CrowdAlert | null) => void;
  activeEscalateAlert: CrowdAlert | null;
  setActiveEscalateAlert: (alert: CrowdAlert | null) => void;
  isPlaying: boolean;
  setIsPlaying: (playing: boolean) => void;
  playbackSpeed: number;
  setPlaybackSpeed: (speed: number) => void;
  timelineSeconds: number;
  setTimelineSeconds: (sec: number) => void;
  reviewAlert: (alertId: string, action: 'confirm' | 'dismiss', notes: string) => void;
  dispatchEscalation: (summary: Omit<EscalationSummary, 'id' | 'timestamp' | 'status' | 'dispatchedAt'>) => void;
  updateZone: (zoneId: string, updates: Partial<Zone>) => void;
  scenarios: SimulationScenario[];
}

const CrowdContext = createContext<CrowdContextType | undefined>(undefined);

export const CrowdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<AppTab>('overview');
  const [role, setRole] = useState<UserRole>('Safety Reviewer');
  const [activeScenarioId, setActiveScenarioId] = useState<string>('surge');
  const [zones, setZones] = useState<Zone[]>(INITIAL_ZONES);
  const [alerts, setAlerts] = useState<CrowdAlert[]>(INITIAL_ALERTS);
  const [escalations, setEscalations] = useState<EscalationSummary[]>(INITIAL_ESCALATIONS);
  const [cameraHealth, setCameraHealth] = useState<CameraHealth>(INITIAL_CAMERA_HEALTH);
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const [activeReviewAlert, setActiveReviewAlert] = useState<CrowdAlert | null>(null);
  const [activeEscalateAlert, setActiveEscalateAlert] = useState<CrowdAlert | null>(null);

  // Playback & simulation state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1);
  const [timelineSeconds, setTimelineSeconds] = useState<number>(2280); // 11:38:00
  const [currentTime, setCurrentTime] = useState<string>('11:38:07');

  // Time ticker simulation
  useEffect(() => {
    const interval = setInterval(() => {
      if (isPlaying) {
        setTimelineSeconds((prev) => (prev >= 3600 ? 0 : prev + 1));
      }
      const now = new Date();
      const hrs = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      const secs = String(now.getSeconds()).padStart(2, '0');
      setCurrentTime(`${hrs}:${mins}:${secs}`);
    }, 1000 / playbackSpeed);

    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  // Handle scenario switching
  const selectScenario = (scenarioId: string) => {
    setActiveScenarioId(scenarioId);
    const scenario = SCENARIOS.find((s) => s.id === scenarioId);
    if (!scenario) return;

    // Update zones
    setZones((prev) =>
      prev.map((zone) => {
        const override = scenario.zoneOverrides[zone.id];
        if (override) {
          const newCount = override.count;
          const newDensity = calculateDensity(newCount, zone.floorAreaM2);
          const newStatus = determineZoneStatus(newDensity, zone.warningThreshold, zone.criticalThreshold);
          return {
            ...zone,
            currentCount: newCount,
            density: newDensity,
            status: newStatus,
            trendRate: override.trend,
          };
        }
        return zone;
      })
    );

    // Update camera health
    if (scenario.cameraHealthState) {
      setCameraHealth((prev) => ({
        ...prev,
        ...scenario.cameraHealthState,
      }));
    } else {
      setCameraHealth(INITIAL_CAMERA_HEALTH);
    }
  };

  const totalPeopleCount = zones.reduce((sum, z) => sum + z.currentCount, 0);
  const zonesAboveNormalCount = zones.filter((z) => z.status !== 'normal').length;

  const reviewAlert = (alertId: string, action: 'confirm' | 'dismiss', notes: string) => {
    const reviewerTitle =
      role === 'Safety Reviewer'
        ? 'A. Vasquez (Trained Safety Reviewer)'
        : role === 'Security Operator'
        ? 'J. Miller (Security Operator)'
        : 'S. Patel (Venue Administrator)';

    const nowStr = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setAlerts((prev) =>
      prev.map((alert) => {
        if (alert.id === alertId) {
          return {
            ...alert,
            status: action === 'confirm' ? 'Confirmed' : 'Dismissed',
            reviewedBy: reviewerTitle,
            reviewedAt: nowStr,
            reviewerNotes: notes,
          };
        }
        return alert;
      })
    );

    setActiveReviewAlert(null);
  };

  const dispatchEscalation = (
    summary: Omit<EscalationSummary, 'id' | 'timestamp' | 'status' | 'dispatchedAt'>
  ) => {
    const escId = `ESC-2026-${String(Math.floor(100 + Math.random() * 900))}`;
    const nowTime = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const newEsc: EscalationSummary = {
      ...summary,
      id: escId,
      timestamp: nowTime,
      status: 'Dispatched to Control Room',
      dispatchedAt: nowTime,
    };

    setEscalations((prev) => [newEsc, ...prev]);

    // Mark the alert as escalated
    setAlerts((prev) =>
      prev.map((alt) => {
        if (alt.id === summary.alertId) {
          return {
            ...alt,
            escalated: true,
            escalationId: escId,
          };
        }
        return alt;
      })
    );

    setActiveEscalateAlert(null);
  };

  const updateZone = (zoneId: string, updates: Partial<Zone>) => {
    setZones((prev) =>
      prev.map((zone) => {
        if (zone.id === zoneId) {
          const updated = { ...zone, ...updates };
          const density = calculateDensity(updated.currentCount, updated.floorAreaM2);
          const status = determineZoneStatus(density, updated.warningThreshold, updated.criticalThreshold);
          return {
            ...updated,
            density,
            status,
          };
        }
        return zone;
      })
    );
  };

  return (
    <CrowdContext.Provider
      value={{
        activeTab,
        setActiveTab,
        role,
        setRole,
        activeScenarioId,
        selectScenario,
        zones,
        alerts,
        escalations,
        cameraHealth,
        currentTime,
        totalPeopleCount,
        zonesAboveNormalCount,
        selectedZoneId,
        setSelectedZoneId,
        activeReviewAlert,
        setActiveReviewAlert,
        activeEscalateAlert,
        setActiveEscalateAlert,
        isPlaying,
        setIsPlaying,
        playbackSpeed,
        setPlaybackSpeed,
        timelineSeconds,
        setTimelineSeconds,
        reviewAlert,
        dispatchEscalation,
        updateZone,
        scenarios: SCENARIOS,
      }}
    >
      {children}
    </CrowdContext.Provider>
  );
};

export function useCrowd() {
  const context = useContext(CrowdContext);
  if (!context) {
    throw new Error('useCrowd must be used within a CrowdProvider');
  }
  return context;
}
