import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  Bell,
  Play,
  Pause,
  Zap,
  Menu,
  Activity,
  CheckCircle2,
  AlertTriangle,
  X,
  Gauge,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { Badge } from './Badge';

interface NavbarProps {
  setMobileOpen: (val: boolean) => void;
  isCollapsed: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ setMobileOpen, isCollapsed }) => {
  const {
    isStreaming,
    setIsStreaming,
    streamSpeed,
    setStreamSpeed,
    isTesting,
    averageLatency,
    notifications,
    markNotificationsRead,
    clearNotifications,
    setActiveTab,
    isChaosMode,
    toggleChaosMode,
    searchQuery,
    setSearchQuery,
    settings,
  } = useSimulation();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

  // Close notifications on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut Ctrl/Cmd+K for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header
        className={`sticky top-0 z-30 h-16 bg-navy-900/80 backdrop-blur-xl border-b border-slate-800/80 transition-all duration-300 flex items-center justify-between px-4 sm:px-6 ${
          isCollapsed ? 'lg:pl-24' : 'lg:pl-[19rem]'
        }`}
      >
        {/* Left Section: Mobile Menu Toggle & Search Bar */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Quick Search Input */}
          <button
            onClick={() => setShowSearchModal(true)}
            className="w-full max-w-xs flex items-center justify-between px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700 text-xs transition-colors group"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span>Search routes, buses, Kafka topics...</span>
            </div>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-800 rounded border border-slate-700">
              Ctrl+K
            </kbd>
          </button>
        </div>

        {/* Center/Right Section: Telemetry Status & Controls */}
        <div className="flex items-center gap-2 sm:gap-4">
          {/* Stream Controls */}
          <div className="hidden sm:flex items-center gap-1.5 px-2 py-1 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <button
              onClick={() => setIsStreaming(!isStreaming)}
              className={`p-1.5 rounded-lg transition-colors ${
                isStreaming
                  ? 'text-cyan-400 hover:bg-cyan-500/10'
                  : 'text-amber-400 hover:bg-amber-500/10'
              }`}
              title={isStreaming ? 'Pause Real-Time Telemetry' : 'Resume Telemetry Stream'}
            >
              {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            </button>

            {/* Speed multipliers */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
              {[1, 2, 5].map((speed) => (
                <button
                  key={speed}
                  onClick={() => setStreamSpeed(speed)}
                  className={`px-1.5 py-0.5 rounded text-[11px] font-mono transition-colors ${
                    streamSpeed === speed
                      ? 'bg-cyan-500/20 text-cyan-300 font-bold border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {speed}x
                </button>
              ))}
            </div>
          </div>

          {/* Chaos Mode Toggle (Instant Demonstration Button) */}
          <button
            onClick={toggleChaosMode}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
              isChaosMode
                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300 animate-pulse glow-rose'
                : 'bg-slate-950/60 border-slate-800/80 text-slate-400 hover:text-amber-400 hover:border-amber-500/30'
            }`}
            title="Inject simulated network congestion, buffer delays, and high Kafka lag"
          >
            <Zap className={`w-3.5 h-3.5 ${isChaosMode ? 'text-rose-400' : 'text-amber-400'}`} />
            <span className="hidden md:inline">{isChaosMode ? 'Chaos Active' : 'Inject Chaos'}</span>
          </button>

          {/* System Telemetry Status Pill */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            {isTesting ? (
              <Badge variant="emerald" size="sm" dot>
                TESTING IN PROGRESS
              </Badge>
            ) : isChaosMode ? (
              <Badge variant="rose" size="sm" dot>
                BOTTLENECK ACTIVE
              </Badge>
            ) : isStreaming ? (
              <Badge variant="cyan" size="sm" dot>
                LIVE STREAMING
              </Badge>
            ) : (
              <Badge variant="amber" size="sm" dot>
                STREAM PAUSED
              </Badge>
            )}

            <span className="font-mono text-slate-400 text-[11px] border-l border-slate-800 pl-2">
              {averageLatency}ms ping
            </span>
          </div>

          {/* Notifications Dropdown */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (!showNotifications && unreadCount > 0) {
                  markNotificationsRead();
                }
              }}
              className="relative p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="System Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-navy-900 animate-pulse" />
              )}
            </button>

            {/* Notification Drawer Popover */}
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl glass-panel border border-slate-700/80 shadow-2xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-white">Notifications</span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300">
                      {notifications.length}
                    </span>
                  </div>
                  <button
                    onClick={clearNotifications}
                    className="text-[11px] text-slate-400 hover:text-cyan-400 transition-colors"
                  >
                    Clear All
                  </button>
                </div>

                <div className="mt-3 max-h-72 overflow-y-auto space-y-2 pr-1">
                  {notifications.length === 0 ? (
                    <div className="text-center py-6 text-xs text-slate-400">
                      No notifications at this time.
                    </div>
                  ) : (
                    notifications.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (item.relatedTab) setActiveTab(item.relatedTab);
                          setShowNotifications(false);
                        }}
                        className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 cursor-pointer transition-all space-y-1"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span
                            className={`font-semibold flex items-center gap-1.5 ${
                              item.type === 'critical'
                                ? 'text-rose-400'
                                : item.type === 'warning'
                                ? 'text-amber-400'
                                : item.type === 'success'
                                ? 'text-emerald-400'
                                : 'text-cyan-400'
                            }`}
                          >
                            {item.type === 'critical' ? (
                              <AlertTriangle className="w-3.5 h-3.5" />
                            ) : item.type === 'success' ? (
                              <CheckCircle2 className="w-3.5 h-3.5" />
                            ) : (
                              <Activity className="w-3.5 h-3.5" />
                            )}
                            {item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {item.timestamp}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed">{item.message}</p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 to-indigo-500 p-0.5 shrink-0">
              <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-xs font-bold text-cyan-300">
                PE
              </div>
            </div>
            <div className="hidden xl:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-tight">
                Transit Engineer
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {settings.mockMode ? 'Simulated Pipeline' : 'Live Go Cluster'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Quick Search Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-start justify-center pt-20 px-4">
          <div className="w-full max-w-xl rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-3 border-b border-slate-800 flex items-center gap-3">
              <Search className="w-5 h-5 text-cyan-400 shrink-0" />
              <input
                autoFocus
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search buses (e.g. BUS-101), routes, pipeline stages, or metrics..."
                className="w-full bg-transparent text-sm text-white focus:outline-none placeholder:text-slate-500"
              />
              <button
                onClick={() => setShowSearchModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Links & Results */}
            <div className="p-4 space-y-3">
              <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                Quick Navigation Shortcuts
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  onClick={() => {
                    setActiveTab('testing');
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 text-left text-slate-200"
                >
                  <Gauge className="w-4 h-4 text-purple-400" />
                  <div>
                    <div className="font-semibold">Performance Testing</div>
                    <div className="text-[10px] text-slate-400">Launch load generation</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('monitoring');
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 text-left text-slate-200"
                >
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <div>
                    <div className="font-semibold">Live Transit Map</div>
                    <div className="text-[10px] text-slate-400">Inspect 12 simulated buses</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('bottlenecks');
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 text-left text-slate-200"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="font-semibold">Bottleneck Detection</div>
                    <div className="text-[10px] text-slate-400">View diagnostic suggestions</div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setActiveTab('reports');
                    setShowSearchModal(false);
                  }}
                  className="p-2.5 rounded-xl bg-slate-900/60 hover:bg-slate-800 border border-slate-800 flex items-center gap-2.5 text-left text-slate-200"
                >
                  <Sliders className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="font-semibold">Reports & CSV Export</div>
                    <div className="text-[10px] text-slate-400">Download benchmark runs</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
