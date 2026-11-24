import React, { useState } from 'react';
import {
  GitBranch,
  ArrowRight,
  Server,
  Layers,
  Database,
  Radio,
  Activity,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Clock,
  HardDrive,
  Info,
  X,
  Play,
  Pause,
  ChevronRight,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { PipelineStageMetric } from '../../types';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const DataPipelineView: React.FC = () => {
  const {
    pipelineStages,
    isStreaming,
    setIsStreaming,
    currentThroughput,
    isChaosMode,
    toggleChaosMode,
  } = useSimulation();

  const [selectedStage, setSelectedStage] = useState<PipelineStageMetric | null>(null);

  // Icon mapping for pipeline stages
  const getStageIcon = (id: string) => {
    switch (id) {
      case 'stage-1':
        return <Radio className="w-5 h-5 text-cyan-400" />;
      case 'stage-2':
        return <Server className="w-5 h-5 text-sky-400" />;
      case 'stage-3':
        return <Layers className="w-5 h-5 text-amber-400" />;
      case 'stage-4':
        return <Cpu className="w-5 h-5 text-indigo-400" />;
      case 'stage-5':
        return <Database className="w-5 h-5 text-emerald-400" />;
      case 'stage-6':
        return <Activity className="w-5 h-5 text-teal-400" />;
      default:
        return <GitBranch className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Data Pipeline & Event Streaming Flow
            </h1>
            <Badge variant="cyan" size="sm" dot>
              6 Active Stages
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            End-to-end data lifecycle: Edge IoT ingest $\rightarrow$ Go Ingestion Gateway $\rightarrow$ Kafka Streaming Log $\rightarrow$ Async Workers $\rightarrow$ TimescaleDB.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isChaosMode ? 'danger' : 'outline'}
            size="sm"
            onClick={toggleChaosMode}
            icon={<AlertTriangle className="w-3.5 h-3.5" />}
          >
            {isChaosMode ? 'Disable Pipeline Chaos' : 'Simulate Stage Bottleneck'}
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsStreaming(!isStreaming)}
            icon={isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          >
            {isStreaming ? 'Pause Flow' : 'Resume Flow'}
          </Button>
        </div>
      </div>

      {/* Pipeline Flow Banner */}
      <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-slate-300">
            Ingestion Speed: <strong className="font-mono text-cyan-400">{currentThroughput.toLocaleString()}</strong> events/sec
          </span>
        </div>
        <div className="text-slate-400">
          Architecture: <strong>Event-Driven Asynchronous Microservices</strong> (Kafka + Go Concurrency)
        </div>
        <div className="text-slate-400">
          Click any stage node below to inspect goroutines, buffer allocations, and partition metrics.
        </div>
      </div>

      {/* Multi-Stage Animated Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 relative">
        {pipelineStages.map((stage, index) => {
          const isSelected = selectedStage?.id === stage.id;
          const isBottleneck = stage.status === 'BOTTLENECK';

          return (
            <div
              key={stage.id}
              onClick={() => setSelectedStage(stage)}
              className={`glass-panel p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative group flex flex-col justify-between ${
                isBottleneck
                  ? 'border-rose-500/80 bg-rose-950/20 shadow-lg shadow-rose-500/10'
                  : isSelected
                  ? 'border-cyan-400/80 bg-slate-850/90 glow-cyan'
                  : 'border-slate-800 hover:border-slate-700 hover:bg-slate-850/60'
              }`}
            >
              {/* Stage Sequence Badge & Status */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                    STAGE 0{index + 1}
                  </span>
                  <Badge
                    variant={isBottleneck ? 'rose' : 'emerald'}
                    size="sm"
                    dot={isBottleneck}
                  >
                    {isBottleneck ? 'BOTTLENECK' : 'OPTIMAL'}
                  </Badge>
                </div>

                {/* Stage Header */}
                <div className="flex items-center gap-2.5 mb-2">
                  <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
                    {getStageIcon(stage.id)}
                  </div>
                  <div className="truncate">
                    <h3 className="text-sm font-bold text-white truncate" title={stage.name}>
                      {stage.shortName}
                    </h3>
                    <p className="text-[10px] text-slate-400 truncate">{stage.technology}</p>
                  </div>
                </div>

                {/* Live Stage Counters */}
                <div className="space-y-2 mt-4 pt-3 border-t border-slate-800/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Received:</span>
                    <span className="font-mono text-slate-200 font-semibold">
                      {stage.eventsReceived.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Processed:</span>
                    <span className="font-mono text-emerald-400 font-semibold">
                      {stage.eventsProcessed.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Queue Lag:</span>
                    <span
                      className={`font-mono font-semibold ${
                        stage.queueBacklog > 2000 ? 'text-rose-400' : 'text-cyan-400'
                      }`}
                    >
                      {stage.queueBacklog.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Delay:</span>
                    <span className="font-mono text-amber-400">
                      {stage.processingDelayMs} ms
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-slate-400">Failed / DLQ:</span>
                    <span
                      className={`font-mono ${
                        stage.eventsFailed > 0 ? 'text-rose-400' : 'text-slate-500'
                      }`}
                    >
                      {stage.eventsFailed}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bottom animated stream indicator */}
              <div className="mt-4 pt-2 border-t border-slate-800/50 flex items-center justify-between text-[11px] text-cyan-400 font-medium">
                <span>Inspect Config</span>
                <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Animated Pipeline Stage Flow Bar */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-white">
              Data Pipeline Connectivity & In-Flight Buffer Depth
            </h2>
          </div>
          <span className="text-xs text-slate-400 font-mono">
            Zero-Loss Backpressure Protocol Active
          </span>
        </div>

        {/* Visual pipeline connection line with moving particles */}
        <div className="relative py-3">
          <div className="h-2 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex">
            {pipelineStages.map((s, idx) => (
              <div
                key={s.id}
                className={`h-full transition-all duration-300 ${
                  s.status === 'BOTTLENECK'
                    ? 'bg-rose-500'
                    : idx % 2 === 0
                    ? 'bg-cyan-500'
                    : 'bg-sky-500'
                }`}
                style={{ width: `${100 / pipelineStages.length}%` }}
              />
            ))}
          </div>

          {/* Flowing animated pulse */}
          {isStreaming && (
            <div className="absolute top-3 left-0 right-0 h-2 flex justify-around pointer-events-none">
              <span className="w-3 h-2 bg-white/80 rounded-full blur-[1px] animate-pulse" />
              <span className="w-3 h-2 bg-white/80 rounded-full blur-[1px] animate-pulse delay-100" />
              <span className="w-3 h-2 bg-white/80 rounded-full blur-[1px] animate-pulse delay-200" />
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-[11px] text-center text-slate-400">
          <div>1. Edge GPS / OBU</div>
          <div>2. Go Ingestion Service</div>
          <div>3. Apache Kafka (12 Partitions)</div>
          <div>4. Async Go Workers</div>
          <div>5. TimescaleDB & Redis</div>
          <div>6. Dashboard Egress</div>
        </div>
      </div>

      {/* Stage Detail Inspector Modal */}
      {selectedStage && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  {getStageIcon(selectedStage.id)}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">{selectedStage.name}</h3>
                  <p className="text-xs text-slate-400">{selectedStage.technology}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedStage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <p className="text-slate-300 leading-relaxed">{selectedStage.description}</p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Capacity Ceiling</span>
                  <span className="text-base font-bold font-mono text-cyan-400">
                    {selectedStage.capacityLimitPerSec.toLocaleString()} EPS
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Buffer Utilization</span>
                  <span className="text-base font-bold font-mono text-slate-200">
                    {selectedStage.details.bufferUtilizationPercent}%
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Active Workers</span>
                  <span className="text-base font-bold font-mono text-emerald-400">
                    {selectedStage.details.workerCount} Workers
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Internal Goroutines</span>
                  <span className="text-base font-bold font-mono text-indigo-400">
                    {selectedStage.details.goroutinesActive ?? 'N/A'}
                  </span>
                </div>
              </div>

              {selectedStage.details.kafkaTopics && (
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                  <span className="text-slate-400 font-semibold block">Configured Kafka Topics:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedStage.details.kafkaTopics.map((topic) => (
                      <span
                        key={topic}
                        className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300 font-mono text-[11px]"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setSelectedStage(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
