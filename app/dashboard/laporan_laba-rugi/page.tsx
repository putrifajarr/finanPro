"use client";

import { useState, useRef, useEffect } from "react"; // Tambahkan useEffect
import Sidebar from "@/components/Sidebar";
import { DateRange } from "react-date-range";
import {
  LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

export default function LaporanLabaRugiPage() {
  const [showExport, setShowExport] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  // STATE BARU: Untuk menyimpan data dari Database
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const reportRef = useRef(null);

  const formatRupiah = (angka: number | string): string => {
    const num = Number(angka) || 0;
    const sign = num < 0 ? "-" : "";
    const abs = Math.abs(num);
    return sign + "Rp" + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // ====== FETCH DATA DARI API ======
  const fetchData = async () => {
    setLoading(true);
    try {
      // Format tanggal agar sesuai input API (yyyy-mm-dd)
      const start = format(range[0].startDate, "yyyy-MM-dd");
      const end = format(range[0].endDate, "yyyy-MM-dd");
      
      const res = await fetch(`/api/laporan-laba?startDate=${start}&endDate=${end}`);
      if (!res.ok) throw new Error("Gagal ambil data");
      
      const data = await res.json();
      setApiData(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Panggil fetch setiap kali tanggal (range) berubah
  useEffect(() => {
    fetchData();
  }, [range]);


  // ====== SIAPKAN DATA UNTUK TABEL ======
  // Gunakan optional chaining (?.) agar tidak error saat data belum dimuat
  const s = apiData?.summary;
  const t = apiData?.totals;

  // Kita mapping hasil API ke struktur Tabel Anda
  const laporanRows = [
    { type: "header", label: "Pendapatan dan HPP" },
    { 
        no: "1", 
        keterangan: "Penjualan bersih", 
        jumlah: s?.penjualan || 0 
    },
    { 
        no: "", 
        keterangan: "Harga pokok penjualan (Pembelian)", 
        // Dikali -1 agar tampil merah/negatif
        jumlah: (s?.pembelian || 0) * -1 
    },
    { 
        no: "", 
        keterangan: "Laba kotor", 
        jumlah: t?.labaKotor || 0, 
        bold: true 
    },

    { type: "header", label: "Beban Operasional" },
    // Karena di DB Anda hanya ada 1 kategori "Operasional", kita gabung di sini
    { 
        no: "2", 
        keterangan: "Total Beban Operasional", 
        jumlah: (s?.operasional || 0) * -1 
    },
    { 
        no: "", 
        keterangan: "Laba operasional", 
        jumlah: t?.labaOperasional || 0, 
        bold: true 
    },

    // Note: Kategori "Pendapatan Lainnya" belum ada di Enum Schema Anda,
    // Jadi sementara saya hide atau set 0 agar tidak error.
    { type: "header", label: "Pendapatan & Beban Lainnya" },
    { no: "3", keterangan: "Pendapatan/Beban Lain", jumlah: 0 },
    { no: "", keterangan: "Total Lainnya", jumlah: 0, bold: true },
    { 
        no: "", 
        keterangan: "Laba sebelum pajak", 
        jumlah: t?.labaOperasional || 0, // Sama dgn operasional krn yg lain 0
        bold: true 
    },

    { type: "header", label: "Pajak Penghasilan" },
    { 
        no: "4", 
        keterangan: "Pajak penghasilan", 
        jumlah: (s?.pajak || 0) * -1 
    },
    { 
        no: "", 
        keterangan: "Laba bersih", 
        jumlah: t?.labaBersih || 0, 
        bold: true 
    },
  ];

  // ====== Data Grafik Dummy (Bisa diabaikan dulu) ======
  const chartData = [
    { month: "Jan", value: 45 },
    { month: "Feb", value: 50 },
    // ... dst (Nanti ini juga bisa dibuat dinamis kalau mau)
  ];

  // ... (SISA KODE EXPORT EXCEL/PDF BIARKAN SAMA SEPERTI SEBELUMNYA) ...
  const handleExportExcel = () => {
    const wsData = [
      ["No", "Keterangan", "Jumlah (Rp)"],
      ...laporanRows
        .filter((r) => !r.type)
        .map((r) => [r.no, r.keterangan, r.jumlah]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Laba Rugi");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(
      new Blob([wbout], { type: "application/octet-stream" }),
      "laporan-laba-rugi.xlsx"
    );
  };

  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    const canvas = await html2canvas(reportRef.current, { scale: 2 });
    const pdf = new jsPDF("landscape", "pt", "a4");
    const imgData = canvas.toDataURL("image/png");
    const width = pdf.internal.pageSize.getWidth();
    const height = (canvas.height * width) / canvas.width;
    pdf.addImage(imgData, "PNG", 0, 0, width, height);
    pdf.save("laporan-laba-rugi.pdf");
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">
            Laporan Laba-Rugi 
            {loading && <span className="text-sm font-normal text-gray-500 ml-2">(Memuat data...)</span>}
        </h1>

        {/* Filter dan Export */}
        <div className="flex items-center gap-3 mb-6 relative">
          <div
            onClick={() => setShowDatePicker(!showDatePicker)}
            className="cursor-pointer text-sm px-3 py-2 bg-white border rounded-md hover:bg-gray-50"
          >
            {format(range[0].startDate, "dd MMM yyyy")} -{" "}
            {format(range[0].endDate, "dd MMM yyyy")}
          </div>

          {showDatePicker && (
            <div className="absolute z-30 top-12 bg-white shadow p-2 rounded">
              <DateRange
                ranges={range}
                onChange={(item) =>
                  setRange([
                    {
                      startDate: item.selection.startDate ?? new Date(),
                      endDate: item.selection.endDate ?? new Date(),
                      key: item.selection.key ?? "selection",
                    },
                  ])
                }
              />
            </div>
          )}

          <div className="relative">
            <button
              onClick={() => setShowExport(!showExport)}
              className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50"
            >
              Export as ▾
            </button>

            {showExport && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-20">
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={handleExportPDF}
                >
                  PDF
                </button>
                <button
                  className="w-full text-left px-3 py-2 hover:bg-gray-100"
                  onClick={handleExportExcel}
                >
                  Excel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Konten Utama */}
        <div ref={reportRef} className="flex gap-6">
          {/* ===== Tabel ===== */}
          <div className="w-2/3 bg-white p-4 rounded shadow-sm">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {laporanRows.map((row, idx) =>
                  row.type === "header" ? (
                    <tr key={idx} className="bg-[#D8F8C2] font-semibold">
                      <td colSpan={3} className="px-3 py-2 border">
                        {row.label}
                      </td>
                    </tr>
                  ) : (
                    <tr key={idx}>
                      <td className="border px-3 py-2 w-10">{row.no}</td>
                      <td className="border px-3 py-2">{row.keterangan}</td>
                      <td
                        className={`border px-3 py-2 text-right ${
                          row.bold ? "font-bold" : ""
                        } ${(row.jumlah ?? 0) < 0 ? "text-red-500" : "text-black"}`}
                      >
                        {formatRupiah(row.jumlah ?? 0)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* ===== Grafik ===== */}
          <div className="w-1/3 bg-white p-4 rounded shadow-sm">
            <h3 className="text-sm text-gray-600 mb-4">
              Grafik Laba Bersih
            </h3>
            <div style={{ width: "100%", height: 240 }}>
              <ResponsiveContainer>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#7CD34A"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}