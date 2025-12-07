"use client";


import React, { useState, useEffect } from "react";
import {
  Search, Filter, Plus, Pencil, Trash2, X,
  LayoutDashboard, PieChart, ArrowRightLeft, Package,
  History, Settings
} from "lucide-react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";


// Tipe Data Produk
interface Produk {
  id_produk: string; // String karena dari API sudah dikonversi dari BigInt
  nama_produk: string;
  kode_produk: string;
  stok_minimum: number;
  stok_saat_ini: number;
  satuan: string;
  harga_pokok: number;
}


export default function InventarisPage() {
  const [produkList, setProdukList] = useState<Produk[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);


  // Form State
  const [formData, setFormData] = useState({
    nama_produk: "",
    kode_produk: "",
    stok_minimum: "",
    stok_saat_ini: "",
    satuan: "",
    harga_pokok: "",
  });


  // 1. FETCH DATA
  const fetchProduk = async () => {
    try {
      const res = await fetch("/api/inventaris");
      const data = await res.json();
      if (res.ok) setProdukList(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchProduk();
  }, []);


  // 2. SIMPAN DATA
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const payload = {
      nama_produk: formData.nama_produk,
      kode_produk: formData.kode_produk,
      stok_minimum: Number(formData.stok_minimum),
      stok_saat_ini: Number(formData.stok_saat_ini),
      satuan: formData.satuan,
      harga_pokok: Number(formData.harga_pokok),
    };


    try {
      const res = await fetch("/api/inventaris", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });


      if (res.ok) {
        alert("Produk berhasil ditambahkan!");
        setShowModal(false);
        fetchProduk();
        // Reset Form
        setFormData({
          nama_produk: "",
          kode_produk: "",
          stok_minimum: "",
          stok_saat_ini: "",
          satuan: "",
          harga_pokok: "",
        });
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.error || "Server Error"));
      }
    } catch (error) {
      alert("Error sistem");
    }
  };


  // 3. HAPUS DATA
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus produk ini?")) return;
    try {
      const res = await fetch(`/api/inventaris/${id}`, { method: "DELETE" });
      if (res.ok) fetchProduk();
      else alert("Gagal menghapus");
    } catch (error) {
      alert("Error sistem");
    }
  };


  return (
    <div className="flex min-h-screen bg-gray-100">
     
      <Sidebar />

      {/* --- KONTEN UTAMA --- */}
      <main className="flex-1 px-10 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Inventaris</h2>


        {/* Toolbar */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input type="text" placeholder="Cari produk..." className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-400 bg-white" />
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50 text-sm shadow-sm text-gray-600">
              <Filter className="h-4 w-4" /> Filter
            </button>
            <button onClick={() => setShowModal(true)} className="flex items-center gap-2 px-6 py-2 bg-lime-400 text-black border border-green-300 rounded-md hover:bg-green-300 font-medium shadow-sm transition-colors">
              <Plus className="h-4 w-4" /> Tambah
            </button>
          </div>
        </div>


        {/* Tabel */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200">
          <table className="w-full text-sm text-left">
            <thead className="bg-lime-300 text-gray-900 font-bold border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-center border-r border-gray-400 w-12">No</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Nama Produk</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Kode Produk</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Stok Minimum</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Stok Saat Ini</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Satuan</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Harga Pokok</th>
                <th className="px-4 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Memuat data...</td></tr>
              ) : produkList.length === 0 ? (
                <tr><td colSpan={8} className="text-center py-8 text-gray-500">Belum ada data produk.</td></tr>
              ) : (
                produkList.map((item, index) => (
                  <tr key={item.id_produk} className="border-b hover:bg-gray-50 text-gray-700 transition-colors">
                    <td className="px-4 py-3 text-center border-r border-gray-200">{index + 1}</td>
                    <td className="px-4 py-3 border-r border-gray-200 font-medium">{item.nama_produk}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">{item.kode_produk}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200 text-red-600 font-bold">{item.stok_minimum}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200 text-green-700 font-bold">{item.stok_saat_ini}</td>
                    <td className="px-4 py-3 text-center border-r border-gray-200">{item.satuan}</td>
                    <td className="px-4 py-3 text-right border-r border-gray-200">
                      {new Intl.NumberFormat("id-ID").format(item.harga_pokok)}
                    </td>
                    <td className="px-4 py-3 text-center flex justify-center gap-2">
                      <button className="text-green-600 hover:text-green-800 p-1"><Pencil className="h-4 w-4" /></button>
                      <button onClick={() => handleDelete(item.id_produk)} className="text-red-600 hover:text-red-800 p-1"><Trash2 className="h-4 w-4" /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>


        {/* --- MODAL POP-UP (TAMBAH PRODUK) --- */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in">
            <div className="bg-white p-6 rounded-lg w-full max-w-lg shadow-2xl relative">
              <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
             
              <h2 className="text-xl font-bold mb-6 text-center text-gray-800">Tambah Produk</h2>
             
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Nama & Kode */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Nama Produk</label>
                    <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                      value={formData.nama_produk} onChange={e => setFormData({...formData, nama_produk: e.target.value})} placeholder="Teh ABC" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Kode Produk</label>
                    <input type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                      value={formData.kode_produk} onChange={e => setFormData({...formData, kode_produk: e.target.value})} placeholder="DEF120" />
                  </div>
                </div>


                {/* Stok Min & Stok Saat Ini */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1">Stok Minimum</label>
                    <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                      value={formData.stok_minimum} onChange={e => setFormData({...formData, stok_minimum: e.target.value})} placeholder="120" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-1">Stok Saat Ini</label>
                    <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                      value={formData.stok_saat_ini} onChange={e => setFormData({...formData, stok_saat_ini: e.target.value})} placeholder="120" />
                  </div>
                </div>


                {/* Satuan */}
                <div>
                  <label className="block text-sm font-semibold mb-1">Satuan</label>
                  <input required type="text" className="w-full border p-2 rounded focus:ring-2 focus:ring-green-400 outline-none"
                    value={formData.satuan} onChange={e => setFormData({...formData, satuan: e.target.value})} placeholder="Pack / Pcs" />
                </div>


                {/* Harga Pokok */}
                <div>
                  <label className="block text-sm font-semibold mb-1">Harga Pokok</label>
                  <div className="flex items-center border border-gray-300 rounded px-3 py-2 focus-within:ring-2 focus-within:ring-green-400">
                    <span className="text-gray-500 mr-2 font-medium">Rp</span>
                    <input required type="number" className="w-full outline-none"
                      value={formData.harga_pokok} onChange={e => setFormData({...formData, harga_pokok: e.target.value})} placeholder="0" />
                  </div>
                </div>


                <div className="flex gap-3 mt-6 pt-2">
                  <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50 font-medium">Batal</button>
                  <button type="submit" className="w-1/2 py-2 bg-[#76C043] text-white rounded font-bold hover:bg-green-600 shadow-md">Simpan</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
