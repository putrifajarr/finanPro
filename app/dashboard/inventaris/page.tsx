"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import {
  MagnifyingGlassIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

export default function Inventaris() {
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [nama, setNama] = useState("");
  const [kode, setKode] = useState("");
  const [min, setMin] = useState("");
  const [stok, setStok] = useState("");
  const [satuan, setSatuan] = useState("");
  const [harga, setHarga] = useState("");

  const formatRupiah = (value: string) => {
    const angka = value.replace(/[^\d]/g, "");
    return angka.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const data = [
    { no: 1, nama: "Teh", kode: "ABCDEF", min: 120, stok: 120, satuan: "Pack", harga: "120.000" },
    { no: 2, nama: "Kopi", kode: "ABCCDDF", min: 20, stok: 10, satuan: "Pack", harga: "150.000" },
  ];

  const filteredData = data.filter((item) =>
    item.nama.toLowerCase().includes(search.toLowerCase()) ||
    item.kode.toLowerCase().includes(search.toLowerCase())
  );
  

  return (
    <div className="flex min-h-screen bg-gray-100">

      {/* Sidebar */}
      <Sidebar />

      {/* MAIN */}
      <main className="flex-1 px-10 py-8">
        <h1 className="text-2xl font-bold mb-6">Inventaris</h1>

        {/* Search + Tambah */}
        <div className="flex justify-end items-center gap-3 mb-4">

          {/* Search */}
          <div className="flex items-center border border-[#BCFF75] bg-white rounded-full px-4 py-2 w-72">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              placeholder="Ketikkan pencarian..."
              className="ml-2 bg-transparent outline-none text-sm w-full"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
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

        {/* Table */}
        <table className="w-full border-collapse bg-white shadow rounded text-sm">
          <thead className="bg-[#BCFF75] font-semibold text-center">
            <tr>
              <th className="border p-2">No</th>
              <th className="border p-2">Nama Produk</th>
              <th className="border p-2">Kode Produk</th>
              <th className="border p-2">Stok Minimum</th>
              <th className="border p-2">Stok Saat Ini</th>
              <th className="border p-2">Satuan</th>
              <th className="border p-2">Harga Pokok</th>
              <th className="border p-2">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((row) => (
              <tr key={row.no} className="text-center hover:bg-gray-50">
                <td className="border p-2">{row.no}</td>
                <td className="border p-2">{row.nama}</td>
                <td className="border p-2">{row.kode}</td>
                <td className="border p-2">{row.min}</td>
                <td className="border p-2">{row.stok}</td>
                <td className="border p-2">{row.satuan}</td>
                <td className="border p-2">{row.harga}</td>

                {/* Aksi */}
                <td className="border p-2 flex justify-center gap-3">
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

      {/* Modal Tambah Produk */}
      {showForm && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="bg-white p-8 rounded-xl shadow-lg w-[420px] animate-fadeIn">
      <h2 className="text-xl font-semibold text-center mb-6">Tambah Produk</h2>

      <label className="text-sm font-medium">Nama Produk</label>
      <input
        value={nama}
        onChange={(e) => setNama(e.target.value)}
        className="border rounded-lg w-full px-3 py-2 mb-3"
        placeholder="Nama Produk"
      />

      <label className="text-sm font-medium">Kode Produk</label>
      <input
        value={kode}
        onChange={(e) => setKode(e.target.value)}
        className="border rounded-lg w-full px-3 py-2 mb-3"
        placeholder="Kode Produk"
      />

      <label className="text-sm font-medium">Stok Minimum</label>
      <input
        type="number"
        value={min}
        onChange={(e) => setMin(e.target.value)}
        className="border rounded-lg w-full px-3 py-2 mb-3"
        placeholder="0"
      />

      <label className="text-sm font-medium">Stok Saat Ini</label>
      <input
        type="number"
        value={stok}
        onChange={(e) => setStok(e.target.value)}
        className="border rounded-lg w-full px-3 py-2 mb-3"
        placeholder="0"
      />

      <label className="text-sm font-medium">Satuan</label>
      <input
        value={satuan}
        onChange={(e) => setSatuan(e.target.value)}
        className="border rounded-lg w-full px-3 py-2 mb-3"
        placeholder="Pack / Unit / Lainnya"
      />

      <label className="text-sm font-medium">Harga Pokok</label>
      <div className="flex items-center border rounded-lg px-3 py-2 mb-4">
        <span className="text-gray-500 mr-2">Rp</span>
        <input
          type="text"
          value={harga}
          onChange={(e) => setHarga(formatRupiah(e.target.value))}
          className="w-full outline-none"
          placeholder="0"
        />
      </div>

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
