"use client";

import { useState } from "react";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import Sidebar from "@/components/Sidebar";

export default function RiwayatTransaksi() {
  const [filter, setFilter] = useState("Semua");
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  // STATE INPUT FORM
  const [produk, setProduk] = useState("");
  const [kategori, setKategori] = useState("");
  const [harga, setHarga] = useState("");

  const formatHarga = (value: string) => {
    const cleaned = value.replace(/\D/g, "");
    return cleaned.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleHargaChange = (e: { target: { value: string; }; }) => {
    setHarga(formatHarga(e.target.value));
  };

  const data = [
    {
      no: 1,
      tanggal: "12-12-2025",
      id_transaksi: "001001",
      jenis: "Pengeluaran",
      kategori: "Operasional",
      satuan: "1 Pack",
      harga: "120.000",
      total: "120.000",
      deskripsi: "100",
    },
    {
      no: 2,
      tanggal: "12-12-2025",
      id_transaksi: "001002",
      jenis: "Pengeluaran",
      kategori: "Penjualan",
      satuan: "3 Pack",
      harga: "120.000",
      total: "360.000",
      deskripsi: "100",
    },
    {
      no: 3,
      tanggal: "12-12-2025",
      id_transaksi: "001003",
      jenis: "Pengeluaran",
      kategori: "Pembelian",
      satuan: "2 Pack",
      harga: "120.000",
      total: "240.000",
      deskripsi: "100",
    },
    {
      no: 4,
      tanggal: "12-12-2025",
      id_transaksi: "001004",
      jenis: "Pemasukan",
      kategori: "Operasional",
      satuan: "1 Pack",
      harga: "120.000",
      total: "120.000",
      deskripsi: "100",
    },
  ];

  const filteredData = data.filter(
    (item) =>
      (filter === "Semua" || item.jenis === filter) &&
      (search === "" ||
        item.id_transaksi.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="flex min-h-screen bg-white">
      <Sidebar />

      <main className="flex-1 px-10 py-8">
        <h1 className="text-lg font-bold mb-6">Riwayat Transaksi</h1>

        {/* Search + Filter + Tambah */}
        <div className="flex justify-end items-center gap-3 mb-4">
          {/* Search */}
          <div className="flex items-center border border-[#BBFF66] rounded-full px-4 py-2 w-72">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="ketikan pencarian"
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
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#BBFF66] hover:bg-[#A5ED4E] text-black px-4 py-2 rounded transition"
          >
            <PlusCircleIcon className="h-5 w-5 text-green-700" />
            Tambah
          </button>
        </div>

        {/* Table */}
        <table className="w-full border-collapse text-sm bg-white shadow rounded text-center">
          <thead className="bg-[#BBFF66] text-black font-semibold">
            <tr>
              <th className="border p-2">No</th>
              <th className="border p-2">Tanggal</th>
              <th className="border p-2">Id_Transaksi</th>
              <th className="border p-2">Jenis Transaksi</th>
              <th className="border p-2">Kategori</th>
              <th className="border p-2">Satuan</th>
              <th className="border p-2">Harga satuan</th>
              <th className="border p-2">Jumlah Total</th>
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

                <td className="border p-2">
                  <span
                    className={`px-3 py-1 rounded text-xs font-semibold ${
                      row.jenis === "Pengeluaran"
                        ? "bg-red-200 text-red-700"
                        : "bg-green-200 text-green-700"
                    }`}
                  >
                    {row.jenis}
                  </span>
                </td>

                <td className="border p-2">{row.kategori}</td>
                <td className="border p-2">{row.satuan}</td>
                <td className="border p-2">{row.harga}</td>
                <td className="border p-2 font-bold">{row.total}</td>
                <td className="border p-2">{row.deskripsi}</td>

                <td className="border p-2 flex justify-center gap-2">
                  <button className="p-1 border rounded-md hover:bg-green-100">
                    <PencilIcon className="h-5 w-5 text-green-600" />
                  </button>
                  <button className="p-1 border rounded-md hover:bg-red-100">
                    <TrashIcon className="h-5 w-5 text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Modal: Tambah Transaksi */}
{showForm && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white rounded-xl shadow-lg w-[480px] p-6 max-h-[90vh] overflow-y-auto">

      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Tambah Transaksi</h3>
        <button onClick={() => setShowForm(false)}>
          <XMarkIcon className="h-6 w-6 text-gray-500 hover:text-black" />
        </button>
      </div>

      {/* ID Transaksi */}
      <label className="block text-sm font-medium mb-1">ID Transaksi</label>
      <input
        placeholder="Masukkan ID transaksi"
        className="border rounded-lg w-full px-3 py-2 mb-3"
      />

      {/* Tanggal */}
      <label className="block text-sm font-medium mb-1">Tanggal</label>
      <input
        type="date"
        className="border rounded-lg w-full px-3 py-2 mb-3"
      />

      {/* Jenis Transaksi */}
      <label className="block text-sm font-medium mb-1">Jenis Transaksi</label>
      <div className="flex gap-6 items-center mb-3">
        <label className="flex items-center gap-2">
          <input type="radio" name="jenis" value="Pengeluaran" />
          <span>Pengeluaran</span>
        </label>

        <label className="flex items-center gap-2">
          <input type="radio" name="jenis" value="Pemasukan" />
          <span>Pemasukan</span>
        </label>
      </div>

      {/* Produk */}
      <label className="block text-sm font-medium mb-1">Nama Produk</label>
      <input
        placeholder="Masukkan nama produk"
        className="border rounded-lg w-full px-3 py-2 mb-3"
        value={produk}
        onChange={(e) => setProduk(e.target.value)}
      />

      {/* Kategori */}
      <label className="block text-sm font-medium mb-1">Kategori</label>
      <select
        className="border rounded-lg w-full px-3 py-2 mb-3"
        value={kategori}
        onChange={(e) => setKategori(e.target.value)}
      >
        <option value="">Pilih kategori</option>
        <option value="Operasional">Operasional</option>
        <option value="Pajak">Pajak</option>
        <option value="Penjualan">Penjualan</option>
        <option value="Pembelian">Pembelian</option>
      </select>

      {/* Harga */}
      <label className="block text-sm font-medium mb-1">Harga Satuan (Rp)</label>
      <div className="flex items-center border rounded-lg px-3 py-2 mb-3">
        <span className="text-gray-600 mr-2">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          value={harga}
          onChange={handleHargaChange}
          placeholder="0"
          className="w-full outline-none"
        />
      </div>

      {/* Jumlah Barang */}
      <label className="block text-sm font-medium mb-1">Jumlah Barang</label>
      <input
        type="number"
        placeholder="Masukkan jumlah"
        className="border rounded-lg w-full px-3 py-2 mb-3"
      />

      {/* Deskripsi */}
      <label className="block text-sm font-medium mb-1">Deskripsi</label>
      <textarea
        placeholder="Tambahkan catatan (opsional)"
        className="border rounded-lg w-full px-3 py-2 h-20 resize-none mb-4"
      ></textarea>

      {/* BUTTON */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          onClick={() => setShowForm(false)}
          className="px-4 py-2 border rounded-lg hover:bg-gray-100"
        >
          Batal
        </button>

        <button className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600">
          Simpan
        </button>
      </div>
    </div>
  </div>
)}

      </main>
    </div>
  );
}
