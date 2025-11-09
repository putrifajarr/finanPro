"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon
} from "@heroicons/react/24/outline";


export default function RiwayatTransaksi() {
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const data = [
    { no: 1, tanggal: "12-12-2025", id_transaksi: "001_001", jenis: "Pengeluaran", kategori: "Operasional", pihak: "Pack", jumlah: "120.000", deskripsi: "100" },
    { no: 2, tanggal: "12-12-2025", id_transaksi: "001_002", jenis: "Pengeluaran", kategori: "Penjualan", pihak: "Pack", jumlah: "120.000", deskripsi: "100" },
    { no: 3, tanggal: "12-12-2025", id_transaksi: "001_003", jenis: "Pengeluaran", kategori: "Pembelian", pihak: "Pack", jumlah: "120.000", deskripsi: "100" },
    { no: 4, tanggal: "12-12-2025", id_transaksi: "001_004", jenis: "Pemasukan", kategori: "Operasional", pihak: "Pack", jumlah: "120.000", deskripsi: "100" },
  ];

  const filteredData = data.filter((item) =>
    (filter === "Semua" || item.jenis === filter) &&
    (search === "" || item.id_transaksi.toLowerCase().includes(search.toLowerCase()))
  );

  const [idTransaksi, setIdTransaksi] = useState("");
  const [jumlahUang, setJumlahUang] = useState("");

  const formatRupiah = (value) => {
  const angka = value.replace(/[^\d]/g, ""); 
  return angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <aside className="w-60 bg-white shadow-md p-5 flex flex-col">
        <h2 className="text-xl font-bold mb-6">FinanPro</h2>
        <nav className="flex flex-col gap-3 text-gray-700">
          <a className="hover:text-lime-600" href="#">Dashboard</a>
          <a className="hover:text-lime-600" href="#">Laporan Laba</a>
          <a className="hover:text-lime-600" href="#">Hutang-Piutang</a>
          <a className="hover:text-lime-600" href="#">Inventaris</a>
          <a className="bg-lime-100 text-lime-700 px-3 py-2 rounded">Riwayat Transaksi</a>
        </nav>
        <button className="mt-auto text-red-500 border border-red-400 px-3 py-2 rounded hover:bg-red-50">
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 px-10 py-8">
        <h1 className="text-2xl font-bold mb-6">Riwayat Transaksi</h1>

        {/* Search + Filter + Tambah */}
        <div className="flex justify-end items-center gap-3 mb-4">

          {/* Search */}
          <div className="flex items-center border border-[#BCFF75] bg-white rounded-full px-4 py-2 w-72">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Cari transaksi..."
              className="ml-2 bg-transparent outline-none text-sm text-gray-700 w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter */}
          <div className="flex items-center border border-gray-300 rounded px-3 py-2 bg-white">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <select
              className="bg-transparent outline-none text-sm"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="Semua">Semua</option>
              <option value="Pengeluaran">Pengeluaran</option>
              <option value="Pemasukan">Pemasukan</option>
            </select>
          </div>

          {/* Tambah */}
          <button
            className="flex items-center gap-2 bg-[#EEFFDC] hover:bg-[#d6eabf] text-black px-4 py-2 rounded border border-[#BCFF75] transition"
            onClick={() => setShowForm(true)}
          >
            <PlusCircleIcon className="h-5 w-5 text-[#7CB342]" />
            Tambah
          </button>
        </div>

        {/* Tabel */}
        <table className="w-full border-collapse text-sm bg-white shadow rounded text center">
          <thead className="bg-[#BCFF75] text-black font-semibold">
            <tr>
              <th className="border p-2">No</th>
              <th className="border p-2">Tanggal</th>
              <th className="border p-2">Id Transaksi</th>
              <th className="border p-2">Jenis Transaksi</th>
              <th className="border p-2">Jumlah</th>
              <th className="border p-2">Deskripsi</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
  {filteredData.map((row) => (
    <tr key={row.no} className="hover:bg-gray-50 text-center">
      <td className="border p-2">{row.no}</td>
      <td className="border p-2">{row.tanggal}</td>
      <td className="border p-2">{row.id_transaksi}</td>

      {/* Jenis Transaksi (Label) */}
      <td className="border p-2">
        <span
          className={`px-3 py-1 rounded text-xs font-semibold ${
            row.jenis === "Pengeluaran"
              ? "bg-red-100 text-red-600"
              : "bg-green-100 text-green-600"
          }`}
        >
          {row.jenis}
        </span>
      </td>

      <td className="border p-2">{row.jumlah}</td>
      <td className="border p-2">{row.deskripsi}</td>

      {/* Aksi */}
      <td className="border p-2 flex gap-3 justify-center">
        <button className="text-green-600 hover:text-green-800">
          <PencilIcon className="h-5 w-5" />
        </button>
        <button className="text-red-500 hover:text-red-700">
          <TrashIcon className="h-5 w-5" />
        </button>
      </td>
    </tr>
  ))}
</tbody>

        </table>
      </main>

      {showForm && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-lg w-[420px] animate-fadeIn">
      <h2 className="text-xl font-semibold text-center mb-6">
        Tambah Transaksi
      </h2>

      {/* ID Transaksi */}
      <label className="block text-sm font-medium mb-1">ID Transaksi</label>
      <input
        type="text"
        value={idTransaksi}
        onChange={(e) => setIdTransaksi(e.target.value)}
        className="border rounded-lg w-full px-3 py-2 mb-4"
        placeholder="Masukkan ID Transaksi"
      />

      {/* Tanggal */}
      <label className="block text-sm font-medium mb-1">Tanggal</label>
      <input type="date" className="border rounded-lg w-full px-3 py-2 mb-4" />

      {/* Jenis Transaksi */}
      <label className="block text-sm font-medium mb-1">Jenis Transaksi</label>
      <div className="flex items-center gap-6 mb-4">
        <label className="flex items-center gap-2">
          <input type="radio" name="jenis" value="Pengeluaran" />
          <span>Pengeluaran</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="jenis" value="Pemasukan" />
          <span>Pemasukan</span>
        </label>
      </div>

      {/* Jumlah Uang */}
      <label className="block text-sm font-medium mb-1">Jumlah Uang</label>
      <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
        <span className="text-gray-500 mr-2">Rp</span>
        <input
          type="text"
          value={jumlahUang}
          onChange={(e) => setJumlahUang(formatRupiah(e.target.value))}
          className="w-full outline-none"
          placeholder=""
        />
      </div>

      {/* Deskripsi */}
      <label className="block text-sm font-medium mb-1">Deskripsi</label>
      <textarea
        className="border rounded-lg w-full px-3 py-2 mb-4 h-20 resize-none"
        placeholder="Masukkan deskripsi"
      ></textarea>

      {/* Tombol */}
      <div className="flex justify-end gap-3">
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Batal
        </button>
        <button className="px-4 py-2 bg-lime-500 hover:bg-lime-600 text-white rounded-lg">
          Simpan
        </button>
      </div>
    </div>
  </div>
)}
    </div>
  );
}
