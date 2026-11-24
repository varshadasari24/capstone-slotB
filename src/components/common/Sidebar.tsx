import React from 'react';
import {
  LayoutDashboard,
  Bus,
  GitBranch,
  Gauge,
  BarChart3,
  AlertTriangle,
  FileSpreadsheet,
  Network,
  Settings,
  ChevronLeft,
  ChevronRight,
  Activity,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { NavigationTab } from '../../types';

interface SidebarProps {
  isCollapsed: boolean;
  setIsCollapsed: (val: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (val: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  setIsCollapsed,
  mobileOpen,
  setMobileOpen,
}) => {
  const {
    activeTab,
    setActiveTab,
    isTesting,
    alerts,
    isChaosMode,
  } = useSimulation();

  const activeAlertsCount = alerts.filter((a) => a.isActive).length;

  const navItems: {
    id: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: { text: string; color: string; animate?: boolean };
  }[] = [
    {
      id: 'overview',
      label: 'Overview Dashboard',
      icon: <LayoutDashboard className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'monitoring',
      label: 'Live Transit Monitoring',
      icon: <Bus className="w-5 h-5 shrink-0" />,
      badge: { text: '12 Live', color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30' },
    },
    {
      id: 'pipeline',
      label: 'Data Pipeline',
      icon: <GitBranch className="w-5 h-5 shrink-0" />,
      badge: { text: '6 Stages', color: 'bg-sky-500/20 text-sky-300 border-sky-500/30' },
    },
    {
      id: 'testing',
      label: 'Performance Testing',
      icon: <Gauge className="w-5 h-5 shrink-0" />,
      badge: isTesting
        ? { text: 'RUNNING', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40', animate: true }
        : { text: 'Load Gen', color: 'bg-purple-500/20 text-purple-300 border-purple-500/30' },
    },
    {
      id: 'benchmark',
      label: 'Benchmark Analysis',
      icon: <BarChart3 className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'bottlenecks',
      label: 'Bottleneck Detection',
      icon: <AlertTriangle className="w-5 h-5 shrink-0" />,
      badge:
        activeAlertsCount > 0
          ? {
              text: `${activeAlertsCount} Alert${activeAlertsCount > 1 ? 's' : ''}`,
              color: isChaosMode
                ? 'bg-rose-500/30 text-rose-300 border-rose-500/50'
                : 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              animate: isChaosMode,
            }
          : undefined,
    },
    {
      id: 'reports',
      label: 'Reports & Export',
      icon: <FileSpreadsheet className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'architecture',
      label: 'System Architecture',
      icon: <Network className="w-5 h-5 shrink-0" />,
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-5 h-5 shrink-0" />,
    },
  ];

  const handleSelectTab = (tab: NavigationTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 bg-navy-950/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 bg-navy-900/95 backdrop-blur-xl border-r border-slate-800/80 transition-all duration-300 flex flex-col ${
          isCollapsed ? 'w-20' : 'w-72'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800/80">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-sky-500 to-teal-400 p-0.5 shadow-lg shadow-cyan-500/20 shrink-0">
              <div className="w-full h-full bg-navy-950 rounded-[10px] flex items-center justify-center text-cyan-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            {!isCollapsed && (
              <div className="flex flex-col truncate">
                <span className="text-sm font-bold tracking-tight text-white flex items-center gap-1.5">
                  TransitBench
                  <span className="text-[10px] font-mono font-medium px-1.5 py-0.2 bg-cyan-500/20 text-cyan-300 rounded border border-cyan-500/30">
                    v2.4
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 truncate">
                  Asynchronous Stream Evaluator
                </span>
              </div>
            )}
          </div>

          {/* Collapse button (Desktop only) */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex items-center justify-center w-7 h-7 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pb-2 text-[11px] font-semibold tracking-wider uppercase text-slate-400">
              Pipeline Management
            </div>
          )}

          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectTab(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-500/20 via-sky-500/15 to-transparent text-cyan-300 border-l-2 border-cyan-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div
                  className={`transition-colors ${
                    isActive ? 'text-cyan-400' : 'text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  {item.icon}
                </div>

                {!isCollapsed && (
                  <span className="truncate flex-1 text-left">{item.label}</span>
                )}

                {!isCollapsed && item.badge && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-mono font-medium shrink-0 ${
                      item.badge.color
                    } ${item.badge.animate ? 'animate-pulse' : ''}`}
                  >
                    {item.badge.text}
                  </span>
                )}

                {/* Dot for collapsed sidebar with alerts or active test */}
                {isCollapsed && item.badge && (
                  <span
                    className={`absolute right-2 top-2.5 w-2 h-2 rounded-full ${
                      item.badge.animate ? 'bg-cyan-400 animate-ping' : 'bg-cyan-500'
                    }`}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom System Target Benchmarks Status */}
        {!isCollapsed ? (
          <div className="p-3 m-3 rounded-xl bg-slate-950/60 border border-slate-800/90 text-xs space-y-2">
            <div className="flex items-center justify-between text-slate-300 font-semibold text-[11px] uppercase tracking-wider">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> SLA Target Targets
              </span>
              <span className="text-emerald-400 text-[10px]">99.9%</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <div className="flex justify-between items-center">
                <span>Packet Loss:</span>
                <span className="text-emerald-400 font-mono font-medium">0% Target</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Sync Latency:</span>
                <span className="text-cyan-400 font-mono font-medium">≤ 500ms</span>
              </div>
              <div className="flex justify-between items-center">
                <span>DB Deadlocks:</span>
                <span className="text-emerald-400 font-mono font-medium">0.00%</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-3 flex justify-center border-t border-slate-800/80">
            <div
              className="w-8 h-8 rounded-lg bg-slate-800/80 flex items-center justify-center text-cyan-400"
              title="SLA Targets: 0% loss, <=500ms sync, 0% deadlocks"
            >
              <Zap className="w-4 h-4" />
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
