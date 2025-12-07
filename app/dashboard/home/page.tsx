import Sidebar from "@/components/Sidebar";
import ChartKeuangan from "@/components/ChartKeuangan";
import TransaksiTerbaru from "@/components/TransaksiTerbaru";
import CardStat from "@/components/CardStat";
import Link from "next/link";
import { getDashboardData } from "@/app/actions/dashboard";

export default async function Dashboard() {
  const { summary, recentTransactions } = await getDashboardData();

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(Math.abs(amount));
  }

  function formatPercent(val: number) {
    return `${Math.abs(val).toFixed(1)}%`;
  }

  const expenseUnfavorable = summary.expense.change > 0;
  
  const netProfitValue = summary.netProfit.value;
  let netProfitClass = "text-gray-900"; 
  let netProfitArrow: "up" | "down" | "neutral" = "neutral";
  let netProfitPositive: boolean | undefined = undefined; 

  if (netProfitValue > 0) {
    netProfitClass = "text-green-600";
    netProfitArrow = "up";
    netProfitPositive = true;
  } else if (netProfitValue < 0) {
    netProfitClass = "text-red-600";
    netProfitArrow = "down";
    netProfitPositive = false;
  }

  return (
    <div className="flex max-h-screen">
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto h-screen">
        <h1 className="text-2xl font-semibold mb-6">Dashboard Keuangan</h1>

        {/* Statistik */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <CardStat
            title="Total Pemasukan"
            value={formatCurrency(summary.income.value)}
            change={formatPercent(summary.income.change)}
            positive={summary.income.change >= 0}
            arrow={summary.income.change >= 0 ? "up" : "down"}
          />
          <CardStat
            title="Total Pengeluaran"
            value={formatCurrency(summary.expense.value)}
            change={formatPercent(summary.expense.change)}
            positive={!expenseUnfavorable} 
            arrow={summary.expense.change >= 0 ? "up" : "down"} 
          />
          <CardStat
            title="Total Laba"
            value={formatCurrency(netProfitValue)}
            valueClassName={netProfitClass} 
            change={formatPercent(summary.netProfit.change)}
            positive={netProfitPositive} 
            arrow={netProfitArrow}
          />
        </div>

        {/* Grafik & Transaksi */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm">
            <ChartKeuangan />
            <Link href="/dashboard/pantau-kesehatan">
              <button className="mt-6 w-full bg-lime-500 text-white font-semibold py-2 rounded-lg hover:bg-lime-600">
                Pantau Kesehatan Bisnis
              </button>
            </Link>
          </div>

          <TransaksiTerbaru transactions={recentTransactions} />
        </div>
      </div>
    </div>
  );
}
