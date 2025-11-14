import Link from "next/link";

export default function TransaksiTerbaru() {
  const transaksi = [
    { jenis: "Penjualan", nama: "Penjualan Burger", nominal: "Rp5.000.000", positif: true },
    { jenis: "Penjualan", nama: "Penjualan A", nominal: "Rp5.000.000", positif: true },
    { jenis: "Operasional", nama: "Pembelian Bulanan", nominal: "Rp5.000.000", positif: false },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Transaksi Terbaru</h3>

      <div className="space-y-3">
        {transaksi.map((t, i) => (
          <div key={i}>
            <p className="font-medium text-sm">{t.jenis}</p>
            <div className="flex justify-between text-sm text-gray-600">
              <span>{t.nama}</span>
              <span className={t.positif ? "text-lime-600" : "text-red-500"}>
                {t.nominal}
              </span>
            </div>
          </div>
        ))}
      </div>

        <Link
        href="/dashboard/transaksi"
        className="text-xs text-right w-full mt-4 text-gray-500 hover:text-gray-700 block"
        >
        Lihat Detail →
        </Link>
    </div>
  );
}
