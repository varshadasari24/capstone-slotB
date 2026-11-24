// Domain Types for Smart Transit Benchmark Framework

export type NavigationTab = 
  | 'overview' 
  | 'monitoring' 
  | 'pipeline' 
  | 'testing' 
  | 'benchmark' 
  | 'bottlenecks' 
  | 'reports' 
  | 'architecture' 
  | 'settings';

export type BusStatus = 'On Time' | 'Delayed' | 'Heavy Traffic' | 'In Depot' | 'Mechanical Alert';

export interface TransitBus {
  id: string;
  routeId: string;
  routeName: string;
  routeColor: string;
  driverName: string;
  latitude: number;
  longitude: number;
  routeProgress: number; // 0 to 100 along the route path
  direction: 'Outbound' | 'Inbound';
  speedKmH: number;
  passengerCount: number;
  capacity: number;
  status: BusStatus;
  lastUpdated: string;
  engineTempC: number;
  fuelBatteryPercent: number;
  currentStop: string;
  nextStop: string;
  delayMinutes: number;
}

export interface TransitRoute {
  id: string;
  number: string;
  name: string;
  color: string;
  totalLengthKm: number;
  activeBusesCount: number;
  stops: { id: string; name: string; x: number; y: number }[];
  pathCoordinates: { x: number; y: number }[];
}

export type EventType = 'GPS_PING' | 'PASSENGER_TAP' | 'DOOR_SENSOR' | 'ENGINE_HEALTH' | 'ROUTE_ALERT';

export interface TransitTelemetryEvent {
  id: string;
  busId: string;
  routeId: string;
  eventType: EventType;
  timestamp: string;
  payload: Record<string, any>;
  processingLatencyMs: number;
  status: 'SUCCESS' | 'QUEUED' | 'DROPPED' | 'FAILED';
  kafkaPartition: number;
}

export interface PipelineStageMetric {
  id: string;
  name: string;
  shortName: string;
  description: string;
  technology: string;
  eventsReceived: number;
  eventsQueued: number;
  eventsProcessed: number;
  eventsFailed: number;
  processingDelayMs: number;
  queueBacklog: number;
  status: 'OPTIMAL' | 'DEGRADED' | 'CONGESTED' | 'BOTTLENECK';
  capacityLimitPerSec: number;
  details: {
    workerCount: number;
    bufferUtilizationPercent: number;
    goroutinesActive?: number;
    kafkaTopics?: string[];
    dbConnectionsUsed?: number;
    dbConnectionsMax?: number;
  };
}

export type WorkloadIntensity = 'Low' | 'Medium' | 'High' | 'Stress';
export type ProcessingMode = 'Async Kafka Worker Pool' | 'Synchronous Ingestion' | 'Batch Buffer Pipeline';

export interface BenchmarkTestConfig {
  eventCount: number; // 1,000 | 10,000 | 100,000 | 1,000,000
  virtualUsers: number; // Concurrency: 10, 50, 100, 500, 1000
  durationSeconds: number; // 10, 30, 60, 120
  workloadIntensity: WorkloadIntensity;
  processingMode: ProcessingMode;
  simulatePacketLoss: boolean;
  notes?: string;
}

export interface BenchmarkResult {
  id: string;
  testDate: string;
  config: BenchmarkTestConfig;
  status: 'COMPLETED' | 'STOPPED' | 'FAILED';
  grade: 'A+' | 'A' | 'B' | 'C' | 'FAIL';
  slaPassed: boolean;
  totalEventsIngested: number;
  totalEventsProcessed: number;
  failedEventsCount: number;
  peakThroughputEventsPerSec: number;
  averageThroughputEventsPerSec: number;
  latencyMs: {
    min: number;
    max: number;
    avg: number;
    p50: number;
    p95: number;
    p99: number;
  };
  resourceUsage: {
    peakCpuPercent: number;
    avgCpuPercent: number;
    peakMemoryMb: number;
    avgMemoryMb: number;
  };
  kafkaStats: {
    maxPartitionLag: number;
    avgConsumerFetchLatencyMs: number;
  };
  dbStats: {
    writeBatchSize: number;
    avgWriteLatencyMs: number;
    deadlockCount: number;
  };
  summaryRecommendation: string;
}

export interface BottleneckAlert {
  id: string;
  component: string;
  severity: 'CRITICAL' | 'WARNING' | 'HEALTHY';
  metricName: string;
  currentValue: string;
  thresholdValue: string;
  title: string;
  explanation: string;
  recommendedAction: string;
  timestamp: string;
  isActive: boolean;
}

export interface DistributedTraceSpan {
  id: string;
  service: string;
  operation: string;
  durationMs: number;
  startOffsetMs: number;
  status: 'ok' | 'warning' | 'error';
  tags: Record<string, string>;
  children?: DistributedTraceSpan[];
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'critical';
  timestamp: string;
  read: boolean;
  relatedTab?: NavigationTab;
}

export interface SystemSettings {
  simulationRefreshRateMs: number; // 250, 500, 1000
  fleetSize: number; // 10 - 50
  enableChaosNoise: boolean;
  targetDashboardSyncDelayMs: number; // <= 500ms
  // Backend Integration configs
  mockMode: boolean;
  kafkaBrokerUrl: string;
  ingestionApiUrl: string;
  prometheusUrl: string;
  gatlingReportUrl: string;
  // Thresholds
  cpuAlertThresholdPercent: number;
  memoryAlertThresholdPercent: number;
  latencyAlertThresholdMs: number;
  queueAlertThresholdEvents: number;
}
