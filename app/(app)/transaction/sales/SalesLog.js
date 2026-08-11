"use client";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import axios from "@/app/utils/axios";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, Calendar, Package2, Search, Tag, Trash2, TrendingUp, ShoppingBag, BarChart3, X } from "lucide-react";
import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Category chip filters ──────────────────────────────────────────────────
const CATEGORIES = [
    { value: "all", label: "Semua" },
    { value: "Voucher & SP", label: "Voucher & SP" },
    { value: "Accessories", label: "Accessories" },
    { value: "Kabel Data", label: "Kabel Data" },
    { value: "Charger", label: "Charger" },
];

const SalesLog = ({ txByWarehouse, mutate, mutateJournal, notification }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [txToDelete, setTxToDelete] = useState(null);

    const filteredTransactions = useMemo(() => {
        return (
            txByWarehouse.list?.filter((tx) => {
                const matchesSearch = tx.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;
                const matchesCategory = categoryFilter === "all" || tx.product?.category === categoryFilter;
                return matchesSearch && matchesCategory;
            }) ?? []
        );
    }, [txByWarehouse.list, searchTerm, categoryFilter]);

    // ─── Summary stats ────────────────────────────────────────────────────────
    const totalRevenue = useMemo(() => filteredTransactions.reduce((s, tx) => s + tx.price * Math.abs(tx.quantity), 0), [filteredTransactions]);
    const totalCost = useMemo(() => filteredTransactions.reduce((s, tx) => s + tx.cost * Math.abs(tx.quantity), 0), [filteredTransactions]);
    const totalProfit = totalRevenue - totalCost;
    const totalQty = useMemo(() => filteredTransactions.reduce((s, tx) => s + Math.abs(tx.quantity), 0), [filteredTransactions]);

    const handleDeleteTrx = async (id) => {
        try {
            const response = await axios.delete(`/api/transactions/${id}`);
            notification(response.data.message);
            mutate();
            mutateJournal();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <div className="space-y-4">
            {/* ─── Filter Bar ──────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs"
            >
                {/* Search input */}
                <div className="relative">
                    <Search className="absolute inset-y-0 left-3 my-auto h-4 w-4 text-slate-400 dark:text-slate-500" />
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari nama produk..."
                        className="w-full rounded-xl border border-slate-200 bg-slate-50/50 py-2 pl-9 pr-9 text-xs font-medium text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:bg-slate-800 transition-all"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-3 my-auto text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        >
                            <X size={14} />
                        </button>
                    )}
                </div>

                {/* Category chip filters */}
                <div className="flex items-center gap-2 flex-wrap">
                    {CATEGORIES.map((cat) => {
                        const isActive = categoryFilter === cat.value;
                        return (
                            <button
                                key={cat.value}
                                type="button"
                                onClick={() => setCategoryFilter(cat.value)}
                                className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                                    isActive
                                        ? "text-amber-700 dark:text-amber-300"
                                        : "text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800"
                                }`}
                            >
                                {isActive && (
                                    <motion.span
                                        layoutId="salesCategoryChip"
                                        className="absolute inset-0 rounded-full bg-amber-100 dark:bg-amber-900/40 border border-amber-200 dark:border-amber-800/60"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">{cat.label}</span>
                            </button>
                        );
                    })}
                    {(searchTerm || categoryFilter !== "all") && (
                        <button
                            type="button"
                            onClick={() => {
                                setSearchTerm("");
                                setCategoryFilter("all");
                            }}
                            className="px-3 py-1.5 rounded-full text-[10px] font-semibold text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors"
                        >
                            Reset
                        </button>
                    )}
                </div>
            </motion.div>

            {/* ─── Summary Stats ────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.08, duration: 0.25 }}
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
            >
                {[
                    {
                        label: "Total Item Terjual",
                        value: `${totalQty} pcs`,
                        icon: ShoppingBag,
                        color: "text-indigo-600 dark:text-indigo-400",
                        bg: "bg-indigo-50 dark:bg-indigo-950/40",
                    },
                    {
                        label: "Total Transaksi",
                        value: filteredTransactions.length,
                        icon: BarChart3,
                        color: "text-violet-600 dark:text-violet-400",
                        bg: "bg-violet-50 dark:bg-violet-950/40",
                    },
                    {
                        label: "Total Pendapatan",
                        value: formatRupiah(totalRevenue),
                        icon: TrendingUp,
                        color: "text-amber-600 dark:text-amber-400",
                        bg: "bg-amber-50 dark:bg-amber-950/40",
                    },
                    {
                        label: "Total Profit",
                        value: formatRupiah(totalProfit),
                        icon: BarChart3,
                        color: "text-emerald-600 dark:text-emerald-400",
                        bg: "bg-emerald-50 dark:bg-emerald-950/40",
                    },
                ].map((stat, i) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.1 + i * 0.05, duration: 0.2 }}
                        className={`flex items-center gap-3 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 ${stat.bg}`}
                    >
                        <div className={`p-2 rounded-xl bg-white/60 dark:bg-slate-900/40 ${stat.color}`}>
                            <stat.icon size={15} strokeWidth={2.2} />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 leading-tight">{stat.label}</p>
                            <p className={`text-xs font-bold font-mono truncate ${stat.color}`}>{stat.value}</p>
                        </div>
                    </motion.div>
                ))}
            </motion.div>

            {/* ─── Table ────────────────────────────────────────────────────── */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.18, duration: 0.3 }}
                className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
            >
                <div className="w-full">
                    {/* ========================================== */}
                    {/* 1. TAMPILAN MOBILE (Card Stack)            */}
                    {/* ========================================== */}
                    <div className="block md:hidden space-y-3">
                        <AnimatePresence mode="popLayout" initial={false}>
                            {filteredTransactions.length === 0 ? (
                                <motion.div
                                    key="empty-mobile"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="rounded-2xl border border-slate-200/80 bg-white/80 p-8 text-center shadow-xs dark:border-slate-800 dark:bg-slate-900/80"
                                >
                                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                                        <AlertCircle className="h-7 w-7 text-slate-300 dark:text-slate-700" />
                                        <p className="text-xs font-semibold">Tidak ada transaksi</p>
                                        <p className="text-[10px] text-slate-400">Coba ubah filter atau kata kunci pencarian</p>
                                    </div>
                                </motion.div>
                            ) : (
                                filteredTransactions.map((tx, i) => {
                                    const profit = tx.price - tx.cost;
                                    const profitPositive = profit >= 0;

                                    return (
                                        <motion.div
                                            key={`mobile-${tx.id}`}
                                            layout
                                            initial={{ opacity: 0, y: 6 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.98 }}
                                            transition={{ delay: i * 0.025, duration: 0.2 }}
                                            className="relative rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80"
                                        >
                                            {/* Header Card: Produk, Kategori & Tombol Hapus */}
                                            <div className="flex items-start justify-between gap-2 border-b border-slate-100 pb-3 dark:border-slate-800/60">
                                                <div className="min-w-0 flex-1">
                                                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">{tx.product?.name}</h4>
                                                    <div className="mt-1 flex flex-wrap items-center gap-2">
                                                        {/* Badge Kategori */}
                                                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400">
                                                            <Tag className="h-2.5 w-2.5" />
                                                            {tx.product?.category ?? "-"}
                                                        </span>
                                                        {/* Waktu */}
                                                        <span className="flex items-center gap-1 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                                                            <Calendar className="h-2.5 w-2.5 shrink-0" />
                                                            {formatDateTime(tx.date_issued)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Tombol Hapus (Langsung Terlihat di Mobile Tanpa Hover) */}
                                                <motion.button
                                                    whileTap={{ scale: 0.9 }}
                                                    type="button"
                                                    onClick={() => setTxToDelete(tx.id)}
                                                    className="shrink-0 p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-all"
                                                >
                                                    <Trash2 size={15} strokeWidth={2} />
                                                </motion.button>
                                            </div>

                                            {/* Rincian Angka Transaksi (Grid 2x2) */}
                                            <div className="mt-3 grid grid-cols-2 gap-2 rounded-xl bg-slate-50/80 p-2.5 dark:bg-slate-950/40">
                                                {/* Qty & Harga Jual */}
                                                <div>
                                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">Qty / Harga Jual</span>
                                                    <div className="mt-0.5 flex items-baseline gap-1">
                                                        <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                            {Math.abs(tx.quantity)}x
                                                        </span>
                                                        <span className="text-[11px] font-mono text-slate-600 dark:text-slate-400">
                                                            ({formatNumber(tx.price)})
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Modal */}
                                                <div>
                                                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 block">Modal</span>
                                                    <span className="mt-0.5 block font-mono text-xs text-slate-600 dark:text-slate-400">
                                                        {formatNumber(tx.cost)}
                                                    </span>
                                                </div>

                                                {/* Profit (Full Width / Highlighted) */}
                                                <div className="col-span-2 border-t border-slate-200/60 pt-2 dark:border-slate-800/60 flex items-center justify-between mt-1">
                                                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Profit Bersih</span>
                                                    <span
                                                        className={`font-mono text-xs font-bold ${
                                                            profitPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                                                        }`}
                                                    >
                                                        {profitPositive ? "+" : ""}
                                                        {formatRupiah(profit)}
                                                    </span>
                                                </div>
                                            </div>
                                        </motion.div>
                                    );
                                })
                            )}
                        </AnimatePresence>

                        {/* Summary Total Card di Mobile */}
                        {filteredTransactions.length > 0 && (
                            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/60 p-4 shadow-xs mt-3">
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-2">
                                    Total Ringkasan ({filteredTransactions.length} transaksi)
                                </p>
                                <div className="grid grid-cols-2 gap-3 text-xs">
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Total Qty</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{totalQty} pcs</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Total Revenue</span>
                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{formatRupiah(totalRevenue)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Total Modal</span>
                                        <span className="font-mono font-bold text-slate-500 dark:text-slate-400">{formatRupiah(totalCost)}</span>
                                    </div>
                                    <div>
                                        <span className="text-[10px] text-slate-400 block">Total Profit</span>
                                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">{formatRupiah(totalProfit)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* ========================================== */}
                    {/* 2. TAMPILAN DESKTOP (Table Asli)           */}
                    {/* ========================================== */}
                    <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/30">
                                        <th scope="col" className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <Package2 size={11} />
                                                <span>Produk</span>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-5 py-3.5">
                                            <div className="flex items-center gap-1.5">
                                                <Tag size={11} />
                                                <span>Kategori</span>
                                            </div>
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-center">
                                            Qty
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-right">
                                            Harga Jual
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-right">
                                            Modal
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-right">
                                            Profit
                                        </th>
                                        <th scope="col" className="px-5 py-3.5 text-center w-14"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <AnimatePresence mode="popLayout" initial={false}>
                                        {filteredTransactions.length === 0 ? (
                                            <motion.tr key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                <td colSpan={7} className="px-6 py-14 text-center">
                                                    <div className="flex flex-col items-center gap-2 text-slate-400 dark:text-slate-500">
                                                        <AlertCircle className="h-7 w-7 text-slate-300 dark:text-slate-700" />
                                                        <p className="text-xs font-semibold">Tidak ada transaksi</p>
                                                        <p className="text-[10px] text-slate-400">Coba ubah filter atau kata kunci pencarian</p>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ) : (
                                            filteredTransactions.map((tx, i) => {
                                                const profit = tx.price - tx.cost;
                                                const profitPositive = profit >= 0;
                                                return (
                                                    <motion.tr
                                                        key={tx.id}
                                                        layout
                                                        initial={{ opacity: 0, y: 6 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        exit={{ opacity: 0, scale: 0.98 }}
                                                        transition={{ delay: i * 0.025, duration: 0.2 }}
                                                        className="border-b border-slate-100 dark:border-slate-800/60 hover:bg-amber-50/30 dark:hover:bg-amber-950/10 transition-colors group"
                                                    >
                                                        {/* Product */}
                                                        <td className="px-5 py-3.5 max-w-50">
                                                            <p className="font-semibold text-xs text-slate-800 dark:text-slate-100 truncate">
                                                                {tx.product?.name}
                                                            </p>
                                                            <span className="flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                                                                <Calendar className="h-2.5 w-2.5 shrink-0" />
                                                                {formatDateTime(tx.date_issued)}
                                                            </span>
                                                        </td>

                                                        {/* Category */}
                                                        <td className="px-5 py-3.5 whitespace-nowrap">
                                                            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-semibold text-amber-700 border border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50 dark:text-amber-400">
                                                                <Tag className="h-2.5 w-2.5" />
                                                                {tx.product?.category ?? "-"}
                                                            </span>
                                                        </td>

                                                        {/* Qty */}
                                                        <td className="px-5 py-3.5 text-center">
                                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono">
                                                                {Math.abs(tx.quantity)}
                                                            </span>
                                                        </td>

                                                        {/* Price */}
                                                        <td className="px-5 py-3.5 text-right">
                                                            <span className="text-xs font-mono text-slate-700 dark:text-slate-300">
                                                                {formatNumber(tx.price)}
                                                            </span>
                                                        </td>

                                                        {/* Cost */}
                                                        <td className="px-5 py-3.5 text-right">
                                                            <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
                                                                {formatNumber(tx.cost)}
                                                            </span>
                                                        </td>

                                                        {/* Profit */}
                                                        <td className="px-5 py-3.5 text-right">
                                                            <span
                                                                className={`text-xs font-bold font-mono ${profitPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"}`}
                                                            >
                                                                {profitPositive ? "+" : ""}
                                                                {formatRupiah(profit)}
                                                            </span>
                                                        </td>

                                                        {/* Delete */}
                                                        <td className="px-5 py-3.5 text-center">
                                                            <motion.button
                                                                whileHover={{ scale: 1.1 }}
                                                                whileTap={{ scale: 0.9 }}
                                                                type="button"
                                                                onClick={() => setTxToDelete(tx.id)}
                                                                className="p-1.5 rounded-lg text-slate-300 dark:text-slate-700 hover:text-rose-500 hover:bg-rose-50 dark:hover:text-rose-400 dark:hover:bg-rose-950/30 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 size={14} strokeWidth={2} />
                                                            </motion.button>
                                                        </td>
                                                    </motion.tr>
                                                );
                                            })
                                        )}
                                    </AnimatePresence>
                                </tbody>
                                {filteredTransactions.length > 0 && (
                                    <tfoot>
                                        <tr className="border-t-2 border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-950/30 text-xs font-bold">
                                            <td className="px-5 py-3 text-slate-500 dark:text-slate-400" colSpan={2}>
                                                Total ({filteredTransactions.length} transaksi)
                                            </td>
                                            <td className="px-5 py-3 text-center font-mono text-slate-700 dark:text-slate-300">{totalQty}</td>
                                            <td className="px-5 py-3 text-right font-mono text-slate-700 dark:text-slate-300">{formatRupiah(totalRevenue)}</td>
                                            <td className="px-5 py-3 text-right font-mono text-slate-500 dark:text-slate-400">{formatRupiah(totalCost)}</td>
                                            <td className="px-5 py-3 text-right font-mono text-emerald-600 dark:text-emerald-400">
                                                {formatRupiah(totalProfit)}
                                            </td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                )}
                            </table>
                        </div>
                    </div>
                </div>
            </motion.div>

            <ConfirmDialog
                isOpen={txToDelete !== null}
                onClose={() => setTxToDelete(null)}
                onConfirm={() => {
                    if (txToDelete) {
                        handleDeleteTrx(txToDelete);
                        setTxToDelete(null);
                    }
                }}
                title="Hapus Transaksi"
                description="Apakah Anda yakin ingin menghapus transaksi ini? Tindakan ini tidak dapat dibatalkan."
            />
        </div>
    );
};

export default SalesLog;
