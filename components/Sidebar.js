"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, BarChart, FileText, Package, LogOut, Settings } from "lucide-react";

const menu = [
  { name: "Dashboard", icon: Home, href: "/dashboard/home" },
  { name: "Laporan Laba", icon: BarChart, href: "/dashboard/laporan_laba-rugi" },
  { name: "Hutang–Piutang", icon: FileText, href: "/dashboard/hutang-piutang" },
  { name: "Inventaris", icon: Package, href: "/dashboard/inventaris" },
  { name: "Riwayat Transaksi", icon: FileText, href: "/dashboard/transaksi" },
  { name: "Pengaturan", icon: Settings, href: "/settings/profile" },
];

export default function Sidebar() {
  const pathname = usePathname(); // untuk deteksi halaman aktif

  return (
    <aside className="w-60 bg-white border-r border-gray-200 p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-lg font-semibold mb-6 text-lime-700">FinanPro</h2>

        <nav className="space-y-2">
          {menu.map((item, i) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={i}
                href={item.href}
                className={`flex items-center gap-3 w-full px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? "bg-lime-100 text-lime-700 font-medium"
                    : "hover:bg-lime-100"
                }`}
              >
                <item.icon size={18} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      <button
        onClick={async () => {
          await fetch("/api/auth/logout", { method: "POST" });
          window.location.href = "/login";
        }}
        className="flex items-center gap-3 px-3 py-2 mt-6 border border-red-300 text-red-600 rounded-lg hover:bg-red-50"
      >
        <LogOut size={18} /> Logout
      </button>
    </aside>
  );
}
