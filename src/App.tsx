/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { CrowdProvider, useCrowd } from './context/CrowdContext';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { OverviewTab } from './components/OverviewTab';
import { LiveReplayTab } from './components/LiveReplayTab';
import { ZonesTab } from './components/ZonesTab';
import { TrendsTab } from './components/TrendsTab';
import { AlertsTab } from './components/AlertsTab';
import { EscalationTab } from './components/EscalationTab';
import { CameraHealthTab } from './components/CameraHealthTab';
import { EvaluationTab } from './components/EvaluationTab';
import { MethodologyTab } from './components/MethodologyTab';
import { AdminTab } from './components/AdminTab';
import { ReviewModal } from './components/ReviewModal';
import { EscalationModal } from './components/EscalationModal';

const DashboardContent: React.FC = () => {
  const { activeTab } = useCrowd();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      <Header />
      <Navigation />

      <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto">
        {activeTab === 'overview' && <OverviewTab />}
        {activeTab === 'replay' && <LiveReplayTab />}
        {activeTab === 'zones' && <ZonesTab />}
        {activeTab === 'trends' && <TrendsTab />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'escalation' && <EscalationTab />}
        {activeTab === 'health' && <CameraHealthTab />}
        {activeTab === 'evaluation' && <EvaluationTab />}
        {activeTab === 'methodology' && <MethodologyTab />}
        {activeTab === 'admin' && <AdminTab />}
      </main>

      {/* Global Modals */}
      <ReviewModal />
      <EscalationModal />

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 py-4 px-6 text-center text-xs text-slate-400">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-2 max-w-7xl mx-auto">
          <div>
            <strong className="text-slate-300">Crowd Monitor</strong> — Live Crowd Counting and Zone Occupancy Review System
          </div>
          <div className="text-[11px] text-slate-400">
            Decision-support prototype • Zero face storage • Human review before venue escalation
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <CrowdProvider>
      <DashboardContent />
    </CrowdProvider>
  );
}
