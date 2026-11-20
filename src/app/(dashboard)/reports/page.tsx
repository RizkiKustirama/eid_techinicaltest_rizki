'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Calendar,
  Layers,
  Thermometer,
  Download,
  Filter,
  CheckCircle2,
  Wrench,
  AlertTriangle,
} from 'lucide-react';

interface ProductionLog {
  id: string;
  shift: 'Shift_1' | 'Shift_2' | 'Shift_3';
  outputCount: number;
  temperature: number;
  status: 'Running' | 'Idle' | 'Maintenance' | 'Error';
  operatorName: string;
  recordedAt: string;
  machine: {
    code: string;
    name: string;
    type: string;
  };
}

interface ReportData {
  filter: {
    date: string;
    shift: string;
  };
  summary: {
    totalRecords: number;
    totalOutput: number;
    avgTemperature: number;
    statusCounts: Record<string, number>;
  };
  logs: ProductionLog[];
}

export default function ReportsPage() {
  const [selectedDate, setSelectedDate] = useState<string>(
    ''
  );
  const [selectedShift, setSelectedShift] = useState<string>('');
  const [report, setReport] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setSelectedDate(new Date().toISOString().split('T')[0]);
  }, []);

  // Ambil Data Laporan
  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedDate) params.append('date', selectedDate);
      if (selectedShift) params.append('shift', selectedShift);

      const res = await fetch(`/api/reports?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      }
    } catch (err) {
      console.error('Gagal mengambil laporan:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedDate, selectedShift]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  // Fungsi Export CSV
  const handleExportCSV = () => {
    if (!report || report.logs.length === 0) {
      alert('Tidak ada data untuk diekspor.');
      return;
    }

    const headers = [
      'Waktu Pencatatan',
      'Shift',
      'Kode Mesin',
      'Nama Mesin',
      'Tipe',
      'Status',
      'Output (pcs)',
      'Suhu (°C)',
      'Operator',
    ];

    const rows = report.logs.map((log) => [
      new Date(log.recordedAt).toLocaleString('id-ID'),
      log.shift.replace('_', ' '),
      log.machine.code,
      `"${log.machine.name}"`,
      log.machine.type,
      log.status,
      log.outputCount,
      log.temperature,
      `"${log.operatorName}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `Laporan_Produksi_${selectedDate}_${selectedShift || 'ALL_SHIFT'}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getStatusBadge = (status: ProductionLog['status']) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            Running
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            Idle
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            Maintenance
          </span>
        );
      case 'Error':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300">
            Error
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Laporan Produksi Harian</h1>
          <p className="text-sm text-slate-500 mt-1">
            Rekapitulasi total output dan kondisi operasional mesin per shift kerja.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Download className="w-4 h-4 text-slate-600" />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Tanggal:</span>
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-600"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Shift Kerja:</span>
          <select
            value={selectedShift}
            onChange={(e) => setSelectedShift(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 text-sm focus:outline-none focus:border-blue-600"
          >
            <option value="">Semua Shift</option>
            <option value="Shift_1">Shift 1 (07:00 - 15:00)</option>
            <option value="Shift_2">Shift 2 (15:00 - 23:00)</option>
            <option value="Shift_3">Shift 3 (23:00 - 07:00)</option>
          </select>
        </div>
      </div>

      {/* KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Hasil Produksi</span>
            <Layers className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">
            {report?.summary.totalOutput.toLocaleString('id-ID') || 0}
            <span className="text-xs font-normal text-slate-500 ml-1">pcs</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Total barang dihasilkan pada periode ini</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rata-Rata Suhu Mesin</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-600">
            {report?.summary.avgTemperature || 0} °C
          </div>
          <div className="text-xs text-slate-400 mt-1">Kondisi termal rata-rata mesin</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Catatan Log</span>
            <FileText className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-600">
            {report?.summary.totalRecords || 0}
          </div>
          <div className="text-xs text-slate-400 mt-1">Entri riwayat operasional shift</div>
        </div>
      </div>

      {/* Table Log Riwayat Produksi */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold text-slate-900">Rincian Riwayat Produksi</h2>
          <span className="text-xs text-slate-400">
            {report?.logs.length || 0} baris ditemukan
          </span>
        </div>

        <div className="overflow-x-auto max-h-[480px]">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 sticky top-0">
              <tr>
                <th className="px-6 py-3.5">Waktu</th>
                <th className="px-6 py-3.5">Shift</th>
                <th className="px-6 py-3.5">Kode & Nama Mesin</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Output</th>
                <th className="px-6 py-3.5">Suhu</th>
                <th className="px-6 py-3.5">Operator</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Memuat laporan produksi...
                  </td>
                </tr>
              ) : !report || report.logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Tidak ada riwayat produksi pada tanggal / shift yang dipilih.
                  </td>
                </tr>
              ) : (
                report.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-3.5 font-mono text-xs text-slate-600">
                      {new Date(log.recordedAt).toLocaleTimeString('id-ID')}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                        {log.shift.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-3.5">
                      <div className="font-bold text-slate-900 text-xs font-mono">
                        {log.machine.code}
                      </div>
                      <div className="text-xs text-slate-500">
                        {log.machine.name}
                      </div>
                    </td>
                    <td className="px-6 py-3.5">{getStatusBadge(log.status)}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-900">
                      {log.outputCount.toLocaleString('id-ID')} pcs
                    </td>
                    <td className="px-6 py-3.5 font-medium text-slate-800">
                      {log.temperature} °C
                    </td>
                    <td className="px-6 py-3.5 text-slate-800">
                      {log.operatorName}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}