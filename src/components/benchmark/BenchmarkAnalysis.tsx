import React, { useState } from 'react';
import {
  BarChart3,
  GitCompare,
  TrendingUp,
  Clock,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import { useSimulation } from '../../context/SimulationContext';
import { BenchmarkResult } from '../../types';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const BenchmarkAnalysis: React.FC = () => {
  const { benchmarkResults, setActiveTab } = useSimulation();

  // Selection for side-by-side comparison
  const [selectedRunIdA, setSelectedRunIdA] = useState<string>(
    benchmarkResults[0]?.id || ''
  );
  const [selectedRunIdB, setSelectedRunIdB] = useState<string>(
    benchmarkResults[1]?.id || benchmarkResults[0]?.id || ''
  );

  const runA = benchmarkResults.find((r) => r.id === selectedRunIdA) || benchmarkResults[0];
  const runB = benchmarkResults.find((r) => r.id === selectedRunIdB) || benchmarkResults[1] || runA;

  // Multi-run latency percentiles comparison chart data
  const percentileComparisonData = [
    {
      metric: 'Min Latency',
      [runA?.id || 'Run A']: runA?.latencyMs.min || 0,
      [runB?.id || 'Run B']: runB?.latencyMs.min || 0,
    },
    {
      metric: 'P50 (Median)',
      [runA?.id || 'Run A']: runA?.latencyMs.p50 || 0,
      [runB?.id || 'Run B']: runB?.latencyMs.p50 || 0,
    },
    {
      metric: 'Average',
      [runA?.id || 'Run A']: runA?.latencyMs.avg || 0,
      [runB?.id || 'Run B']: runB?.latencyMs.avg || 0,
    },
    {
      metric: 'P95 Tail',
      [runA?.id || 'Run A']: runA?.latencyMs.p95 || 0,
      [runB?.id || 'Run B']: runB?.latencyMs.p95 || 0,
    },
    {
      metric: 'P99 Worst-case',
      [runA?.id || 'Run A']: runA?.latencyMs.p99 || 0,
      [runB?.id || 'Run B']: runB?.latencyMs.p99 || 0,
    },
  ];

  // Historical runs throughput & latency trend
  const historicalTrendData = [...benchmarkResults]
    .reverse()
    .map((r, index) => ({
      name: `#${index + 1} (${r.id.slice(-6)})`,
      id: r.id,
      tps: r.averageThroughputEventsPerSec,
      peakTps: r.peakThroughputEventsPerSec,
      avgLatency: r.latencyMs.avg,
      p95Latency: r.latencyMs.p95,
      cpu: r.resourceUsage.avgCpuPercent,
      mode: r.config.processingMode,
    }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Benchmark Analytics & SLA Evaluation
            </h1>
            <Badge variant="cyan" size="sm">
              {benchmarkResults.length} Test Runs Logged
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Statistical latency percentiles ($P_{50}, P_{95}, P_{99}$), throughput scaling limits, resource overhead, and comparative run analysis.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setActiveTab('testing')}
          icon={<Zap className="w-3.5 h-3.5" />}
        >
          Run New Benchmark
        </Button>
      </div>

      {/* Primary Statistical Breakdown Cards (Active Run A) */}
      {runA && (
        <div>
          <div className="flex items-center justify-between mb-3 text-xs">
            <span className="font-semibold text-slate-300">
              Primary Reference Benchmark: <strong className="text-cyan-400 font-mono">{runA.id}</strong> ({runA.config.processingMode})
            </span>
            <span className="text-slate-400">Date: {runA.testDate}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Average Latency</span>
              <span className="text-2xl font-bold font-mono text-teal-400">
                {runA.latencyMs.avg} <span className="text-xs text-slate-400 font-sans">ms</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Target: &lt;50ms</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">P95 Tail Latency</span>
              <span className="text-2xl font-bold font-mono text-amber-400">
                {runA.latencyMs.p95} <span className="text-xs text-slate-400 font-sans">ms</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">P99: {runA.latencyMs.p99}ms</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Min / Max Latency</span>
              <span className="text-xl font-bold font-mono text-slate-200">
                {runA.latencyMs.min} / {runA.latencyMs.max} <span className="text-xs text-slate-400 font-sans">ms</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">Full spectrum</span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Avg Throughput</span>
              <span className="text-2xl font-bold font-mono text-cyan-400">
                {runA.averageThroughputEventsPerSec.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                Peak: {runA.peakThroughputEventsPerSec.toLocaleString()} EPS
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">Error Rate</span>
              <span
                className={`text-2xl font-bold font-mono ${
                  runA.failedEventsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}
              >
                {(
                  (runA.failedEventsCount / runA.totalEventsIngested) *
                  100
                ).toFixed(2)}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {runA.failedEventsCount} failed
              </span>
            </div>

            <div className="glass-panel p-4 rounded-xl border border-slate-800">
              <span className="text-[11px] font-medium text-slate-400 block mb-1">CPU & Memory</span>
              <span className="text-xl font-bold font-mono text-indigo-400">
                {runA.resourceUsage.avgCpuPercent}% <span className="text-xs text-slate-400 font-sans">CPU</span>
              </span>
              <span className="text-[10px] text-slate-400 block mt-1">
                {runA.resourceUsage.avgMemoryMb} MB RAM
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Side-by-Side Comparison Selector */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                Side-by-Side Benchmark Run Comparison
              </h2>
              <p className="text-xs text-slate-400">
                Select any two historical runs to compare async vs sync scaling and resource footprints
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-semibold">Run A:</span>
              <select
                value={selectedRunIdA}
                onChange={(e) => setSelectedRunIdA(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
              >
                {benchmarkResults.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} ({r.config.processingMode} - {r.config.eventCount.toLocaleString()} evt)
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-amber-400 font-semibold">Run B:</span>
              <select
                value={selectedRunIdB}
                onChange={(e) => setSelectedRunIdB(e.target.value)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none"
              >
                {benchmarkResults.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.id} ({r.config.processingMode} - {r.config.eventCount.toLocaleString()} evt)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Comparison Bar Chart */}
        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={percentileComparisonData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="metric" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} unit="ms" />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b1120',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey={runA?.id || 'Run A'} name={`Run A: ${runA?.config.processingMode}`} fill="#06b6d4" radius={[4, 4, 0, 0]} />
              <Bar dataKey={runB?.id || 'Run B'} name={`Run B: ${runB?.config.processingMode}`} fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Side-by-Side Delta Metrics Table */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[10px] font-semibold">
              <tr>
                <th className="py-2.5 px-3">Benchmark Metric</th>
                <th className="py-2.5 px-3 text-cyan-400 font-mono">Run A ({runA?.id})</th>
                <th className="py-2.5 px-3 text-amber-400 font-mono">Run B ({runB?.id})</th>
                <th className="py-2.5 px-3 text-right">Advantage / Delta</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              <tr>
                <td className="py-2.5 px-3 font-medium">Processing Architecture</td>
                <td className="py-2.5 px-3 text-cyan-300">{runA?.config.processingMode}</td>
                <td className="py-2.5 px-3 text-amber-300">{runB?.config.processingMode}</td>
                <td className="py-2.5 px-3 text-right text-slate-400">—</td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Average Latency</td>
                <td className="py-2.5 px-3 font-mono">{runA?.latencyMs.avg} ms</td>
                <td className="py-2.5 px-3 font-mono">{runB?.latencyMs.avg} ms</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-400">
                  {runA && runB
                    ? `${Math.abs(Number((runA.latencyMs.avg - runB.latencyMs.avg).toFixed(1)))} ms ${
                        runA.latencyMs.avg < runB.latencyMs.avg ? 'faster (Run A)' : 'faster (Run B)'
                      }`
                    : '—'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">Peak Throughput</td>
                <td className="py-2.5 px-3 font-mono">{runA?.peakThroughputEventsPerSec.toLocaleString()} EPS</td>
                <td className="py-2.5 px-3 font-mono">{runB?.peakThroughputEventsPerSec.toLocaleString()} EPS</td>
                <td className="py-2.5 px-3 text-right font-mono font-bold text-cyan-400">
                  {runA && runB
                    ? `${(
                        (Math.abs(runA.peakThroughputEventsPerSec - runB.peakThroughputEventsPerSec) /
                          Math.min(runA.peakThroughputEventsPerSec, runB.peakThroughputEventsPerSec)) *
                        100
                      ).toFixed(0)}% gain`
                    : '—'}
                </td>
              </tr>
              <tr>
                <td className="py-2.5 px-3 font-medium">SLA Compliance</td>
                <td className="py-2.5 px-3">
                  <Badge variant={runA?.slaPassed ? 'emerald' : 'rose'} size="sm">
                    {runA?.slaPassed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </td>
                <td className="py-2.5 px-3">
                  <Badge variant={runB?.slaPassed ? 'emerald' : 'rose'} size="sm">
                    {runB?.slaPassed ? 'PASSED' : 'FAILED'}
                  </Badge>
                </td>
                <td className="py-2.5 px-3 text-right font-medium">
                  {runA?.slaPassed && !runB?.slaPassed
                    ? 'Run A met all SLA criteria'
                    : runB?.slaPassed && !runA?.slaPassed
                    ? 'Run B met all SLA criteria'
                    : 'Both met criteria'}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Historical Throughput & Latency Progression Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Throughput Scaling Progression across Test Runs
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Comparison of average throughput (EPS) and CPU saturation across chronological runs
            </p>
          </div>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={historicalTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
              <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0b1120',
                  borderColor: '#1e293b',
                  borderRadius: '0.75rem',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line
                type="monotone"
                dataKey="tps"
                name="Avg Throughput (EPS)"
                stroke="#06b6d4"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#06b6d4' }}
              />
              <Line
                type="monotone"
                dataKey="peakTps"
                name="Peak Throughput (EPS)"
                stroke="#38bdf8"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="avgLatency"
                name="Avg Latency (ms)"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3, fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};
