"use client";

import React, { useState, useEffect } from "react";
import {
  Search, Filter, Plus, Pencil, Trash2, X, Calendar,
  LayoutDashboard, PieChart, ArrowRightLeft, Package,
  History, Settings, LogOut, Loader2
} from "lucide-react";
import Sidebar from "@/components/Sidebar";
// import Link from "next/link"; // Gunakan Link jika di lokal

// Sesuaikan tipe data dengan respon API
interface Transaksi {
  id_transaksi: string;
  tanggal: string;
  total_harga: number;
  deskripsi: string;
  kategori: {
    nama_kategori: string;
    jenis_kategori: string;
  };
}

export default function RiwayatTransaksiPage() {
  const [transaksiList, setTransaksiList] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // State Filter
  const [searchTerm, setSearchTerm] = useState("");
  const [filterJenis, setFilterJenis] = useState("Semua");

  // State Form (Edit/Add)
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    tanggal: "",
    jenis_transaksi: "Pengeluaran",
    jumlah: "",
    deskripsi: "",
  });

  // 1. FETCH DATA
  const fetchTransaksi = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/transaksi");
      if (res.ok) {
        const data = await res.json();
        setTransaksiList(data);
      } else {
        console.error("Gagal mengambil data");
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransaksi();
  }, []);

  // 2. FILTERING LOGIC (Client Side)
  const filteredList = transaksiList.filter((item) => {
    const term = searchTerm.toLowerCase();
    // Cari di deskripsi atau harga
    const matchSearch = 
      (item.deskripsi || "").toLowerCase().includes(term) ||
      item.total_harga.toString().includes(term);

    // Filter Dropdown
    // Menggunakan optional chaining (?.) untuk mencegah error jika kategori null
    const jenisItem = item.kategori?.jenis_kategori; 
    
    const matchJenis = 
      filterJenis === "Semua" ? true :
      filterJenis === "Pemasukan" ? jenisItem === "pemasukan" :
      jenisItem === "pengeluaran";

    return matchSearch && matchJenis;
  });

  // 3. SUBMIT (SIMPAN / EDIT)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const tanggalFix = formData.tanggal || new Date().toISOString().split('T')[0];

    // Payload kirim 'jenis_transaksi', backend akan urus ID Kategori
    const payload = {
      tanggal: tanggalFix,
      total_harga: Number(formData.jumlah),
      deskripsi: formData.deskripsi,
      jenis_transaksi: formData.jenis_transaksi, 
    };

    try {
      const url = isEditing ? `/api/transaksi/${editId}` : "/api/transaksi";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert(isEditing ? "Berhasil diperbarui!" : "Berhasil disimpan!");
        setShowModal(false);
        resetForm();
        fetchTransaksi();
      } else {
        const err = await res.json();
        alert("Gagal: " + (err.error || "Server Error"));
      }
    } catch (error) {
      alert("Terjadi kesalahan sistem.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // 4. DELETE
  const handleDelete = async (id: string) => {
    if (!confirm("Hapus transaksi ini?")) return;
    
    try {
      const res = await fetch(`/api/transaksi/${id}`, { method: "DELETE" });
      if (res.ok) {
        alert("Berhasil dihapus");
        fetchTransaksi();
      } else {
        const err = await res.json();
        alert("Gagal hapus: " + (err.error || "Server Error"));
      }
    } catch (error) {
      alert("Gagal menghapus data.");
    }
  };

  // 5. EDIT HANDLER
  const handleEditClick = (item: Transaksi) => {
    setIsEditing(true);
    setEditId(item.id_transaksi);
    
    // Format tanggal ISO ke YYYY-MM-DD untuk input date
    const dateObj = new Date(item.tanggal);
    const dateStr = dateObj.toISOString().split('T')[0];
    
    // Ambil jenis dari kategori (safe access)
    const jenisLabel = item.kategori?.jenis_kategori === "pemasukan" ? "Pemasukan" : "Pengeluaran";

    setFormData({
      tanggal: dateStr,
      jenis_transaksi: jenisLabel,
      jumlah: item.total_harga.toString(),
      deskripsi: item.deskripsi || "",
    });
    setShowModal(true);
  };

  const handleTambahClick = () => {
    resetForm();
    setShowModal(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditId(null);
    const today = new Date().toISOString().split('T')[0];
    setFormData({ tanggal: today, jenis_transaksi: "Pengeluaran", jumlah: "", deskripsi: "" });
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      
      <Sidebar />

      {/* MAIN CONTENT */}
      <main className="flex-1 px-10 py-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Riwayat Transaksi</h2>

        {/* TOOLBAR */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center mb-6">
          <div className="relative w-full md:w-1/3">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Cari deskripsi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#76C043]"
            />
          </div>
          <div className="flex gap-3">
             <div className="relative">
              <Filter className="absolute left-3 top-2.5 h-4 w-4 text-gray-600 pointer-events-none" />
              <select 
                value={filterJenis}
                onChange={(e) => setFilterJenis(e.target.value)}
                className="pl-10 pr-8 py-2 bg-white border border-gray-300 rounded-md text-sm text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#76C043] cursor-pointer appearance-none"
              >
                <option value="Semua">Semua</option>
                <option value="Pemasukan">Pemasukan</option>
                <option value="Pengeluaran">Pengeluaran</option>
              </select>
            </div>
            <button onClick={handleTambahClick} className="flex items-center gap-2 px-6 py-2 bg-lime-500 text-black border border-green-300 rounded-md hover:bg-green-300 font-medium transition-colors"><Plus className="h-4 w-4" /> Tambah</button>
          </div>
        </div>

        {/* TABEL */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200 min-h-[400px]">
          <table className="w-full text-sm text-left">
            <thead className="bg-lime-300 text-gray-900 font-bold border-b border-gray-300">
              <tr>
                <th className="px-4 py-3 text-center w-12 border-r border-gray-400">No</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Tanggal</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Id</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Jenis</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Jumlah</th>
                <th className="px-4 py-3 text-center border-r border-gray-400">Deskripsi</th>
                <th className="px-4 py-3 text-center w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Memuat data...</td></tr>
              ) : filteredList.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-10 text-gray-500">Data tidak ditemukan.</td></tr>
              ) : (
                filteredList.map((item, index) => {
                  const isPemasukan = item.kategori?.jenis_kategori === "pemasukan";
                  return (
                    <tr key={item.id_transaksi} className="border-b hover:bg-gray-50 text-gray-700 transition-colors">
                      <td className="px-4 py-3 text-center border-r border-gray-200">{index + 1}</td>
                      <td className="px-4 py-3 text-center border-r border-gray-200">{new Date(item.tanggal).toLocaleDateString("id-ID")}</td>
                      <td className="px-4 py-3 text-center border-r border-gray-200 font-mono text-xs">{item.id_transaksi.substring(0, 8)}...</td>
                      <td className="px-4 py-3 text-center border-r border-gray-200">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          isPemasukan ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                        }`}>
                          {isPemasukan ? "Pemasukan" : "Pengeluaran"}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right px-6 font-medium border-r border-gray-200">{new Intl.NumberFormat("id-ID").format(item.total_harga)}</td>
                      <td className="px-4 py-3 text-center border-r border-gray-200">{item.deskripsi || "-"}</td>
                      <td className="px-4 py-3 text-center flex justify-center gap-2">
                        <button onClick={() => handleEditClick(item)} className="text-green-600 hover:text-green-800 p-1 rounded hover:bg-green-50">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => handleDelete(item.id_transaksi)} className="text-red-600 hover:text-red-800 p-1 rounded hover:bg-red-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </main>

      {/* MODAL FORM */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-lg w-full max-w-md shadow-2xl relative">
            <button onClick={() => setShowModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            <h2 className="text-xl font-bold mb-4 text-center text-gray-800">{isEditing ? "Edit Transaksi" : "Tambah Transaksi"}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Tanggal</label>
                <input required type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#76C043] outline-none"
                  value={formData.tanggal} onChange={e => setFormData({...formData, tanggal: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Jenis</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jenis" value="Pengeluaran" checked={formData.jenis_transaksi === "Pengeluaran"} onChange={e => setFormData({...formData, jenis_transaksi: e.target.value})} className="text-[#76C043] focus:ring-[#76C043]" /> Pengeluaran
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="jenis" value="Pemasukan" checked={formData.jenis_transaksi === "Pemasukan"} onChange={e => setFormData({...formData, jenis_transaksi: e.target.value})} className="text-[#76C043] focus:ring-[#76C043]" /> Pemasukan
                  </label>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold">Jumlah (Rp)</label>
                <input required type="number" className="w-full border p-2 rounded focus:ring-2 focus:ring-[#76C043] outline-none"
                  value={formData.jumlah} onChange={e => setFormData({...formData, jumlah: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold">Deskripsi</label>
                <textarea className="w-full border p-2 rounded focus:ring-2 focus:ring-[#76C043] outline-none"
                  value={formData.deskripsi} onChange={e => setFormData({...formData, deskripsi: e.target.value})} />
              </div>
              <div className="flex gap-2 mt-4">
                <button type="button" onClick={() => setShowModal(false)} className="w-1/2 py-2 border rounded hover:bg-gray-100 transition-colors">Batal</button>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-1/2 py-2 bg-[#76C043] text-white rounded font-bold hover:bg-green-600 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : (isEditing ? "Update" : "Simpan")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}