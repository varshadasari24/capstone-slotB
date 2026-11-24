import React, { useState } from 'react';
import { Bus, Navigation, MapPin, Zap } from 'lucide-react';
import { TransitBus, TransitRoute } from '../../types';

interface TransitMapProps {
  routes: TransitRoute[];
  buses: TransitBus[];
  selectedBus: TransitBus | null;
  onSelectBus: (bus: TransitBus) => void;
  selectedRouteFilter: string;
}

export const TransitMap: React.FC<TransitMapProps> = ({
  routes,
  buses,
  selectedBus,
  onSelectBus,
  selectedRouteFilter,
}) => {
  const [hoveredBus, setHoveredBus] = useState<TransitBus | null>(null);

  // SVG viewBox coordinates: 0 0 900 550
  const getCoordinatesAlongPath = (route: TransitRoute, progressPercent: number) => {
    const coords = route.pathCoordinates;
    if (!coords || coords.length < 2) return { x: 450, y: 275 };

    const totalSegments = coords.length - 1;
    const progress = Math.max(0, Math.min(100, progressPercent)) / 100;
    const scaledIndex = progress * totalSegments;
    const segmentIndex = Math.min(Math.floor(scaledIndex), totalSegments - 1);
    const segmentFraction = scaledIndex - segmentIndex;

    const p1 = coords[segmentIndex];
    const p2 = coords[segmentIndex + 1];

    const x = p1.x + (p2.x - p1.x) * segmentFraction;
    const y = p1.y + (p2.y - p1.y) * segmentFraction;

    return { x, y };
  };

  const filteredRoutes = selectedRouteFilter === 'ALL'
    ? routes
    : routes.filter((r) => r.id === selectedRouteFilter);

  return (
    <div className="relative w-full h-[480px] rounded-2xl glass-panel border border-slate-800/80 overflow-hidden select-none bg-navy-950/70">
      {/* Background Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.12] pointer-events-none"
        style={{
          backgroundImage:
            'radial-gradient(circle at 1px 1px, #38bdf8 1px, transparent 0)',
          backgroundSize: '24px 24px',
        }}
      />

      {/* SVG Transit Canvas */}
      <svg
        className="w-full h-full"
        viewBox="0 0 900 550"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* Glowing line filters */}
          <filter id="glowCyan" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* 1. Draw Route Paths */}
        {filteredRoutes.map((route) => {
          const pathD = route.pathCoordinates.reduce((acc, pt, idx) => {
            return idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`;
          }, '');

          return (
            <g key={route.id} className="transition-opacity duration-300">
              {/* Route Path Outer Soft Glow */}
              <path
                d={pathD}
                fill="none"
                stroke={route.color}
                strokeWidth="10"
                strokeOpacity="0.15"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Route Path Main Track */}
              <path
                d={pathD}
                fill="none"
                stroke={route.color}
                strokeWidth="3.5"
                strokeOpacity="0.85"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeDasharray={route.id === 'route-09' ? '6 6' : undefined}
              />

              {/* Route Stops */}
              {route.stops.map((stop) => (
                <g key={stop.id} className="cursor-pointer group">
                  <circle
                    cx={stop.x}
                    cy={stop.y}
                    r="5"
                    fill="#0b1120"
                    stroke={route.color}
                    strokeWidth="2.5"
                  />
                  <text
                    x={stop.x}
                    y={stop.y + 16}
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontFamily="Inter, sans-serif"
                    fontWeight="500"
                    className="pointer-events-none drop-shadow"
                  >
                    {stop.name}
                  </text>
                </g>
              ))}
            </g>
          );
        })}

        {/* 2. Draw Moving Buses */}
        {buses.map((bus) => {
          if (selectedRouteFilter !== 'ALL' && bus.routeId !== selectedRouteFilter) {
            return null;
          }

          const route = routes.find((r) => r.id === bus.routeId);
          if (!route) return null;

          const { x, y } = getCoordinatesAlongPath(route, bus.routeProgress);
          const isSelected = selectedBus?.id === bus.id;
          const isDelayed = bus.status === 'Delayed' || bus.status === 'Heavy Traffic';
          const isMechanical = bus.status === 'Mechanical Alert';

          const markerColor = isMechanical
            ? '#f43f5e'
            : isDelayed
            ? '#f59e0b'
            : bus.status === 'In Depot'
            ? '#64748b'
            : route.color;

          return (
            <g
              key={bus.id}
              transform={`translate(${x}, ${y})`}
              className="cursor-pointer transition-transform duration-300"
              onClick={() => onSelectBus(bus)}
              onMouseEnter={() => setHoveredBus(bus)}
              onMouseLeave={() => setHoveredBus(null)}
            >
              {/* Radar pulse for active/delayed buses */}
              <circle
                r={isSelected ? '18' : '12'}
                fill={markerColor}
                opacity={isSelected ? 0.35 : 0.2}
                className={bus.speedKmH > 0 ? 'animate-ping' : ''}
                style={{ animationDuration: '2.5s' }}
              />

              {/* Outer ring */}
              <circle
                r={isSelected ? '14' : '10'}
                fill="#0b1120"
                stroke={markerColor}
                strokeWidth={isSelected ? '3' : '2'}
              />

              {/* Inner Bus Icon / Dot */}
              <circle r="4" fill={markerColor} />

              {/* Bus ID Tag */}
              <rect
                x="-26"
                y="-26"
                width="52"
                height="16"
                rx="4"
                fill="#0b1120"
                stroke={markerColor}
                strokeWidth="1"
                opacity="0.9"
              />
              <text
                x="0"
                y="-15"
                textAnchor="middle"
                fill="#ffffff"
                fontSize="8.5"
                fontFamily="JetBrains Mono, monospace"
                fontWeight="bold"
              >
                {bus.id}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Floating Map Legend Overlay */}
      <div className="absolute top-4 left-4 p-3 rounded-xl bg-slate-950/80 backdrop-blur-md border border-slate-800 text-xs space-y-2 pointer-events-auto">
        <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px] block">
          Active Corridors
        </span>
        <div className="space-y-1 text-[11px]">
          {routes.map((r) => (
            <div key={r.id} className="flex items-center gap-2">
              <span className="w-2.5 h-1 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="text-slate-300 font-medium">Route {r.number}</span>
              <span className="text-slate-400 text-[10px]">({r.activeBusesCount} buses)</span>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Telemetry Hover Preview */}
      {hoveredBus && (
        <div className="absolute bottom-4 left-4 p-3.5 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-700 shadow-xl text-xs space-y-1.5 pointer-events-none min-w-[220px] animate-in fade-in duration-100">
          <div className="flex items-center justify-between">
            <span className="font-mono font-bold text-white text-sm">{hoveredBus.id}</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                hoveredBus.status === 'On Time'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : hoveredBus.status === 'Delayed'
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-rose-500/20 text-rose-400'
              }`}
            >
              {hoveredBus.status}
            </span>
          </div>
          <div className="text-[11px] text-slate-300 truncate">{hoveredBus.routeName}</div>
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-800 text-[11px]">
            <div>
              <span className="text-slate-400">Speed:</span>{' '}
              <span className="font-mono text-cyan-400">{hoveredBus.speedKmH} km/h</span>
            </div>
            <div>
              <span className="text-slate-400">Load:</span>{' '}
              <span className="font-mono text-slate-200">
                {hoveredBus.passengerCount}/{hoveredBus.capacity}
              </span>
            </div>
          </div>
          <div className="text-[10px] text-cyan-400 pt-0.5">Click vehicle to inspect telemetry & logs</div>
        </div>
      )}

      {/* Map Action Helper */}
      <div className="absolute bottom-4 right-4 text-[11px] text-slate-400 bg-slate-950/70 px-3 py-1.5 rounded-lg border border-slate-800/80">
        Simulated GPS Coordinates • Refreshed every 500ms
      </div>
    </div>
  );
};
