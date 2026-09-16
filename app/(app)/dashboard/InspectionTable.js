/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect, useMemo, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    FileText,
    Tag,
    CreditCard,
    Coins,
    MoreHorizontal,
    Calendar,
    ArrowRightLeft,
    FileWarning,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    User,
    Plus,
    Loader2,
    RefreshCw,
    Search,
    CheckSquare,
    Square,
    X,
    CheckCircle2,
} from "lucide-react";

import { useTransactions } from "@/app/hooks/useTransactions";
import { useAccounts } from "@/app/hooks/useAccounts";
import useWarehouse from "@/app/hooks/useWarehouse";
import Dropdown from "@/app/components/Dropdown";
import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import { calculateFee, DateTimeNow, formatDateTime, formatNumber, getShortName } from "@/app/utils/format";
import axios from "@/app/utils/axios";

export default function InspectionTable({ onOpenCreateModal }) {
    const { today } = DateTimeNow();

    // --- Filters State ---
    const [selectedWarehouse, setSelectedWarehouse] = useState(1);
    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: today,
        endDate: today,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [categoryFilter] = useState("all");

    // --- Table States ---
    const [loading, setLoading] = useState(false);
    const [selectedJournalIds, setSelectedJournalIds] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);
    const [toastMessage, setToastMessage] = useState(null);

    // --- Data Fetching ---
    const { warehouses = [] } = useWarehouse();
    const { accounts = [] } = useAccounts();
    const { journalByWarehouse, isLoading, isValidating, mutate } = useTransactions({
        selectedWarehouse,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
    });

    // --- Options & Memos ---
    const warehouseCashId = useMemo(() => {
        return warehouses.find((w) => w.id === selectedWarehouse)?.primary_cash?.id;
    }, [warehouses, selectedWarehouse]);

    const warehouseOptions = useMemo(
        () => [{ value: "all", label: "Semua Cabang" }, ...warehouses.filter((w) => w.status === 1).map((w) => ({ value: w.id, label: w.name }))],
        [warehouses],
    );

    const whAccounts = useMemo(() => {
        return accounts.filter((acc) => acc.warehouse_id === selectedWarehouse);
    }, [accounts, selectedWarehouse]);

    const whAccountIdsSet = useMemo(() => {
        return new Set(whAccounts.map((acc) => Number(acc?.id)).filter((id) => !isNaN(id) && id > 0));
    }, [whAccounts]);

    const accountOptions = useMemo(
        () => [{ value: "all", label: "Semua Akun" }, ...whAccounts.map((acc) => ({ value: acc.id, label: acc.group }))],
        [whAccounts],
    );

    // --- Filtered Data ---
    const filteredTransactions = useMemo(() => {
        if (!journalByWarehouse) return [];
        const term = searchTerm.toLowerCase().trim();

        return journalByWarehouse.filter((journal) => {
            const matchAccount =
                accountFilter === "all" || Number(journal.cred_id) === Number(accountFilter) || Number(journal.debt_id) === Number(accountFilter);

            const matchCategory = categoryFilter === "all" || journal.trx_type === categoryFilter;

            const matchSearch =
                !term ||
                (journal.debt?.name ?? "").toLowerCase().includes(term) ||
                (journal.cred?.name ?? "").toLowerCase().includes(term) ||
                (journal.description ?? "").toLowerCase().includes(term) ||
                String(journal.id ?? "")
                    .toLowerCase()
                    .includes(term) ||
                (journal.invoice ?? "").toLowerCase().includes(term) ||
                String(journal.amount ?? "")
                    .toLowerCase()
                    .includes(term) ||
                (journal.transaction ?? []).some((t) => (t.product?.name ?? "").toLowerCase().includes(term));

            return matchAccount && matchCategory && matchSearch;
        });
    }, [journalByWarehouse, accountFilter, categoryFilter, searchTerm]);

    // Reset pagination when data changes length
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredTransactions.length]);

    // --- Pagination Computations ---
    const totalPages = useMemo(() => {
        if (pageSize === "all") return 1;
        return Math.max(1, Math.ceil(filteredTransactions.length / Number(pageSize)));
    }, [filteredTransactions.length, pageSize]);

    const paginatedTransactions = useMemo(() => {
        if (pageSize === "all") return filteredTransactions;
        const start = (currentPage - 1) * Number(pageSize);
        return filteredTransactions.slice(start, start + Number(pageSize));
    }, [filteredTransactions, currentPage, pageSize]);

    const startItemIndex = useMemo(() => {
        if (filteredTransactions.length === 0) return 0;
        if (pageSize === "all") return 1;
        return (currentPage - 1) * Number(pageSize) + 1;
    }, [filteredTransactions.length, currentPage, pageSize]);

    const endItemIndex = useMemo(() => {
        if (pageSize === "all") return filteredTransactions.length;
        return Math.min(currentPage * Number(pageSize), filteredTransactions.length);
    }, [filteredTransactions.length, currentPage, pageSize]);

    // --- Batch Selection Handlers ---
    const isAllSelected = useMemo(() => {
        if (paginatedTransactions.length === 0) return false;
        return paginatedTransactions.every((tx) => selectedJournalIds.includes(tx.id));
    }, [paginatedTransactions, selectedJournalIds]);

    const toggleSelectAll = useCallback(() => {
        if (isAllSelected) {
            const currentPageIds = new Set(paginatedTransactions.map((tx) => tx.id));
            setSelectedJournalIds((prev) => prev.filter((id) => !currentPageIds.has(id)));
        } else {
            const currentPageIds = paginatedTransactions.map((tx) => tx.id);
            setSelectedJournalIds((prev) => Array.from(new Set([...prev, ...currentPageIds])));
        }
    }, [isAllSelected, paginatedTransactions]);

    const toggleSelectRow = useCallback((id) => {
        setSelectedJournalIds((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
    }, []);

    // --- Batch Action API ---
    const handleConfirmSelected = async () => {
        if (!confirm(`Konfirmasi ${selectedJournalIds.length} jurnal terdepan?`)) return;
        setLoading(true);
        try {
            const response = await axios.post("/api/update-confirm-status-batch", {
                journal_ids: selectedJournalIds,
            });
            setToastMessage(response.data.message || "Berhasil mengonfirmasi transaksi!");
            setSelectedJournalIds([]);
            mutate();
        } catch (err) {
            setToastMessage(err.response?.data?.message || "Gagal mengonfirmasi transaksi.");
        } finally {
            setLoading(false);
            setTimeout(() => setToastMessage(null), 4000);
        }
    };

    const getCategoryBadgeClass = (trxType) => {
        switch (trxType) {
            case "Mutasi Kas":
                return "bg-indigo-50/80 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border-indigo-200/60 dark:border-indigo-900/50";
            case "Transfer Uang":
                return "bg-sky-50/80 text-sky-700 dark:bg-sky-950/50 dark:text-sky-300 border-sky-200/60 dark:border-sky-900/50";
            case "Tarik Tunai":
                return "bg-amber-50/80 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200/60 dark:border-amber-900/50";
            case "Deposit":
                return "bg-emerald-50/80 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-900/50";
            default:
                return "bg-slate-100/80 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/50";
        }
    };

    return (
        <div className="space-y-5">
            {/* Notification Toast */}
            <AnimatePresence>
                {toastMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-5 right-5 z-50 flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-3 shadow-xl dark:bg-slate-100 dark:text-slate-900"
                    >
                        <AlertCircle className="h-4 w-4 text-indigo-400 dark:text-indigo-600" />
                        <span className="text-xs font-medium">{toastMessage}</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Selection Floating Bar */}
            <AnimatePresence>
                {selectedJournalIds.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 30, scale: 0.95 }}
                        className="fixed bottom-6 sm:left-22 z-40 flex items-center gap-3 rounded-2xl bg-slate-900/90 p-2 pl-4 text-white shadow-2xl backdrop-blur-md border border-slate-700/50 dark:bg-slate-800/90"
                    >
                        <div className="flex items-center gap-2 text-xs">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-500 text-[10px] font-bold">
                                {selectedJournalIds.length}
                            </span>
                            <span className="hidden sm:inline font-medium text-slate-300">Baris Terpilih</span>
                        </div>
                        <div className="h-4 w-px bg-slate-700" />
                        <div className="flex items-center gap-1.5">
                            <button
                                type="button"
                                disabled={loading}
                                onClick={() => setSelectedJournalIds([])}
                                className="inline-flex items-center gap-1 rounded-xl px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors disabled:opacity-50"
                            >
                                <X className="h-3.5 w-3.5" />
                                Batal
                            </button>
                            <button
                                type="button"
                                disabled={loading}
                                onClick={handleConfirmSelected}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 transition-all disabled:opacity-50"
                            >
                                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                                Konfirmasi
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-white border border-slate-200/80 dark:bg-slate-900 dark:border-slate-800 shadow-xs"
            >
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    <Dropdown
                        id="warehouse-filter"
                        label="Warehouse"
                        options={warehouseOptions}
                        selectedValue={selectedWarehouse}
                        onChange={(val) => {
                            setSelectedWarehouse(val);
                            setAccountFilter("all");
                        }}
                        ariaLabel="Filter by warehouse"
                    />

                    <Dropdown
                        id="account-filter"
                        label="Stock Account"
                        options={accountOptions}
                        selectedValue={accountFilter}
                        onChange={(val) => setAccountFilter(val)}
                        ariaLabel="Filter inventory by account"
                    />

                    <DateFilterDropdown
                        selectedPreset={dateFilter.preset}
                        customStartDate={dateFilter.startDate}
                        customEndDate={dateFilter.endDate}
                        onChange={(val) => setDateFilter(val)}
                        label="Tanggal Transaksi"
                    />
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 border-t sm:border-0 pt-3 sm:pt-0 border-slate-100 dark:border-slate-800">
                    <AnimatePresence>
                        {isValidating && !isLoading && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/40"
                            >
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                <span className="hidden sm:inline">Refreshing...</span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="button"
                        onClick={onOpenCreateModal}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 transition-all cursor-pointer"
                    >
                        <Plus className="h-4 w-4 shrink-0" />
                        <span className="truncate">Tambah Transaksi</span>
                    </button>
                </div>
            </motion.div>

            {/* Table Area */}
            <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3.5 p-3.5 sm:p-4">
                {/* Search Bar */}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Search className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari transaksi, deskripsi, invoice, nominal..."
                        aria-label="Search transaction list"
                        className="w-full rounded-xl border border-slate-200/80 bg-slate-50/50 py-2 pl-9 pr-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/50 dark:text-slate-100 dark:focus:bg-slate-800 transition-colors"
                    />
                </div>

                {/* Table Data */}
                <div className="overflow-x-auto rounded-xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                                <th scope="col" className="p-3.5 text-center w-10">
                                    <button
                                        type="button"
                                        onClick={toggleSelectAll}
                                        aria-label="Select all transactions"
                                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                                    >
                                        {isAllSelected ? (
                                            <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                        ) : (
                                            <Square className="h-4 w-4" />
                                        )}
                                    </button>
                                </th>
                                <th scope="col" className="px-4 py-3.5 min-w-50">
                                    <div className="flex items-center gap-1.5">
                                        <FileText className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Detail Transaksi</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-4 py-3.5 w-36">
                                    <div className="flex items-center gap-1.5">
                                        <Tag className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Kategori</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-4 py-3.5 min-w-45">
                                    <div className="flex items-center gap-1.5">
                                        <CreditCard className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Kanal Transaksi</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-4 py-3.5 text-right w-40">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <Coins className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Nominal Kas</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                            {/* Loading State */}
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
                                        <td className="p-3.5 text-center">
                                            <div className="h-4 w-4 bg-slate-200 dark:bg-slate-800 rounded mx-auto" />
                                        </td>
                                        <td className="px-4 py-4 space-y-2">
                                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                                            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/3" />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-32" />
                                        </td>
                                        <td className="px-4 py-4 text-right space-y-1">
                                            <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-24 ml-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                /* Empty State */
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                            <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">Tidak ada transaksi ditemukan</p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500">
                                                Coba sesuaikan kata kunci pencarian atau filter tanggal Anda
                                            </p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                /* Data Rows */
                                paginatedTransactions.map((tx) => {
                                    const selectedAccId = Number(accountFilter);
                                    const isFiltered = accountFilter !== "all" && !isNaN(selectedAccId);
                                    const isInflow = isFiltered ? Number(tx.debt_id) === selectedAccId : whAccountIdsSet.has(Number(tx.debt_id));

                                    const isSelected = selectedJournalIds.includes(tx.id);

                                    return (
                                        <tr
                                            key={tx.id}
                                            onClick={() => toggleSelectRow(tx.id)}
                                            className={`cursor-pointer transition-colors duration-150 ${
                                                isSelected ? "bg-indigo-50/60 dark:bg-indigo-950/30" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/40"
                                            }`}
                                        >
                                            <td className="p-3.5 text-center">
                                                {isSelected ? (
                                                    <CheckSquare className="h-4 w-4 text-indigo-600 dark:text-indigo-400 mx-auto" />
                                                ) : (
                                                    <Square className="h-4 w-4 text-slate-300 dark:text-slate-600 mx-auto" />
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 max-w-xs md:max-w-md">
                                                <div className="space-y-1">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-100 block wrap-break-word">
                                                        {tx.description || "Tanpa Keterangan"}
                                                    </span>
                                                    <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 border border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 font-mono flex-wrap">
                                                        <span className="inline-flex items-center gap-1">
                                                            <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                                            <span>{formatDateTime(tx.date_issued)}</span>
                                                        </span>
                                                        {tx.user?.name && (
                                                            <span className="inline-flex items-center gap-1">
                                                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                                                <User className="h-3 w-3 text-slate-400 shrink-0" />
                                                                <span className="truncate max-w-30">{getShortName(tx.user.name)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium border ${getCategoryBadgeClass(
                                                        tx.trx_type,
                                                    )}`}
                                                >
                                                    <Tag className="h-3 w-3 shrink-0 opacity-70" />
                                                    <span>{tx.trx_type || "Uncategorized"}</span>
                                                </span>
                                            </td>

                                            <td className="px-4 py-3.5">
                                                {tx.trx_type === "Mutasi Kas" ? (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 flex-wrap">
                                                        <ArrowRightLeft className="h-3 w-3 shrink-0" />
                                                        <span className="wrap-break-word">
                                                            {tx.cred?.group}
                                                            {tx.cred?.warehouse?.id !== selectedWarehouse && (
                                                                <span className="text-slate-500 dark:text-slate-400 font-normal">
                                                                    {" "}
                                                                    ({tx.cred?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                                </span>
                                                            )}
                                                            {" → "}
                                                            {tx.debt?.group}
                                                            {tx.debt?.warehouse?.id !== selectedWarehouse && (
                                                                <span className="text-slate-500 dark:text-slate-400 font-normal">
                                                                    {" "}
                                                                    ({tx.debt?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                                </span>
                                                            )}
                                                        </span>
                                                        {tx.debt?.group !== tx.cred?.group && (
                                                            <FileWarning className="h-3.5 w-3.5 text-amber-500 shrink-0 ml-0.5" />
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                                                        <CreditCard className="h-3 w-3 shrink-0" />
                                                        <span>{tx.cred_id === warehouseCashId ? tx.debt?.group || "Cash" : tx.cred?.group || "Cash"}</span>
                                                    </span>
                                                )}
                                            </td>

                                            <td className="px-4 py-3.5 text-right whitespace-nowrap font-mono">
                                                <div className="font-semibold text-slate-800 dark:text-slate-100">
                                                    <span
                                                        className={`text-xs font-bold px-2 py-1 rounded-md inline-block border ${
                                                            isInflow
                                                                ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100/40 dark:border-emerald-900/40"
                                                                : "text-rose-600 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/30 border-rose-100/40 dark:border-rose-900/40"
                                                        }`}
                                                    >
                                                        {isInflow ? "+" : "-"} {formatNumber(tx.amount)}
                                                    </span>
                                                </div>
                                                {Boolean(tx.fee_amount) && tx.fee_amount !== 0 && (
                                                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center justify-end gap-1">
                                                        <span>Fee:</span>
                                                        <span
                                                            className={`font-semibold ${
                                                                calculateFee(tx.amount) !== tx.fee_amount &&
                                                                ["Tarik Tunai", "Transfer Uang"].includes(tx.trx_type)
                                                                    ? "text-rose-600 dark:text-rose-400 font-bold"
                                                                    : "text-emerald-600 dark:text-emerald-400"
                                                            }`}
                                                        >
                                                            {formatNumber(tx.fee_amount)}
                                                            {calculateFee(tx.amount) !== tx.fee_amount &&
                                                                ["Tarik Tunai", "Transfer Uang"].includes(tx.trx_type) && (
                                                                    <span className="ml-1 text-[9px] bg-rose-100 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 px-1 py-0.2 rounded font-bold">
                                                                        Mismatch
                                                                    </span>
                                                                )}
                                                        </span>
                                                    </div>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {filteredTransactions.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                            <span>
                                Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{startItemIndex}</span> -{" "}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{endItemIndex}</span> dari{" "}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredTransactions.length}</span> transaksi
                            </span>

                            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                            <div className="flex items-center gap-1.5">
                                <span className="text-[11px]">Tampilkan:</span>
                                <select
                                    value={pageSize}
                                    onChange={(e) => {
                                        setPageSize(e.target.value === "all" ? "all" : Number(e.target.value));
                                        setCurrentPage(1);
                                    }}
                                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value={10}>10</option>
                                    <option value={25}>25</option>
                                    <option value={50}>50</option>
                                    <option value={100}>100</option>
                                    <option value="all">Semua</option>
                                </select>
                            </div>
                        </div>

                        {pageSize !== "all" && totalPages > 1 && (
                            <div className="flex items-center gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                                    disabled={currentPage === 1}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronLeft className="h-4 w-4" />
                                </button>

                                <div className="flex items-center gap-1 font-mono font-semibold px-2">
                                    <span className="text-indigo-600 dark:text-indigo-400">{currentPage}</span>
                                    <span>/</span>
                                    <span>{totalPages}</span>
                                </div>

                                <button
                                    type="button"
                                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                                    disabled={currentPage === totalPages}
                                    className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                >
                                    <ChevronRight className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
