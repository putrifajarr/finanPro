import Link from "next/link";

interface Transaction {
  id: string;
  type: "pemasukan" | "pengeluaran";
  amount: number;
  date: Date;
  description: string | null;
  categoryName: string;
}

export default function TransaksiTerbaru({ transactions }: { transactions: Transaction[] }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <h3 className="font-semibold mb-4">Transaksi Terbaru</h3>

      <div className="space-y-3">
        {transactions.length === 0 ? (
          <p className="text-sm text-gray-500">Belum ada transaksi.</p>
        ) : (
          transactions.map((t) => (
            <div key={t.id}>
              <p className="font-medium text-sm">{t.categoryName}</p>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{t.description || "Tanpa deskripsi"}</span>
                <span
                  className={
                    t.type === "pemasukan" ? "text-lime-600" : "text-red-500"
                  }
                >
                  {t.type === "pemasukan" ? "+" : "-"}
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumFractionDigits: 0,
                  }).format(t.amount)}
                </span>
              </div>
            </div>
          ))
        )}
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
