import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Zap,
  TrendingDown,
  Layers,
  Database,
  Cpu,
  Clock,
  ArrowRight,
  ShieldAlert,
  Wrench,
  RotateCcw,
  Info,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { BottleneckAlert } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const BottleneckDetection: React.FC = () => {
  const {
    alerts,
    dismissAlert,
    isChaosMode,
    toggleChaosMode,
    queueBacklog,
    averageLatency,
    cpuUtilization,
    memoryMb,
  } = useSimulation();

  const [appliedRemedies, setAppliedRemedies] = useState<string[]>([]);

  const handleApplyRemedy = (alertId: string, remedyText: string) => {
    setAppliedRemedies((prev) => [...prev, alertId]);
    dismissAlert(alertId);
  };

  const activeAlerts = alerts.filter((a) => a.isActive);
  const resolvedAlerts = alerts.filter((a) => !a.isActive);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Automated Bottleneck Detection & Root Cause Analysis
            </h1>
            <Badge
              variant={isChaosMode ? 'rose' : activeAlerts.length > 0 ? 'amber' : 'emerald'}
              size="sm"
              dot={isChaosMode || activeAlerts.length > 0}
            >
              {isChaosMode
                ? 'CHAOS OVERLOAD SIMULATED'
                : activeAlerts.length > 0
                ? `${activeAlerts.length} Active Warnings`
                : 'All Subsystems Nominal'}
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time heuristic diagnostic engine monitoring Kafka lag, slow worker loops, DB locks, CPU saturation, and backpressure.
          </p>
        </div>

        {/* Chaos Mode Toggle */}
        <div className="flex items-center gap-3">
          <Button
            variant={isChaosMode ? 'danger' : 'outline'}
            size="md"
            icon={<Zap className="w-4 h-4 fill-current" />}
            onClick={toggleChaosMode}
            className={isChaosMode ? 'glow-rose' : ''}
          >
            {isChaosMode ? 'STOP CHAOS INJECTION' : 'TRIGGER CHAOS OVERLOAD'}
          </Button>
        </div>
      </div>

      {/* Real-time Health Matrix Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Kafka Lag Threshold</span>
            <span className="font-mono text-slate-500">Max 5,000</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                queueBacklog > 5000 ? 'text-rose-400' : 'text-emerald-400'
              }`}
            >
              {queueBacklog.toLocaleString()}
            </span>
            <span className="text-xs text-slate-400">events</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full ${
                queueBacklog > 5000 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (queueBacklog / 10000) * 100)}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">End-to-End Latency</span>
            <span className="font-mono text-slate-500">SLA 50.0 ms</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                averageLatency > 50 ? 'text-rose-400' : averageLatency > 25 ? 'text-amber-400' : 'text-emerald-400'
              }`}
            >
              {averageLatency}
            </span>
            <span className="text-xs text-slate-400">ms</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full ${
                averageLatency > 50 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, (averageLatency / 100) * 100)}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Worker CPU Ceiling</span>
            <span className="font-mono text-slate-500">Max 85%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono ${
                cpuUtilization > 85 ? 'text-rose-400' : 'text-indigo-400'
              }`}
            >
              {cpuUtilization}%
            </span>
            <span className="text-xs text-slate-400">load</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div
              className={`h-full ${
                cpuUtilization > 85 ? 'bg-rose-500' : 'bg-indigo-500'
              }`}
              style={{ width: `${Math.min(100, cpuUtilization)}%` }}
            />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-slate-400">Deadlock Frequency</span>
            <span className="font-mono text-slate-500">Target 0.00%</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              0.00%
            </span>
            <span className="text-xs text-slate-400">zero locks</span>
          </div>
          <div className="w-full bg-slate-950 h-1.5 rounded-full mt-2 overflow-hidden border border-slate-800">
            <div className="h-full bg-emerald-500" style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      {/* Active Detected Bottlenecks Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-400" />
            <h2 className="text-base font-bold text-white">
              Detected Pipeline Inefficiencies & Warning Cards
            </h2>
          </div>
          <span className="text-xs text-slate-400">
            Real-time heuristic evaluation updated every second
          </span>
        </div>

        {activeAlerts.length === 0 ? (
          <div className="p-8 rounded-2xl glass-panel border border-emerald-500/30 text-center space-y-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-base font-bold text-white">All Subsystems Operating Optimally</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Kafka consumer lag is within safe buffer parameters, database write queues are unblocked, and worker goroutines are completing processing loops in under 20ms.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleChaosMode}
              icon={<Zap className="w-3.5 h-3.5 text-amber-400" />}
            >
              Test Chaos Overload Mode
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {activeAlerts.map((alert) => {
              const isCritical = alert.severity === 'CRITICAL';
              return (
                <div
                  key={alert.id}
                  className={`glass-panel p-5 rounded-2xl border transition-all duration-200 ${
                    isCritical
                      ? 'border-rose-500/80 bg-rose-950/20 shadow-xl shadow-rose-500/10'
                      : 'border-amber-500/80 bg-amber-950/20'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`p-2.5 rounded-xl border shrink-0 ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                            : 'bg-amber-500/20 text-amber-400 border-amber-500/40'
                        }`}
                      >
                        <AlertTriangle className="w-5 h-5" />
                      </div>

                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                          <Badge variant={isCritical ? 'rose' : 'amber'} size="sm" dot>
                            {alert.severity}
                          </Badge>
                          <span className="text-xs font-mono text-slate-400 bg-slate-900/60 px-2 py-0.5 rounded border border-slate-800">
                            {alert.component}
                          </span>
                        </div>
                        <p className="text-xs text-slate-300 leading-relaxed pt-1">
                          {alert.explanation}
                        </p>
                      </div>
                    </div>

                    {/* Metrics Tag */}
                    <div className="text-right shrink-0 font-mono text-xs p-2 rounded-xl bg-slate-950/60 border border-slate-800">
                      <span className="text-slate-400 block text-[10px]">CURRENT VS LIMIT</span>
                      <span
                        className={`font-bold ${
                          isCritical ? 'text-rose-400' : 'text-amber-400'
                        }`}
                      >
                        {alert.currentValue}
                      </span>
                      <span className="text-slate-500 text-[10px] block">
                        Threshold: {alert.thresholdValue}
                      </span>
                    </div>
                  </div>

                  {/* Optimization Action Card */}
                  <div className="mt-4 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-start gap-2">
                      <Wrench className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-cyan-300">Suggested Optimization Action: </strong>
                        <span className="text-slate-200">{alert.recommendedAction}</span>
                      </div>
                    </div>

                    <Button
                      variant="primary"
                      size="sm"
                      className="shrink-0 text-xs py-1.5"
                      icon={<CheckCircle2 className="w-3.5 h-3.5" />}
                      onClick={() => handleApplyRemedy(alert.id, alert.recommendedAction)}
                    >
                      Apply Optimization
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Resolved Optimization History */}
      {resolvedAlerts.length > 0 && (
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Verified & Stabilized Subsystem Metrics ({resolvedAlerts.length})
            </h3>
            <span className="text-xs text-slate-400 font-mono">Continuous Healthcheck</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {resolvedAlerts.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-xl bg-slate-900/40 border border-slate-800 space-y-1"
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-200">{item.component}</span>
                  <Badge variant="emerald" size="sm">
                    HEALTHY
                  </Badge>
                </div>
                <p className="text-slate-400 text-[11px] leading-relaxed">{item.explanation}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
