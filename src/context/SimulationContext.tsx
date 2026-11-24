import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import {
  NavigationTab,
  TransitBus,
  TransitRoute,
  PipelineStageMetric,
  BenchmarkTestConfig,
  BenchmarkResult,
  BottleneckAlert,
  SystemNotification,
  SystemSettings,
} from '../types';
import {
  INITIAL_BUSES,
  INITIAL_ROUTES,
  INITIAL_PIPELINE_STAGES,
  INITIAL_BENCHMARK_RESULTS,
  INITIAL_BOTTLENECK_ALERTS,
  INITIAL_SETTINGS,
} from '../data/mockData';

export interface TimeSeriesPoint {
  time: string;
  eventsProcessed: number;
  throughput: number;
  latencyMs: number;
  p95LatencyMs: number;
  cpuPercent: number;
  memoryMb: number;
  failedEvents: number;
  queueDepth: number;
}

export interface LiveTestStats {
  eventsDone: number;
  totalTargetEvents: number;
  elapsedSec: number;
  remainingSec: number;
  currentTps: number;
  currentLatency: number;
  queueBacklog: number;
  successCount: number;
  failureCount: number;
  cpu: number;
  memory: number;
  history: {
    time: string;
    tps: number;
    latency: number;
    queue: number;
    success: number;
    failure: number;
  }[];
}

interface SimulationContextType {
  // Navigation & UI
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Stream controls
  isStreaming: boolean;
  setIsStreaming: (val: boolean) => void;
  streamSpeed: number;
  setStreamSpeed: (val: number) => void;

  // Global live metrics
  totalEventsProcessed: number;
  currentThroughput: number;
  averageLatency: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  cpuUtilization: number;
  memoryMb: number;
  activeBusesCount: number;
  queueBacklog: number;
  successRate: number;
  timeSeriesHistory: TimeSeriesPoint[];

  // Fleet & routes
  buses: TransitBus[];
  routes: TransitRoute[];
  selectedBus: TransitBus | null;
  setSelectedBus: (bus: TransitBus | null) => void;
  injectBusEvent: (busId: string, eventType: string) => void;

  // Pipeline stages
  pipelineStages: PipelineStageMetric[];

  // Performance Testing
  activeTestConfig: BenchmarkTestConfig | null;
  isTesting: boolean;
  testProgress: number; // 0 - 100
  testLiveStats: LiveTestStats | null;
  startBenchmarkTest: (config: BenchmarkTestConfig) => void;
  stopBenchmarkTest: () => void;
  latestResult: BenchmarkResult | null;
  dismissLatestResult: () => void;

  // Benchmark analysis & reports
  benchmarkResults: BenchmarkResult[];
  addBenchmarkResult: (result: BenchmarkResult) => void;
  deleteBenchmarkResult: (id: string) => void;

  // Bottlenecks & Chaos
  alerts: BottleneckAlert[];
  isChaosMode: boolean;
  toggleChaosMode: () => void;
  dismissAlert: (id: string) => void;

  // Notifications
  notifications: SystemNotification[];
  markNotificationsRead: () => void;
  clearNotifications: () => void;

  // Settings
  settings: SystemSettings;
  updateSettings: (newSettings: Partial<SystemSettings>) => void;
  resetAllData: () => void;
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Navigation
  const [activeTab, setActiveTab] = useState<NavigationTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Streaming controls
  const [isStreaming, setIsStreaming] = useState(true);
  const [streamSpeed, setStreamSpeed] = useState(1);

  // Core metrics
  const [totalEventsProcessed, setTotalEventsProcessed] = useState(284810);
  const [currentThroughput, setCurrentThroughput] = useState(3840);
  const [averageLatency, setAverageLatency] = useState(16.4);
  const [p50Latency, setP50Latency] = useState(12.8);
  const [p95Latency, setP95Latency] = useState(34.2);
  const [p99Latency, setP99Latency] = useState(52.6);
  const [cpuUtilization, setCpuUtilization] = useState(44.5);
  const [memoryMb, setMemoryMb] = useState(482);
  const [queueBacklog, setQueueBacklog] = useState(1480);
  const [successRate, setSuccessRate] = useState(99.98);

  // Fleet state
  const [buses, setBuses] = useState<TransitBus[]>(INITIAL_BUSES);
  const [routes] = useState<TransitRoute[]>(INITIAL_ROUTES);
  const [selectedBus, setSelectedBus] = useState<TransitBus | null>(null);

  // Pipeline stages
  const [pipelineStages, setPipelineStages] = useState<PipelineStageMetric[]>(INITIAL_PIPELINE_STAGES);

  // Chaos mode
  const [isChaosMode, setIsChaosMode] = useState(false);
  const [alerts, setAlerts] = useState<BottleneckAlert[]>(INITIAL_BOTTLENECK_ALERTS);

  // Notifications
  const [notifications, setNotifications] = useState<SystemNotification[]>([
    {
      id: 'n-1',
      title: 'Benchmark Runner Ready',
      message: 'Asynchronous Go worker pool initialized with 12 Kafka partitions.',
      type: 'info',
      timestamp: '10:20:15',
      read: false,
      relatedTab: 'testing',
    },
    {
      id: 'n-2',
      title: 'Database Write Latency Alert',
      message: 'Batch write contention observed on TimescaleDB hypertable.',
      type: 'warning',
      timestamp: '10:22:04',
      read: false,
      relatedTab: 'bottlenecks',
    },
  ]);

  // Settings
  const [settings, setSettings] = useState<SystemSettings>(() => {
    const saved = localStorage.getItem('transit_benchmark_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  // Benchmark history
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[]>(() => {
    const saved = localStorage.getItem('transit_benchmark_results');
    return saved ? JSON.parse(saved) : INITIAL_BENCHMARK_RESULTS;
  });

  // Performance Testing Engine State
  const [activeTestConfig, setActiveTestConfig] = useState<BenchmarkTestConfig | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testLiveStats, setTestLiveStats] = useState<LiveTestStats | null>(null);
  const [latestResult, setLatestResult] = useState<BenchmarkResult | null>(null);

  // Time series buffer for overview charts (last 30 seconds)
  const [timeSeriesHistory, setTimeSeriesHistory] = useState<TimeSeriesPoint[]>(() => {
    const points: TimeSeriesPoint[] = [];
    const now = Date.now();
    for (let i = 29; i >= 0; i--) {
      const t = new Date(now - i * 1000);
      const timeStr = `${t.getHours().toString().padStart(2, '0')}:${t.getMinutes().toString().padStart(2, '0')}:${t.getSeconds().toString().padStart(2, '0')}`;
      points.push({
        time: timeStr,
        eventsProcessed: 280000 + (30 - i) * 3500,
        throughput: 3400 + Math.sin(i) * 400 + Math.floor(Math.random() * 200),
        latencyMs: 14 + Math.cos(i) * 3 + Math.random() * 2,
        p95LatencyMs: 28 + Math.cos(i) * 5 + Math.random() * 4,
        cpuPercent: 42 + Math.sin(i) * 6 + Math.random() * 3,
        memoryMb: 470 + i * 0.5 + Math.random() * 5,
        failedEvents: Math.random() > 0.8 ? 1 : 0,
        queueDepth: 1200 + Math.floor(Math.random() * 300),
      });
    }
    return points;
  });

  // Helper to add notification
  const addNotification = useCallback((notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    const newNotif: SystemNotification = {
      ...notif,
      id: `n-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: timeStr,
      read: false,
    };
    setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
  }, []);

  // Update Settings
  const updateSettings = useCallback((newSettings: Partial<SystemSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('transit_benchmark_settings', JSON.stringify(updated));
      return updated;
    });
    addNotification({
      title: 'Settings Updated',
      message: 'Benchmark simulation parameters have been adjusted.',
      type: 'info',
      relatedTab: 'settings',
    });
  }, [addNotification]);

  // Persist results
  const addBenchmarkResult = useCallback((res: BenchmarkResult) => {
    setBenchmarkResults((prev) => {
      const updated = [res, ...prev];
      localStorage.setItem('transit_benchmark_results', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const deleteBenchmarkResult = useCallback((id: string) => {
    setBenchmarkResults((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem('transit_benchmark_results', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const dismissLatestResult = useCallback(() => {
    setLatestResult(null);
  }, []);

  // Toggle chaos mode
  const toggleChaosMode = useCallback(() => {
    setIsChaosMode((prev) => {
      const next = !prev;
      if (next) {
        // Trigger high bottleneck alerts
        setAlerts([
          {
            id: 'alert-chaos-1',
            component: 'Apache Kafka Cluster',
            severity: 'CRITICAL',
            metricName: 'Partition Consumer Lag',
            currentValue: '18,450 events',
            thresholdValue: '5,000 events',
            title: 'Critical Kafka Partition Backpressure Detected',
            explanation: 'Kafka broker ingest is overwhelming consumer workers. Partition lag has exceeded 300% of maximum threshold!',
            recommendedAction: 'Scale Kafka consumer partitions from 12 to 24 and double Go consumer worker pool instances.',
            timestamp: 'Just now',
            isActive: true,
          },
          {
            id: 'alert-chaos-2',
            component: 'TimescaleDB Storage Layer',
            severity: 'CRITICAL',
            metricName: 'Database Write Contention',
            currentValue: '142.0 ms',
            thresholdValue: '25.0 ms',
            title: 'Database Write Lock Starvation',
            explanation: 'Disk I/O saturation and hypertable chunk lock contention are backing up batch insertion queue.',
            recommendedAction: 'Enable asynchronous write buffer and bulk copy-in mode with 500-item chunks.',
            timestamp: 'Just now',
            isActive: true,
          },
          {
            id: 'alert-chaos-3',
            component: 'Asynchronous Go Processors',
            severity: 'WARNING',
            metricName: 'CPU Saturation',
            currentValue: '91.8%',
            thresholdValue: '85.0%',
            title: 'Go Goroutine Scheduler Throttling',
            explanation: 'High concurrency load is creating CPU thread contention across worker pods.',
            recommendedAction: 'Increase GOMAXPROCS and deploy additional container replicas.',
            timestamp: 'Just now',
            isActive: true,
          },
        ]);
        setQueueBacklog(18450);
        setAverageLatency(86.4);
        setP95Latency(145.0);
        setP99Latency(220.0);
        setCpuUtilization(92.4);
        setSuccessRate(96.4);
        addNotification({
          title: 'Chaos Injection Triggered',
          message: 'Simulated network congestion and queue backpressure enabled.',
          type: 'critical',
          relatedTab: 'bottlenecks',
        });
      } else {
        setAlerts(INITIAL_BOTTLENECK_ALERTS);
        setQueueBacklog(1480);
        setAverageLatency(16.4);
        setP95Latency(34.2);
        setP99Latency(52.6);
        setCpuUtilization(44.5);
        setSuccessRate(99.98);
        addNotification({
          title: 'Chaos Mode Disabled',
          message: 'Pipeline restored to optimal throughput conditions.',
          type: 'success',
          relatedTab: 'bottlenecks',
        });
      }
      return next;
    });
  }, [addNotification]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, isActive: false } : a)));
  }, []);

  const markNotificationsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const resetAllData = useCallback(() => {
    setBenchmarkResults(INITIAL_BENCHMARK_RESULTS);
    setAlerts(INITIAL_BOTTLENECK_ALERTS);
    setSettings(INITIAL_SETTINGS);
    setIsChaosMode(false);
    localStorage.removeItem('transit_benchmark_results');
    localStorage.removeItem('transit_benchmark_settings');
    addNotification({
      title: 'System Reset',
      message: 'All benchmark datasets and settings restored to baseline.',
      type: 'info',
    });
  }, [addNotification]);

  // Inject bus event simulation
  const injectBusEvent = useCallback((busId: string, eventType: string) => {
    setBuses((prev) =>
      prev.map((b) => {
        if (b.id === busId) {
          const isDelayed = eventType === 'TRAFFIC_INCIDENT' || eventType === 'MECHANICAL_ALERT';
          return {
            ...b,
            status: isDelayed ? 'Delayed' : 'On Time',
            delayMinutes: isDelayed ? b.delayMinutes + 5 : Math.max(0, b.delayMinutes - 1),
            lastUpdated: 'Just now',
            passengerCount: Math.min(b.capacity, b.passengerCount + (Math.floor(Math.random() * 8) - 3)),
          };
        }
        return b;
      })
    );
    addNotification({
      title: `Event Injected: ${eventType}`,
      message: `Manual telemetry signal dispatched for ${busId}.`,
      type: 'info',
      relatedTab: 'monitoring',
    });
  }, [addNotification]);

  // Main real-time simulation interval (when not running benchmark test)
  useEffect(() => {
    if (!isStreaming) return;

    const intervalTime = Math.max(200, Math.floor(settings.simulationRefreshRateMs / streamSpeed));

    const interval = setInterval(() => {
      // 1. Move buses along their route
      setBuses((prevBuses) =>
        prevBuses.map((bus) => {
          if (bus.status === 'In Depot' || bus.status === 'Mechanical Alert') {
            return bus;
          }
          const progressDelta = bus.speedKmH > 0 ? (bus.speedKmH / 300) * streamSpeed : 0.2;
          let nextProgress = bus.routeProgress + progressDelta;
          let nextDirection = bus.direction;

          if (nextProgress >= 98) {
            nextProgress = 98;
            nextDirection = 'Inbound';
          } else if (nextProgress <= 2) {
            nextProgress = 2;
            nextDirection = 'Outbound';
          }

          // Random slight speed and passenger fluctuation
          const speedVariation = (Math.random() - 0.5) * 4;
          const newSpeed = Math.max(10, Math.min(85, Math.round(bus.speedKmH + speedVariation)));
          const passDelta = Math.random() > 0.6 ? (Math.random() > 0.5 ? 1 : -1) : 0;
          const newPassengers = Math.max(0, Math.min(bus.capacity, bus.passengerCount + passDelta));

          return {
            ...bus,
            routeProgress: Number(nextProgress.toFixed(1)),
            direction: nextDirection,
            speedKmH: newSpeed,
            passengerCount: newPassengers,
            lastUpdated: 'Just now',
          };
        })
      );

      // 2. Adjust global metrics & pipeline stages if not in chaos mode
      if (!isTesting) {
        const jitter = (Math.random() - 0.5) * 200;
        const baseTps = isChaosMode ? 1800 : 3800;
        const newTps = Math.max(1000, Math.round(baseTps + jitter));
        setCurrentThroughput(newTps);

        setTotalEventsProcessed((prev) => prev + Math.round(newTps * (intervalTime / 1000)));

        if (!isChaosMode) {
          const latJitter = (Math.random() - 0.5) * 1.5;
          const newLat = Number(Math.max(8, 16.4 + latJitter).toFixed(1));
          setAverageLatency(newLat);
          setP50Latency(Number((newLat * 0.78).toFixed(1)));
          setP95Latency(Number((newLat * 2.1).toFixed(1)));
          setP99Latency(Number((newLat * 3.2).toFixed(1)));

          const cpuJitter = (Math.random() - 0.5) * 3;
          setCpuUtilization(Number(Math.max(20, Math.min(75, 45 + cpuJitter)).toFixed(1)));

          const memJitter = (Math.random() - 0.5) * 4;
          setMemoryMb(Math.round(480 + memJitter));

          const queueJitter = Math.floor((Math.random() - 0.5) * 80);
          setQueueBacklog(Math.max(400, 1450 + queueJitter));
        }

        // Update pipeline stage counts
        setPipelineStages((prevStages) =>
          prevStages.map((stage, idx) => {
            const added = Math.round(newTps * (intervalTime / 1000));
            const backlogJitter = Math.floor((Math.random() - 0.48) * 15);
            return {
              ...stage,
              eventsReceived: stage.eventsReceived + added,
              eventsProcessed: stage.eventsProcessed + added,
              queueBacklog: Math.max(20, stage.queueBacklog + backlogJitter),
              processingDelayMs: Number((stage.processingDelayMs + (Math.random() - 0.5) * 0.2).toFixed(1)),
              status: isChaosMode && (idx === 2 || idx === 4) ? 'BOTTLENECK' : 'OPTIMAL',
            };
          })
        );

        // Update time series buffer
        const now = new Date();
        const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
        setTimeSeriesHistory((prev) => {
          const newPoint: TimeSeriesPoint = {
            time: timeStr,
            eventsProcessed: totalEventsProcessed,
            throughput: newTps,
            latencyMs: averageLatency,
            p95LatencyMs: p95Latency,
            cpuPercent: cpuUtilization,
            memoryMb: memoryMb,
            failedEvents: isChaosMode ? Math.floor(Math.random() * 15) : Math.random() > 0.85 ? 1 : 0,
            queueDepth: queueBacklog,
          };
          return [...prev.slice(1), newPoint];
        });
      }
    }, intervalTime);

    return () => clearInterval(interval);
  }, [
    isStreaming,
    streamSpeed,
    settings.simulationRefreshRateMs,
    isTesting,
    isChaosMode,
    totalEventsProcessed,
    averageLatency,
    p95Latency,
    cpuUtilization,
    memoryMb,
    queueBacklog,
  ]);

  // Load Test Runner Engine
  const testRef = useRef<{
    intervalId?: ReturnType<typeof setInterval>;
    startTime: number;
    eventsProcessed: number;
    totalTarget: number;
    durationMs: number;
    config: BenchmarkTestConfig;
    history: LiveTestStats['history'];
    peakTps: number;
    sumLatency: number;
    sampleCount: number;
    latencies: number[];
  }>({
    startTime: 0,
    eventsProcessed: 0,
    totalTarget: 0,
    durationMs: 0,
    config: {} as BenchmarkTestConfig,
    history: [],
    peakTps: 0,
    sumLatency: 0,
    sampleCount: 0,
    latencies: [],
  });

  const stopBenchmarkTest = useCallback(() => {
    if (testRef.current.intervalId) {
      clearInterval(testRef.current.intervalId);
    }
    setIsTesting(false);
    setActiveTestConfig(null);
  }, []);

  const startBenchmarkTest = useCallback(
    (config: BenchmarkTestConfig) => {
      // Clear any running test
      if (testRef.current.intervalId) {
        clearInterval(testRef.current.intervalId);
      }

      setIsTesting(true);
      setActiveTestConfig(config);
      setTestProgress(0);

      const targetEvents = config.eventCount;
      const durationMs = config.durationSeconds * 1000;
      const startTime = Date.now();

      testRef.current = {
        startTime,
        eventsProcessed: 0,
        totalTarget: targetEvents,
        durationMs,
        config,
        history: [],
        peakTps: 0,
        sumLatency: 0,
        sampleCount: 0,
        latencies: [],
      };

      addNotification({
        title: `Load Test Started: ${config.eventCount.toLocaleString()} Events`,
        message: `${config.workloadIntensity} intensity workload with ${config.virtualUsers} virtual users (${config.processingMode}).`,
        type: 'info',
        relatedTab: 'testing',
      });

      const tickInterval = 250; // update 4 times a second for super responsive charts

      const intervalId = setInterval(() => {
        const elapsedMs = Date.now() - testRef.current.startTime;
        const progress = Math.min(100, Math.round((elapsedMs / durationMs) * 100));
        setTestProgress(progress);

        // Calculate workload characteristics based on mode and intensity
        const isAsync = config.processingMode === 'Async Kafka Worker Pool';
        const isBatch = config.processingMode === 'Batch Buffer Pipeline';

        // Target TPS based on intensity and mode
        let baseTps = 8000;
        if (config.workloadIntensity === 'Low') baseTps = 3200;
        else if (config.workloadIntensity === 'Medium') baseTps = 7500;
        else if (config.workloadIntensity === 'High') baseTps = 14500;
        else if (config.workloadIntensity === 'Stress') baseTps = 24000;

        if (!isAsync) {
          // Synchronous suffers heavily under high concurrency
          baseTps = isBatch ? baseTps * 0.75 : baseTps * 0.35;
        }

        // Add concurrency scaling factor
        const concurrencyFactor = Math.min(2.5, Math.log10(config.virtualUsers) * 0.9);
        const currentTps = Math.round(baseTps * concurrencyFactor * (0.85 + Math.random() * 0.3));

        // Incremental events
        const incremental = Math.round(currentTps * (tickInterval / 1000));
        testRef.current.eventsProcessed = Math.min(
          targetEvents,
          testRef.current.eventsProcessed + incremental
        );

        if (currentTps > testRef.current.peakTps) {
          testRef.current.peakTps = currentTps;
        }

        // Latency characteristics
        let currentLatency = isAsync ? 14.2 : isBatch ? 32.0 : 185.0;
        if (config.workloadIntensity === 'Stress') {
          currentLatency *= isAsync ? 1.8 : 3.5;
        }
        currentLatency += (Math.random() - 0.4) * 4;
        currentLatency = Math.max(3.5, Number(currentLatency.toFixed(1)));

        testRef.current.latencies.push(currentLatency);
        testRef.current.sumLatency += currentLatency;
        testRef.current.sampleCount++;

        // Queue backlog
        const queueFactor = isAsync ? 0.15 : isBatch ? 0.35 : 0.8;
        const currentQueue = Math.round(
          (targetEvents - testRef.current.eventsProcessed) * queueFactor * (0.1 + Math.random() * 0.05)
        );

        // Failures
        let failures = 0;
        if (config.simulatePacketLoss || (!isAsync && config.virtualUsers > 100)) {
          failures = Math.floor(incremental * (isAsync ? 0.008 : 0.08));
        }
        const successes = Math.max(0, incremental - failures);

        // CPU & Memory
        const cpuBase = isAsync ? 45 : 85;
        const currentCpu = Number(
          Math.min(99.5, cpuBase + (config.virtualUsers / 1000) * 35 + Math.random() * 5).toFixed(1)
        );
        const currentMem = Math.min(
          1200,
          Math.round(380 + (testRef.current.eventsProcessed / targetEvents) * 350 + Math.random() * 20)
        );

        const now = new Date();
        const timeStr = `${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}.${Math.floor(now.getMilliseconds() / 100)}`;

        const newPoint = {
          time: timeStr,
          tps: currentTps,
          latency: currentLatency,
          queue: currentQueue,
          success: successes,
          failure: failures,
        };

        const updatedHistory = [...testRef.current.history.slice(-24), newPoint];
        testRef.current.history = updatedHistory;

        setTestLiveStats({
          eventsDone: testRef.current.eventsProcessed,
          totalTargetEvents: targetEvents,
          elapsedSec: Number((elapsedMs / 1000).toFixed(1)),
          remainingSec: Math.max(0, Number(((durationMs - elapsedMs) / 1000).toFixed(1))),
          currentTps,
          currentLatency,
          queueBacklog: currentQueue,
          successCount: testRef.current.eventsProcessed - failures,
          failureCount: failures,
          cpu: currentCpu,
          memory: currentMem,
          history: updatedHistory,
        });

        // Test completion check
        if (elapsedMs >= durationMs || testRef.current.eventsProcessed >= targetEvents) {
          clearInterval(intervalId);
          setIsTesting(false);
          setTestProgress(100);

          // Calculate percentiles
          const sorted = [...testRef.current.latencies].sort((a, b) => a - b);
          const p50 = sorted[Math.floor(sorted.length * 0.5)] || currentLatency;
          const p95 = sorted[Math.floor(sorted.length * 0.95)] || currentLatency * 1.8;
          const p99 = sorted[Math.floor(sorted.length * 0.99)] || currentLatency * 2.5;
          const avgLat = Number(
            (testRef.current.sumLatency / Math.max(1, testRef.current.sampleCount)).toFixed(1)
          );

          const totalProcessed = testRef.current.eventsProcessed;
          const totalFailed = Math.round(
            totalProcessed * (config.simulatePacketLoss ? 0.012 : !isAsync ? 0.085 : 0.0002)
          );

          const avgTps = Math.round(totalProcessed / (durationMs / 1000));
          const slaPassed = avgLat <= settings.latencyAlertThresholdMs && totalFailed / totalProcessed < 0.01;

          let grade: BenchmarkResult['grade'] = 'A+';
          if (!slaPassed) grade = 'FAIL';
          else if (avgLat > 50) grade = 'B';
          else if (avgLat > 25) grade = 'A';

          const runId = `RUN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`;

          const result: BenchmarkResult = {
            id: runId,
            testDate: new Date().toLocaleString(),
            config,
            status: 'COMPLETED',
            grade,
            slaPassed,
            totalEventsIngested: totalProcessed,
            totalEventsProcessed: totalProcessed - totalFailed,
            failedEventsCount: totalFailed,
            peakThroughputEventsPerSec: testRef.current.peakTps,
            averageThroughputEventsPerSec: avgTps,
            latencyMs: {
              min: sorted[0] || 3.2,
              max: sorted[sorted.length - 1] || 85.0,
              avg: avgLat,
              p50: Number(p50.toFixed(1)),
              p95: Number(p95.toFixed(1)),
              p99: Number(p99.toFixed(1)),
            },
            resourceUsage: {
              peakCpuPercent: currentCpu,
              avgCpuPercent: Number((currentCpu * 0.85).toFixed(1)),
              peakMemoryMb: currentMem,
              avgMemoryMb: Number((currentMem * 0.9).toFixed(0)),
            },
            kafkaStats: {
              maxPartitionLag: Math.round(currentQueue * 1.2),
              avgConsumerFetchLatencyMs: isAsync ? 4.8 : 0,
            },
            dbStats: {
              writeBatchSize: isAsync ? 250 : 1,
              avgWriteLatencyMs: isAsync ? 12.4 : 145.0,
              deadlockCount: isAsync ? 0 : config.virtualUsers > 100 ? 8 : 0,
            },
            summaryRecommendation: slaPassed
              ? `Benchmark PASSED SLA. Peak throughput reached ${testRef.current.peakTps.toLocaleString()} eps with ${avgLat}ms average latency.`
              : `Benchmark FAILED SLA requirements. High latency (${avgLat}ms) or failure rate exceeded tolerance. Recommend scaling worker consumers.`,
          };

          setLatestResult(result);
          addBenchmarkResult(result);

          addNotification({
            title: `Benchmark Complete: ${runId}`,
            message: `Result: Grade ${grade} (${slaPassed ? 'PASSED SLA' : 'FAILED SLA'}). Avg Latency: ${avgLat}ms.`,
            type: slaPassed ? 'success' : 'critical',
            relatedTab: 'benchmark',
          });
        }
      }, tickInterval);

      testRef.current.intervalId = intervalId;
    },
    [addBenchmarkResult, addNotification, settings.latencyAlertThresholdMs]
  );

  return (
    <SimulationContext.Provider
      value={{
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isStreaming,
        setIsStreaming,
        streamSpeed,
        setStreamSpeed,
        totalEventsProcessed,
        currentThroughput,
        averageLatency,
        p50Latency,
        p95Latency,
        p99Latency,
        cpuUtilization,
        memoryMb,
        activeBusesCount: buses.length,
        queueBacklog,
        successRate,
        timeSeriesHistory,
        buses,
        routes,
        selectedBus,
        setSelectedBus,
        injectBusEvent,
        pipelineStages,
        activeTestConfig,
        isTesting,
        testProgress,
        testLiveStats,
        startBenchmarkTest,
        stopBenchmarkTest,
        latestResult,
        dismissLatestResult,
        benchmarkResults,
        addBenchmarkResult,
        deleteBenchmarkResult,
        alerts,
        isChaosMode,
        toggleChaosMode,
        dismissAlert,
        notifications,
        markNotificationsRead,
        clearNotifications,
        settings,
        updateSettings,
        resetAllData,
      }}
    >
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};
