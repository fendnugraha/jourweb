import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import Dropdown from "@/app/components/Dropdown";
import { useDailyDashboard } from "@/app/hooks/useDailyDashboard";
import useWarehouse from "@/app/hooks/useWarehouse";
import { DateTimeNow, formatNumber, formatNumberToK } from "@/app/utils/format";
import {
    Wallet,
    Building2,
    Gem,
    ArrowUpRight,
    ArrowDownLeft,
    ReceiptText,
    Coins,
    Percent,
    TrendingDown,
    Activity,
    Ticket,
    Cable,
    Smartphone,
    Loader2,
    Search,
} from "lucide-react";
import { useState } from "react";

export default function DailyDashboardGrid({ userRole, warehouseId }) {
    const { today } = DateTimeNow();
    const warehouse = !["Administrator", "Super Admin"].includes(userRole) ? warehouseId : "all";
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState(warehouse);
    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: today,
        endDate: today,
    });
    const { warehouses } = useWarehouse();

    const warehouseOptions = [
        { value: "all", label: "Semua Cabang" },
        ...warehouses.map((warehouse) => ({
            value: warehouse.id,
            label: warehouse.name,
        })),
    ];
    const { dailyDashboard, isLoading, isValidating, error, mutate } = useDailyDashboard(selectedWarehouse, dateFilter.startDate, dateFilter.endDate);

    const data = dailyDashboard?.data;

    const totalCash = Number(data?.totalCash || 0);
    const totalBank = Number(data?.totalBank || 0);
    const totalLiquidity = totalCash + totalBank;

    const totalSetoran =
        Number(data?.totalCashDeposit?.total || 0) +
        Number(data?.profit || 0) +
        totalCash +
        Number(data?.totalVoucher?.total || 0) +
        Number(data?.totalAccessories?.total || 0);

    const expenseVal = Number(data?.totalExpense || 0);
    const displayExpense = expenseVal < 0 ? expenseVal * -1 : expenseVal;

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side: Filter Search */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari aktivitas atau user..."
                            aria-label="Search log activities"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                    {/* Warehouse Dropdown */}
                    <div>
                        <Dropdown
                            id="warehouse-filter"
                            label="Warehouse Filter"
                            options={warehouseOptions}
                            selectedValue={selectedWarehouse}
                            onChange={(val) => setSelectedWarehouse(val)}
                            ariaLabel="Filter by warehouse"
                            disabled={!["Administrator", "Super Admin"].includes(userRole)}
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

                {/* Right Side: Refreshing/Validating Status Indicator */}
                <div className="flex items-center gap-3">
                    {isValidating && !isLoading && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="hidden sm:inline">Refreshing...</span>
                        </div>
                    )}
                </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 w-full h-full font-sans antialiased text-slate-800 dark:text-slate-100 p-1">
                {/* ==================== LEFT & CENTER COLUMN (9 COLS) ==================== */}
                <div className="lg:col-span-9 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. LIKUIDITAS UTAMA CARD */}
                    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-indigo-50/80 via-slate-50/90 to-indigo-100/50 dark:from-indigo-950/80 dark:via-slate-900/90 dark:to-slate-900 border border-indigo-200/60 dark:border-indigo-500/20 p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                        <div className="absolute -top-12 -left-12 w-48 h-48 bg-indigo-500/10 dark:bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-500/15 border border-indigo-300/60 dark:border-indigo-500/30 px-3.5 py-1 rounded-full">
                                    <Wallet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Likuiditas Utama
                                </span>
                            </div>

                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Kas Tunai (On-Hand)</p>
                            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight mt-1 text-slate-900 dark:text-white">
                                {isLoading ? (
                                    <Loader2 className="animate-spin w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                                ) : (
                                    `Rp ${formatNumber(totalCash)}`
                                )}
                            </h1>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-indigo-200/40 dark:border-slate-800/80">
                            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-indigo-100 dark:border-slate-800">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <Building2 className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                                    Bank
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white mt-1">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumber(totalBank)}
                                </p>
                            </div>
                            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-500/20">
                                <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                                    <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                                    Total Uang
                                </div>
                                <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumber(totalLiquidity)}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 2. NET PROFIT CARD */}
                    <div className="relative overflow-hidden rounded-3xl bg-linear-to-br from-emerald-50/80 via-slate-50/90 to-emerald-100/40 dark:from-emerald-950/60 dark:via-slate-900/90 dark:to-slate-900 border border-emerald-200/60 dark:border-emerald-500/20 p-6 shadow-sm dark:shadow-2xl backdrop-blur-xl flex flex-col justify-between">
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 dark:bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

                        <div>
                            <div className="flex items-center justify-between mb-5">
                                <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/15 border border-emerald-300/60 dark:border-emerald-500/30 px-3.5 py-1 rounded-full">
                                    <Gem className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Net Profit
                                </span>
                            </div>

                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Laba Bersih Hari Ini</p>
                            <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight mt-1 text-emerald-600 dark:text-emerald-400">
                                {isLoading ? (
                                    <Loader2 className="animate-spin w-8 h-8 text-emerald-600 dark:text-emerald-400" />
                                ) : (
                                    `Rp ${formatNumber(Number(data?.profit || 0))}`
                                )}
                            </h1>
                        </div>

                        <div className="grid grid-cols-2 gap-3 mt-6 pt-4 border-t border-emerald-200/40 dark:border-slate-800/80">
                            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    <span className="flex items-center gap-1">
                                        <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Transfer
                                    </span>
                                    <span className="text-[10px] font-bold bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-1.5 py-0.5 rounded-full">
                                        {isLoading ? "..." : formatNumber(Number(data?.totalTransfer?.count || 0))}x
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumberToK(Number(data?.totalTransfer?.total || 0))}
                                </p>
                            </div>

                            <div className="bg-white/80 dark:bg-slate-900/80 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800">
                                <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                                    <span className="flex items-center gap-1">
                                        <ArrowDownLeft className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" /> Tarik Tunai
                                    </span>
                                    <span className="text-[10px] font-bold bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded-full">
                                        {isLoading ? "..." : formatNumber(Number(data?.totalCashWithdrawal?.count || 0))}x
                                    </span>
                                </div>
                                <p className="text-sm font-bold text-slate-800 dark:text-white">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumberToK(Number(data?.totalCashWithdrawal?.total || 0))}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* 3. PRODUCT CATEGORIES (3 BOXES IN BOTTOM ROW) */}
                    <div className="md:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Voucher Card */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Voucher & SP</span>
                                <div className="p-2.5 bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20 rounded-2xl text-indigo-600 dark:text-indigo-400">
                                    <Ticket className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                                    {isLoading ? "..." : `${formatNumber(Number(data?.totalVoucher?.count || 0))} Pcs`}
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumber(Number(data?.totalVoucher?.total || 0))}
                                </h2>
                            </div>
                        </div>

                        {/* Accessories Card */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Accessories</span>
                                <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 rounded-2xl text-amber-600 dark:text-amber-400">
                                    <Cable className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                                    {isLoading ? "..." : `${formatNumber(Number(data?.totalAccessories?.count || 0))} Pcs`}
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumber(Number(data?.totalAccessories?.total || 0))}
                                </h2>
                            </div>
                        </div>

                        {/* Deposit Card */}
                        <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Deposit (Pulsa/Token)</span>
                                <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 rounded-2xl text-sky-600 dark:text-sky-400">
                                    <Smartphone className="w-5 h-5" />
                                </div>
                            </div>
                            <div className="mt-4">
                                <span className="text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-full">
                                    {isLoading ? "..." : `${formatNumber(Number(data?.totalCashDeposit?.count || 0))} Tx`}
                                </span>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumber(Number(data?.totalCashDeposit?.total || 0))}
                                </h2>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ==================== RIGHT SIDEBAR STATS (3 COLS) ==================== */}
                <div className="lg:col-span-3 flex flex-col gap-3">
                    {/* Total Setoran */}
                    <div className="relative overflow-hidden bg-linear-to-r from-violet-600 to-indigo-600 p-5 rounded-3xl shadow-md text-white flex items-center justify-between">
                        <div>
                            <p className="text-[11px] font-bold tracking-wider uppercase text-violet-200">Total Setoran</p>
                            <h2 className="text-2xl font-extrabold text-white mt-0.5">
                                {isLoading ? <Loader2 className="animate-spin w-5 h-5 text-white" /> : `Rp ${formatNumber(totalSetoran)}`}
                            </h2>
                        </div>
                        <div className="p-3 bg-white/20 backdrop-blur-md rounded-2xl border border-white/30">
                            <ReceiptText className="w-6 h-6 text-white" />
                        </div>
                    </div>

                    {/* Fee Admin */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-amber-50 dark:bg-amber-500/10 border border-amber-100 dark:border-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl">
                                <Percent className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fee (Gross Profit)</p>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumber(Number(data?.totalFee || 0))}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Fee Bunga Bank */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-xl">
                                <Coins className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Fee/Bunga Bank</p>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumber(Number(data?.totalBankFee || 0))}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Biaya Operasional */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 rounded-xl">
                                <TrendingDown className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Total Biaya</p>
                                <h3 className="text-base font-bold text-rose-600 dark:text-rose-400 mt-0.5">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : formatNumber(displayExpense)}
                                </h3>
                            </div>
                        </div>
                    </div>

                    {/* Volume Transaksi */}
                    <div className="bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 text-sky-600 dark:text-sky-400 rounded-xl">
                                <Activity className="w-4 h-4" />
                            </div>
                            <div>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Volume Transaksi</p>
                                <h3 className="text-base font-bold text-slate-800 dark:text-white mt-0.5">
                                    {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : `${formatNumber(Number(data?.salesCount || 0))} Tx`}
                                </h3>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
