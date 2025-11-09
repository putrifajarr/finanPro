"use client";

import Sidebar from "@/components/Sidebar";
import CardStat from "@/components/CardStat";
import ChartKeuangan from "@/components/ChartKeuangan";
import TransaksiTerbaru from "@/components/TransaksiTerbaru";

export default function Dashboard() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">Dashboard Keuangan</h1>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CardStat title="Total Pemasukan" value="Rp12,426" change="+36%" positive />
          <CardStat title="Total Pengeluaran" value="Rp2,38,485" change="+14%" positive={undefined} />
          <CardStat title="Total Laba" value="Rp2,38,485" change="+14%" positive />
        </div>

        {/* Grafik & Transaksi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <ChartKeuangan />
            <button className="mt-6 w-full bg-lime-500 text-white font-semibold py-2 rounded-lg hover:bg-lime-600">
              Pantau Kesehatan Bisnis
            </button>
          </div>

          <TransaksiTerbaru />
        </div>
      </div>
    </div>
  );
}
