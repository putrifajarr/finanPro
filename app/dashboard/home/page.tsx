"use client";

import { useState, useRef, useEffect } from "react";
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
import { id } from "date-fns/locale";

import 'react-date-range/dist/styles.css'; 
import 'react-date-range/dist/theme/default.css';

export default function LaporanLabaRugiPage() {
  const [showExport, setShowExport] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  
  const [apiData, setApiData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [range, setRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(),
      key: "selection",
    },
  ]);

  const reportRef = useRef<HTMLDivElement>(null);

  const formatRupiah = (angka: number | string): string => {
    const num = Number(angka) || 0;
    const sign = num < 0 ? "-" : "";
    const abs = Math.abs(num);
    return sign + "Rp" + abs.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const start = format(range[0].startDate, "yyyy-MM-dd");
      const end = format(range[0].endDate, "yyyy-MM-dd");
      
      const res = await fetch(`/api/laporan-laba?startDate=${start}&endDate=${end}`);
      if (!res.ok) throw new Error("Gagal mengambil data dari server");
      
      const data = await res.json();
      setApiData(data);
    } catch (error) {
      console.error(error);
      setErrorMsg("Gagal memuat data. Cek koneksi atau coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  const s = apiData?.summary;
  const t = apiData?.totals;
  const chartData = apiData?.chartData || [];

  const laporanRows = [
    { type: "header", label: "Pendapatan dan HPP" },
    { no: "1", keterangan: "Penjualan bersih", jumlah: s?.penjualan || 0 },
    { no: "", keterangan: "Harga pokok penjualan (Pembelian)", jumlah: (s?.pembelian || 0) * -1 },
    { no: "", keterangan: "Laba kotor", jumlah: t?.labaKotor || 0, bold: true },

    { type: "header", label: "Beban Operasional" },
    { no: "2", keterangan: "Total Beban Operasional", jumlah: (s?.operasional || 0) * -1 },
    { no: "", keterangan: "Laba operasional", jumlah: t?.labaOperasional || 0, bold: true },

    { type: "header", label: "Pajak Penghasilan" },
    { no: "4", keterangan: "Pajak penghasilan", jumlah: (s?.pajak || 0) * -1 },
    { no: "", keterangan: "Laba bersih", jumlah: t?.labaBersih || 0, bold: true },
  ];

  // ====== EXPORT PDF ======
  const handleExportPDF = async () => {
    if (!reportRef.current) return;
    
    try {
        // 1. Screenshot area ref (Tabel & Grafik)
        // Opsi backgroundColor: '#ffffff' PENTING agar tidak hitam/transparan
        const canvas = await html2canvas(reportRef.current, {
            scale: 2, 
            backgroundColor: "#ffffff" 
        });
        const imgData = canvas.toDataURL("image/png");

        // 2. Siapkan PDF
        const pdf = new jsPDF("landscape", "pt", "a4");
        const pageWidth = pdf.internal.pageSize.getWidth();
        const margin = 40;

        // 3. Tambahkan Judul & Tanggal Manual di PDF
        // (Ini mengatasi masalah judul yang 'terpisah' di tampilan web)
        pdf.setFontSize(18);
        pdf.setFont("helvetica", "bold");
        pdf.text("Laporan Laba Rugi", margin, 50);

        pdf.setFontSize(12);
        pdf.setFont("helvetica", "normal");
        const dateStr = `${format(range[0].startDate, "dd MMMM yyyy", { locale: id })} - ${format(range[0].endDate, "dd MMMM yyyy", { locale: id })}`;
        pdf.text(`Periode: ${dateStr}`, margin, 70);

        // 4. Hitung ukuran gambar agar pas
        const imgProps = pdf.getImageProperties(imgData);
        const pdfImgWidth = pageWidth - (margin * 2);
        const pdfImgHeight = (imgProps.height * pdfImgWidth) / imgProps.width;

        // 5. Tempel gambar di bawah teks judul (y: 90)
        pdf.addImage(imgData, "PNG", margin, 90, pdfImgWidth, pdfImgHeight);
        pdf.save("laporan-laba-rugi.pdf");
        setShowExport(false);

    } catch (err) {
        console.error("Gagal export PDF", err);
        alert("Gagal membuat PDF");
    }
  };

  // ====== EXPORT EXCEL ======
  const handleExportExcel = () => {
    const wsData = [
      ["Laporan Laba Rugi"],
      [`Periode: ${format(range[0].startDate, "dd MMM yyyy")} - ${format(range[0].endDate, "dd MMM yyyy")}`],
      [""],
      ["No", "Keterangan", "Jumlah (Rp)"],
      ...laporanRows.filter((r) => !r.type).map((r) => [r.no, r.keterangan, r.jumlah]),
    ];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Laporan Laba Rugi");
    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    saveAs(new Blob([wbout], { type: "application/octet-stream" }), "laporan-laba-rugi.xlsx");
    setShowExport(false);
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">
            Laporan Laba-Rugi 
            {loading && <span className="text-sm font-normal text-gray-500 ml-2">(Memuat...)</span>}
        </h1>

        {/* Notifikasi Error jika Data Gagal Dimuat */}
        {errorMsg && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {errorMsg}
            </div>
        )}

        <div className="flex items-center gap-3 mb-6 relative">
          <div onClick={() => setShowDatePicker(!showDatePicker)} className="cursor-pointer text-sm px-3 py-2 bg-white border rounded-md hover:bg-gray-50">
            {format(range[0].startDate, "dd MMM yyyy")} - {format(range[0].endDate, "dd MMM yyyy")}
          </div>

          {showDatePicker && (
            <div className="absolute z-30 top-12 bg-white shadow p-2 rounded">
              <DateRange
                ranges={range}
                onChange={(item) => setRange([{ startDate: item.selection.startDate!, endDate: item.selection.endDate!, key: "selection" }])}
              />
            </div>
          )}

          <div className="relative">
            <button onClick={() => setShowExport(!showExport)} className="px-3 py-2 border rounded-md bg-white hover:bg-gray-50">
              Export as ▾
            </button>
            {showExport && (
              <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow z-20">
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={handleExportPDF}>PDF</button>
                <button className="w-full text-left px-3 py-2 hover:bg-gray-100" onClick={handleExportExcel}>Excel</button>
              </div>
            )}
          </div>
        </div>

        {/* WRAPPER REF: Hanya membungkus area Tabel & Grafik (Tanpa Judul H1) */}
        <div ref={reportRef} className="flex gap-6">
          {/* Tabel */}
          <div className="w-2/3 bg-white p-4 rounded shadow-sm">
            <table className="w-full text-sm border-collapse">
              <tbody>
                {laporanRows.map((row, idx) =>
                  row.type === "header" ? (
                    <tr key={idx} className="bg-[#D8F8C2] font-semibold">
                      <td colSpan={3} className="px-3 py-2 border">{row.label}</td>
                    </tr>
                  ) : (
                    <tr key={idx}>
                      <td className="border px-3 py-2 w-10">{row.no}</td>
                      <td className="border px-3 py-2">{row.keterangan}</td>
                      <td className={`border px-3 py-2 text-right ${row.bold ? "font-bold" : ""} ${(row.jumlah ?? 0) < 0 ? "text-red-500" : "text-black"}`}>
                        {formatRupiah(row.jumlah ?? 0)}
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Grafik */}
          <div className="w-1/3 bg-white p-4 rounded shadow-sm">
            <h3 className="text-sm text-gray-600 mb-4">Grafik Laba Bersih</h3>
            {chartData.length > 0 ? (
                <div style={{ width: "100%", height: 240 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
                    <XAxis dataKey="date" tick={{fontSize:10}} />
                    <YAxis hide />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#7CD34A" strokeWidth={3} dot={false} />
                    </LineChart>
                </ResponsiveContainer>
                </div>
            ) : (
                <div className="h-40 flex items-center justify-center text-gray-400 text-xs">Belum ada data</div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}