import React, { useState } from 'react';
import {
  Bus,
  Search,
  Filter,
  Navigation,
  Clock,
  Gauge,
  Users,
  AlertCircle,
  Eye,
  Zap,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { TransitBus, BusStatus } from '../../types';
import { TransitMap } from './TransitMap';
import { BusDetailModal } from './BusDetailModal';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

export const LiveTransitMonitoring: React.FC = () => {
  const {
    buses,
    routes,
    selectedBus,
    setSelectedBus,
    injectBusEvent,
  } = useSimulation();

  const [routeFilter, setRouteFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const filteredBuses = buses.filter((bus) => {
    const matchesRoute = routeFilter === 'ALL' || bus.routeId === routeFilter;
    const matchesStatus = statusFilter === 'ALL' || bus.status === statusFilter;
    const matchesSearch =
      bus.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.routeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      bus.driverName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRoute && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Live Transit Fleet Telemetry
            </h1>
            <Badge variant="cyan" size="sm" dot>
              {buses.length} Vehicles Active
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time geospatial tracking, route progression, telemetry payload generation, and schedule adherence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setRouteFilter('ALL');
              setStatusFilter('ALL');
              setSearchQuery('');
            }}
          >
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Interactive Map Visualizer */}
      <TransitMap
        routes={routes}
        buses={buses}
        selectedBus={selectedBus}
        onSelectBus={(bus) => setSelectedBus(bus)}
        selectedRouteFilter={routeFilter}
      />

      {/* Filter and Search Controls */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Route Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Route:</span>
            <select
              value={routeFilter}
              onChange={(e) => setRouteFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Routes ({routes.length})</option>
              {routes.map((r) => (
                <option key={r.id} value={r.id}>
                  Route {r.number} - {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 font-medium">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-slate-900 border border-slate-700/80 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="ALL">All Statuses</option>
              <option value="On Time">On Time</option>
              <option value="Delayed">Delayed</option>
              <option value="Heavy Traffic">Heavy Traffic</option>
              <option value="In Depot">In Depot</option>
              <option value="Mechanical Alert">Mechanical Alert</option>
            </select>
          </div>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Bus ID or Driver..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Fleet Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bus className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Active Fleet Telemetry Roster</span>
            <span className="text-xs font-mono text-slate-400">({filteredBuses.length} shown)</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Bus ID</th>
                <th className="py-3 px-4">Route</th>
                <th className="py-3 px-4">Current Stop</th>
                <th className="py-3 px-4">Speed</th>
                <th className="py-3 px-4">Passengers</th>
                <th className="py-3 px-4">Engine Temp</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Updated</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredBuses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    No vehicles match the selected criteria.
                  </td>
                </tr>
              ) : (
                filteredBuses.map((bus) => (
                  <tr
                    key={bus.id}
                    className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedBus(bus)}
                  >
                    <td className="py-3 px-4 font-mono font-bold text-white flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: bus.routeColor }}
                      />
                      {bus.id}
                    </td>
                    <td className="py-3 px-4 text-slate-200">
                      <span className="font-medium">{bus.routeName}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {bus.currentStop}
                    </td>
                    <td className="py-3 px-4 font-mono text-cyan-400 font-semibold">
                      {bus.speedKmH} km/h
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span>{bus.passengerCount}/{bus.capacity}</span>
                        <span className="text-[10px] text-slate-500">
                          ({Math.round((bus.passengerCount / bus.capacity) * 100)}%)
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <span className={bus.engineTempC > 100 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                        {bus.engineTempC}°C
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge
                        variant={
                          bus.status === 'On Time'
                            ? 'emerald'
                            : bus.status === 'Delayed'
                            ? 'amber'
                            : bus.status === 'In Depot'
                            ? 'slate'
                            : 'rose'
                        }
                        size="sm"
                        dot={bus.status !== 'In Depot'}
                      >
                        {bus.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                      {bus.lastUpdated}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        icon={<Eye className="w-3.5 h-3.5" />}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedBus(bus);
                        }}
                      >
                        Inspect
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bus Detail Modal */}
      <BusDetailModal
        bus={selectedBus}
        onClose={() => setSelectedBus(null)}
        onInjectEvent={injectBusEvent}
      />
    </div>
  );
};
