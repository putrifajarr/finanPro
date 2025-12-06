"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from "recharts";
import { useState, useEffect, useTransition } from "react";
import { getChartData, ChartDataPoint } from "@/app/actions/chart";
import { Loader2 } from "lucide-react";

export default function ChartKeuangan() {
  const [range, setRange] = useState<"30d" | "6m" | "12m">("12m");
  const [data, setData] = useState<ChartDataPoint[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    // Fetch data when range changes
    startTransition(async () => {
        try {
            const result = await getChartData(range);
            setData(result);
        } catch (error) {
            console.error("Failed to fetch chart data", error);
        }
    });
  }, [range]);

  const ranges = [
    { label: "12 Bulan", value: "12m" },
    { label: "6 Bulan", value: "6m" },
    { label: "30 Hari", value: "30d" },
  ];

  const formatCurrency = (value: number) => {
    if (value >= 1_000_000) {
        return `Rp${(value / 1_000_000).toFixed(1)}jt`;
    } else if (value >= 1_000) {
        return `Rp${(value / 1_000).toFixed(0)}rb`;
    }
    return `Rp${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border  rounded shadow-lg text-xs">
          <p className="font-bold mb-1">{label}</p>
          <p className="text-lime-600">
            Pemasukan: {new Intl.NumberFormat("id-ID").format(payload[0].value)}
          </p>
          <p className="text-red-500">
            Pengeluaran: {new Intl.NumberFormat("id-ID").format(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm min-h-[350px]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
        <h3 className="font-semibold text-lg text-gray-800">Grafik Keuangan</h3>

        <div className="flex bg-gray-100 p-1 rounded-lg">
          {ranges.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value as any)}
              disabled={isPending}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
                range === r.value
                  ? "bg-white text-gray-800 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div className="w-full h-[280px] relative">
        {isPending && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        )}
        
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
            <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                dy={10}
            />
            <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 11, fill: "#9ca3af" }}
                tickFormatter={formatCurrency}
            />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#e5e7eb', strokeWidth: 1 }} />
            <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px' }}/>
            <Line
              name="Pemasukan"
              type="monotone"
              dataKey="pemasukan"
              stroke="#84cc16" // lime-500
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
            <Line
              name="Pengeluaran"
              type="monotone"
              dataKey="pengeluaran"
              stroke="#ef4444" // red-500
              strokeWidth={3}
              dot={false}
              activeDot={{ r: 6, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
