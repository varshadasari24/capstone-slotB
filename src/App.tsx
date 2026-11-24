import React, { useState } from 'react';
import { SimulationProvider, useSimulation } from './context/SimulationContext';
import { Sidebar } from './components/common/Sidebar';
import { Navbar } from './components/common/Navbar';
import { OverviewDashboard } from './components/dashboard/OverviewDashboard';
import { LiveTransitMonitoring } from './components/transit/LiveTransitMonitoring';
import { DataPipelineView } from './components/pipeline/DataPipelineView';
import { PerformanceTestingModule } from './components/testing/PerformanceTestingModule';
import { BenchmarkAnalysis } from './components/benchmark/BenchmarkAnalysis';
import { BottleneckDetection } from './components/bottlenecks/BottleneckDetection';
import { ReportsView } from './components/reports/ReportsView';
import { SystemArchitectureView } from './components/architecture/SystemArchitectureView';
import { SettingsView } from './components/settings/SettingsView';
import { Activity, ShieldCheck, Heart } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const { activeTab } = useSimulation();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'overview':
        return <OverviewDashboard />;
      case 'monitoring':
        return <LiveTransitMonitoring />;
      case 'pipeline':
        return <DataPipelineView />;
      case 'testing':
        return <PerformanceTestingModule />;
      case 'benchmark':
        return <BenchmarkAnalysis />;
      case 'bottlenecks':
        return <BottleneckDetection />;
      case 'reports':
        return <ReportsView />;
      case 'architecture':
        return <SystemArchitectureView />;
      case 'settings':
        return <SettingsView />;
      default:
        return <OverviewDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex">
      {/* Responsive Collapsible Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-h-screen transition-all duration-300 w-full ${
          isCollapsed ? 'lg:pl-20' : 'lg:pl-72'
        }`}
      >
        {/* Sticky Top Navigation Bar */}
        <Navbar
          setMobileOpen={setMobileOpen}
          isCollapsed={isCollapsed}
        />

        {/* View Container */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {renderActiveView()}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-navy-900/60 backdrop-blur-md py-4 px-6 text-xs text-slate-400 no-print">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              <span className="font-semibold text-slate-300">
                Smart Transit Performance Benchmark Framework
              </span>
              <span className="font-mono text-slate-400">v2.4.0</span>
            </div>

            <div className="flex items-center gap-4 text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Zero-Loss Benchmark Specification
              </span>
              <span>•</span>
              <span>Final Year Engineering Project Evaluation</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export function App() {
  return (
    <SimulationProvider>
      <DashboardContent />
    </SimulationProvider>
  );
}

export default App;
