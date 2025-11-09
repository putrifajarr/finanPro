"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

type Row = {
  no: number;
  nama: string;
  jenisPihak: string;
  tipe: "Hutang" | "Piutang";
  status: string;
  jumlah: number; // simpan sebagai number, tampilkan dengan format
  jatuhTempo: string;
};

export default function HutangPiutangPage() {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Semua");
  const [showForm, setShowForm] = useState(false);

  // form state
  const [formNama, setFormNama] = useState("");
  const [formJenisPihak, setFormJenisPihak] = useState("Pelanggan");
  const [formTipe, setFormTipe] = useState<"Hutang" | "Piutang">("Hutang");
  const [formStatus, setFormStatus] = useState("Belum Lunas");
  const [formJumlah, setFormJumlah] = useState(""); // formatted string e.g. "120.000"
  const [formJatuhTempo, setFormJatuhTempo] = useState("");

  // sample data
  const [data, setData] = useState<Row[]>([
    { no: 1, nama: "Kaisya", jenisPihak: "Pemasok", tipe: "Hutang", status: "Lunas", jumlah: 120000, jatuhTempo: "2025-12-12" },
    { no: 2, nama: "Syifa", jenisPihak: "Pelanggan", tipe: "Piutang", status: "Dicicil", jumlah: 120000, jatuhTempo: "2025-12-12" },
    { no: 3, nama: "Angel", jenisPihak: "Pelanggan", tipe: "Hutang", status: "Belum Lunas", jumlah: 120000, jatuhTempo: "2025-12-12" },
    { no: 4, nama: "Sasa", jenisPihak: "Pelanggan", tipe: "Piutang", status: "Belum Lunas", jumlah: 120000, jatuhTempo: "2025-12-20" },
  ]);

  // helper: format number ke "100.000"
  function formatRupiahFromNumber(n: number) {
    return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }
  // helper: format input string (hapus non-digit, lalu format)
  function formatInputToRupiah(value: string) {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  // filter + search
  const filtered = data.filter((r) => {
    const matchesType = filterType === "Semua" ? true : r.tipe === filterType;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      r.nama.toLowerCase().includes(q) ||
      r.jumlah.toString().includes(q) ||
      r.jatuhTempo.includes(q);
    return matchesType && matchesSearch;
  });

  // handle simpan form (simpan ke data lokal)
  function handleSimpan() {
    // validasi dasar
    if (!formNama.trim() || !formJumlah.trim() || !formJatuhTempo) {
      alert("Lengkapi Nama, Jumlah, dan Jatuh Tempo.");
      return;
    }
    const numeric = parseInt(formJumlah.replace(/[^\d]/g, ""), 10) || 0;
    const nextNo = data.length ? Math.max(...data.map(d => d.no)) + 1 : 1;
    const newRow: Row = {
      no: nextNo,
      nama: formNama.trim(),
      jenisPihak: formJenisPihak,
      tipe: formTipe,
      status: formStatus,
      jumlah: numeric,
      jatuhTempo: formJatuhTempo,
    };
    setData((prev) => [newRow, ...prev]);
    // reset form + tutup
    setFormNama("");
    setFormJenisPihak("Pelanggan");
    setFormTipe("Hutang");
    setFormStatus("Belum Lunas");
    setFormJumlah("");
    setFormJatuhTempo("");
    setShowForm(false);
  }

  // handle hapus (dummy)
  function handleHapus(no: number) {
    if (!confirm("Hapus data ini?")) return;
    setData(prev => prev.filter(r => r.no !== no));
  }

  // style helper for label types
  function labelClassForTipe(t: string) {
    return t === "Pengeluaran" || t === "Hutang"
      ? "bg-red-100 text-red-700"
      : "bg-green-100 text-green-700";
  }

  // search input style: hanya garis (transparent background)
  const searchInputClass = "ml-3 bg-transparent outline-none text-sm text-gray-700 w-full";

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-60 bg-white shadow p-5 flex flex-col">
        <h2 className="text-xl font-bold mb-6">FinanPro</h2>
        <nav className="flex flex-col gap-3 text-gray-700">
          <a className="hover:text-lime-600" href="#">Dashboard</a>
          <a className="hover:text-lime-600" href="#">Laporan Laba</a>
          <a className="bg-lime-100 text-lime-700 px-3 py-2 rounded">Hutang-Piutang</a>
          <a className="hover:text-lime-600" href="#">Inventaris</a>
          <a className="hover:text-lime-600" href="#">Riwayat Transaksi</a>
        </nav>
        <button className="mt-auto text-red-500 border border-red-400 px-3 py-2 rounded hover:bg-red-50">Logout</button>
      </aside>

      {/* Main */}
      <main className="flex-1 px-10 py-8">
        <h1 className="text-2xl font-bold mb-6">Hutang-Piutang</h1>

        {/* Search + Filter + Tambah (kanan atas) */}
        <div className="flex justify-end items-center gap-3 mb-4">

          {/* search (only border, transparent bg) */}
          <div className="flex items-center border border-[#BCFF75] bg-white rounded-full px-4 py-2 w-72">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ketikkan pencarian"
              className={searchInputClass}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* filter tipe */}
          <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <select
              className="bg-transparent outline-none text-sm"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="Semua">Semua</option>
              <option value="Hutang">Hutang</option>
              <option value="Piutang">Piutang</option>
            </select>
          </div>

          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#EEFFDC] hover:bg-[#d6eabf] text-black px-4 py-2 rounded border border-[#BCFF75]"
          >
            <PlusCircleIcon className="h-5 w-5 text-[#7CB342]" />
            Tambah
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead className="bg-[#BCFF75] text-black font-semibold">
              <tr>
                <th className="border p-2">No</th>
                <th className="border p-2">Nama Pihak</th>
                <th className="border p-2">Jenis Pihak</th>
                <th className="border p-2">Hutang-Piutang</th>
                <th className="border p-2">Status Pembayaran</th>
                <th className="border p-2">Jumlah</th>
                <th className="border p-2">Jatuh Tempo</th>
                <th className="border p-2">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((row) => (
                <tr key={row.no} className="odd:bg-white even:bg-white hover:bg-gray-50">
                  <td className="border p-2 text-center align-middle">{row.no}</td>
                  <td className="border p-2 align-middle text-left">{row.nama}</td>
                  <td className="border p-2 text-center align-middle">
                    <span className="inline-block px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                      {row.jenisPihak}
                    </span>
                  </td>
                  <td className="border p-2 text-center align-middle">
                    <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${row.tipe === "Hutang" ? "bg-red-100 text-red-600" : "bg-green-100 text-green-600"}`}>
                      {row.tipe}
                    </span>
                  </td>
                  <td className="border p-2 text-center align-middle">
                    <span className="inline-block px-3 py-1 rounded text-xs bg-yellow-50 text-yellow-700">
                      {row.status}
                    </span>
                  </td>
                  <td className="border p-2 text-right align-middle">Rp{formatRupiahFromNumber(row.jumlah)}</td>
                  <td className="border p-2 text-center align-middle">{row.jatuhTempo}</td>
                  <td className="border p-2 text-center align-middle flex items-center justify-center gap-2">
                    <button className="text-green-600 hover:text-green-800 p-1" title="Edit">
                      <PencilIcon className="h-5 w-5" />
                    </button>
                    <button className="text-red-500 hover:text-red-700 p-1" title="Hapus" onClick={() => handleHapus(row.no)}>
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td className="p-4 text-center" colSpan={8}>Tidak ada data.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* Modal: Tambah */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-[480px] p-6">
            <h3 className="text-lg font-semibold text-center mb-4">Tambah Hutang / Piutang</h3>

            <label className="block text-sm font-medium mb-1">Nama Pihak</label>
            <input value={formNama} onChange={(e) => setFormNama(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-3" placeholder="Nama pihak" />

            <label className="block text-sm font-medium mb-1">Jenis Pihak</label>
            <select value={formJenisPihak} onChange={(e) => setFormJenisPihak(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-3">
              <option>Pelanggan</option>
              <option>Pemasok</option>
            </select>

            <label className="block text-sm font-medium mb-1">Tipe</label>
            <div className="flex gap-6 items-center mb-3">
              <label className="flex items-center gap-2">
                <input type="radio" name="tipe" checked={formTipe === "Hutang"} onChange={() => setFormTipe("Hutang")} />
                <span>Hutang</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="tipe" checked={formTipe === "Piutang"} onChange={() => setFormTipe("Piutang")} />
                <span>Piutang</span>
              </label>
            </div>

            <label className="block text-sm font-medium mb-1">Status Pembayaran</label>
            <select value={formStatus} onChange={(e) => setFormStatus(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-3">
              <option>Belum Lunas</option>
              <option>Dicicil</option>
              <option>Lunas</option>
            </select>

            <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
            <div className="flex items-center border rounded-lg px-3 py-2 mb-3">
              <span className="text-gray-600 mr-2">Rp</span>
              <input
                type="text"
                inputMode="numeric"
                value={formJumlah}
                onChange={(e) => setFormJumlah(formatInputToRupiah(e.target.value))}
                placeholder="0"
                className="w-full outline-none"
              />
            </div>

            <label className="block text-sm font-medium mb-1">Jatuh Tempo</label>
            <input type="date" value={formJatuhTempo} onChange={(e) => setFormJatuhTempo(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-4" />

            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-4 py-2 border rounded-lg">Batal</button>
              <button onClick={handleSimpan} className="px-4 py-2 bg-lime-500 text-white rounded-lg">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
