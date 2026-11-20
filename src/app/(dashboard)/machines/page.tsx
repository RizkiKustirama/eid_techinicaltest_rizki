'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Cpu,
  Plus,
  Pencil,
  Trash2,
  X,
  Check,
  AlertCircle,
} from 'lucide-react';

interface Machine {
  id: string;
  code: string;
  name: string;
  type: 'CNC' | 'Milling' | 'Press' | 'Assembly';
  status: 'Running' | 'Idle' | 'Maintenance' | 'Error';
  temperature: number;
  outputPerMinute: number;
  operatorName: string;
}

export default function MachinesPage() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // State Modal Form
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    type: 'CNC' as Machine['type'],
    status: 'Idle' as Machine['status'],
    operatorName: '',
  });

  // Ambil Data Mesin dari API
  const fetchMachines = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/machines');
      const data = await res.json();
      if (data.success) {
        setMachines(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data mesin.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMachines();
  }, [fetchMachines]);

  // Update Status Cepat Langsung dari Tabel (Inline Dropdown)
  const handleQuickStatusChange = async (id: string, newStatus: Machine['status']) => {
    try {
      const res = await fetch(`/api/machines/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      fetchMachines();
    } catch (err: any) {
      setError(err.message || 'Gagal mengubah status mesin.');
    }
  };

  // Buka Modal Tambah
  const handleOpenAdd = () => {
    setEditingMachine(null);
    setFormData({
      code: '',
      name: '',
      type: 'CNC',
      status: 'Idle',
      operatorName: '',
    });
    setIsModalOpen(true);
  };

  // Buka Modal Edit
  const handleOpenEdit = (m: Machine) => {
    setEditingMachine(m);
    setFormData({
      code: m.code,
      name: m.name,
      type: m.type,
      status: m.status,
      operatorName: m.operatorName,
    });
    setIsModalOpen(true);
  };

  // Simpan Data (Create / Update)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    try {
      if (editingMachine) {
        // Mode Update (PUT)
        const res = await fetch(`/api/machines/${editingMachine.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            type: formData.type,
            status: formData.status,
            operatorName: formData.operatorName,
          }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSuccessMsg(`Mesin ${formData.code} berhasil diperbarui.`);
      } else {
        // Mode Create (POST)
        const res = await fetch('/api/machines', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setSuccessMsg(`Mesin baru ${formData.code} berhasil ditambahkan.`);
      }

      setIsModalOpen(false);
      fetchMachines();
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan saat menyimpan data.');
    }
  };

  // Hapus Data (DELETE)
  const handleDelete = async (id: string, code: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus mesin [${code}]?`)) return;

    setError('');
    setSuccessMsg('');

    try {
      const res = await fetch(`/api/machines/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setSuccessMsg(`Mesin ${code} berhasil dihapus.`);
      fetchMachines();
    } catch (err: any) {
      setError(err.message || 'Gagal menghapus mesin.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Manajemen Data Mesin</h1>
          <p className="text-sm text-slate-500 mt-1">
            Pengelolaan master data unit mesin produksi, jenis mesin, dan penugasan operator.
          </p>
        </div>
        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Mesin Baru</span>
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
              <tr>
                <th className="px-6 py-4">Kode Mesin</th>
                <th className="px-6 py-4">Nama Mesin</th>
                <th className="px-6 py-4">Tipe</th>
                <th className="px-6 py-4">Status Operasional</th>
                <th className="px-6 py-4">Suhu (°C)</th>
                <th className="px-6 py-4">Operator</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Memuat data mesin...
                  </td>
                </tr>
              ) : machines.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    Belum ada data mesin terdaftar.
                  </td>
                </tr>
              ) : (
                machines.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-blue-700">
                      {m.code}
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                      {m.name}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200">
                        {m.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {/* Dropdown Ganti Status Cepat */}
                      <select
                        value={m.status}
                        onChange={(e) => handleQuickStatusChange(m.id, e.target.value as Machine['status'])}
                        className={`px-3 py-1 rounded-full text-xs font-semibold border cursor-pointer focus:outline-none transition-colors ${
                          m.status === 'Running'
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                            : m.status === 'Idle'
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : m.status === 'Maintenance'
                            ? 'bg-sky-100 text-sky-800 border-sky-300'
                            : 'bg-rose-100 text-rose-800 border-rose-300'
                        }`}
                      >
                        <option value="Running" className="bg-white text-slate-800">Running</option>
                        <option value="Idle" className="bg-white text-slate-800">Idle</option>
                        <option value="Maintenance" className="bg-white text-slate-800">Maintenance</option>
                        <option value="Error" className="bg-white text-slate-800">Error</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {m.temperature} °C
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">
                      {m.operatorName}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(m)}
                          className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-200"
                          title="Edit Data Mesin"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(m.id, m.code)}
                          className="p-1.5 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-200"
                          title="Hapus Mesin"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form Tambah / Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-bold text-slate-900 text-lg">
                {editingMachine ? `Edit Mesin [${editingMachine.code}]` : 'Tambah Mesin Baru'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Kode Mesin
                </label>
                <input
                  type="text"
                  required
                  disabled={!!editingMachine}
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  placeholder="Contoh: CNC-03"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600 disabled:bg-slate-100 disabled:text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Nama Mesin
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Contoh: 5-Axis Vertical Milling"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Tipe Mesin
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="CNC">CNC</option>
                    <option value="Milling">Milling</option>
                    <option value="Press">Press</option>
                    <option value="Assembly">Assembly</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                    Status Awal
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  >
                    <option value="Running">Running</option>
                    <option value="Idle">Idle</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Error">Error</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-600 mb-1.5">
                  Operator Bertugas
                </label>
                <input
                  type="text"
                  required
                  value={formData.operatorName}
                  onChange={(e) => setFormData({ ...formData, operatorName: e.target.value })}
                  placeholder="Nama teknisi / operator"
                  className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-100 rounded-xl text-sm font-medium transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm"
                >
                  {editingMachine ? 'Simpan Perubahan' : 'Tambah Mesin'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}