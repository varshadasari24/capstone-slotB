import React, { useState } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  FileCode,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
  X,
  Search,
  Filter,
  BarChart3,
  Layers,
  Clock,
  Gauge,
  ArrowRight,
} from 'lucide-react';
import { useSimulation } from '../../context/SimulationContext';
import { BenchmarkResult } from '../../types';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';

export const ReportsView: React.FC = () => {
  const { benchmarkResults, deleteBenchmarkResult, setActiveTab } = useSimulation();

  const [selectedResult, setSelectedResult] = useState<BenchmarkResult | null>(null);
  const [searchFilter, setSearchFilter] = useState('');
  const [showPrintModal, setShowPrintModal] = useState(false);

  // Filtered results
  const filtered = benchmarkResults.filter((r) => {
    return (
      r.id.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.config.processingMode.toLowerCase().includes(searchFilter.toLowerCase()) ||
      r.config.workloadIntensity.toLowerCase().includes(searchFilter.toLowerCase())
    );
  });

  // Export to CSV Function
  const handleExportCSV = () => {
    const headers = [
      'Test ID',
      'Date',
      'Workload Intensity',
      'Virtual Users',
      'Processing Mode',
      'Total Ingested Events',
      'Processed Events',
      'Failed Events',
      'Avg Latency (ms)',
      'P50 Latency (ms)',
      'P95 Latency (ms)',
      'P99 Latency (ms)',
      'Peak Throughput (EPS)',
      'Avg Throughput (EPS)',
      'SLA Passed',
      'Grade',
    ];

    const rows = benchmarkResults.map((r) => [
      r.id,
      `"${r.testDate}"`,
      r.config.workloadIntensity,
      r.config.virtualUsers,
      `"${r.config.processingMode}"`,
      r.totalEventsIngested,
      r.totalEventsProcessed,
      r.failedEventsCount,
      r.latencyMs.avg,
      r.latencyMs.p50,
      r.latencyMs.p95,
      r.latencyMs.p99,
      r.peakThroughputEventsPerSec,
      r.averageThroughputEventsPerSec,
      r.slaPassed ? 'TRUE' : 'FALSE',
      r.grade,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smart_transit_benchmark_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export to JSON
  const handleExportJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(benchmarkResults, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `benchmark_telemetry_dump_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Trigger Printable PDF Dialog
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-800/80 no-print">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-white">
              Benchmark Reports & Export Engine
            </h1>
            <Badge variant="cyan" size="sm">
              {benchmarkResults.length} Reports Archived
            </Badge>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Audit-grade performance benchmark summaries, CSV datasets, JSON telemetry dumps, and printable PDF documents.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
          >
            Export CSV
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={handleExportJSON}
            icon={<FileCode className="w-3.5 h-3.5" />}
          >
            Export JSON
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePrint}
            icon={<Printer className="w-3.5 h-3.5" />}
          >
            Print / PDF Report
          </Button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4 text-xs no-print">
        <div className="relative w-full max-w-sm">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchFilter}
            onChange={(e) => setSearchFilter(e.target.value)}
            placeholder="Search report by Test ID, mode, or workload..."
            className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700/80 rounded-lg text-slate-200 placeholder:text-slate-500 text-xs focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-slate-400 text-[11px] font-mono">
          Showing {filtered.length} of {benchmarkResults.length} runs
        </div>
      </div>

      {/* Reports Table */}
      <div className="glass-panel rounded-2xl border border-slate-800/80 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-cyan-400" />
            <span className="text-sm font-semibold text-white">Historical Benchmark Execution Ledger</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/60 text-slate-400 uppercase tracking-wider text-[11px] font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Test ID</th>
                <th className="py-3 px-4">Test Date</th>
                <th className="py-3 px-4">Workload Profile</th>
                <th className="py-3 px-4">Total Events</th>
                <th className="py-3 px-4">Avg Latency</th>
                <th className="py-3 px-4">Throughput</th>
                <th className="py-3 px-4">Error Rate</th>
                <th className="py-3 px-4">Result / SLA</th>
                <th className="py-3 px-4 text-right no-print">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-slate-500">
                    No benchmark runs recorded matching search query.
                  </td>
                </tr>
              ) : (
                filtered.map((report) => {
                  const errorPct = (
                    (report.failedEventsCount / report.totalEventsIngested) *
                    100
                  ).toFixed(2);
                  return (
                    <tr
                      key={report.id}
                      className="hover:bg-slate-850/50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedResult(report)}
                    >
                      <td className="py-3 px-4 font-mono font-bold text-cyan-400 flex items-center gap-2">
                        {report.id}
                      </td>
                      <td className="py-3 px-4 text-slate-400 text-[11px] font-mono">
                        {report.testDate}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-200">
                          {report.config.workloadIntensity} ({report.config.virtualUsers} VUs)
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[160px]">
                          {report.config.processingMode}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {report.totalEventsIngested.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 font-mono text-teal-400 font-semibold">
                        {report.latencyMs.avg} ms
                      </td>
                      <td className="py-3 px-4 font-mono text-cyan-300 font-semibold">
                        {report.averageThroughputEventsPerSec.toLocaleString()} EPS
                      </td>
                      <td className="py-3 px-4 font-mono">
                        <span
                          className={
                            report.failedEventsCount > 0 ? 'text-rose-400' : 'text-emerald-400'
                          }
                        >
                          {errorPct}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-mono font-bold text-xs border ${
                              report.grade === 'A+' || report.grade === 'A'
                                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                                : report.grade === 'B'
                                ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                                : 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                            }`}
                          >
                            {report.grade}
                          </span>
                          <Badge
                            variant={report.slaPassed ? 'emerald' : 'rose'}
                            size="sm"
                          >
                            {report.slaPassed ? 'PASSED' : 'FAILED'}
                          </Badge>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right no-print">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="ghost"
                            size="sm"
                            icon={<Eye className="w-3.5 h-3.5" />}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedResult(report);
                            }}
                          >
                            Details
                          </Button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteBenchmarkResult(report.id);
                            }}
                            className="p-1 rounded text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete report"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Report Drawer / Modal */}
      {selectedResult && (
        <div className="fixed inset-0 z-50 bg-navy-950/80 backdrop-blur-md flex items-center justify-center p-4 no-print">
          <div className="w-full max-w-2xl rounded-2xl glass-panel border border-slate-700/80 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold font-mono border ${
                    selectedResult.grade === 'A+' || selectedResult.grade === 'A'
                      ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                      : 'bg-rose-500/20 text-rose-400 border-rose-500/40'
                  }`}
                >
                  {selectedResult.grade}
                </div>
                <div>
                  <h3 className="text-base font-bold text-white font-mono">
                    {selectedResult.id}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {selectedResult.testDate} • {selectedResult.config.processingMode}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedResult(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4 text-xs">
              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-300 leading-relaxed">
                <strong>Executive Summary: </strong>
                {selectedResult.summaryRecommendation}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Total Events</span>
                  <span className="text-base font-bold font-mono text-white">
                    {selectedResult.totalEventsIngested.toLocaleString()}
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Average Latency</span>
                  <span className="text-base font-bold font-mono text-teal-400">
                    {selectedResult.latencyMs.avg} ms
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-400 block mb-1">P95 Tail Latency</span>
                  <span className="text-base font-bold font-mono text-amber-400">
                    {selectedResult.latencyMs.p95} ms
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-900/40 border border-slate-800">
                  <span className="text-slate-400 block mb-1">Peak Throughput</span>
                  <span className="text-base font-bold font-mono text-cyan-400">
                    {selectedResult.peakThroughputEventsPerSec.toLocaleString()} EPS
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 space-y-2">
                <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider block">
                  Configuration Parameters
                </span>
                <div className="grid grid-cols-2 gap-2 text-slate-300">
                  <div>Workload: <strong>{selectedResult.config.workloadIntensity}</strong></div>
                  <div>Virtual Users: <strong>{selectedResult.config.virtualUsers} VUs</strong></div>
                  <div>Duration: <strong>{selectedResult.config.durationSeconds} seconds</strong></div>
                  <div>Packet Loss Simulation: <strong>{selectedResult.config.simulatePacketLoss ? 'Enabled' : 'Disabled'}</strong></div>
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-800 bg-slate-950/40 flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                icon={<BarChart3 className="w-3.5 h-3.5" />}
                onClick={() => {
                  setSelectedResult(null);
                  setActiveTab('benchmark');
                }}
              >
                Analyze in Benchmarks
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedResult(null)}>
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
