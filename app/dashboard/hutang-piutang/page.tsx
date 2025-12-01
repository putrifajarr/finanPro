"use client";

import { useState, useEffect, useCallback } from "react";
import Sidebar from "@/components/Sidebar";
import {
  MagnifyingGlassIcon,
  FunnelIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

// --- TIPE DATA SESUAI PRISMA ---
export type HutangPiutang = {
  id_hutang_piutang: string; // UUID dari database
  user_id: number;
  nama_pihak: string;
  jenis_hutang_piutang: 'hutang' | 'piutang'; 
  jumlah: number; 
  jatuh_tempo: string; // YYYY-MM-DD
  status_pembayaran: 'belum_lunas' | 'lunas' | 'dicicil';
  jenis_pihak?: string; // Tambahan lokal untuk tampilan (tidak ada di DB)
};

// --- HELPER UNTUK KONVERSI ENUM ---

// Konversi nilai database ('hutang' | 'piutang') ke nilai tampilan ('Hutang' | 'Piutang')
function convertToDisplay(jenis: 'hutang' | 'piutang'): 'Hutang' | 'Piutang' {
    return jenis === 'hutang' ? 'Hutang' : 'Piutang';
}

// Konversi nilai tampilan ('Hutang' | 'Piutang') ke nilai database ('hutang' | 'piutang')
function convertToDatabase(jenis: 'Hutang' | 'Piutang'): 'hutang' | 'piutang' {
    return jenis === 'Hutang' ? 'hutang' : 'piutang';
}

// Konversi nilai status database ('belum_lunas') ke nilai tampilan ('Belum Lunas')
function statusToDisplay(status: string): string {
    return status.replace("_", " ").split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}

// Konversi nilai status tampilan ('Belum Lunas') ke nilai database ('belum_lunas')
function statusToDatabase(status: string): 'belum_lunas' | 'lunas' | 'dicicil' {
    return status.toLowerCase().replace(" ", "_") as 'belum_lunas' | 'lunas' | 'dicicil';
}

// Helper untuk format rupiah dari number
function formatRupiahFromNumber(n: number) {
    if (n === null || n === undefined) return '0';
    return n.toLocaleString('id-ID', {
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0,
    }).replace(/,/g, "."); 
}

// Helper untuk format input string (hapus non-digit, lalu format)
function formatInputToRupiah(value: string) {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}


export default function HutangPiutangPage() {
  const [data, setData] = useState<HutangPiutang[]>([]); // Data dari API
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  // Filter status menggunakan display value
  const [filterStatus, setFilterStatus] = useState("Semua"); 
  const [showForm, setShowForm] = useState(false);
  
  // State form
  const [formNama, setFormNama] = useState("");
  const [formJenisPihak, setFormJenisPihak] = useState("Pelanggan"); // Kolom lokal di frontend
  const [formTipe, setFormTipe] = useState<'Hutang' | 'Piutang'>("Hutang");
  const [formStatus, setFormStatus] = useState<"Belum Lunas" | "Dicicil" | "Lunas">("Belum Lunas"); 
  const [formJumlah, setFormJumlah] = useState(""); 
  const [formJatuhTempo, setFormJatuhTempo] = useState("");
  
  // State untuk notifikasi (mengganti alert/confirm)
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);


  // --- FUNGSI UTAMA: FETCH DATA (GET) ---
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/hutang-piutang');
      
      if (!response.ok) {
        if (response.status === 401) {
            setError("Sesi kedaluwarsa. Silakan login kembali.");
        } else {
            const errorData = await response.json();
            setError(errorData.error || "Gagal mengambil data hutang-piutang.");
        }
        setData([]);
        return;
      }
      
      const result: HutangPiutang[] = await response.json();
      
      // Tambahkan kolom jenis_pihak secara lokal
      const processedData = result.map(item => ({
        ...item,
        // Ini hanya contoh, karena jenis_pihak tidak ada di DB, kita buat placeholder
        jenis_pihak: item.nama_pihak.includes("Pemasok") ? "Pemasok" : "Pelanggan" 
      }));

      setData(processedData);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError("Gagal terhubung ke server.");
      setData([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);


  // --- FUNGSI SIMPAN DATA (POST) ---
  const handleSimpan = async () => {
    // 1. Validasi
    const numericAmount = parseInt(formJumlah.replace(/[^\d]/g, ""), 10) || 0;
    if (!formNama.trim() || numericAmount <= 0 || !formJatuhTempo) {
      setNotification({message: "Lengkapi Nama, Jumlah (>0), dan Jatuh Tempo.", type: 'error'});
      return;
    }

    // 2. Persiapan Data untuk API 
    const payload = {
      nama_pihak: formNama.trim(),
      jenis_hutang_piutang: convertToDatabase(formTipe), // 'Hutang' -> 'hutang'
      jumlah: numericAmount,
      jatuh_tempo: formJatuhTempo, // YYYY-MM-DD
      status_pembayaran: statusToDatabase(formStatus), // 'Belum Lunas' -> 'belum_lunas'
    };

    try {
      // 3. Panggil API POST
      const response = await fetch('/api/hutang-piutang', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setNotification({message: errorData.error || "Gagal menyimpan data.", type: 'error'});
        return;
      }

      // 4. Sukses: Refresh data dan reset form
      setNotification({message: "Data berhasil ditambahkan!", type: 'success'});
      fetchData(); 
      
      // Reset form + tutup
      setFormNama("");
      setFormJenisPihak("Pelanggan");
      setFormTipe("Hutang");
      setFormStatus("Belum Lunas");
      setFormJumlah("");
      setFormJatuhTempo("");
      setShowForm(false);

    } catch (err) {
      setNotification({message: "Gagal terhubung ke server saat menyimpan.", type: 'error'});
    }
  };


  // --- FUNGSI HAPUS DATA (DELETE) ---
  const handleHapus = async (id: string, nama: string) => {
    // Mengganti confirm() dengan window.confirm()
    if (!window.confirm(`Yakin ingin menghapus data ${nama}? Tindakan ini tidak dapat dibatalkan.`)) return;
    
    try {
      const response = await fetch(`/api/hutang-piutang/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setNotification({message: errorData.error || "Gagal menghapus data.", type: 'error'});
        return;
      }

      // Sukses: Refresh data
      setNotification({message: "Data berhasil dihapus.", type: 'success'});
      fetchData();

    } catch (err) {
      setNotification({message: "Gagal terhubung ke server saat menghapus.", type: 'error'});
    }
  };
  

  // --- LOGIC SEARCH & FILTER ---
  const filtered = data.filter((r) => {
    const displayStatus = statusToDisplay(r.status_pembayaran);

    // Filter berdasarkan status
    const matchesStatus = filterStatus === "Semua" ? true : displayStatus === filterStatus;
    
    // Filter berdasarkan search query
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      r.nama_pihak.toLowerCase().includes(q) ||
      r.jumlah.toString().includes(q) ||
      r.jatuh_tempo.includes(q) ||
      (r.jenis_pihak?.toLowerCase() || "").includes(q); 

    return matchesStatus && matchesSearch;
  });

  // style helper for label types (sesuai screenshot)
  function labelClassForTipe(tipe: 'hutang' | 'piutang') {
    return tipe === "hutang"
      ? "bg-red-100 text-red-600" // Hutang (Merah)
      : "bg-green-100 text-green-600"; // Piutang (Hijau)
  }
  
  function labelClassForStatus(status: string) {
    switch (status) {
        case 'belum_lunas':
            return "bg-red-50 text-red-700";
        case 'dicicil':
            return "bg-yellow-50 text-yellow-700";
        case 'lunas':
            return "bg-green-50 text-green-700";
        default:
            return "bg-gray-50 text-gray-700";
    }
  }


  // Search input style
  const searchInputClass = "ml-3 bg-transparent outline-none text-sm text-gray-700 w-full";


  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      {/* Asumsi komponen Sidebar sudah diimport dan berfungsi dengan baik */}
      <Sidebar />

      {/* Main Content */}
      <main className="flex-1 px-10 py-8">
        <h1 className="text-2xl font-bold mb-6">Hutang-Piutang</h1>
        
        {/* Notifikasi */}
        {notification && (
            <div 
                className={`p-3 mb-4 rounded-lg shadow-md flex justify-between items-center ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}
                role="alert"
            >
                <p>{notification.message}</p>
                <button onClick={() => setNotification(null)} className="font-bold text-lg leading-none">&times;</button>
            </div>
        )}

        {/* Search + Filter + Tambah (kanan atas) */}
        <div className="flex justify-end items-center gap-3 mb-4">

          {/* Search */}
          <div className="flex items-center border border-[#BCFF75] bg-white rounded-full px-4 py-2 w-72 shadow-sm">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Ketikkan pencarian"
              className={searchInputClass}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Filter status*/}
          <div className="flex items-center border border-gray-300 px-4 py-2 bg-white text-sm shadow-sm">
            <FunnelIcon className="h-5 w-5 text-gray-500 mr-2" />
            <select
              className="bg-transparent outline-none text-sm"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="Semua">Semua</option>
              <option value="Belum Lunas">Belum Lunas</option>
              <option value="Dicicil">Dicicil</option>
              <option value="Lunas">Lunas</option>
            </select>
          </div>

          {/* Tombol Tambah*/}
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-[#EEFFDC] hover:bg-[#d6eabf] text-black px-4 py-2 border border-[#BCFF75] font-medium transition-colors duration-150 shadow-sm"
          >
            <PlusCircleIcon className="h-5 w-5 text-[#7CB342]" />
            Tambah
          </button>
        </div>

        {/* Loading / Error State */}
        {isLoading ? (
            <div className="text-center p-8 text-gray-500">Memuat data...</div>
        ) : error ? (
            <div className="text-center p-8 text-red-600 border border-red-300 bg-red-50 rounded-xl shadow-lg">{error}</div>
        ) : (
            // Table
            <div className="w-full border-collapse text-sm bg-white shadow rounded text center">
              <table className="w-full border-collapse text-sm">
                <thead className="bg-[#BCFF75] text-black font-semibold">
                  <tr>
                    <th className="p-3 w-10 border-b border-r">No</th>
                    <th className="p-3 text-left border-b border-r">Nama Pihak</th>
                    <th className="p-3 border-b border-r">Jenis Pihak</th>
                    <th className="p-3 border-b border-r">Hutang-Piutang</th>
                    <th className="p-3 border-b border-r">Status Pembayaran</th>
                    <th className="p-3 text-right border-b border-r">Jumlah</th>
                    <th className="p-3 border-b border-r">Jatuh Tempo</th>
                    <th className="p-3 w-20 border-b">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((row, index) => (
                    <tr key={row.id_hutang_piutang} className="hover:bg-gray-50 text-center">
                      <td className="border-r p-3 text-center align-middle">{index + 1}</td>
                      <td className="border-r p-3 align-middle text-left">{row.nama_pihak}</td>
                      {/* Kolom Jenis Pihak (menggunakan data lokal/placeholder) */}
                      <td className="border-r p-3 text-center align-middle">
                        <span className="inline-block px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                          {row.jenis_pihak || 'N/A'}
                        </span>
                      </td>
                      {/* Kolom Hutang-Piutang (menggunakan labelClassForTipe) */}
                      <td className="border-r p-3 text-center align-middle">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${labelClassForTipe(row.jenis_hutang_piutang)}`}>
                          {convertToDisplay(row.jenis_hutang_piutang)}
                        </span>
                      </td>
                      {/* Kolom Status Pembayaran (menggunakan labelClassForStatus) */}
                      <td className="border-r p-3 text-center align-middle">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${labelClassForStatus(row.status_pembayaran)}`}>
                          {statusToDisplay(row.status_pembayaran)}
                        </span>
                      </td>
                      {/* Kolom Jumlah dengan format rupiah*/}
                      <td className="border-r p-3 text-right align-middle text-gray-700">{formatRupiahFromNumber(row.jumlah)}</td> 
                      {/* Kolom Jatuh Tempo */}
                      <td className="border-r p-3 text-center align-middle text-gray-600">{row.jatuh_tempo.substring(0, 10)}</td>
                      {/* Kolom Aksi */}
                      <td className="p-3 text-center align-middle flex items-center justify-center gap-2">
                        <button className="text-green-600 hover:text-green-800 p-1" title="Edit">
                          <PencilIcon className="h-5 w-5" />
                        </button>
                        <button 
                            className="text-red-500 hover:text-red-700 p-1" 
                            title="Hapus" 
                            onClick={() => handleHapus(row.id_hutang_piutang, row.nama_pihak)}
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && !isLoading && (
                    <tr>
                      <td className="p-8 text-center text-gray-500" colSpan={8}>Tidak ada data Hutang atau Piutang yang ditemukan.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}
      </main>

      {/* Modal: Tambah (Sesuai screenshot) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-down">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">Tambah Hutang / Piutang</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSimpan(); }}>
                
              {/* Nama Pihak */}
              <label className="block text-sm font-medium mb-1">Nama Pihak</label>
              <input value={formNama} onChange={(e) => setFormNama(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-3 focus:ring-lime-500 focus:border-lime-500" placeholder="Nama pihak" required />

              {/* Jenis Pihak */}
              <label className="block text-sm font-medium mb-1">Jenis Pihak</label>
              <select value={formJenisPihak} onChange={(e) => setFormJenisPihak(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-3 focus:ring-lime-500 focus:border-lime-500">
                <option>Pelanggan</option>
                <option>Pemasok</option>
              </select>

              {/* Tipe (Hutang/Piutang) */}
              <label className="block text-sm font-medium mb-1">Tipe</label>
              <div className="flex gap-6 items-center mb-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tipe" checked={formTipe === "Hutang"} onChange={() => setFormTipe("Hutang")} className="text-lime-500" />
                  <span>Hutang</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="tipe" checked={formTipe === "Piutang"} onChange={() => setFormTipe("Piutang")} className="text-lime-500" />
                  <span>Piutang</span>
                </label>
              </div>

              {/* Status Pembayaran */}
              <label className="block text-sm font-medium mb-1">Status Pembayaran</label>
              <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as "Belum Lunas" | "Dicicil" | "Lunas")} className="border rounded-lg w-full px-3 py-2 mb-3 focus:ring-lime-500 focus:border-lime-500">
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Dicicil">Dicicil</option>
                <option value="Lunas">Lunas</option>
              </select>

              {/* Jumlah */}
              <label className="block text-sm font-medium mb-1">Jumlah (Rp)</label>
              <div className="flex items-center border rounded-lg px-3 py-2 mb-3 focus-within:ring-1 focus-within:ring-lime-500">
                <span className="text-gray-600 mr-2">Rp</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={formJumlah}
                  onChange={(e) => setFormJumlah(formatInputToRupiah(e.target.value))}
                  placeholder="0"
                  className="w-full outline-none"
                  required
                />
              </div>

              {/* Jatuh Tempo */}
              <label className="block text-sm font-medium mb-1">Jatuh Tempo</label>
              <input type="date" value={formJatuhTempo} onChange={(e) => setFormJatuhTempo(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-4 focus:ring-lime-500 focus:border-lime-500" required />

              {/* Tombol Aksi */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Batal</button>
                <button type="submit" className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}