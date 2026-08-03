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

            <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                {/* Visual Progress Bar di Atas Card/Tabel saat Revalidating */}
                {isValidating && !isLoading && (
                    <div className="absolute top-0 left-0 right-0 h-0.5 bg-indigo-500/20 overflow-hidden z-20">
                        <div className="w-full h-full bg-indigo-600 animate-pulse" />
                    </div>
                )}

                {/* ========================================================= */}
                {/* 1. KONDISI LOADING (BERLAKU DI HP & DESKTOP) */}
                {/* ========================================================= */}
                {isLoading ? (
                    <div className="p-10 text-center text-slate-400 font-sans">
                        <div className="flex items-center justify-center gap-2">
                            <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                            <span className="text-xs sm:text-sm font-medium">Memuat data saldo cabang...</span>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* ========================================================= */}
                        {/* 2. CARD RINGKASAN TOTAL (UNTUK LAYAR HP MODERAT) */}
                        {/* ========================================================= */}
                        <div className="sm:hidden p-4 bg-slate-50/80 dark:bg-slate-950/40 border-b border-slate-100 dark:border-slate-800 space-y-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">Total Ringkasan Seluruh Cabang</span>
                            <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                    <span className="text-[10px] font-sans text-slate-400 block">Kas (Tunai)</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(totals.cash)}</span>
                                </div>
                                <div className="bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/60 dark:border-slate-800">
                                    <span className="text-[10px] font-sans text-slate-400 block">Saldo Bank</span>
                                    <span className="font-bold text-slate-700 dark:text-slate-200">{formatNumber(totals.bank)}</span>
                                </div>
                            </div>
                            <div className="bg-indigo-50/70 dark:bg-indigo-950/40 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/40 flex justify-between items-center">
                                <span className="text-xs font-bold font-sans text-indigo-950 dark:text-indigo-200">Grand Total</span>
                                <span className="text-sm font-bold font-mono text-indigo-600 dark:text-indigo-400">{formatNumber(totals.grandTotal)}</span>
                            </div>
                        </div>

                        {/* ========================================================= */}
                        {/* 3. TAMPILAN MOBILE: LIST OF CARDS (HANYA MUNCUL DI HP) */}
                        {/* ========================================================= */}
                        <div className="block sm:hidden divide-y divide-slate-100 dark:divide-slate-800/60">
                            {filteredWarehouseBalance && filteredWarehouseBalance.length > 0 ? (
                                filteredWarehouseBalance.map((w, i) => (
                                    <div key={w.id || i} className="p-4 space-y-3">
                                        {/* Header Card (Nama Cabang & Lock Status) */}
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 min-w-0">
                                                <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0">
                                                    <Building2 className="w-4 h-4" />
                                                </div>
                                                <span className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                                                    {i + 1}. {w.name.replace(/^konter\s*/i, "")}
                                                </span>
                                            </div>

                                            {/* Rate & Status */}
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

                                        {/* Body Card (Rincian Saldo) */}
                                        <div className="bg-slate-50/50 dark:bg-slate-850/30 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 grid grid-cols-2 gap-2 text-xs font-mono">
                                            <div>
                                                <span className="text-[10px] font-sans text-slate-400 block">Tunai</span>
                                                <span className="text-slate-700 dark:text-slate-300">{formatNumber(w.cash)}</span>
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-sans text-slate-400 block">Bank</span>
                                                <span className="text-slate-700 dark:text-slate-300">{formatNumber(w.bank)}</span>
                                            </div>
                                            <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 flex justify-between items-center">
                                                <span className="text-[11px] font-sans font-semibold text-slate-500 dark:text-slate-400">Total Saldo</span>
                                                <span className="font-bold text-slate-900 dark:text-slate-100">
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
                        {/* 4. TAMPILAN DESKTOP: TABLE (HANYA MUNCUL DI TABLET/LAPTOP) */}
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
                                    {/* BARIS TOTAL PERTAMA */}
                                    <tr className="bg-slate-50/60 font-bold dark:bg-slate-800/40 text-slate-900 dark:text-slate-100 font-sans">
                                        <td className="px-6 py-4 font-mono uppercase tracking-wider text-[11px]">Total ringkasan</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatNumber(totals.cash)}</td>
                                        <td className="px-6 py-4 text-right font-mono">{formatNumber(totals.bank)}</td>
                                        <td className="px-6 py-4 text-right font-mono text-indigo-600 dark:text-indigo-400">
                                            {formatNumber(totals.grandTotal)}
                                        </td>
                                        <td className="px-6 py-4"></td>
                                        <td className="px-6 py-4"></td>
                                    </tr>

                                    {/* DAFTAR WAREHOUSE */}
                                    {filteredWarehouseBalance && filteredWarehouseBalance.length > 0 ? (
                                        filteredWarehouseBalance.map((w, i) => (
                                            <tr
                                                key={w.id || i}
                                                className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150 font-sans"
                                            >
                                                <td className="px-6 py-4 font-medium text-slate-800 dark:text-slate-200">
                                                    {i + 1}. {w.name.replace(/^konter\s*/i, "")}
                                                </td>
                                                <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">{formatNumber(w.cash)}</td>
                                                <td className="px-6 py-4 text-right font-mono text-slate-600 dark:text-slate-300">{formatNumber(w.bank)}</td>
                                                <td className="px-6 py-4 text-right font-mono font-semibold text-slate-900 dark:text-slate-100">
                                                    {formatNumber((w.cash || 0) + (w.bank || 0))}
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
                    </>
                )}
            </div>
        </>
    );
};

export default WarehouseBalance;
