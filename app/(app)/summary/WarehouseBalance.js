"use client";
import Dropdown from "@/app/components/Dropdown";
import { changeLockStatus } from "@/app/hooks/JournalActionService";
import { useWarehouseBalance } from "@/app/hooks/useWarehouseBalance";
import useWarehouseZone from "@/app/hooks/useWarehouseZone";
import { DateTimeNow, formatNumber, todayDate } from "@/app/utils/format";
import { getStorePerformanceRating } from "@/app/utils/GetStorePerformanceRating";
import { Building2, Calendar, Loader2, Lock, Search, Unlock } from "lucide-react";
import { useMemo, useState } from "react";

const WarehouseBalance = () => {
    // const { today } = DateTimeNow();
    const today = todayDate();
    const [selectedDate, setSelectedDate] = useState(today);
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState("all");
    const [zone, setZone] = useState("all");
    const { zones } = useWarehouseZone();

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: 1, label: "Unlocked" },
        { value: 0, label: "Locked" },
    ];

    const zoneOptions = [
        { value: "all", label: "All Zones" },
        ...zones.map((zone) => ({
            value: zone.id,
            label: zone.zone_name,
        })),
    ];

    const getLimitColor = (percent) => {
        if (percent >= 80) return "bg-green-500";
        if (percent >= 40) return "bg-yellow-400";
        return "bg-red-500";
    };

    // 2. Helper Warna Teks menyesuaikan warna bar
    const getLimitTextColor = (percent) => {
        if (percent >= 80) return "text-emerald-600 dark:text-emerald-400 font-semibold";
        if (percent >= 40) return "text-amber-600 dark:text-amber-400 font-medium";
        return "text-rose-600 dark:text-rose-400 font-bold";
    };

    // 3. Sub-komponen Visual Limit Progress Bar
    const CashLimitProgress = ({ cash = 0, limit = 0, adjust = 2.1, calculateLimitPercentage }) => {
        if (!limit || limit <= 0) {
            return <span className="text-slate-400 font-sans text-[10px]">No Limit</span>;
        }

        const percentage = calculateLimitPercentage(cash, limit, adjust);

        return (
            <div className="flex flex-col items-end gap-1 min-w-25">
                {/* Teks Persentase */}
                <div className="flex items-center gap-1 text-[10px] font-mono">
                    <span className="text-slate-400 font-sans text-[9px]">Stock:</span>
                    <span className={getLimitTextColor(percentage)}>{percentage}%</span>
                </div>

                {/* Track & Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-300 ${getLimitColor(percentage)}`}
                        style={{ width: `${Math.min(100, percentage)}%` }}
                    />
                </div>
            </div>
        );
    };

    const calculateLimitPercentage = (cash, limit, adjust = 1) => {
        // Cegah pembagian dengan nol atau limit invalid
        if (!limit || limit <= 0 || adjust <= 0) return 0;

        const effectiveLimit = limit * adjust;
        const percentage = (cash / effectiveLimit) * 100;

        // Mengembalikan angka bulat (number) tanpa batas atas 100%
        return Math.round(percentage);
    };

    const { warehouseBalance, error, isLoading, isValidating, mutate } = useWarehouseBalance(selectedDate);
    const filteredWarehouseBalance = useMemo(() => {
        return warehouseBalance?.warehouse?.filter((item) => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = status === "all" || item.is_open === status;
            const matchesZone = zone === "all" || item.zone_id === zone;
            return matchesSearch && matchesStatus && matchesZone;
        });
    }, [warehouseBalance, searchTerm, status, zone]);

    const totals = useMemo(() => {
        if (!filteredWarehouseBalance) return { cash: 0, bank: 0, grandTotal: 0 };
        return filteredWarehouseBalance.reduce(
            (acc, curr) => {
                const cash = curr.cash || 0;
                const bank = curr.bank || 0;
                acc.cash += cash;
                acc.bank += bank;
                acc.grandTotal += cash + bank;
                return acc;
            },
            { cash: 0, bank: 0, grandTotal: 0 },
        );
    }, [filteredWarehouseBalance]);

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
                    {/* Status Dropdown */}
                    <div>
                        <Dropdown
                            id="stock-status-filter"
                            label="Stock Status Filter"
                            options={statusOptions}
                            selectedValue={status}
                            onChange={(val) => setStatus(val)}
                            ariaLabel="Filter warehouse by status"
                        />
                    </div>
                    {/* Zone Dropdown */}
                    <div>
                        <Dropdown
                            id="zone-filter"
                            label="Zone Filter"
                            options={zoneOptions}
                            selectedValue={zone}
                            onChange={(val) => setZone(val)}
                            ariaLabel="Filter warehouse by zone"
                        />
                    </div>
                </div>

                {/* Action Area: Date Picker + Background Refresh Indicator */}
                <div className="flex items-center gap-3">
                    {/* Indicator saat data sedang diperbarui di background */}
                    {isValidating && !isLoading && (
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/40">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span className="hidden sm:inline">Refreshing...</span>
                        </div>
                    )}

                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            placeholder="Select date..."
                            aria-label="Select date"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-4">
                {/* Visual Progress Bar (SWR/Revalidating Indicator) */}
                {isValidating && !isLoading && (
                    <div className="h-0.5 w-full bg-indigo-500/20 overflow-hidden rounded-full">
                        <div className="w-full h-full bg-indigo-600 animate-pulse" />
                    </div>
                )}

                {/* ========================================================= */}
                {/* 1. KONDISI LOADING */}
                {/* ========================================================= */}
                {isLoading ? (
                    <div className="p-10 text-center text-slate-400 font-sans rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                            <span className="text-xs sm:text-sm font-medium">Memuat data saldo cabang...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ========================================================= */}
                        {/* 2. SUMMARY CARDS TOTAL RINGKASAN */}
                        {/* ========================================================= */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            {/* Total Kas Tunai */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Kas (Tunai)</span>
                                <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">{formatNumber(totals.cash)}</p>
                            </div>

                            {/* Total Saldo Bank */}
                            <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs flex flex-col justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Saldo Bank</span>
                                <p className="text-lg font-bold font-mono text-slate-800 dark:text-slate-100 mt-1">{formatNumber(totals.bank)}</p>
                            </div>

                            {/* Grand Total */}
                            <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-800/40 border border-indigo-200/60 dark:border-indigo-900/40 shadow-2xs flex flex-col justify-between">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                                    Grand Total Seluruh Cabang
                                </span>
                                <p className="text-lg font-bold font-mono text-indigo-700 dark:text-indigo-300 mt-1">{formatNumber(totals.grandTotal)}</p>
                            </div>
                        </div>

                        {/* MAIN DATA CONTAINER */}
                        <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                            {/* ========================================================= */}
                            {/* 3. TAMPILAN MOBILE: LIST OF CARDS */}
                            {/* ========================================================= */}
                            <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                                {filteredWarehouseBalance && filteredWarehouseBalance.length > 0 ? (
                                    filteredWarehouseBalance.map((w, i) => (
                                        <div key={w.id || i} className="p-4 space-y-3">
                                            {/* Header Card */}
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-2 min-w-0">
                                                    <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                                        <Building2 className="w-4 h-4" />
                                                    </div>
                                                    <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                                                        {i + 1}. {w.name.replace(/^konter\s*/i, "")}
                                                    </span>
                                                </div>

                                                <div className="flex items-center gap-2 shrink-0">
                                                    {getStorePerformanceRating(w.average_profit)}

                                                    {w.id !== 1 && (
                                                        <button
                                                            type="button"
                                                            onClick={async () => {
                                                                await changeLockStatus(w.id);
                                                                mutate();
                                                            }}
                                                            className={`inline-flex items-center justify-center gap-1 px-2.5 py-1 rounded-full border text-[10px] font-semibold transition-all cursor-pointer ${
                                                                w.is_open
                                                                    ? "border-emerald-200 bg-emerald-50/50 text-emerald-600 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
                                                                    : "border-rose-200 bg-rose-50/50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400"
                                                            }`}
                                                        >
                                                            {w.is_open ? <Unlock size={11} /> : <Lock size={11} />}
                                                            <span>{w.is_open ? "Unlocked" : "Locked"}</span>
                                                        </button>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Body Card */}
                                            <div className="bg-slate-50/50 dark:bg-slate-850/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 space-y-2.5">
                                                {/* Tunai + Limit Progress */}
                                                <div className="flex justify-between items-center text-xs">
                                                    <div>
                                                        <span className="text-[10px] font-sans text-slate-400 block">Tunai</span>
                                                        <span className="text-slate-700 dark:text-slate-300 font-mono font-semibold">
                                                            {formatNumber(w.cash)}
                                                        </span>
                                                    </div>

                                                    <CashLimitProgress
                                                        cash={w.cash}
                                                        limit={w.total_cash_limit}
                                                        calculateLimitPercentage={calculateLimitPercentage}
                                                    />
                                                </div>

                                                {/* Bank */}
                                                <div className="flex justify-between items-center text-xs pt-2 border-t border-slate-200/40 dark:border-slate-800/50">
                                                    <div>
                                                        <span className="text-[10px] font-sans text-slate-400 block">Bank</span>
                                                        <span className="text-slate-700 dark:text-slate-300 font-mono">{formatNumber(w.bank)}</span>
                                                    </div>
                                                </div>

                                                {/* Total Saldo */}
                                                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                                                    <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400">Total Saldo</span>
                                                    <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                                                        {formatNumber((w.cash || 0) + (w.bank || 0))}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-6 text-center text-slate-400 font-sans text-xs">Tidak ada data cabang yang ditemukan.</div>
                                )}
                            </div>

                            {/* ========================================================= */}
                            {/* 4. TAMPILAN DESKTOP: TABLE */}
                            {/* ========================================================= */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                            <th scope="col" className="px-6 py-4 text-left">
                                                Cabang
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right">
                                                Kas (Tunai)
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right">
                                                Saldo Bank
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right">
                                                Total
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-center">
                                                Lock Status
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-center">
                                                Rate
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 font-mono">
                                        {filteredWarehouseBalance && filteredWarehouseBalance.length > 0 ? (
                                            filteredWarehouseBalance.map((w, i) => (
                                                <tr
                                                    key={w.id || i}
                                                    className="group hover:bg-slate-50/40 dark:hover:bg-slate-800/20 transition-colors duration-150 font-sans"
                                                >
                                                    <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                                        <div className="flex items-center gap-3">
                                                            {/* Avatar / Numbered Badge */}
                                                            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 border border-indigo-100 dark:border-indigo-900/40 shadow-2xs">
                                                                {String(i + 1).padStart(2, "0")}
                                                            </div>

                                                            {/* Nama Cabang & Sub-info */}
                                                            <div className="min-w-0">
                                                                <span className="font-bold text-slate-800 dark:text-slate-100 block truncate leading-snug">
                                                                    {w.name.replace(/^konter\s*/i, "")}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono block">
                                                                    ID: #{w.id}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </td>

                                                    {/* Kolom Kas (Tunai) + Visual Progress Bar */}
                                                    <td className="px-6 py-4 text-right font-mono">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-slate-700 dark:text-slate-200 font-semibold">{formatNumber(w.cash)}</span>
                                                            <CashLimitProgress
                                                                cash={w.cash}
                                                                limit={w.total_cash_limit}
                                                                calculateLimitPercentage={calculateLimitPercentage}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-right font-mono">
                                                        <div className="flex flex-col items-end gap-1">
                                                            <span className="text-slate-700 dark:text-slate-200 font-semibold">{formatNumber(w.bank)}</span>
                                                            <CashLimitProgress
                                                                cash={w.bank}
                                                                limit={w.total_bank_limit}
                                                                adjust={1}
                                                                calculateLimitPercentage={calculateLimitPercentage}
                                                            />
                                                        </div>
                                                    </td>

                                                    <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                                                        {/* Nominal Total Saldo */}
                                                        <span>{formatNumber((Number(w.cash) || 0) + (Number(w.bank) || 0))}</span>

                                                        {(() => {
                                                            // 1. Ambil nilai saldo & limit dengan konversi ke Number yang aman
                                                            const cash = Number(w.cash) || 0;
                                                            const bank = Number(w.bank) || 0;
                                                            const totalBalance = cash + bank;
                                                            const limit = Number(w.total_limit) || 0;

                                                            // 2. Jika total_limit tidak diisi atau 0, tampilkan "No Limit"
                                                            if (!limit || limit <= 0) {
                                                                return <span className="text-[10px] text-slate-400 font-sans block font-normal">No Limit</span>;
                                                            }

                                                            // 3. Hitung persentase terpakai
                                                            const percentUsed = Math.round((totalBalance / limit) * 100);
                                                            const isOver = percentUsed > 100;
                                                            const remainingPercent = 100 - percentUsed;

                                                            return (
                                                                <div className="flex items-center justify-end gap-1 mt-0.5 font-sans">
                                                                    {/* Status Over / Sisa */}
                                                                    {isOver ? (
                                                                        <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                                                            +{Math.abs(remainingPercent)}%
                                                                        </span>
                                                                    ) : (
                                                                        <span className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400">
                                                                            -{remainingPercent}%
                                                                        </span>
                                                                    )}

                                                                    {/* Persentase Terpakai dalam kurung */}
                                                                    <span className="text-[9px] text-slate-400 dark:text-slate-500 font-mono">
                                                                        ({percentUsed}%)
                                                                    </span>
                                                                </div>
                                                            );
                                                        })()}
                                                    </td>

                                                    <td className="px-6 py-4 text-center">
                                                        {w.id !== 1 && (
                                                            <div className="flex items-center justify-center">
                                                                <button
                                                                    type="button"
                                                                    onClick={async () => {
                                                                        await changeLockStatus(w.id);
                                                                        mutate();
                                                                    }}
                                                                    className={`inline-flex items-center justify-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold transition-all cursor-pointer ${
                                                                        w.is_open
                                                                            ? "border-emerald-200 bg-emerald-50/50 text-emerald-600 hover:bg-emerald-100 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-400"
                                                                            : "border-rose-200 bg-rose-50/50 text-rose-600 hover:bg-rose-100 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-400"
                                                                    }`}
                                                                >
                                                                    {w.is_open ? (
                                                                        <>
                                                                            <Unlock size={13} />
                                                                            <span>Unlocked</span>
                                                                        </>
                                                                    ) : (
                                                                        <>
                                                                            <Lock size={13} />
                                                                            <span>Locked</span>
                                                                        </>
                                                                    )}
                                                                </button>
                                                            </div>
                                                        )}
                                                    </td>

                                                    <td className="px-6 py-4 text-center">{getStorePerformanceRating(w.average_profit)}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-8 text-center text-slate-400 font-sans">
                                                    Tidak ada data cabang yang ditemukan.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default WarehouseBalance;
