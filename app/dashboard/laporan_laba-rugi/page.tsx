"use client";

import { useState, useRef } from "react";
import Sidebar from "@/components/Sidebar";
import { DateRange } from "react-date-range";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { format } from "date-fns";

export default function LaporanLabaRugiPage() {
  const [showExport, setShowExport] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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

  // ====== Data Laporan ======
  const laporanRows = [
    { type: "header", label: "Pendapatan dan HPP" },
    { no: "1", keterangan: "Penjualan bersih", jumlah: 500000000 },
    { no: "", keterangan: "Harga pokok penjualan", jumlah: -300000000 },
    { no: "", keterangan: "Laba kotor", jumlah: 200000000, bold: true },

    { type: "header", label: "Beban Operasional" },
    { no: "2", keterangan: "Beban penjualan & pemasaran", jumlah: -40000000 },
    { no: "", keterangan: "Beban administrasi & umum", jumlah: -30000000 },
    { no: "", keterangan: "Total beban operasional", jumlah: -70000000, bold: true },
    { no: "", keterangan: "Laba operasional", jumlah: 130000000, bold: true },

    { type: "header", label: "Pendapatan & Beban Lainnya" },
    { no: "3", keterangan: "Pendapatan bunga", jumlah: 50000000 },
    { no: "", keterangan: "Beban bunga", jumlah: -10000000 },
    { no: "", keterangan: "Keuntungan penjualan aset", jumlah: 3000000 },
    { no: "", keterangan: "Total pendapatan & beban lainnya", jumlah: 2000000, bold: true },
    { no: "", keterangan: "Laba sebelum pajak", jumlah: 128000000, bold: true },

    { type: "header", label: "Pajak Penghasilan" },
    { no: "4", keterangan: "Pajak penghasilan", jumlah: -28000000 },
    { no: "", keterangan: "Laba bersih", jumlah: 100000000, bold: true },
  ];

  // ====== Data Grafik ======
  const chartData = [
    { month: "Jan", value: 45 },
    { month: "Feb", value: 50 },
    { month: "Mar", value: 55 },
    { month: "Apr", value: 60 },
    { month: "May", value: 70 },
    { month: "Jun", value: 75 },
    { month: "Jul", value: 80 },
    { month: "Aug", value: 85 },
    { month: "Sep", value: 90 },
    { month: "Oct", value: 95 },
    { month: "Nov", value: 100 },
    { month: "Dec", value: 110 },
  ];

  // ====== Export Excel ======
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

  // ====== Export PDF ======
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

  // ====== Tampilan Halaman ======
  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <Sidebar />

      {/* Main */}
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Laporan Laba-Rugi</h1>

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
              Grafik Laba Bersih 2025
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
