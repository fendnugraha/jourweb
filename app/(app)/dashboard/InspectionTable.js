/* eslint-disable react-hooks/set-state-in-effect */
import { useTransactions } from "@/app/hooks/useTransactions";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Dropdown from "@/app/components/Dropdown";
import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import { calculateFee, DateTimeNow, formatDateTime, formatNumber, getShortName } from "@/app/utils/format";
import useWarehouse from "@/app/hooks/useWarehouse";
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
} from "lucide-react";
import { useAccounts } from "@/app/hooks/useAccounts";
import axios from "@/app/utils/axios";

export default function InspectionTable() {
    const { today } = DateTimeNow();
    const [selectedWarehouse, setSelectedWarehouse] = useState(1);
    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: today,
        endDate: today,
    });

    // --- Search & Filter State ---
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(25);

    const { warehouses } = useWarehouse();
    const warehouseCashId = warehouses.find((warehouse) => warehouse.id === selectedWarehouse)?.primary_cash?.id;

    const warehouseOptions = [
        { value: "all", label: "Semua Cabang" },
        ...warehouses
            .filter((w) => w.status === 1)
            .map((warehouse) => ({
                value: warehouse.id,
                label: warehouse.name,
            })),
    ];

    const { accounts = [], loading: loadingAccounts, error: errorAccounts } = useAccounts();

    const whAccounts = useMemo(() => accounts.filter((account) => account.warehouse_id === selectedWarehouse), [accounts, selectedWarehouse]);
    const hqAccounts = useMemo(() => accounts.filter((account) => account.warehouse_id === 1), [accounts]);
    const hqAccountIds = useMemo(() => hqAccounts.map((account) => account.id), [hqAccounts]);

    const accountOptions = useMemo(
        () =>
            whAccounts.map((account) => ({
                value: account.id,
                label: account.group,
            })),
        [whAccounts],
    );

    const { journalByWarehouse, isLoading, isValidating, error, mutate } = useTransactions({
        selectedWarehouse: selectedWarehouse,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
    });

    // --- Filtered Transactions Memo ---
    const filteredTransactions = useMemo(() => {
        if (!journalByWarehouse) return [];

        const normalizedSearchTerm = searchTerm ? searchTerm.toLowerCase().trim() : "";

        return journalByWarehouse.filter((journal) => {
            // 1. Cek Filter Akun
            const matchAccount =
                accountFilter === "all" || Number(journal.cred_id) === Number(accountFilter) || Number(journal.debt_id) === Number(accountFilter);

            // 2. Cek Filter Kategori
            const matchCategory = categoryFilter === "all" || journal.trx_type === categoryFilter;

            // 3. Cek Pencarian (Search Term)
            const matchSearchTerm =
                !normalizedSearchTerm ||
                (journal.debt?.name ?? "").toLowerCase().includes(normalizedSearchTerm) ||
                (journal.cred?.name ?? "").toLowerCase().includes(normalizedSearchTerm) ||
                (journal.description ?? "").toLowerCase().includes(normalizedSearchTerm) ||
                (journal.id ?? "").toString().toLowerCase().includes(normalizedSearchTerm) ||
                (journal.invoice ?? "").toLowerCase().includes(normalizedSearchTerm) ||
                (journal.amount ?? "").toString().toLowerCase().includes(normalizedSearchTerm) ||
                (journal.transaction ?? []).some((t) => (t.product?.name ?? "").toLowerCase().includes(normalizedSearchTerm));

            // Semua filter harus bernilai true agar data lolos
            return matchAccount && matchCategory && matchSearchTerm;
        });
    }, [journalByWarehouse, accountFilter, searchTerm, categoryFilter]);

    // Reset to page 1 when filtered transactions change length
    useEffect(() => {
        setCurrentPage(1);
    }, [filteredTransactions.length]);

    const whAccountIds = useMemo(() => {
        if (!Array.isArray(whAccounts)) return [];

        return whAccounts
            .map((acc) => Number(acc?.id)) // Ambil ID akunnya
            .filter((id) => !isNaN(id) && id > 0); // Hilangkan NaN, null (0), atau undefined
    }, [whAccounts]);

    // Paginated Slices
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

    // Category badge helper
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

    const [selectedJournalIds, setSelectedJournalIds] = useState([]);
    const totalTransaction = filteredTransactions?.length || 0;

    const totalConfirmedTransaction =
        filteredTransactions?.filter((j) => (Number(j.debt?.account_id) === 2 || Number(j.cred?.account_id) === 2) && Number(j.is_confirmed) === 1).length || 0;

    const calculatePercentage = () => {
        if (totalTransaction > 0) {
            return ((totalConfirmedTransaction / totalTransaction) * 100).toFixed(2);
        }
        return 0;
    };

    const handleConfirmSelected = async () => {
        if (!confirm("Are you sure you want to confirm selected journal?")) return;
        setLoading(true);
        try {
            const response = await axios.post("/api/update-confirm-status-batch", { journal_ids: selectedJournalIds });
            setNotification(response.data.message);
            setSelectedJournalIds([]);
            mutate();
        } catch (error) {
            setNotification(error.response?.data?.message || "Something went wrong.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };
    return (
        <div className="space-y-6">
            {selectedJournalIds.length > 0 && (
                <div className="flex flex-col w-fit gap-2 fixed bottom-4 right-8 z-99">
                    <button
                        className="py-2 w-full px-4 text-white text-sm bg-red-600 hover:bg-red-500 drop-shadow-2xl rounded-2xl"
                        disabled={loading || selectedJournalIds.length === 0}
                        onClick={() => setSelectedJournalIds([])}
                    >
                        Clear selected
                    </button>
                    <button
                        className="py-2 px-4 text-white text-sm w-fit bg-blue-600 hover:bg-blue-500 drop-shadow-2xl rounded-2xl"
                        disabled={loading || selectedJournalIds.length === 0}
                        onClick={handleConfirmSelected}
                    >
                        Confirm selected <span className="font-bold bg-white text-blue-600 px-2 py-0.5 rounded-full">{selectedJournalIds.length}</span>
                    </button>
                </div>
            )}
            {/* Filter Bar */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-2xs"
            >
                {/* Left Side: Filter Search */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    {/* Warehouse Dropdown */}
                    <div>
                        <Dropdown
                            id="warehouse-filter"
                            label="Warehouse Filter"
                            options={warehouseOptions}
                            selectedValue={selectedWarehouse}
                            onChange={(val) => {
                                setSelectedWarehouse(val);
                                setAccountFilter("all");
                            }}
                            ariaLabel="Filter by warehouse"
                        />
                    </div>

                    {/* Account Dropdown */}
                    <div className="w-full">
                        <Dropdown
                            id="ware-filter"
                            label="Stock Account Filter"
                            options={[{ value: "all", label: "Semua Akun" }, ...accountOptions]}
                            selectedValue={accountFilter}
                            onChange={(val) => setAccountFilter(val)}
                            ariaLabel="Filter inventory by account"
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

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <button
                            type="button"
                            onClick={() => {
                                setModalName("create-transaction");
                                setIsModalAddTransactionOpen(true);
                            }}
                            className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all cursor-pointer"
                        >
                            <Plus className="h-4 w-4 shrink-0" />
                            <span className="truncate">Tambah Transaksi</span>
                        </button>
                    </div>
                </div>
            </motion.div>

            <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4 p-3.5 sm:p-4">
                {/* BACKGROUND REVALIDATING INDICATOR */}
                {isValidating && !isLoading && (
                    <div className="absolute top-3 right-5 z-10 flex items-center gap-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/80 px-2.5 py-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 backdrop-blur-xs">
                        <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
                        <span>Syncing...</span>
                    </div>
                )}
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500 pointer-events-none">
                        <Search className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search ..."
                        aria-label="Search transaction list"
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 transition-colors"
                    />
                </div>
                <div className="hidden md:block overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-200/80 bg-slate-50/70 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-800/40">
                                <th scope="col" className="px-4 py-3.5 min-w-55">
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
                                <th scope="col" className="px-4 py-3.5 min-w-50">
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
                                <th scope="col" className="px-4 py-3.5 text-center w-20">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <MoreHorizontal className="w-3.5 h-3.5 text-indigo-500" />
                                        <span>Aksi</span>
                                    </div>
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                            {/* 1. STATE LOADING DESKTOP */}
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, index) => (
                                    <tr key={index} className="animate-pulse">
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
                                            <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-12 ml-auto" />
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredTransactions.length === 0 ? (
                                /* 2. STATE EMPTY DESKTOP */
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                            <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">Tidak ada transaksi ditemukan</p>
                                            <p className="text-[11px] text-slate-400 dark:text-slate-500">Coba sesuaikan filter pencarian akun atau tanggal</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                /* 3. STATE DATA DESKTOP */
                                paginatedTransactions.map((tx) => {
                                    const selectedAccId = Number(accountFilter);
                                    const isFiltered = accountFilter !== "all" && !isNaN(selectedAccId);

                                    // Menentukan apakah transaksi adalah Inflow (Uang Masuk)
                                    const isInflow = isFiltered ? Number(tx.debt_id) === selectedAccId : whAccountIds.includes(Number(tx.debt_id));

                                    return (
                                        <tr
                                            key={tx.id}
                                            onClick={() =>
                                                setSelectedJournalIds(
                                                    (prev) =>
                                                        prev.includes(tx.id)
                                                            ? prev.filter((id) => id !== tx.id) // kalau ada → hapus
                                                            : [...prev, tx.id], // kalau tidak ada → tambah
                                                )
                                            }
                                            className={`group ${selectedJournalIds.includes(tx.id) ? "bg-blue-100 dark:bg-blue-900/50" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"} transition-colors duration-150`}
                                        >
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
                                                                <span className="truncate max-w-36">{getShortName(tx.user.name)}</span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-4 py-3.5 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-[11px] font-medium border ${getCategoryBadgeClass(tx.trx_type)}`}
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
                                                {!tx.fee_amount || tx.fee_amount === 0 ? null : (
                                                    <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5 flex items-center justify-end gap-1">
                                                        <span>Fee:</span>
                                                        <span
                                                            className={`font-semibold ${calculateFee(tx.amount) !== tx.fee_amount && ["Tarik Tunai", "Transfer Uang"].includes(tx.trx_type) ? "text-rose-600 dark:text-rose-400 font-bold" : "text-emerald-600 dark:text-emerald-400"}`}
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

                                            <td className="px-4 py-3.5 whitespace-nowrap text-center"></td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* PAGINATION FOOTER CONTROLS */}
                {filteredTransactions.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                        <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
                            <span>
                                Menampilkan <span className="font-semibold text-slate-800 dark:text-slate-200">{startItemIndex}</span> -{" "}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{endItemIndex}</span> dari{" "}
                                <span className="font-semibold text-slate-800 dark:text-slate-200">{filteredTransactions.length}</span> transaksi
                            </span>

                            <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">|</span>

                            <div className="flex items-center gap-1">
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
