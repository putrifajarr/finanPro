"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const data = [
  { name: "Feb", pemasukan: 200, pengeluaran: 180 },
  { name: "Mar", pemasukan: 220, pengeluaran: 200 },
  { name: "Apr", pemasukan: 240, pengeluaran: 210 },
  { name: "May", pemasukan: 260, pengeluaran: 230 },
  { name: "Jun", pemasukan: 300, pengeluaran: 250 },
  { name: "Jul", pemasukan: 320, pengeluaran: 270 },
  { name: "Aug", pemasukan: 340, pengeluaran: 280 },
  { name: "Sep", pemasukan: 360, pengeluaran: 290 },
  { name: "Oct", pemasukan: 380, pengeluaran: 300 },
];

export default function ChartKeuangan() {
  return (
    <>
      <div className="flex justify-between mb-4">
        <h3 className="font-semibold">Grafik Keuangan</h3>
        <div className="space-x-2">
          <button className="border px-3 py-1 text-sm rounded-md bg-white shadow-sm">
            12 Bulan
          </button>
          <button className="border px-3 py-1 text-sm rounded-md">6 Bulan</button>
          <button className="border px-3 py-1 text-sm rounded-md">30 Hari</button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="pemasukan" stroke="#84cc16" strokeWidth={2} />
          <Line type="monotone" dataKey="pengeluaran" stroke="#ef4444" strokeWidth={2} />
        </LineChart>
      </ResponsiveContainer>
    </>
  );
}
