"use client";

import ConfirmDialog from "@/app/components/ConfirmDialog";
import Dropdown from "@/app/components/Dropdown";
import { deleteJournal } from "@/app/hooks/JournalActionService";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { ArrowRightLeft, Calendar, Coins, CreditCard, FileWarning, Search, Trash2 } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useMemo, useState } from "react";

const MutationHistoryLog = ({ journals = [], accounts = [], setNotification, mutate, mutateBalance }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [txToDelete, setTxToDelete] = useState(null);

    // Dynamic account options derived directly from accounts prop
    const accountOptions = useMemo(() => {
        return [{ value: "all", label: "Semua akun" }, ...accounts.map((a) => ({ value: a.id, label: a.group }))];
    }, [accounts]);

    const activeAccountIds = useMemo(() => {
        return accountOptions.map((o) => Number(o.value)).filter((val) => !isNaN(val));
    }, [accountOptions]);

    const filteredTransactions = useMemo(() => {
        return journals
            .filter((j) => j.trx_type === "Mutasi Kas")
            .filter((j) => (j.description || "").toLowerCase().includes(searchTerm.toLowerCase()))
            .filter((j) => {
                if (accountFilter === "all") return true;
                return Number(j.debt_id) === Number(accountFilter) || Number(j.cred_id) === Number(accountFilter);
            });
    }, [journals, searchTerm, accountFilter]);

    return (
        <div className="p-4 rounded-2xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-xs space-y-4">
            {/* Widget Header & Local Controls */}
            <div className="space-y-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">Mutation Log History</h3>

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
                            placeholder="Search ..."
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
                    <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">No mutation records found</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">Adjust your search or account filter.</p>
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
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100 dark:bg-slate-800/40 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors"
                                >
                                    <div className="flex items-start gap-2.5 min-w-0 flex-1">
                                        <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0 mt-0.5">
                                            <ArrowRightLeft className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="min-w-0 flex-1 space-y-1">
                                            <div className="flex items-center gap-1 flex-wrap">
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-xs font-semibold font-mono border border-slate-100 dark:border-slate-700">
                                                    <CreditCard className="h-2.5 w-2.5 text-slate-400" />
                                                    {tx.cred?.group || "Asal"}{" "}
                                                    {!accountOptions.some((opt) => Number(opt.value) === Number(tx.cred?.id)) && tx.cred?.warehouse?.code
                                                        ? `(${tx.cred.warehouse.code})`
                                                        : null}
                                                </span>
                                                <span className="text-slate-400 text-xs">→</span>
                                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-xs font-semibold font-mono">
                                                    <Coins className="h-2.5 w-2.5 text-indigo-500" />
                                                    {tx.debt?.group || "Tujuan"}{" "}
                                                    {!accountOptions.some((opt) => Number(opt.value) === Number(tx.debt?.id)) && tx.debt?.warehouse?.code
                                                        ? `(${tx.debt.warehouse.code})`
                                                        : null}
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
                                            {tx.fee_amount > 0 && (
                                                <span className="block text-xs font-medium text-slate-400">Fee: {formatNumber(tx.fee_amount)}</span>
                                            )}
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => setTxToDelete(tx.id)}
                                            className="mt-1 rounded-lg p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                                            title="Delete entry"
                                        >
                                            <Trash2 className="h-3.5 w-3.5" />
                                        </button>
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
                        setNotification?.(response.message || "Mutation entry deleted successfully");
                        if (typeof mutate === "function") mutate();
                        if (typeof mutateBalance === "function") mutateBalance();
                    } catch {
                        setNotification?.("Failed to delete ledger entry");
                    }
                }}
                title="Delete Ledger Transaction"
                description="Are you sure you want to delete this mutation entry?"
            />
        </div>
    );
};

export default MutationHistoryLog;
