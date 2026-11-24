import React, { useState } from 'react';
import {
  X,
  Bus,
  Gauge,
  Users,
  BatteryCharging,
  Thermometer,
  MapPin,
  Clock,
  Radio,
  FileCode,
  Send,
  AlertTriangle,
} from 'lucide-react';
import { TransitBus } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

interface BusDetailModalProps {
  bus: TransitBus | null;
  onClose: () => void;
  onInjectEvent: (busId: string, eventType: string) => void;
}

export const BusDetailModal: React.FC<BusDetailModalProps> = ({
  bus,
  onClose,
  onInjectEvent,
}) => {
  if (!bus) return null;

  const [activeTab, setActiveTab] = useState<'metrics' | 'payload'>('metrics');

  const simulatedPayload = {
    event_id: `evt-gps-${bus.id.toLowerCase()}-${Date.now()}`,
    source_device: `OBU-2024-${bus.id}`,
    protocol: 'MQTT/v3.1.1-TLS',
    timestamp: new Date().toISOString(),
    bus_telemetry: {
      bus_id: bus.id,
      route_id: bus.routeId,
      driver_id: bus.driverName.replace(/\s+/g, '.').toLowerCase(),
      position: {
        latitude: bus.latitude,
        longitude: bus.longitude,
        route_progress_pct: bus.routeProgress,
      },
      motion: {
        speed_kmh: bus.speedKmH,
        direction: bus.direction,
        engine_temp_celsius: bus.engineTempC,
      },
      occupancy: {
        current_passengers: bus.passengerCount,
        max_capacity: bus.capacity,
        load_factor: Number((bus.passengerCount / bus.capacity).toFixed(2)),
      },
      transit_status: {
        operational_state: bus.status,
        delay_seconds: Math.round(bus.delayMinutes * 60),
        current_stop: bus.currentStop,
        next_stop: bus.nextStop,
      },
    },
    kafka_metadata: {
      topic: 'transit.raw-events',
      partition_key: bus.routeId,
      compression: 'lz4',
    },
  };

  const occupancyPercent = Math.round((bus.passengerCount / bus.capacity) * 100);

  return (
    <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <Bus className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white font-mono">{bus.id}</h3>
                <Badge
                  variant={
                    bus.status === 'On Time'
                      ? 'emerald'
                      : bus.status === 'Delayed'
                      ? 'amber'
                      : 'rose'
                  }
                  size="sm"
                  dot
                >
                  {bus.status}
                </Badge>
              </div>
              <p className="text-xs text-slate-400">{bus.routeName} • Driver: {bus.driverName}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector */}
        <div className="flex items-center gap-4 px-6 pt-3 border-b border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-2.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'metrics'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            Telemetry & Telematics
          </button>
          <button
            onClick={() => setActiveTab('payload')}
            className={`pb-2.5 font-medium transition-colors border-b-2 flex items-center gap-1.5 ${
              activeTab === 'payload'
                ? 'text-cyan-400 border-cyan-400 font-semibold'
                : 'text-slate-400 border-transparent hover:text-slate-200'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            Raw Ingest JSON Payload
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          {activeTab === 'metrics' ? (
            <>
              {/* Route Progress Visual Bar */}
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-cyan-400" /> Current Segment
                  </span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    {bus.routeProgress}% Route Progress
                  </span>
                </div>
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-sky-400 rounded-full transition-all duration-500"
                    style={{ width: `${bus.routeProgress}%` }}
                  />
                </div>
                <div className="flex justify-between text-[11px] text-slate-400 pt-1">
                  <span>Current: <strong className="text-slate-200">{bus.currentStop}</strong></span>
                  <span>Next: <strong className="text-slate-200">{bus.nextStop}</strong></span>
                </div>
              </div>

              {/* 4 Telemetry Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Speed</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono text-cyan-400">{bus.speedKmH}</span>
                    <span className="text-slate-400 text-[10px]">km/h</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Passengers</span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-xl font-bold font-mono text-white">
                      {bus.passengerCount}
                    </span>
                    <span className="text-slate-400 text-[10px]">/ {bus.capacity}</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1 rounded mt-1.5 overflow-hidden">
                    <div
                      className={`h-full ${
                        occupancyPercent > 85 ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${occupancyPercent}%` }}
                    />
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Engine Temp</span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-xl font-bold font-mono ${
                        bus.engineTempC > 100 ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {bus.engineTempC}
                    </span>
                    <span className="text-slate-400 text-[10px]">°C</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Schedule Delta</span>
                  <div className="flex items-baseline gap-1">
                    <span
                      className={`text-xl font-bold font-mono ${
                        bus.delayMinutes > 0 ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {bus.delayMinutes > 0 ? `+${bus.delayMinutes}` : '0'}
                    </span>
                    <span className="text-slate-400 text-[10px]">min delay</span>
                  </div>
                </div>
              </div>

              {/* Event Injection Simulation Controls */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-3">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Simulate Incident Injection
                </span>
                <p className="text-xs text-slate-400">
                  Trigger an ad-hoc telemetry event to test pipeline event ingestion and bottleneck detection.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onInjectEvent(bus.id, 'TRAFFIC_INCIDENT')}
                    icon={<Clock className="w-3.5 h-3.5" />}
                  >
                    Simulate Traffic Delay
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onInjectEvent(bus.id, 'MECHANICAL_ALERT')}
                    icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  >
                    Simulate Engine Warning
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => onInjectEvent(bus.id, 'NORMAL_SCHEDULE')}
                  >
                    Clear Incidents
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Ingestion Format: JSON (Kafka Protocol payload)</span>
                <span className="font-mono text-cyan-400">Topic: transit.raw-events</span>
              </div>
              <pre className="p-4 rounded-xl bg-slate-950 font-mono text-xs text-cyan-300 border border-slate-800 overflow-x-auto max-h-72">
                {JSON.stringify(simulatedPayload, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-end">
          <Button variant="secondary" size="sm" onClick={onClose}>
            Close Inspector
          </Button>
        </div>
      </div>
    </div>
  );
};
