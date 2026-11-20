'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  Thermometer,
  Layers,
  User,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Wrench,
  Radio,
} from 'lucide-react';

interface Machine {
  id: string;
  code: string;
  name: string;
  type: string;
  status: 'Running' | 'Idle' | 'Maintenance' | 'Error';
  temperature: number;
  outputPerMinute: number;
  operatorName: string;
  updatedAt: string;
}

export default function MonitoringDashboard() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [currentShift, setCurrentShift] = useState<string>('Shift_1');
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [isLive, setIsLive] = useState<boolean>(true);

  // Fungsi sinkronisasi telemetri real-time
  const syncTelemetry = useCallback(async () => {
    try {
      const res = await fetch('/api/monitoring/tick', { method: 'POST' });
      const data = await res.json();
      if (data.success && data.data) {
        setMachines(data.data.machines);
        setCurrentShift(data.data.shift);
        setLastUpdate(new Date(data.data.timestamp));
        setIsLive(true);
      }
    } catch (err) {
      console.error('Gagal sync telemetri:', err);
      setIsLive(false);
    }
  }, []);

  // Inisialisasi awal dan interval real-time setiap 3 detik
  useEffect(() => {
    syncTelemetry();

    const interval = setInterval(() => {
      syncTelemetry();
    }, 3000);

    return () => clearInterval(interval);
  }, [syncTelemetry]);

  // Perhitungan Ringkasan KPI
  const totalMachines = machines.length;
  const runningMachines = machines.filter((m) => m.status === 'Running').length;
  const errorMachines = machines.filter((m) => m.status === 'Error').length;
  const totalCurrentOutput = machines.reduce((acc, m) => acc + m.outputPerMinute, 0);
  const avgTemp =
    machines.length > 0
      ? (machines.reduce((acc, m) => acc + m.temperature, 0) / machines.length).toFixed(1)
      : '0.0';

  // Badge Status Mesin (Warna Solid)
  const getStatusBadge = (status: Machine['status']) => {
    switch (status) {
      case 'Running':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
            Running
          </span>
        );
      case 'Idle':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            Idle
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-300">
            <Wrench className="w-3 h-3 text-sky-700" />
            Maintenance
          </span>
        );
      case 'Error':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-300 animate-pulse">
            <AlertTriangle className="w-3 h-3 text-rose-700" />
            Error
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Live Production Monitoring</h1>
          <p className="text-sm text-slate-500 mt-1">
            Sistem pemantauan performa mesin pabrik real-time & perekaman shift otomatis.
          </p>
        </div>

        {/* Status Kontrol & Shift */}
        <div className="flex items-center gap-3">
          <div className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl flex items-center gap-2 text-xs shadow-sm">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-slate-500">Shift Berjalan:</span>
            <span className="font-semibold text-slate-800">{currentShift.replace('_', ' ')}</span>
          </div>

          <div
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border flex items-center gap-2 shadow-sm ${
              isLive
                ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
                : 'bg-rose-50 border-rose-300 text-rose-800'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isLive ? 'animate-pulse text-emerald-600' : 'text-rose-600'}`} />
            <span>{isLive ? 'Real-Time Telemetry: Active (3s)' : 'Telemetry Inactive'}</span>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Mesin</span>
            <Cpu className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-slate-900">{totalMachines}</div>
          <div className="text-xs text-slate-400 mt-1">Unit terdaftar di sistem</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Mesin Beroperasi</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-bold text-emerald-600">{runningMachines}</div>
          <div className="text-xs text-slate-400 mt-1">Dari total {totalMachines} mesin aktif</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Total Output / Menit</span>
            <Layers className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-bold text-indigo-600">{totalCurrentOutput}</div>
          <div className="text-xs text-slate-400 mt-1">Barang dihasilkan per menit</div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-medium uppercase tracking-wider">Rata-Rata Temperatur</span>
            <Thermometer className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-600">{avgTemp} °C</div>
          <div className="text-xs text-slate-400 mt-1">
            {errorMachines > 0 ? `${errorMachines} unit dalam kondisi peringatan` : 'Semua mesin suhu wajar'}
          </div>
        </div>
      </div>

      {/* Grid Mesin Real-Time */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-slate-900">Status Performa Setiap Mesin</h2>
          <span className="text-xs text-slate-400">
            Terakhir update: {lastUpdate.toLocaleTimeString('id-ID')}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
          {machines.map((machine) => {
            const isHot = machine.temperature >= 75;
            return (
              <div
                key={machine.id}
                className={`bg-white border rounded-2xl p-6 shadow-sm transition-all ${
                  machine.status === 'Error'
                    ? 'border-rose-300 ring-2 ring-rose-100'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {/* Header Card Mesin */}
                <div className="flex items-start justify-between mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-blue-700 border border-slate-200">
                        {machine.code}
                      </span>
                      <span className="text-xs font-semibold text-slate-500">
                        {machine.type}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{machine.name}</h3>
                  </div>
                  <div>{getStatusBadge(machine.status)}</div>
                </div>

                {/* Indikator Metrik (Output, Suhu, Operator) */}
                <div className="grid grid-cols-3 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl mb-4">
                  {/* Output per Menit */}
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">Output / Menit</span>
                    <div className="text-xl font-bold text-slate-900 flex items-baseline gap-1">
                      {machine.outputPerMinute}
                      <span className="text-[10px] text-slate-500 font-normal">pcs</span>
                    </div>
                  </div>

                  {/* Temperatur Mesin */}
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">Temperatur</span>
                    <div
                      className={`text-xl font-bold flex items-baseline gap-1 ${
                        isHot ? 'text-rose-600' : 'text-slate-900'
                      }`}
                    >
                      {machine.temperature}
                      <span className="text-[10px] text-slate-500 font-normal">°C</span>
                    </div>
                  </div>

                  {/* Operator */}
                  <div>
                    <span className="text-[11px] font-medium text-slate-500 block mb-1">Operator Bertugas</span>
                    <div className="text-xs font-semibold text-slate-800 truncate flex items-center gap-1 mt-1">
                      <User className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">{machine.operatorName}</span>
                    </div>
                  </div>
                </div>

                {/* Status Bar Suhu */}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1.5">
                    <span>Termal Thermal Load</span>
                    <span className={isHot ? 'text-rose-600 font-semibold' : 'text-slate-500'}>
                      {isHot ? 'Peringatan Suhu Tinggi' : 'Kondisi Normal'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                    <div
                      className={`h-full transition-all duration-500 ${
                        machine.temperature > 80
                          ? 'bg-rose-600'
                          : machine.temperature > 60
                          ? 'bg-amber-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ width: `${Math.min(100, (machine.temperature / 100) * 100)}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}