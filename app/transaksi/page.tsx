"use client";

import { useState } from "react";

interface Transaksi {
  id: number;
  tanggal: string;
  user: string;
  produk: string;
  pihak: string;
  deskripsi: string;
  tipe: "Pemasukan" | "Pengeluaran";
  jumlah: number;
}

export default function TransaksiPage() {
  const [transaksi, setTransaksi] = useState<Transaksi[]>([]);

  // 🧾 State untuk setiap input
  const [user, setUser] = useState("");
  const [produk, setProduk] = useState("");
  const [pihak, setPihak] = useState("");
  const [deskripsi, setDeskripsi] = useState("");
  const [jumlah, setJumlah] = useState<number | "">("");
  const [tipe, setTipe] = useState<"Pemasukan" | "Pengeluaran">("Pemasukan");

  // 💰 Hitung saldo otomatis
  const saldo = transaksi.reduce(
    (acc, t) => (t.tipe === "Pemasukan" ? acc + t.jumlah : acc - t.jumlah),
    0
  );

  // ➕ Tambah transaksi baru
  const tambahTransaksi = () => {
    if (!user || !produk || !pihak || !jumlah || !deskripsi) {
      alert("Lengkapi semua data terlebih dahulu!");
      return;
    }

    const now = new Date().toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    const dataBaru: Transaksi = {
      id: Date.now(),
      tanggal: now,
      user,
      produk,
      pihak,
      deskripsi,
      tipe,
      jumlah: Number(jumlah),
    };

    setTransaksi([...transaksi, dataBaru]);

    // reset input
    setUser("");
    setProduk("");
    setPihak("");
    setDeskripsi("");
    setJumlah("");
    setTipe("Pemasukan");
  };

  const hapusTransaksi = (id: number) => {
    setTransaksi(transaksi.filter((t) => t.id !== id));
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold flex items-center gap-2 mb-2">
        FinanPro — Transaksi
      </h1>
      <p className="text-gray-600 mb-6">
        Kelola transaksi dan lihat riwayat pengeluaran serta pemasukan.
      </p>

      {/* FORM INPUT */}
      <div className="bg-white shadow-md rounded-2xl p-6 mb-8">
        <h2 className="text-xl font-semibold mb-4">Form Input Transaksi</h2>

        <div className="flex flex-col sm:grid sm:grid-cols-2 gap-4 mb-4">
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            placeholder="Nama user"
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          <input
            type="text"
            value={produk}
            onChange={(e) => setProduk(e.target.value)}
            placeholder="Nama produk"
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          <input
            type="text"
            value={pihak}
            onChange={(e) => setPihak(e.target.value)}
            placeholder="Pihak terkait"
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          <input
            type="number"
            value={jumlah}
            onChange={(e) =>
              setJumlah(e.target.value === "" ? "" : Number(e.target.value))
            }
            placeholder="Jumlah (Rp)"
            className="border border-gray-300 rounded-lg p-2 w-full"
          />
          <select
            value={tipe}
            onChange={(e) => setTipe(e.target.value as any)}
            className="border border-gray-300 rounded-lg p-2 w-full"
          >
            <option value="Pemasukan">Pemasukan</option>
            <option value="Pengeluaran">Pengeluaran</option>
          </select>
          <input
            type="text"
            value={deskripsi}
            onChange={(e) => setDeskripsi(e.target.value)}
            placeholder="Deskripsi transaksi"
            className="border border-gray-300 rounded-lg p-2 w-full sm:col-span-2"
          />
        </div>

        <div className="flex gap-3 mb-4">
          <button
            onClick={tambahTransaksi}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Simpan
          </button>
          <button
            onClick={() => {
              setUser("");
              setProduk("");
              setPihak("");
              setDeskripsi("");
              setJumlah("");
              setTipe("Pemasukan");
            }}
            className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg hover:bg-gray-400"
          >
            Reset
          </button>
        </div>

        <p className="font-semibold text-gray-700">
          Saldo Saat Ini:{" "}
          <span
            className={`${
              saldo < 0 ? "text-red-600" : "text-green-600"
            } font-bold`}
          >
            {saldo.toLocaleString("id-ID", {
              style: "currency",
              currency: "IDR",
            })}
          </span>
        </p>
      </div>

      {/* RIWAYAT TRANSAKSI */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Riwayat Transaksi</h2>

        {transaksi.length === 0 ? (
          <p className="text-gray-500 italic">Belum ada transaksi.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border border-gray-200 rounded-lg overflow-hidden bg-white shadow-md">
              <thead className="bg-gray-100 text-gray-800">
                <tr>
                  <th className="text-left px-4 py-2">Tanggal</th>
                  <th className="text-left px-4 py-2">User</th>
                  <th className="text-left px-4 py-2">Produk</th>
                  <th className="text-left px-4 py-2">Pihak</th>
                  <th className="text-left px-4 py-2">Deskripsi</th>
                  <th className="text-left px-4 py-2">Tipe</th>
                  <th className="text-left px-4 py-2">Jumlah</th>
                  <th className="text-left px-4 py-2">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {transaksi.map((t) => (
                  <tr
                    key={t.id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">{t.tanggal}</td>
                    <td className="px-4 py-2">{t.user}</td>
                    <td className="px-4 py-2">{t.produk}</td>
                    <td className="px-4 py-2">{t.pihak}</td>
                    <td className="px-4 py-2">{t.deskripsi}</td>
                    <td className="px-4 py-2">{t.tipe}</td>
                    <td
                      className={`px-4 py-2 font-semibold ${
                        t.tipe === "Pengeluaran"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {t.jumlah.toLocaleString("id-ID", {
                        style: "currency",
                        currency: "IDR",
                      })}
                    </td>
                    <td className="px-4 py-2">
                      <button
                        onClick={() => hapusTransaksi(t.id)}
                        className="bg-red-600 text-white px-3 py-1 rounded-lg hover:bg-red-700 flex items-center gap-1"
                      >
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
