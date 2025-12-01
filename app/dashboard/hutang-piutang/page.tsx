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

// --- TIPE DATA ---
export type HutangPiutang = {
  id_hutang_piutang: string; 
  user_id: number;
  nama_pihak: string;
  jenis_hutang_piutang: 'hutang' | 'piutang'; 
  jumlah: number; 
  jatuh_tempo: string;
  status_pembayaran: 'belum_lunas' | 'lunas' | 'dicicil';
  jenis_pihak?: string; 
};

// --- HELPER FUNCTIONS (Di luar komponen supaya rapi) ---

function convertToDisplay(jenis: 'hutang' | 'piutang'): 'Hutang' | 'Piutang' {
    return jenis === 'hutang' ? 'Hutang' : 'Piutang';
}

function convertToDatabase(jenis: 'Hutang' | 'Piutang'): 'hutang' | 'piutang' {
    return jenis === 'Hutang' ? 'hutang' : 'piutang';
}

function statusToDisplay(status: string): string {
    return status.replace("_", " ").split(' ').map(s => s.charAt(0).toUpperCase() + s.substring(1)).join(' ');
}

function statusToDatabase(status: string): 'belum_lunas' | 'lunas' | 'dicicil' {
    return status.toLowerCase().replace(" ", "_") as 'belum_lunas' | 'lunas' | 'dicicil';
}

function formatRupiahFromNumber(n: number) {
    if (n === null || n === undefined) return '0';
    return n.toLocaleString('id-ID', {
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0,
    }).replace(/,/g, "."); 
}

function formatInputToRupiah(value: string) {
    const digits = value.replace(/[^\d]/g, "");
    if (!digits) return "";
    return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// --- KOMPONEN UTAMA ---
export default function HutangPiutangPage() {
  // State Data
  const [data, setData] = useState<HutangPiutang[]>([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State UI
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("Semua"); 
  const [showForm, setShowForm] = useState(false);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  // State Edit Mode
  const [editId, setEditId] = useState<string | null>(null);

  // State Form Input
  const [formNama, setFormNama] = useState("");
  const [formJenisPihak, setFormJenisPihak] = useState("Pelanggan");
  const [formTipe, setFormTipe] = useState<'Hutang' | 'Piutang'>("Hutang");
  const [formStatus, setFormStatus] = useState<"Belum Lunas" | "Dicicil" | "Lunas">("Belum Lunas"); 
  const [formJumlah, setFormJumlah] = useState(""); 
  const [formJatuhTempo, setFormJatuhTempo] = useState("");
  

  // --- 1. FETCH DATA (GET) ---
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
            setError(errorData.error || "Gagal mengambil data.");
        }
        setData([]);
        return;
      }
      
      const result: HutangPiutang[] = await response.json();
      
      // Tambah properti lokal 'jenis_pihak'
      const processedData = result.map(item => ({
        ...item,
        jenis_pihak: item.nama_pihak.toLowerCase().includes("pemasok") ? "Pemasok" : "Pelanggan" 
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


  // --- 2. RESET FORM ---
  const resetForm = () => {
    setEditId(null); 
    setFormNama("");
    setFormJenisPihak("Pelanggan");
    setFormTipe("Hutang");
    setFormStatus("Belum Lunas");
    setFormJumlah("");
    setFormJatuhTempo("");
    setShowForm(false);
  };

  // --- 3. BUKA FORM EDIT (YANG SUDAH DIPERBAIKI) ---
  const handleEditClick = (item: HutangPiutang) => {
    try {
        setEditId(item.id_hutang_piutang);
        
        // Isi form
        setFormNama(item.nama_pihak || ""); 
        setFormJenisPihak(item.jenis_pihak || "Pelanggan");
        setFormTipe(convertToDisplay(item.jenis_hutang_piutang));
        
        // Me astikan status sesuai pilihan di dropdown
        const statusClean = statusToDisplay(item.status_pembayaran);
        // Casting paksa string ke tipe union supaya TypeScript tidak marah
        setFormStatus(statusClean as "Belum Lunas" | "Dicicil" | "Lunas");
        
        setFormJumlah(formatInputToRupiah((item.jumlah || 0).toString()));
        
        // Handle Tanggal dengan Aman
        let safeDate = "";
        if (item.jatuh_tempo) {
            // Ambil 10 karakter pertama (YYYY-MM-DD)
            safeDate = String(item.jatuh_tempo).substring(0, 10);
        }
        setFormJatuhTempo(safeDate); 

        setShowForm(true);
    } catch (error) {
        console.error("Error saat klik edit:", error);
        alert("Gagal memuat data edit.");
    }
  };


  // --- 4. SIMPAN DATA (POST & PUT) ---
  const handleSimpan = async () => {
    // Validasi
    const numericAmount = parseInt(formJumlah.replace(/[^\d]/g, ""), 10) || 0;
    if (!formNama.trim() || numericAmount <= 0 || !formJatuhTempo) {
      setNotification({message: "Lengkapi Nama, Jumlah (>0), dan Jatuh Tempo.", type: 'error'});
      return;
    }

    const payload = {
      nama_pihak: formNama.trim(),
      jenis_hutang_piutang: convertToDatabase(formTipe),
      jumlah: numericAmount,
      jatuh_tempo: formJatuhTempo,
      status_pembayaran: statusToDatabase(formStatus),
    };

    try {
      let response;

      if (editId) {
         // UPDATE
         response = await fetch(`/api/hutang-piutang/${editId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
      } else {
         // BARU
         response = await fetch('/api/hutang-piutang', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
         });
      }

      if (!response.ok) {
        const errorData = await response.json();
        setNotification({message: errorData.error || "Gagal menyimpan data.", type: 'error'});
        return;
      }

      setNotification({
          message: editId ? "Data berhasil diperbarui!" : "Data berhasil ditambahkan!", 
          type: 'success'
      });
      
      fetchData(); 
      resetForm(); 

    } catch (err) {
      setNotification({message: "Gagal terhubung ke server.", type: 'error'});
    }
  };


  // --- 5. HAPUS DATA (DELETE) ---
  const handleHapus = async (id: string, nama: string) => {
    if (!window.confirm(`Yakin ingin menghapus data ${nama}?`)) return;
    
    try {
      const response = await fetch(`/api/hutang-piutang/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        setNotification({message: errorData.error || "Gagal menghapus data.", type: 'error'});
        return;
      }

      setNotification({message: "Data berhasil dihapus.", type: 'success'});
      fetchData();

    } catch (err) {
      setNotification({message: "Gagal terhubung ke server.", type: 'error'});
    }
  };
  

  // --- 6. LOGIC FILTER ---
  const filtered = data.filter((r) => {
    const displayStatus = statusToDisplay(r.status_pembayaran);
    const matchesStatus = filterStatus === "Semua" ? true : displayStatus === filterStatus;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      q === "" ||
      r.nama_pihak.toLowerCase().includes(q) ||
      r.jumlah.toString().includes(q) ||
      r.jatuh_tempo.includes(q) ||
      (r.jenis_pihak?.toLowerCase() || "").includes(q); 
    return matchesStatus && matchesSearch;
  });

  // Helper styles
  function labelClassForTipe(tipe: 'hutang' | 'piutang') {
    return tipe === "hutang"
      ? "bg-red-100 text-red-600"
      : "bg-green-100 text-green-600";
  }
  
  function labelClassForStatus(status: string) {
    switch (status) {
        case 'belum_lunas': return "bg-red-50 text-red-700";
        case 'dicicil': return "bg-yellow-50 text-yellow-700";
        case 'lunas': return "bg-green-50 text-green-700";
        default: return "bg-gray-50 text-gray-700";
    }
  }

  const searchInputClass = "ml-3 bg-transparent outline-none text-sm text-gray-700 w-full";

  // --- UI RENDER ---
  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 px-10 py-8">
        <h1 className="text-2xl font-bold mb-6">Hutang-Piutang</h1>
        
        {/* Notifikasi */}
        {notification && (
            <div 
                className={`p-3 mb-4 rounded-lg shadow-md flex justify-between items-center ${notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-300' : 'bg-red-100 text-red-800 border border-red-300'}`}
            >
                <p>{notification.message}</p>
                <button onClick={() => setNotification(null)} className="font-bold text-lg leading-none">&times;</button>
            </div>
        )}

        {/* Toolbar Atas */}
        <div className="flex justify-end items-center gap-3 mb-4">
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

          <button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="flex items-center gap-2 bg-[#EEFFDC] hover:bg-[#d6eabf] text-black px-4 py-2 border border-[#BCFF75] font-medium transition-colors duration-150 shadow-sm"
          >
            <PlusCircleIcon className="h-5 w-5 text-[#7CB342]" />
            Tambah
          </button>
        </div>

        {/* Tabel Data */}
        {isLoading ? (
            <div className="text-center p-8 text-gray-500">Memuat data...</div>
        ) : error ? (
            <div className="text-center p-8 text-red-600 border border-red-300 bg-red-50 rounded-xl shadow-lg">{error}</div>
        ) : (
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
                      <td className="border-r p-3 text-center align-middle">
                        <span className="inline-block px-2 py-1 rounded text-xs bg-slate-100 text-slate-700">
                          {row.jenis_pihak || 'N/A'}
                        </span>
                      </td>
                      <td className="border-r p-3 text-center align-middle">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-semibold ${labelClassForTipe(row.jenis_hutang_piutang)}`}>
                          {convertToDisplay(row.jenis_hutang_piutang)}
                        </span>
                      </td>
                      <td className="border-r p-3 text-center align-middle">
                        <span className={`inline-block px-3 py-1 rounded text-xs font-medium ${labelClassForStatus(row.status_pembayaran)}`}>
                          {statusToDisplay(row.status_pembayaran)}
                        </span>
                      </td>
                      <td className="border-r p-3 text-right align-middle text-gray-700">{formatRupiahFromNumber(row.jumlah)}</td> 
                      <td className="border-r p-3 text-center align-middle text-gray-600">
                         {/* Safe rendering date */}
                         {row.jatuh_tempo ? String(row.jatuh_tempo).substring(0, 10) : '-'}
                      </td>
                      
                      <td className="p-3 text-center align-middle flex items-center justify-center gap-2">
                        <button 
                            className="text-green-600 hover:text-green-800 p-1" 
                            title="Edit"
                            onClick={() => handleEditClick(row)}
                        >
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
                      <td className="p-8 text-center text-gray-500" colSpan={8}>Tidak ada data.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
        )}
      </main>

      {/* Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg p-6 animate-fade-in-down">
            <h3 className="text-lg font-semibold text-center mb-4 text-gray-800">
                {editId ? "Edit Hutang / Piutang" : "Tambah Hutang / Piutang"}
            </h3>

            <form onSubmit={(e) => { e.preventDefault(); handleSimpan(); }}>
              <label className="block text-sm font-medium mb-1">Nama Pihak</label>
              <input value={formNama} onChange={(e) => setFormNama(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-3 focus:ring-lime-500 focus:border-lime-500" placeholder="Nama pihak" required />

              <label className="block text-sm font-medium mb-1">Jenis Pihak</label>
              <select value={formJenisPihak} onChange={(e) => setFormJenisPihak(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-3 focus:ring-lime-500 focus:border-lime-500">
                <option>Pelanggan</option>
                <option>Pemasok</option>
              </select>

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

              <label className="block text-sm font-medium mb-1">Status Pembayaran</label>
              <select value={formStatus} onChange={(e) => setFormStatus(e.target.value as "Belum Lunas" | "Dicicil" | "Lunas")} className="border rounded-lg w-full px-3 py-2 mb-3 focus:ring-lime-500 focus:border-lime-500">
                <option value="Belum Lunas">Belum Lunas</option>
                <option value="Dicicil">Dicicil</option>
                <option value="Lunas">Lunas</option>
              </select>

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

              <label className="block text-sm font-medium mb-1">Jatuh Tempo</label>
              <input type="date" value={formJatuhTempo} onChange={(e) => setFormJatuhTempo(e.target.value)} className="border rounded-lg w-full px-3 py-2 mb-4 focus:ring-lime-500 focus:border-lime-500" required />

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <button type="button" onClick={resetForm} className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100">Batal</button>
                <button type="submit" className="px-4 py-2 bg-lime-500 text-white rounded-lg hover:bg-lime-600">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}