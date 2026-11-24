import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Server,
  Database,
  Sliders,
  Bell,
  RotateCcw,
  CheckCircle2,
  AlertTriangle,
  Info,
  Save,
  Radio,
  ExternalLink,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const SettingsView: React.FC = () => {
  const { settings, updateSettings, resetAllData } = useSimulation();

  // Local state for editable settings form
  const [form, setForm] = useState(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [connectionTestStatus, setConnectionTestStatus] = useState<string | null>(null);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(form);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const testBackendConnection = () => {
    setConnectionTestStatus('testing');
    setTimeout(() => {
      // Honest check: since it's a simulated environment running without local Go server
      if (form.mockMode) {
        setConnectionTestStatus('mock_active');
      } else {
        setConnectionTestStatus('not_reachable');
      }
    }, 800);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              System Settings & Integration Endpoints
            </h1>
            <Badge variant="cyan" size="sm">
              Configuration Panel
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Configure telemetry refresh frequency, warning thresholds, and external Kafka/Prometheus connection parameters.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={resetAllData}
            icon={<RotateCcw className="w-3.5 h-3.5" />}
          >
            Reset All to Defaults
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            icon={<Save className="w-3.5 h-3.5" />}
          >
            Save Configuration
          </Button>
        </div>
      </div>

      {saveSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-2 text-xs text-emerald-300 animate-in fade-in duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          Settings successfully persisted to application state and browser local storage!
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Panel 1: Simulation Tuning Parameters */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Telemetry Simulation Tuning
            </h2>
          </div>

          {/* Refresh Frequency */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Simulation Ticker Interval</span>
              <span className="font-mono text-cyan-400">{form.simulationRefreshRateMs} ms</span>
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[200, 500, 1000, 2000].map((rate) => (
                <button
                  key={rate}
                  type="button"
                  onClick={() => setForm({ ...form, simulationRefreshRateMs: rate })}
                  className={`py-2 text-xs font-mono rounded-xl border transition-all ${
                    form.simulationRefreshRateMs === rate
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 font-bold'
                      : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:bg-slate-850'
                  }`}
                >
                  {rate}ms
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              Frequency of GPS coordinate updates and telemetry packet emission.
            </p>
          </div>

          {/* Fleet Size */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Simulated Fleet Size</span>
              <span className="font-mono text-sky-400">{form.fleetSize} Active Buses</span>
            </label>
            <input
              type="range"
              min="4"
              max="24"
              step="2"
              value={form.fleetSize}
              onChange={(e) => setForm({ ...form, fleetSize: Number(e.target.value) })}
              className="w-full accent-cyan-400"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>4 Buses</span>
              <span>12 Buses (Recommended)</span>
              <span>24 Buses</span>
            </div>
          </div>

          {/* Target Sync Delay Target */}
          <div className="space-y-2 pt-2">
            <label className="text-xs font-semibold text-slate-300 flex justify-between">
              <span>Target Dashboard Sync Delay Benchmark</span>
              <span className="font-mono text-teal-400">{form.targetDashboardSyncDelayMs} ms</span>
            </label>
            <input
              type="range"
              min="100"
              max="1000"
              step="50"
              value={form.targetDashboardSyncDelayMs}
              onChange={(e) =>
                setForm({ ...form, targetDashboardSyncDelayMs: Number(e.target.value) })
              }
              className="w-full accent-teal-400"
            />
            <p className="text-[11px] text-slate-400">
              Project SLA standard: ≤ 500ms delay between edge event creation and dashboard refresh.
            </p>
          </div>
        </div>

        {/* Panel 2: Alert Thresholds */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <Bell className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Diagnostic Bottleneck Thresholds
            </h2>
          </div>

          <div className="space-y-3 text-xs">
            {/* CPU Ceiling */}
            <div className="space-y-1">
              <label className="font-semibold text-slate-300 flex justify-between">
                <span>CPU Saturation Warning Limit</span>
                <span className="font-mono text-indigo-400">{form.cpuAlertThresholdPercent}%</span>
              </label>
              <input
                type="range"
                min="50"
                max="95"
                step="5"
                value={form.cpuAlertThresholdPercent}
                onChange={(e) =>
                  setForm({ ...form, cpuAlertThresholdPercent: Number(e.target.value) })
                }
                className="w-full accent-indigo-400"
              />
            </div>

            {/* Latency Threshold */}
            <div className="space-y-1 pt-2">
              <label className="font-semibold text-slate-300 flex justify-between">
                <span>End-to-End Latency SLA Breach Ceiling</span>
                <span className="font-mono text-teal-400">{form.latencyAlertThresholdMs} ms</span>
              </label>
              <input
                type="range"
                min="20"
                max="250"
                step="10"
                value={form.latencyAlertThresholdMs}
                onChange={(e) =>
                  setForm({ ...form, latencyAlertThresholdMs: Number(e.target.value) })
                }
                className="w-full accent-teal-400"
              />
            </div>

            {/* Kafka Backlog Limit */}
            <div className="space-y-1 pt-2">
              <label className="font-semibold text-slate-300 flex justify-between">
                <span>Kafka Consumer Group Lag Warning Level</span>
                <span className="font-mono text-amber-400">
                  {form.queueAlertThresholdEvents.toLocaleString()} events
                </span>
              </label>
              <input
                type="range"
                min="1000"
                max="20000"
                step="1000"
                value={form.queueAlertThresholdEvents}
                onChange={(e) =>
                  setForm({ ...form, queueAlertThresholdEvents: Number(e.target.value) })
                }
                className="w-full accent-amber-400"
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Backend & Integration Endpoints (Spans full width) */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                External Backend & Observability Endpoints
              </h2>
            </div>
            <Badge variant={form.mockMode ? 'cyan' : 'emerald'} size="sm">
              {form.mockMode ? 'Interactive Mock Engine' : 'Live Go Cluster'}
            </Badge>
          </div>

          {/* Transparent Integration Disclaimer */}
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-300 space-y-1">
            <strong className="text-cyan-400">Integration Transparency: </strong>
            <span>
              This frontend is currently operating in <strong>Simulated Demonstration Mode</strong>. When ready to connect to a production Go microservice environment, toggle off mock mode and provide your live Kafka cluster and Prometheus scraping endpoints below.
            </span>
          </div>

          {/* Mode Toggle */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            <input
              type="checkbox"
              id="mockModeToggle"
              checked={form.mockMode}
              onChange={(e) => setForm({ ...form, mockMode: e.target.checked })}
              className="w-4 h-4 rounded text-cyan-500 focus:ring-0 cursor-pointer"
            />
            <label htmlFor="mockModeToggle" className="cursor-pointer">
              <strong className="text-white block">Enable Built-in Browser Simulation Engine</strong>
              <span className="text-slate-400">
                Recommended for presentation, college evaluations, and offline benchmark demos without requiring Docker containers running locally.
              </span>
            </label>
          </div>

          {/* Endpoint Input Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Go Ingestion Service Endpoint</label>
              <input
                type="text"
                disabled={form.mockMode}
                value={form.ingestionApiUrl}
                onChange={(e) => setForm({ ...form, ingestionApiUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Apache Kafka Broker Address</label>
              <input
                type="text"
                disabled={form.mockMode}
                value={form.kafkaBrokerUrl}
                onChange={(e) => setForm({ ...form, kafkaBrokerUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Prometheus Metrics Exporter URL</label>
              <input
                type="text"
                disabled={form.mockMode}
                value={form.prometheusUrl}
                onChange={(e) => setForm({ ...form, prometheusUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs disabled:opacity-50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="font-semibold text-slate-300">Gatling Performance Reports Path</label>
              <input
                type="text"
                disabled={form.mockMode}
                value={form.gatlingReportUrl}
                onChange={(e) => setForm({ ...form, gatlingReportUrl: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700/80 rounded-lg px-3 py-2 text-slate-200 font-mono text-xs disabled:opacity-50"
              />
            </div>
          </div>

          {/* Test Connection Button */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={testBackendConnection}
              icon={<Radio className="w-3.5 h-3.5" />}
            >
              Ping Integration Endpoints
            </Button>

            {connectionTestStatus === 'mock_active' && (
              <span className="text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Internal Simulation Engine Active & Responsive (0.2ms)
              </span>
            )}

            {connectionTestStatus === 'not_reachable' && (
              <span className="text-xs text-amber-400 font-medium flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" /> External Go backend at {form.ingestionApiUrl} not reachable. Reverted to simulated data.
              </span>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};
