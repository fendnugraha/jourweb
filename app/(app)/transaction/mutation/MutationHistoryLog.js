"use client";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import { deleteJournal } from "@/app/hooks/JournalActionService";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { ArrowRightLeft, Calendar, Coins, CreditCard, FileWarning, Pencil, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";
import EditMutation from "./EditMutation";

const MutationHistoryLog = ({ journals = [], accounts = [], setNotification, mutate, mutateBalance, userRole }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [selectInOut, setSelectInOut] = useState("all"); // 'all' | 'in' | 'out'
    const [txToDelete, setTxToDelete] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedJournal, setSelectedJournal] = useState(null);

    // Dynamic account options derived directly from accounts prop
    const accountOptions = useMemo(() => {
        return [{ value: "all", label: "Semua akun" }, ...accounts.map((a) => ({ value: a.id, label: a.group }))];
    }, [accounts]);

    const activeAccountIds = useMemo(() => {
        return accountOptions.map((o) => Number(o.value)).filter((val) => !isNaN(val));
    }, [accountOptions]);

    // Memastikan sumber data aman baik dari Array biasa maupun Paginasi (journals.data)
    const journalList = useMemo(() => {
        if (Array.isArray(journals)) return journals;
        if (Array.isArray(journals?.data)) return journals.data;
        return [];
    }, [journals]);

    // Filter Transaksi Tunggal & Aman
    const filteredTransactions = useMemo(() => {
        return journalList.filter((journal) => {
            // 1. Filter Tipe Transaksi
            if (journal.trx_type !== "Mutasi Kas") return false;

            // 2. Filter Search Term
            const searchLower = searchTerm.toLowerCase().trim();
            const matchSearchTerm =
                !searchLower ||
                journal.cred?.acc_name?.toLowerCase().includes(searchLower) ||
                journal.debt?.acc_name?.toLowerCase().includes(searchLower) ||
                journal.invoice?.toLowerCase().includes(searchLower) ||
                journal.description?.toLowerCase().includes(searchLower) ||
                journal.amount?.toString().includes(searchLower);

            if (!matchSearchTerm) return false;

            // 3. Filter Akun Spesifik
            const isMatchAccount =
                accountFilter === "all" || Number(journal.debt_id) === Number(accountFilter) || Number(journal.cred_id) === Number(accountFilter);

            if (!isMatchAccount) return false;

            // 4. Filter Masuk (In) / Keluar (Out)
            if (selectInOut === "in") {
                // 'In' jika akun tujuan (debt_id) sesuai dengan filter akun aktif / konteks
                return accountFilter === "all" ? activeAccountIds.includes(Number(journal.debt_id)) : Number(journal.debt_id) === Number(accountFilter);
            }

            if (selectInOut === "out") {
                // 'Out' jika akun asal (cred_id) sesuai dengan filter akun aktif / konteks
                return accountFilter === "all" ? activeAccountIds.includes(Number(journal.cred_id)) : Number(journal.cred_id) === Number(accountFilter);
            }

            return true;
        });
    }, [journalList, searchTerm, accountFilter, selectInOut, activeAccountIds]);

    return (
        <div className="p-4 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
            {/* Widget Header & Local Controls */}
            <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Mutation Log History</h3>

                    {/* Tab Segment Filter (Semua, Masuk, Keluar) */}
                    <div className="flex rounded-lg p-0.5 bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-[10px]">
                        {[
                            { key: "all", label: "Semua" },
                            { key: "in", label: "Masuk" },
                            { key: "out", label: "Keluar" },
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => setSelectInOut(tab.key)}
                                className={`px-2 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                                    selectInOut === tab.key
                                        ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-indigo-300"
                                        : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {/* Search Input */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500 pointer-events-none">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari transaksi..."
                            aria-label="Search transaction list"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 transition-colors"
                        />
                    </div>

                    {/* Account Filter Dropdown */}
                    <Dropdown
                        id="history-account-filter"
                        options={accountOptions}
                        selectedValue={accountFilter}
                        onChange={(val) => setAccountFilter(val)}
                        ariaLabel="Filter history by account"
                    />
                </div>
            </div>

            {/* List Content */}
            {filteredTransactions.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex flex-col items-center justify-center p-6 text-center"
                >
                    <FileWarning className="h-7 w-7 text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Tidak ada riwayat mutasi ditemukan</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Coba sesuaikan pencarian atau filter akun Anda.</p>
                </motion.div>
            ) : (
                <div className="space-y-2.5 max-h-120 overflow-y-auto pr-1">
                    <AnimatePresence initial={false}>
                        {filteredTransactions.map((tx, index) => {
                            const isOutflow = activeAccountIds.includes(Number(tx.cred_id));

                            return (
                                <motion.div
                                    key={tx.id}
                                    layout
                                    initial={{ opacity: 0, y: 10, scale: 0.98 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.95 }}
                                    transition={{ duration: 0.2, delay: index * 0.02 }}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0 mt-0.5">
                                            <ArrowRightLeft className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                {/* Akun Asal */}
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold font-mono border border-slate-100 dark:border-slate-700">
                                                    <CreditCard className="h-2.5 w-2.5 text-slate-400" />
                                                    {tx.cred?.group || "Asal"}{" "}
                                                    {!accountOptions.some((opt) => Number(opt.value) === Number(tx.cred?.id)) && tx.cred?.warehouse?.code ? (
                                                        <span className="font-normal text-slate-400">
                                                            ({tx.cred?.warehouse?.name?.replace(/^konter\s*/i, "")})
                                                        </span>
                                                    ) : null}
                                                </span>

                                                <span className="text-slate-400 text-xs">→</span>

                                                {/* Akun Tujuan */}
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-semibold font-mono">
                                                    <Coins className="h-2.5 w-2.5 text-indigo-500" />
                                                    {tx.debt?.group || "Tujuan"}{" "}
                                                    {!accountOptions.some((opt) => Number(opt.value) === Number(tx.debt?.id)) && tx.debt?.warehouse?.code ? (
                                                        <span className="font-normal text-slate-400">
                                                            ({tx.debt?.warehouse?.name?.replace(/^konter\s*/i, "")})
                                                        </span>
                                                    ) : null}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-1 text-[10px] font-mono text-slate-400">
                                                <Calendar className="h-2.5 w-2.5 shrink-0" />
                                                <span>{formatDateTime(tx.date_issued)}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex shrink-0 flex-col items-end justify-between self-stretch pl-1">
                                        <div className="text-right">
                                            <span className={`block font-mono text-sm font-bold ${isOutflow ? "text-red-500" : "text-emerald-500"}`}>
                                                {formatRupiah(tx.amount)}
                                            </span>
                                            {Number(tx.fee_amount) > 0 && (
                                                <span className="block text-xs font-medium text-slate-400">Fee: {formatNumber(tx.fee_amount)}</span>
                                            )}
                                        </div>

                                        <div className="flex gap-1">
                                            {["Administator", "Super Admin", "Administrator"].includes(userRole) && (
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedJournal(tx);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="mt-1 rounded-lg p-1 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                                                    title="Edit entry"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => setTxToDelete(tx.id)}
                                                className="mt-1 rounded-lg p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                                title="Delete entry"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            )}

            <ConfirmDialog
                isOpen={txToDelete !== null}
                onClose={() => setTxToDelete(null)}
                onConfirm={async () => {
                    if (!txToDelete) return;
                    try {
                        const response = await deleteJournal(txToDelete);
                        setTxToDelete(null);
                        setNotification?.(response.message || "Riwayat mutasi berhasil dihapus");
                        if (typeof mutate === "function") mutate();
                        if (typeof mutateBalance === "function") mutateBalance();
                    } catch {
                        setNotification?.("Gagal menghapus riwayat transaksi");
                    }
                }}
                title="Hapus Transaksi Mutasi"
                description="Apakah Anda yakin ingin menghapus catatan mutasi kas ini?"
            />

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Edit Mutasi Kas">
                <EditMutation journal={selectedJournal} isModalOpen={setIsModalOpen} mutate={mutate} notification={setNotification} />
            </Modal>
        </div>
    );
};

export default MutationHistoryLog;
