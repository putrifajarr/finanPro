"use client";

import Sidebar from "@/components/Sidebar";
import CardStat from "@/components/CardStat";
import ChartKeuangan from "@/components/ChartKeuangan";

export default function PantauKesehatan() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold mb-6">
          Pantau Kesehatan Keuangan
        </h1>

        {/* Status Keuangan */}
        <div className="bg-lime-50 border border-lime-200 p-6 rounded-xl mb-8">
          <h2 className="text-lg font-semibold mb-2">Status Keuangan</h2>
          <p className="text-green-700 font-semibold text-xl">Sehat</p>
          <p className="text-green-600 text-sm mt-1">
            Stabil, pertahankan. Cash Flow Efektif: Rp. 3.441.000
          </p>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CardStat
            title="Rasio Laba"
            value="-20.00%"
            change="Target > 10%"
            positive={false}
          />
          <CardStat
            title="Cash Flow Efektif"
            value="Rp. 1.250.000"
            change="Setelah cadangan Rp500.000"
            positive={true}
          />
          <CardStat
            title="Saldo Saat Ini"
            value="Rp. 3.441.000"
            change="+5% dari bulan lalu"
            positive={true}
          />
        </div>

        {/* Grafik */}
        <ChartKeuangan />
      </main>
    </div>
  );
}
