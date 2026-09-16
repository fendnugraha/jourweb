"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, TrendingUp, ArrowUpRight, ArrowDownLeft, ReceiptText, DollarSign, Building2, CalendarCheck } from "lucide-react";

import useWarehouse from "@/app/hooks/useWarehouse";
import useRevenueReportByWarehouse from "@/app/hooks/useRevenueReportByWarehouse";
import MainContent from "../../main";
import Dropdown from "@/app/components/Dropdown";
import { DateTimeNow, formatNumber, formatNumberToK, getMonthName } from "@/app/utils/format";

const MONTH_OPTIONS = [
    { value: 1, label: "Januari" },
    { value: 2, label: "Februari" },
    { value: 3, label: "Maret" },
    { value: 4, label: "April" },
    { value: 5, label: "Mei" },
    { value: 6, label: "Juni" },
    { value: 7, label: "Juli" },
    { value: 8, label: "Agustus" },
    { value: 9, label: "September" },
    { value: 10, label: "Oktober" },
    { value: 11, label: "November" },
    { value: 12, label: "Desember" },
];

export default function BranchRevenuePage() {
    const { warehouses = [] } = useWarehouse();
    const { thisMonth, thisYear } = DateTimeNow();

    const [selectedWarehouse, setSelectedWarehouse] = useState(1);
    const [month, setMonth] = useState(thisMonth);
    const [year, setYear] = useState(thisYear);

    const { revenueByWarehouse, isLoading } = useRevenueReportByWarehouse({
        warehouseId: selectedWarehouse,
        month,
        year,
    });

    // --- Options Memos ---
    const warehouseOptions = useMemo(() => {
        return warehouses
            .filter((w) => w.status === 1)
            .map((w) => ({
                value: w.id,
                label: w.name,
            }));
    }, [warehouses]);

    const yearOptions = useMemo(
        () => [
            { value: thisYear - 2, label: String(thisYear - 2) },
            { value: thisYear - 1, label: String(thisYear - 1) },
            { value: thisYear, label: String(thisYear) },
        ],
        [thisYear],
    );

    // --- Safe Computations ---
    const totals = revenueByWarehouse?.totals || {};
    const revenueList = revenueByWarehouse?.revenue || [];

    const totalTransfer = Number(totals.totalTransfer || 0);
    const totalTarikTunai = Number(totals.totalTarikTunai || 0);
    const sumTransferAndWithdrawal = totalTransfer + totalTarikTunai;

    const transferPercentage = useMemo(() => {
        if (!sumTransferAndWithdrawal) return "0.00";
        return ((totalTransfer / sumTransferAndWithdrawal) * 100).toFixed(2);
    }, [totalTransfer, sumTransferAndWithdrawal]);

    const withdrawalPercentage = useMemo(() => {
        if (!sumTransferAndWithdrawal) return "0.00";
        return ((totalTarikTunai / sumTransferAndWithdrawal) * 100).toFixed(2);
    }, [totalTarikTunai, sumTransferAndWithdrawal]);

    const averageDailyProfit = useMemo(() => {
        const daysCount = revenueList.length;
        if (!daysCount) return 0;
        return Number(totals.totalFee || 0) / daysCount;
    }, [totals.totalFee, revenueList.length]);

    return (
        <MainContent headerTitle="Ringkasan Pendapatan Cabang">
            <div className="space-y-6">
                {/* Header & Filter Controls */}
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 sm:p-5 rounded-2xl bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 shadow-xs"
                >
                    <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                        <Dropdown
                            id="warehouse-filter"
                            label="Cabang / Warehouse"
                            options={warehouseOptions}
                            selectedValue={selectedWarehouse}
                            onChange={(val) => setSelectedWarehouse(val)}
                            ariaLabel="Filter berdasarkan cabang"
                        />

                        <Dropdown
                            id="month-filter"
                            label="Bulan"
                            options={MONTH_OPTIONS}
                            selectedValue={month}
                            onChange={(val) => setMonth(val)}
                            ariaLabel="Filter berdasarkan bulan"
                        />

                        <Dropdown
                            id="year-filter"
                            label="Tahun"
                            options={yearOptions}
                            selectedValue={year}
                            onChange={(val) => setYear(val)}
                            ariaLabel="Filter berdasarkan tahun"
                        />
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                        <AnimatePresence>
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/40"
                                >
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    <span>Memuat Data...</span>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>

                {/* KPI Overview Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
                    {/* Transfer */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-medium">Transfer</span>
                            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/50 dark:text-sky-400">
                                <ArrowUpRight className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">{formatNumberToK(totalTransfer)}</div>
                            <span className="text-[11px] font-medium text-sky-600 dark:text-sky-400">{transferPercentage}% dari total</span>
                        </div>
                    </div>

                    {/* Tarik Tunai */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-medium">Tarik Tunai</span>
                            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400">
                                <ArrowDownLeft className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">{formatNumberToK(totalTarikTunai)}</div>
                            <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">{withdrawalPercentage}% dari total</span>
                        </div>
                    </div>

                    {/* Total Transaksi */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-medium">Transaksi</span>
                            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400">
                                <ReceiptText className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">{formatNumber(totals.totalTrx || 0)}</div>
                            <span className="text-[11px] font-medium text-slate-400 dark:text-slate-500">Total item trx</span>
                        </div>
                    </div>

                    {/* Profit Rata-Rata / Hari */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-2">
                        <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="text-xs font-medium">Profit Rata-Rata</span>
                            <div className="p-1.5 rounded-lg bg-purple-50 text-purple-600 dark:bg-purple-950/50 dark:text-purple-400">
                                <CalendarCheck className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-100">{formatNumberToK(averageDailyProfit)}</div>
                            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">/ hari aktif</span>
                        </div>
                    </div>

                    {/* Net Profit */}
                    <div className="p-4 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-200/80 dark:border-emerald-900/40 shadow-xs space-y-2 col-span-2 lg:col-span-1">
                        <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400">
                            <span className="text-xs font-semibold">Net Profit</span>
                            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                                <DollarSign className="h-4 w-4" />
                            </div>
                        </div>
                        <div>
                            <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400">{formatNumber(totals.totalFee || 0)}</div>
                            <span className="text-[11px] font-medium text-emerald-600/80 dark:text-emerald-400/80">Keuntungan bersih</span>
                        </div>
                    </div>
                </div>

                {/* Table Container */}
                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
                    <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-indigo-500" />
                            <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">
                                Laporan Detail ({revenueByWarehouse?.warehouse?.name || "Laporan Cabang"})
                            </h2>
                        </div>
                        <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg w-fit">
                            Periode: {getMonthName(month)} {year}
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs border-collapse">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                                    <th className="px-4 py-3.5 text-center whitespace-nowrap min-w-27.5">Tanggal</th>
                                    <th className="px-4 py-3.5 text-right">Transfer</th>
                                    <th className="px-4 py-3.5 text-right">Tarik Tunai</th>
                                    <th className="px-4 py-3.5 text-right">Voucher</th>
                                    <th className="px-4 py-3.5 text-right">Deposit</th>
                                    <th className="px-4 py-3.5 text-right w-20">Trx</th>
                                    <th className="px-4 py-3.5 text-right">Biaya (Expense)</th>
                                    <th className="px-4 py-3.5 text-right">Laba Bersih</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60 font-mono">
                                {isLoading ? (
                                    Array.from({ length: 5 }).map((_, i) => (
                                        <tr key={i} className="animate-pulse">
                                            <td className="p-3.5">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto w-12" />
                                            </td>
                                            <td className="p-3.5">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-16" />
                                            </td>
                                            <td className="p-3.5">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-16" />
                                            </td>
                                            <td className="p-3.5">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-12" />
                                            </td>
                                            <td className="p-3.5">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-16" />
                                            </td>
                                            <td className="p-3.5">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-8" />
                                            </td>
                                            <td className="p-3.5">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-14" />
                                            </td>
                                            <td className="p-3.5">
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded ml-auto w-16" />
                                            </td>
                                        </tr>
                                    ))
                                ) : revenueList.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-6 py-10 text-center text-slate-400 font-sans">
                                            Tidak ada data laporan untuk periode ini.
                                        </td>
                                    </tr>
                                ) : (
                                    revenueList.map((item, index) => (
                                        <tr key={index} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors duration-150">
                                            <td className="px-4 py-3 text-center font-sans font-medium text-slate-700 dark:text-slate-300 whitespace-nowrap">
                                                {item.date}
                                            </td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{formatNumber(item.transfer)}</td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{formatNumber(item.tarikTunai)}</td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{formatNumber(item.voucher)}</td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{formatNumber(item.deposit)}</td>
                                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-200">{formatNumber(item.trx)}</td>
                                            <td className="px-4 py-3 text-right font-semibold text-rose-600 dark:text-rose-400">
                                                {formatNumber(item.expense)}
                                            </td>
                                            <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(item.fee)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                            <tfoot className="border-t-2 border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20 font-mono text-xs">
                                <tr>
                                    <th className="px-4 py-3.5 text-center font-bold font-sans text-slate-800 dark:text-slate-100 whitespace-nowrap">Total</th>
                                    <th className="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-100">
                                        {formatNumber(totals.totalTransfer)}
                                    </th>
                                    <th className="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-100">
                                        {formatNumber(totals.totalTarikTunai)}
                                    </th>
                                    <th className="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-100">{formatNumber(totals.totalVoucher)}</th>
                                    <th className="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-100">{formatNumber(totals.totalDeposit)}</th>
                                    <th className="px-4 py-3.5 text-right font-bold text-slate-800 dark:text-slate-100">{formatNumber(totals.totalTrx)}</th>
                                    <th className="px-4 py-3.5 text-right font-bold text-rose-600 dark:text-rose-400">{formatNumber(totals.totalExpense)}</th>
                                    <th className="px-4 py-3.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(totals.totalFee)}</th>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </MainContent>
    );
}
