"use server";

import { prisma } from "@/lib/prisma";
import { jenis_kategori } from "@prisma/client";

export async function getDashboardData() {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();

  const startOfCurrentMonth = new Date(currentYear, currentMonth, 1);
  const startOfNextMonth = new Date(currentYear, currentMonth + 1, 1);
  const startOfPrevMonth = new Date(currentYear, currentMonth - 1, 1);
  
  async function getSum(start: Date, end: Date, type: jenis_kategori) {
    const result = await prisma.transaksi.aggregate({
      _sum: {
        total_harga: true,
      },
      where: {
        tanggal: {
          gte: start,
          lt: end,
        },
        kategori: {
          jenis_kategori: type,
        },
      },
    });
    return result._sum.total_harga || 0;
  }

  const incomeCurrent = await getSum(startOfCurrentMonth, startOfNextMonth, "pemasukan");
  const expenseCurrent = await getSum(startOfCurrentMonth, startOfNextMonth, "pengeluaran");
  const netProfitCurrent = incomeCurrent - expenseCurrent;

  const incomePrev = await getSum(startOfPrevMonth, startOfCurrentMonth, "pemasukan");
  const expensePrev = await getSum(startOfPrevMonth, startOfCurrentMonth, "pengeluaran");
  const netProfitPrev = incomePrev - expensePrev;

  function calculateChange(current: number, prev: number) {
    if (prev === 0) return current > 0 ? 100 : 0;
    return ((current - prev) / prev) * 100;
  }

  const incomeChange = calculateChange(incomeCurrent, incomePrev);
  const expenseChange = calculateChange(expenseCurrent, expensePrev);
  const netProfitChange = calculateChange(netProfitCurrent, netProfitPrev);

  const recentTransactions = await prisma.transaksi.findMany({
    take: 5,
    orderBy: {
      tanggal: "desc",
    },
    include: {
      kategori: true,
    },
  });

  return {
    summary: {
      income: { value: incomeCurrent, change: incomeChange },
      expense: { value: expenseCurrent, change: expenseChange },
      netProfit: { value: netProfitCurrent, change: netProfitChange },
    },
    recentTransactions: recentTransactions.map((t) => ({
      id: t.id_transaksi,
      type: t.kategori.jenis_kategori,
      amount: t.total_harga,
      date: t.tanggal,
      description: t.deskripsi,
      categoryName: t.kategori.nama_kategori,
    })),
  };
}
