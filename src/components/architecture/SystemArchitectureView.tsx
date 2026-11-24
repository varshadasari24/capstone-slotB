import React, { useState } from 'react';
import {
  Network,
  Server,
  Layers,
  Database,
  Activity,
  Cpu,
  Radio,
  FileCode,
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  Boxes,
  Terminal,
  ExternalLink,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';
import { MOCK_TRACE_SPANS } from '../../data/mockData';
import { DistributedTraceSpan } from '../../types';

export const SystemArchitectureView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'diagram' | 'tracing' | 'specs'>('diagram');
  const [selectedComponent, setSelectedComponent] = useState<string>('kafka');

  // Component Technical Specifications
  const architectureComponents: Record<
    string,
    {
      name: string;
      tech: string;
      role: string;
      ports: string;
      metrics: string[];
      sampleCode: string;
    }
  > = {
    gatling: {
      name: 'Gatling Load Generator',
      tech: 'Gatling 3.10 (Scala/Java)',
      role: 'Simulates concurrent IoT on-board units with ramping virtual users and chaos traffic bursts.',
      ports: '8082 (HTML Reports)',
      metrics: ['gatling_active_users', 'gatling_requests_total', 'gatling_response_time_ms'],
      sampleCode: `val transitSimulation = scenario("Transit Rush Hour")
  .feed(busGpsFeeder)
  .exec(
    http("Post Bus Telemetry")
      .post("/v1/telemetry/event")
      .body(StringBody("""{"bus_id":"\${busId}","speed":\${speed}}"""))
      .asJson
      .check(status.is(202))
  )`,
    },
    ingestion: {
      name: 'Go Ingestion Service',
      tech: 'Go 1.22 + Gin/Fiber',
      role: 'Stateless edge API validating incoming Protobuf/JSON payloads, checking tokens, and publishing to Kafka.',
      ports: '8080 (REST / gRPC)',
      metrics: ['http_requests_total', 'http_request_duration_seconds', 'go_goroutines_count'],
      sampleCode: `func HandleTelemetry(c *gin.Context) {
    var event BusTelemetryEvent
    if err := c.ShouldBindJSON(&event); err != nil {
        c.JSON(400, gin.H{"error": "invalid payload schema"})
        return
    }
    // Asynchronous non-blocking publish to Kafka
    kafkaProducer.Produce(&kafka.Message{
        TopicPartition: kafka.TopicPartition{Topic: &topic, Partition: kafka.PartitionAny},
        Key:            []byte(event.RouteID),
        Value:          c.GetRawData(),
    }, deliveryChan)
    c.Status(http.StatusAccepted)
}`,
    },
    kafka: {
      name: 'Apache Kafka Cluster',
      tech: 'Apache Kafka 3.6 (3 Brokers, 12 Partitions)',
      role: 'Distributed immutable commit log providing strictly ordered event streams keyed by RouteID & BusID.',
      ports: '9092 (PLAINTEXT), 9093 (SSL)',
      metrics: ['kafka_server_brokertopicmetrics_messagesin_total', 'kafka_consumergroup_lag'],
      sampleCode: `// Topic Creation Configuration
TopicConfig:
  topic: transit.raw-events
  numPartitions: 12
  replicationFactor: 3
  cleanupPolicy: delete
  retentionMs: 86400000 // 24h retention
  compressionType: lz4`,
    },
    workers: {
      name: 'Asynchronous Processing Services',
      tech: 'Go Goroutines Consumer Worker Pool',
      role: 'Consumes partitioned Kafka messages, applies geospatial map matching, occupancy analytics, and route schedule adherence calculations.',
      ports: '9095 (Internal Health / Metrics)',
      metrics: ['worker_processing_latency_ms', 'worker_batch_size', 'dead_letter_events_total'],
      sampleCode: `func StartWorkerPool(ctx context.Context, workers int) {
    for i := 0; i < workers; i++ {
        go func(workerID int) {
            for msg := range messageChannel {
                // Enrich geospatial stop coordinates
                geoEnrichment(msg)
                // Batch write buffer dispatch
                dbBatchQueue <- msg
            }
        }(i)
    }
}`,
    },
    database: {
      name: 'Storage Tier (TimescaleDB & Redis)',
      tech: 'TimescaleDB (PostgreSQL 16) + Redis 7',
      role: 'TimescaleDB hypertables store historical sensor telemetry; Redis provides sub-millisecond bus coordinate lookups.',
      ports: '5432 (Postgres), 6379 (Redis)',
      metrics: ['timescaledb_chunks_count', 'pg_stat_activity_count', 'redis_connected_clients'],
      sampleCode: `CREATE TABLE transit_telemetry (
    time TIMESTAMPTZ NOT NULL,
    bus_id TEXT NOT NULL,
    route_id TEXT NOT NULL,
    speed_kmh DOUBLE PRECISION,
    passengers INT,
    status TEXT
);
-- Convert to hypertable partitioned by 1-day chunks
SELECT create_hypertable('transit_telemetry', 'time', chunk_time_interval => INTERVAL '1 day');`,
    },
    observability: {
      name: 'Observability & Tracing Stack',
      tech: 'Prometheus + OpenTelemetry + Jaeger + Docker',
      role: 'Scrapes container metrics, captures distributed trace spans, and instruments Go microservices.',
      ports: '9090 (Prometheus), 16686 (Jaeger UI), 4317 (OTLP gRPC)',
      metrics: ['otel_span_duration_ms', 'prometheus_tsdb_head_samples_appended_total'],
      sampleCode: `scrape_configs:
  - job_name: 'transit-ingest-service'
    scrape_interval: 250ms
    static_configs:
      - targets: ['go-ingest:8080', 'go-workers:9095']`,
    },
  };

  const selectedSpec = architectureComponents[selectedComponent];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              System Architecture & Distributed Tracing
            </h1>
            <Badge variant="cyan" size="sm">
              Event-Driven Pipeline Blueprint
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Gatling $\rightarrow$ Go Ingestion $\rightarrow$ Apache Kafka $\rightarrow$ Async Go Workers $\rightarrow$ TimescaleDB $\rightarrow$ React Dashboard.
          </p>
        </div>

        {/* View Tabs */}
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === 'diagram' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('diagram')}
            icon={<Network className="w-3.5 h-3.5" />}
          >
            Architecture Flow
          </Button>

          <Button
            variant={activeTab === 'tracing' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('tracing')}
            icon={<Clock className="w-3.5 h-3.5" />}
          >
            Jaeger Distributed Tracing
          </Button>

          <Button
            variant={activeTab === 'specs' ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setActiveTab('specs')}
            icon={<Terminal className="w-3.5 h-3.5" />}
          >
            Microservice Specs
          </Button>
        </div>
      </div>

      {/* Section 11: Expected Performance Targets SLA Requirements */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              System Performance Targets (Project SLA Benchmarks)
            </h2>
          </div>
          <Badge variant="cyan" size="sm">
            Target SLA Specifications
          </Badge>
        </div>
        <p className="text-xs text-slate-400">
          These criteria represent the formal engineering performance targets against which load tests and chaos conditions are evaluated.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Packet Loss Tolerance</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0% Dropped Packets
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              No dropped data packets allowed at the maximum tested workload (1,000,000 events). Malformed events must route to Dead-Letter Queue (DLQ).
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">Dashboard Sync Latency</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ≤ 500 ms Refresh Delay
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Dashboard refresh synchronization delay between IoT edge timestamp and browser visual rendering must remain 500 ms or less.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-slate-300">DB Write Deadlocks</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                0.00% Deadlock Frequency
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Database write-queue deadlock frequency must be exactly 0% by utilizing asynchronous batch bulk inserts rather than synchronous row-by-row locks.
            </p>
          </div>
        </div>
      </div>

      {/* Tab 1: Interactive Architecture Blueprint Diagram */}
      {activeTab === 'diagram' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">
                Component Pipeline Topology & Observability Layer
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Click any microservice component to inspect ports, metrics, and Go source code
              </p>
            </div>
          </div>

          {/* Primary Ingestion Pipeline Nodes */}
          <div className="space-y-3">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Core Streaming Data Path
            </span>

            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              {/* 1. Gatling */}
              <button
                type="button"
                onClick={() => setSelectedComponent('gatling')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedComponent === 'gatling'
                    ? 'bg-purple-950/40 border-purple-500 text-purple-200 shadow-lg shadow-purple-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold text-white">Gatling</span>
                </div>
                <div className="text-[10px] text-slate-400">Load Generator</div>
                <div className="text-[10px] font-mono text-purple-400 mt-2">HTTP / gRPC Influx</div>
              </button>

              {/* 2. Go Ingestion Service */}
              <button
                type="button"
                onClick={() => setSelectedComponent('ingestion')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedComponent === 'ingestion'
                    ? 'bg-sky-950/40 border-sky-500 text-sky-200 shadow-lg shadow-sky-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span className="text-xs font-bold text-white">Go Ingestion</span>
                </div>
                <div className="text-[10px] text-slate-400">REST Gateway</div>
                <div className="text-[10px] font-mono text-sky-400 mt-2">Port 8080</div>
              </button>

              {/* 3. Apache Kafka */}
              <button
                type="button"
                onClick={() => setSelectedComponent('kafka')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedComponent === 'kafka'
                    ? 'bg-cyan-950/40 border-cyan-500 text-cyan-200 shadow-lg shadow-cyan-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  <span className="text-xs font-bold text-white">Apache Kafka</span>
                </div>
                <div className="text-[10px] text-slate-400">12 Partitions</div>
                <div className="text-[10px] font-mono text-cyan-400 mt-2">Cluster (Port 9092)</div>
              </button>

              {/* 4. Go Worker Pool */}
              <button
                type="button"
                onClick={() => setSelectedComponent('workers')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedComponent === 'workers'
                    ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 shadow-lg shadow-indigo-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Cpu className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-bold text-white">Async Workers</span>
                </div>
                <div className="text-[10px] text-slate-400">Go Goroutines</div>
                <div className="text-[10px] font-mono text-indigo-400 mt-2">256 Workers</div>
              </button>

              {/* 5. Database Tier */}
              <button
                type="button"
                onClick={() => setSelectedComponent('database')}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedComponent === 'database'
                    ? 'bg-emerald-950/40 border-emerald-500 text-emerald-200 shadow-lg shadow-emerald-500/20'
                    : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Database className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold text-white">TimescaleDB</span>
                </div>
                <div className="text-[10px] text-slate-400">+ Redis Cache</div>
                <div className="text-[10px] font-mono text-emerald-400 mt-2">Port 5432 / 6379</div>
              </button>

              {/* 6. Dashboard */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80 text-left">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-4 h-4 text-teal-400" />
                  <span className="text-xs font-bold text-white">React UI</span>
                </div>
                <div className="text-[10px] text-slate-400">WebSocket / Recharts</div>
                <div className="text-[10px] font-mono text-teal-400 mt-2">Refresh ≤ 500ms</div>
              </div>
            </div>
          </div>

          {/* Observability Tier */}
          <div className="space-y-3 pt-3 border-t border-slate-800">
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
              Observability & Distributed Tracing Layer (Prometheus, OpenTelemetry, Jaeger, Docker)
            </span>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-amber-400" /> Prometheus
                </div>
                <p className="text-slate-400 text-[11px]">
                  Scrapes 4Hz latency and throughput metrics from Go workers and Kafka brokers.
                </p>
                <span className="text-[10px] font-mono text-amber-400 block pt-1">Endpoint: :9090</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Boxes className="w-4 h-4 text-cyan-400" /> OpenTelemetry (OTel)
                </div>
                <p className="text-slate-400 text-[11px]">
                  Standardized trace propagation context injected into Kafka message headers.
                </p>
                <span className="text-[10px] font-mono text-cyan-400 block pt-1">OTLP gRPC: :4317</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-400" /> Jaeger Tracing
                </div>
                <p className="text-slate-400 text-[11px]">
                  End-to-end distributed transaction spans visualizer across microservices.
                </p>
                <span className="text-[10px] font-mono text-teal-400 block pt-1">UI: :16686</span>
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <div className="font-semibold text-white flex items-center gap-1.5">
                  <Server className="w-4 h-4 text-sky-400" /> Docker Containers
                </div>
                <p className="text-slate-400 text-[11px]">
                  Compose orchestration running Kafka, Zookeeper/KRaft, TimescaleDB, and Go containers.
                </p>
                <span className="text-[10px] font-mono text-sky-400 block pt-1">docker-compose.yml</span>
              </div>
            </div>
          </div>

          {/* Component Deep-Dive Inspection Panel */}
          {selectedSpec && (
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    {selectedSpec.name} Specifications
                  </h3>
                  <p className="text-xs text-slate-400">{selectedSpec.role}</p>
                </div>
                <span className="text-xs font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {selectedSpec.tech}
                </span>
              </div>

              <pre className="p-3.5 rounded-xl bg-navy-950 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto">
                {selectedSpec.sampleCode}
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Jaeger Distributed Tracing Simulator */}
      {activeTab === 'tracing' && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-800/80 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-teal-400" />
                Jaeger Distributed Trace Waterfall (Trace ID: #tr-8942-001)
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Simulated microservice trace spans showing exact timing delays from IoT ingress to database commit
              </p>
            </div>
            <span className="text-xs font-mono text-teal-400 font-bold">Total Duration: 38.4 ms</span>
          </div>

          {/* Trace Spans Waterfall List */}
          <div className="space-y-2 text-xs">
            {/* Span 1: Client Post */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">1. iot-edge-client: POST /v1/telemetry/event</span>
                <span className="font-mono text-cyan-400">38.4 ms (root)</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Span 2: Ingestion Gateway */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 ml-4">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-sky-300">2. go-ingestion-api: gin.HandleRequest</span>
                <span className="font-mono text-sky-400">34.2 ms</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-sky-500 rounded-full" style={{ marginLeft: '5%', width: '89%' }} />
              </div>
            </div>

            {/* Span 3: Kafka Produce */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 ml-8">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-amber-300">3. kafka-producer: ProduceAsync(topic: transit.raw-events)</span>
                <span className="font-mono text-amber-400">4.8 ms</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ marginLeft: '13%', width: '13%' }} />
              </div>
            </div>

            {/* Span 4: Async Consumer Worker */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 ml-8">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-indigo-300">4. async-worker-pool: kafka.ConsumeBatch (Worker #07)</span>
                <span className="font-mono text-indigo-400">22.8 ms</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-indigo-500 rounded-full" style={{ marginLeft: '27%', width: '59%' }} />
              </div>
            </div>

            {/* Span 5: Map Match */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 ml-12">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-300">5. geo-service: spatial.MapMatchRoute</span>
                <span className="font-mono text-teal-400">5.6 ms</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-teal-500 rounded-full" style={{ marginLeft: '29%', width: '15%' }} />
              </div>
            </div>

            {/* Span 6: Redis Cache Set */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 ml-12">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-slate-300">6. redis-cache: SetBusState(bus:state:BUS-101)</span>
                <span className="font-mono text-cyan-400">1.8 ms</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-400 rounded-full" style={{ marginLeft: '44%', width: '5%' }} />
              </div>
            </div>

            {/* Span 7: DB Batch Insert */}
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5 ml-12">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-emerald-300">7. timescaledb: BatchInsertHypertable (250 rows)</span>
                <span className="font-mono text-emerald-400">11.2 ms</span>
              </div>
              <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ marginLeft: '51%', width: '29%' }} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Microservice Specs */}
      {activeTab === 'specs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(architectureComponents).map(([key, comp]) => (
            <div key={key} className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white">{comp.name}</h3>
                <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                  {comp.tech}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">{comp.role}</p>

              <div className="text-xs space-y-1 pt-2 border-t border-slate-800">
                <div className="text-slate-400">
                  Network Ports: <strong className="text-slate-200 font-mono">{comp.ports}</strong>
                </div>
                <div className="text-slate-400">
                  Prometheus Metrics:{' '}
                  <span className="font-mono text-slate-300 text-[11px]">
                    {comp.metrics.join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
