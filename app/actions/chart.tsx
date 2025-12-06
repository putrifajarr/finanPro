"use server";

import { prisma } from "@/lib/prisma";
import {
  subDays,
  subMonths,
  format,
  eachDayOfInterval,
  eachMonthOfInterval,
  startOfDay,
  endOfDay,
  isSameDay,
  isSameMonth,
  startOfMonth,
} from "date-fns";
import { id } from "date-fns/locale";

export type ChartDataPoint = {
  name: string;
  pemasukan: number;
  pengeluaran: number;
  originalDate: Date;
};

export async function getChartData(range: "30d" | "6m" | "12m"): Promise<ChartDataPoint[]> {
  const now = new Date();
  let startDate: Date;
  let intervalSkeletons: Date[] = [];
  let dateFormat = "dd MMM";

  if (range === "30d") {
    startDate = subDays(now, 29);
    dateFormat = "dd MMM";
    intervalSkeletons = eachDayOfInterval({ start: startDate, end: now });
  } else if (range === "6m") {
    startDate = subMonths(now, 5);
    startDate = startOfMonth(startDate);
    dateFormat = "MMM";
    intervalSkeletons = eachMonthOfInterval({ start: startDate, end: now });
  } else {
    // 12m
    startDate = subMonths(now, 11);
    startDate = startOfMonth(startDate);
    dateFormat = "MMM";
    intervalSkeletons = eachMonthOfInterval({ start: startDate, end: now });
  }

  const transactions = await prisma.transaksi.findMany({
    where: {
      tanggal: {
        gte: startDate,
      },
    },
    include: {
      kategori: {
        select: {
          jenis_kategori: true,
        },
      },
    },
    orderBy: {
      tanggal: "asc",
    },
  });

  const chartData = intervalSkeletons.map((dateItem) => {
    const matchingTrans = transactions.filter((t) => {
        const tDate = new Date(t.tanggal);
        if (range === "30d") {
            return isSameDay(tDate, dateItem);
        } else {
            return isSameMonth(tDate, dateItem);
        }
    });

    const income = matchingTrans
      .filter((t) => t.kategori.jenis_kategori === "pemasukan")
      .reduce((sum, t) => sum + t.total_harga, 0);

    const expense = matchingTrans
      .filter((t) => t.kategori.jenis_kategori === "pengeluaran")
      .reduce((sum, t) => sum + t.total_harga, 0);

    return {
      name: format(dateItem, dateFormat, { locale: id }), // Localized date string
      pemasukan: income,
      pengeluaran: expense,
      originalDate: dateItem,
    };
  });

  return chartData;
}
