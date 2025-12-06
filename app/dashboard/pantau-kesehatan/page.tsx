"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import CardStat from "@/components/CardStat";
import ChartKeuangan from "@/components/ChartKeuangan";

export default function PantauKesehatanPage() {
  // State untuk menyimpan data dari Database
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fungsi Format Rupiah (Sama persis dengan Dashboard)
  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  }

  // Fetch Data dari API Backend (penghubung ke Database)
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Ini memanggil file route.ts yang sudah kita buat
        const res = await fetch("/api/pantau-kesehatan"); 
        if (res.ok) {
          const result = await res.json();
          setData(result);
        }
      } catch (error) {
        console.error("Gagal mengambil data database:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Default values saat loading agar tidak error
  const status = data?.status || "...";
  const pesan = data?.pesan || "Sedang menganalisa data...";
  const warna = data?.warna || "gray";
  const metrics = data?.metrics || { rasioLaba: 0, cashFlow: 0, saldo: 0 };

  // Logic Warna Status (Banner)
  const getStatusColor = (colorType: string) => {
    if (colorType === 'green') return { bg: 'bg-green-50', border: 'border-green-200', textMain: 'text-green-700', textSub: 'text-green-600' };
    if (colorType === 'yellow') return { bg: 'bg-yellow-50', border: 'border-yellow-200', textMain: 'text-yellow-700', textSub: 'text-yellow-600' };
    if (colorType === 'red') return { bg: 'bg-red-50', border: 'border-red-200', textMain: 'text-red-700', textSub: 'text-red-600' };
    return { bg: 'bg-gray-50', border: 'border-gray-200', textMain: 'text-gray-700', textSub: 'text-gray-600' };
  };

  const colors = getStatusColor(warna);
  const rasioLabaValue = Number(metrics.rasioLaba);
  const cashFlowValue = Number(metrics.cashFlow);

  return (
    <div className="flex max-h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content (Layout persis Dashboard: Fixed Sidebar + Scrollable Content) */}
      <div className="flex-1 p-8 overflow-auto h-screen">
        <h1 className="text-2xl font-semibold mb-6">Pantau Kesehatan Bisnis</h1>

        {/* 1. STATUS BANNER (Menggantikan summary Dashboard, khusus fitur Kesehatan) */}
        <div className={`mb-8 p-6 rounded-2xl border ${colors.bg} ${colors.border} shadow-sm flex flex-col justify-center`}>
           <h2 className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Status Keuangan Saat Ini</h2>
           {loading ? (
             <div className="animate-pulse h-8 w-48 bg-gray-200 rounded mt-2"></div>
           ) : (
             <>
                <div className={`text-3xl font-bold ${colors.textMain} mb-2`}>{status}</div>
                <p className={`${colors.textSub} font-medium`}>{pesan}</p>
             </>
           )}
        </div>

        {/* 2. STATISTIK GRID */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CardStat
            title="Rasio Laba (Margin)"
            value={loading ? "..." : `${metrics.rasioLaba}%`}
            change="Target > 20%"
            // Jika > 20% dianggap positif (hijau)
            positive={rasioLabaValue > 20}
            arrow={rasioLabaValue > 20 ? "up" : "down"}
          />
          <CardStat
            title="Cash Flow Efektif"
            value={loading ? "..." : formatCurrency(cashFlowValue)}
            change="Arus kas bulan ini"
            // Jika positif hijau
            positive={cashFlowValue >= 0}
            arrow={cashFlowValue >= 0 ? "up" : "down"}
          />
          <CardStat
            title="Saldo Saat Ini (Real)"
            value={loading ? "..." : formatCurrency(metrics.saldo)}
            change="Total akumulasi"
            positive={true}
            arrow="up"
          />
        </div>

        {/* 3. GRAFIK (Dalam Container Putih persis Dashboard) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-8">
           {/* ChartKeuangan ini sudah mandiri (fetch data sendiri) */}
           <ChartKeuangan />
        </div>

      </div>
    </div>
  );
}