import React from 'react';
import {
  Activity,
  Gauge,
  Cpu,
  Layers,
  HardDrive,
  Bus,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  TrendingUp,
  AlertTriangle,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { useSimulation } from '../../context/SimulationContext';
import { StatCard } from '../common/StatCard';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const OverviewDashboard: React.FC = () => {
  const {
    totalEventsProcessed,
    currentThroughput,
    averageLatency,
    p50Latency,
    p95Latency,
    p99Latency,
    cpuUtilization,
    memoryMb,
    activeBusesCount,
    queueBacklog,
    successRate,
    timeSeriesHistory,
    setActiveTab,
    isChaosMode,
    isTesting,
  } = useSimulation();

  // Pie chart data for event types
  const eventDistributionData = [
    { name: 'GPS Telemetry', value: 58, color: '#06b6d4' },
    { name: 'Passenger Tap-in', value: 24, color: '#38bdf8' },
    { name: 'Door & Diagnostics', value: 12, color: '#10b981' },
    { name: 'Traffic / Schedule Alerts', value: 6, color: '#f59e0b' },
  ];

  // Success vs Failure data
  const successVsFailData = [
    { name: 'Successful Events', value: 99.98, color: '#10b981' },
    { name: 'DLQ / Failed', value: 0.02, color: '#f43f5e' },
  ];

  // Route breakdown data
  const routeThroughputData = [
    { route: 'R-42 Downtown', throughput: 1420, buses: 4 },
    { route: 'R-17 Metro', throughput: 1150, buses: 3 },
    { route: 'R-88 Airport', throughput: 890, buses: 3 },
    { route: 'R-09 Industrial', throughput: 380, buses: 2 },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Smart Transit Telemetry Overview
            </h1>
            <Badge variant="cyan" size="sm" dot>
              Live Telemetry Stream
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time telemetry ingestion, Kafka queue health, Go worker throughput, and resource utilization.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            icon={<ArrowUpRight className="w-3.5 h-3.5" />}
            iconPosition="right"
            onClick={() => setActiveTab('monitoring')}
          >
            Live Transit Map
          </Button>

          <Button
            variant="primary"
            size="sm"
            icon={<Gauge className="w-3.5 h-3.5" />}
            onClick={() => setActiveTab('testing')}
          >
            Launch Benchmark Test
          </Button>
        </div>
      </div>

      {/* Chaos Mode Active Warning Banner */}
      {isChaosMode && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between text-xs text-rose-300 animate-pulse">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
            <span>
              <strong>Chaos Injection Active:</strong> Pipeline experiencing simulated network backpressure, high Kafka partition lag, and elevated write latency.
            </span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className="text-xs py-1 px-2.5"
            onClick={() => setActiveTab('bottlenecks')}
          >
            Inspect Bottlenecks
          </Button>
        </div>
      )}

      {/* 8 Primary Top Stat Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Events Processed"
          value={totalEventsProcessed}
          icon={<Layers className="w-5 h-5" />}
          iconBgColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
          change={{ value: '+14.2%', isPositive: true, label: 'today' }}
          status={{ label: 'Continuous', variant: 'cyan' }}
        />

        <StatCard
          title="Current Throughput"
          value={currentThroughput}
          unit="events/sec"
          icon={<Activity className="w-5 h-5" />}
          iconBgColor="bg-sky-500/10 text-sky-400 border-sky-500/20"
          change={{ value: isChaosMode ? '-52.4%' : '+6.8%', isPositive: !isChaosMode, label: 'vs avg' }}
          status={{
            label: currentThroughput > 3000 ? 'HIGH TPS' : 'NORMAL',
            variant: currentThroughput > 3000 ? 'emerald' : 'blue',
          }}
        />

        <StatCard
          title="Avg End-to-End Latency"
          value={averageLatency}
          unit="ms"
          icon={<Clock className="w-5 h-5" />}
          iconBgColor="bg-teal-500/10 text-teal-400 border-teal-500/20"
          subtext={`P95: ${p95Latency}ms | P99: ${p99Latency}ms`}
          status={{
            label: averageLatency < 30 ? 'OPTIMAL' : averageLatency < 60 ? 'ELEVATED' : 'SLA BREACH',
            variant: averageLatency < 30 ? 'emerald' : averageLatency < 60 ? 'amber' : 'rose',
          }}
        />

        <StatCard
          title="Processing Success Rate"
          value={successRate}
          unit="%"
          icon={<CheckCircle2 className="w-5 h-5" />}
          iconBgColor="bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
          subtext="Zero packet loss tolerance target"
          status={{ label: successRate > 99.5 ? 'TARGET MET' : 'DEGRADED', variant: successRate > 99.5 ? 'emerald' : 'rose' }}
        />

        <StatCard
          title="CPU Utilization"
          value={cpuUtilization}
          unit="%"
          icon={<Cpu className="w-5 h-5" />}
          iconBgColor="bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
          subtext="Go Worker Cluster (4 Cores)"
          status={{
            label: cpuUtilization > 85 ? 'HIGH LOAD' : 'HEALTHY',
            variant: cpuUtilization > 85 ? 'rose' : 'blue',
          }}
        />

        <StatCard
          title="Memory Consumption"
          value={memoryMb}
          unit="MB"
          icon={<HardDrive className="w-5 h-5" />}
          iconBgColor="bg-purple-500/10 text-purple-400 border-purple-500/20"
          subtext="TimescaleDB & Redis Cache"
          status={{ label: 'NOMINAL', variant: 'blue' }}
        />

        <StatCard
          title="Active Simulated Buses"
          value={activeBusesCount}
          unit="vehicles"
          icon={<Bus className="w-5 h-5" />}
          iconBgColor="bg-cyan-500/10 text-cyan-400 border-cyan-500/20"
          subtext="Across 4 transit corridors"
          onClick={() => setActiveTab('monitoring')}
          status={{ label: 'VIEW MAP', variant: 'cyan' }}
        />

        <StatCard
          title="Kafka Queue Backlog"
          value={queueBacklog}
          unit="events"
          icon={<Gauge className="w-5 h-5" />}
          iconBgColor="bg-amber-500/10 text-amber-400 border-amber-500/20"
          subtext="12 topic partitions"
          status={{
            label: queueBacklog > 5000 ? 'CONGESTION' : 'NORMAL LAG',
            variant: queueBacklog > 5000 ? 'rose' : 'emerald',
          }}
        />
      </div>

      {/* Primary Charts Row 1: Throughput and Latency */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Real-time Throughput Area Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                Live Ingestion & Processing Throughput
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time throughput trend measured in events per second (EPS)
              </p>
            </div>
            <span className="text-xs font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20">
              {currentThroughput.toLocaleString()} EPS
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="throughput"
                  name="Throughput (EPS)"
                  stroke="#06b6d4"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#tpsGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Real-time Latency Trends (P50, P95, P99) */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-base font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                End-to-End Latency Trends
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Percentile distribution: P50 median vs P95 tail latency (ms)
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-0.5 bg-teal-400 inline-block" /> Avg ({averageLatency}ms)
              </span>
              <span className="flex items-center gap-1 text-slate-300">
                <span className="w-2.5 h-0.5 bg-amber-400 inline-block" /> P95 ({p95Latency}ms)
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                    color: '#e2e8f0',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="latencyMs"
                  name="Avg Latency (ms)"
                  stroke="#14b8a6"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="p95LatencyMs"
                  name="P95 Latency (ms)"
                  stroke="#f59e0b"
                  strokeWidth={1.5}
                  strokeDasharray="4 4"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Secondary Charts Row 2: Resource Footprint, Event Breakdown, Route TPS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CPU & Memory Utilization */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                Cluster Resource Utilization
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Go Processors CPU % & Memory MB</p>
            </div>
            <span className="text-xs font-mono text-indigo-400">{cpuUtilization}% CPU</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeriesHistory} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="cpuGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="cpuPercent"
                  name="CPU %"
                  stroke="#6366f1"
                  strokeWidth={2}
                  fill="url(#cpuGradient)"
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Telemetry Event Type Distribution */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-cyan-400" />
                Event Stream Classification
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Payload distribution by sensor source</p>
            </div>
          </div>

          <div className="h-44 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={eventDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={68}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {eventDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Share']}
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-slate-800">
            {eventDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5 truncate">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-300 truncate">{item.name}</span>
                <span className="text-slate-400 ml-auto font-mono">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Throughput by Route Bar Chart */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Bus className="w-4 h-4 text-emerald-400" />
                Throughput by Transit Corridor
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">Active bus count and ingested EPS</p>
            </div>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={routeThroughputData} layout="vertical" margin={{ top: 5, right: 10, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" opacity={0.6} horizontal={false} />
                <XAxis type="number" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis dataKey="route" type="category" stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0b1120',
                    borderColor: '#1e293b',
                    borderRadius: '0.75rem',
                    fontSize: '11px',
                  }}
                />
                <Bar dataKey="throughput" name="EPS" fill="#38bdf8" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
