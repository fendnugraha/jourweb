import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import useRevenueReport from "@/app/hooks/useRevenueReport";
import { DateTimeNow, formatNumber } from "@/app/utils/format";
import { Building2, Calendar, Loader2, Search } from "lucide-react";
import { useMemo, useState } from "react";

const RevenueReport = () => {
    const { today } = DateTimeNow();
    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: "",
        endDate: "",
    });

    const [searchTerm, setSearchTerm] = useState("");

    const { revenue, error, isLoading, isValidating } = useRevenueReport(dateFilter.startDate, dateFilter.endDate);

    const sumByTrxType = (trxType) => {
        return revenue.revenue.reduce((total, item) => {
            return total + Number(item[trxType]);
        }, 0);
        // console.log(revenue.revenue?.[0][trxType]);
    };
    const hasData = revenue?.revenue && revenue.revenue.length > 0;
    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side Filters */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    {/* Search SKU/Name */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            aria-label="Search finance records"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <DateFilterDropdown
                            selectedPreset={dateFilter.preset}
                            customStartDate={dateFilter.startDate}
                            customEndDate={dateFilter.endDate}
                            onChange={(val) => setDateFilter(val)}
                            label="Transaction Date"
                        />
                    </div>
                </div>

                {/* Status Refreshing / Validating */}
                <div className="flex items-center gap-2">
                    {isValidating && !isLoading && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Menyegarkan...</span>
                        </div>
                    )}
                </div>
            </div>

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {/* Visual Progress Bar di Atas Card/Tabel saat Revalidating */}
                {isValidating && !isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500/20 overflow-hidden z-20">
                        <div className="w-full h-full bg-indigo-600 animate-pulse" />
                    </div>
                )}

                {/* ========================================================= */}
                {/* 1. KONDISI LOADING (HP & DESKTOP) */}
                {/* ========================================================= */}
                {isLoading ? (
                    <div className="p-10 text-center text-slate-400 font-sans">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                            <span className="text-xs sm:text-sm font-medium">Memuat data pendapatan...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ========================================================= */}
                        {/* 2. CARD RINGKASAN TOTAL (UNTUK LAYAR HP) */}
                        {/* ========================================================= */}
                        {hasData && (
                            <div className="sm:hidden p-4 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 space-y-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Ringkasan Laporan Pendapatan</span>

                                {/* High Level Numbers */}
                                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                    <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                                        <span className="text-[10px] font-sans font-medium text-emerald-700 dark:text-emerald-400 block">
                                            Total Laba Bersih
                                        </span>
                                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{formatNumber(sumByTrxType("fee"))}</span>
                                    </div>
                                    <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                        <span className="text-[10px] font-sans font-medium text-slate-400 block">Total Setoran Kas</span>
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{formatNumber(sumByTrxType("cash"))}</span>
                                    </div>
                                </div>

                                {/* Detail Ringkasan Transaksi */}
                                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800 text-[11px] font-mono grid grid-cols-2 gap-y-2 gap-x-4">
                                    <div className="flex justify-between items-center">
                                        <span className="font-sans text-slate-400">Transfer</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("transfer"))}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-sans text-slate-400">Tarik Tunai</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("tarikTunai"))}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-sans text-slate-400">Voucher</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("voucher"))}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-sans text-slate-400">Acc.</span>
                                        <span className="text-slate-700 dark:text-slate-300">{formatNumber(sumByTrxType("accessories"))}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-sans text-slate-400">Bank Fee</span>
                                        <span className="text-rose-500 font-medium">{formatNumber(sumByTrxType("bank_fee"))}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="font-sans text-slate-400">Biaya</span>
                                        <span className="text-rose-500 font-medium">{formatNumber(sumByTrxType("expense"))}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ========================================================= */}
                        {/* 3. TAMPILAN MOBILE: LIST OF CARDS (HANYA MUNCUL DI HP) */}
                        {/* ========================================================= */}
                        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                            {hasData ? (
                                revenue.revenue.map((item, i) => (
                                    <div key={i} className="p-4 space-y-3">
                                        {/* Header Cabang */}
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <span className="font-semibold text-xs text-slate-800 dark:text-slate-100">
                                                {item.warehouse.replace(/^konter\s*/i, "")}
                                            </span>
                                        </div>

                                        {/* Main Metric Highlight (Laba Bersih & Setoran) */}
                                        <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                                            <div className="bg-emerald-50/50 dark:bg-emerald-950/20 p-2.5 rounded-xl border border-emerald-100/60 dark:border-emerald-900/30">
                                                <span className="text-[10px] font-sans text-emerald-700 dark:text-emerald-400 block">Laba Bersih</span>
                                                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatNumber(item.fee)}</span>
                                            </div>
                                            <div className="bg-slate-50/70 dark:bg-slate-850/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                                                <span className="text-[10px] font-sans text-slate-400 block">Setoran Kas</span>
                                                <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formatNumber(item.cash)}</span>
                                            </div>
                                        </div>

                                        {/* Rincian Transaksi */}
                                        <div className="bg-slate-50/50 dark:bg-slate-850/20 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2 text-xs font-mono">
                                            <div className="text-[10px] font-sans font-bold text-slate-400 uppercase tracking-wider">Breakdown Transaksi</div>
                                            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-slate-400">Transfer:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.transfer)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-slate-400">Tarik Tunai:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.tarikTunai)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-slate-400">Voucher:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.voucher)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-slate-400">Acc.:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.accessories)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-slate-400">Deposit:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.deposit)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-slate-400">Tx Total:</span>
                                                    <span className="text-slate-700 dark:text-slate-300">{formatNumber(item.trx)}</span>
                                                </div>
                                            </div>

                                            {/* Biaya & Fee Bank */}
                                            <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 grid grid-cols-2 gap-2 text-[11px]">
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-slate-400">Bank Fee:</span>
                                                    <span className="text-rose-500 font-medium">{formatNumber(item.bank_fee)}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="font-sans text-slate-400">Biaya Ops:</span>
                                                    <span className="text-rose-500 font-medium">{formatNumber(item.expense)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="p-6 text-center text-slate-400 font-sans text-xs">Tidak ada data transaksi ditemukan.</div>
                            )}
                        </div>

                        {/* ========================================================= */}
                        {/* 4. TAMPILAN DESKTOP: FULL TABLE (HANYA MUNCUL DI DESKTOP) */}
                        {/* ========================================================= */}
                        <div className="hidden sm:block overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/25">
                                        <th scope="col" className="px-6 py-4 text-left">
                                            Cabang
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Transfer
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Tarik Tunai
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Voucher
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Acc.
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Deposit
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Tx
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Bank Fee
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Biaya
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Laba Bersih
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right">
                                            Setoran Kas
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 font-mono">
                                    {hasData ? (
                                        revenue.revenue.map((item, i) => (
                                            <tr key={i} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                                <td className="px-6 py-4 font-sans font-medium text-slate-800 dark:text-slate-200">
                                                    {item.warehouse.replace(/^konter\s*/i, "")}
                                                </td>
                                                <td className="px-6 py-4 text-right">{formatNumber(item.transfer)}</td>
                                                <td className="px-6 py-4 text-right">{formatNumber(item.tarikTunai)}</td>
                                                <td className="px-6 py-4 text-right">{formatNumber(item.voucher)}</td>
                                                <td className="px-6 py-4 text-right">{formatNumber(item.accessories)}</td>
                                                <td className="px-6 py-4 text-right">{formatNumber(item.deposit)}</td>
                                                <td className="px-6 py-4 text-right">{formatNumber(item.trx)}</td>
                                                <td className="px-6 py-4 text-right text-rose-500">{formatNumber(item.bank_fee)}</td>
                                                <td className="px-6 py-4 text-right text-rose-500">{formatNumber(item.expense)}</td>
                                                <td className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                    {formatNumber(item.fee)}
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold">{formatNumber(item.cash)}</td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="11" className="px-6 py-8 text-center text-slate-400 font-sans">
                                                Tidak ada data transaksi ditemukan.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>

                                {/* FOOTER TOTAL (DESKTOP) */}
                                {hasData && (
                                    <tfoot className="bg-slate-100 dark:bg-slate-800">
                                        <tr className="border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/25">
                                            <th className="px-6 py-4 text-left font-semibold text-slate-700 dark:text-slate-300">Total</th>
                                            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                                {formatNumber(sumByTrxType("transfer"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                                {formatNumber(sumByTrxType("tarikTunai"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                                {formatNumber(sumByTrxType("voucher"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                                {formatNumber(sumByTrxType("accessories"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                                {formatNumber(sumByTrxType("deposit"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-semibold text-slate-700 dark:text-slate-300">
                                                {formatNumber(sumByTrxType("trx"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-semibold dark:text-slate-300 text-rose-500">
                                                {formatNumber(sumByTrxType("bank_fee"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-semibold dark:text-slate-300 text-rose-500">
                                                {formatNumber(sumByTrxType("expense"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-bold text-emerald-600 dark:text-emerald-400">
                                                {formatNumber(sumByTrxType("fee"))}
                                            </th>
                                            <th className="px-6 py-4 text-right font-bold text-slate-800 dark:text-slate-100">
                                                {formatNumber(sumByTrxType("cash"))}
                                            </th>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default RevenueReport;
