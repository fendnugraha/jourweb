import Modal from "@/app/components/Modal";
import axios from "@/app/utils/axios";
import { formatNumber } from "@/app/utils/format";
import { AlertCircle, ChevronDown, Cog, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const labelClass = "block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05,
        },
    },
};

const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const CashBankBalance = ({ accountBalance, isLoading, isValidating, mutate, dailyDashboard }) => {
    const summarizeBalance = accountBalance?.data?.chartOfAccounts?.reduce((total, account) => total + account.balance, 0) || 0;
    const accounts = accountBalance?.data?.chartOfAccounts || [];
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedId, setSelectedId] = useState(null);
    const [newAmount, setNewAmount] = useState("");

    const handleOpenModal = (account) => {
        setSelectedId(account.id);
        setNewAmount(account.limit?.limit_amount || "");
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedId(null);
        setNewAmount("");
    };

    const updateLimitAmount = async (id, amount) => {
        setLoading(true);
        try {
            await axios.put(`/api/update-account-limit/${id}`, {
                limit: amount,
                diff: 0, // kalau backend kamu wajib diff
            });
            setIsModalOpen(false);
            mutate();
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitLimit = (e) => {
        e.preventDefault();
        if (!selectedId) return;
        updateLimitAmount(selectedId, newAmount);
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
            {/* HEADER */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 p-3.5 sm:p-4 cursor-pointer select-none active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
            >
                <div className="flex items-center gap-2.5 min-w-0">
                    <motion.div
                        animate={{ rotate: isOpen ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">KAS / BANK</h3>
                            {isValidating && !isLoading && <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin shrink-0" title="Memperbarui data..." />}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Ringkasan Saldo Akun</p>
                    </div>
                </div>

                <div className="shrink-0">
                    <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Total:</span>
                        {isLoading ? (
                            <div className="h-4 w-16 sm:w-20 bg-indigo-200/50 dark:bg-indigo-900/50 animate-pulse rounded" />
                        ) : (
                            <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono tracking-tight">
                                {formatNumber(summarizeBalance)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ACCOUNT LIST CONTENT */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="collapsible-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                    >
                        <div className="p-2 sm:p-3">
                            <AnimatePresence mode="wait">
                                {isLoading ? (
                                    <motion.div
                                        key="loading-skeleton"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-1"
                                    >
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <div key={index} className="flex items-center justify-between py-2.5 px-3 animate-pulse">
                                                <div className="space-y-1.5 flex-1 pr-4">
                                                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4" />
                                                </div>
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : accounts.length > 0 ? (
                                    <motion.div
                                        key="account-list"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="hidden"
                                        className="divide-y divide-slate-100 dark:divide-slate-800/50"
                                    >
                                        {accounts.map((account) => {
                                            const hasLimit = Boolean(account.limit?.limit_amount);
                                            const diff = account.balance - (account.limit?.limit_amount || 0);

                                            return (
                                                <motion.div
                                                    key={account.id}
                                                    variants={itemVariants}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="group flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 active:bg-slate-100 dark:active:bg-slate-800/80 cursor-pointer overflow-hidden"
                                                >
                                                    <div className="min-w-0 flex-1 pr-3">
                                                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                            {account.group}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                                            {account.name}
                                                        </p>
                                                    </div>

                                                    <div className="text-right shrink-0 flex flex-col items-end justify-center">
                                                        <span
                                                            className={`text-xs sm:text-sm font-bold font-mono tracking-tight ${
                                                                account.balance < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                                                            }`}
                                                        >
                                                            {formatNumber(account.balance)}
                                                        </span>

                                                        {hasLimit && diff !== 0 && (
                                                            <span
                                                                className={`text-[9px] sm:text-[10px] font-mono font-medium ${
                                                                    diff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                                                                }`}
                                                            >
                                                                {diff > 0 ? "+" : ""}
                                                                {formatNumber(diff)}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleOpenModal(account);
                                                        }}
                                                        className="flex items-center justify-center shrink-0 w-0 opacity-0 ml-0 overflow-hidden group-hover:w-7 group-hover:opacity-100 group-hover:ml-2 transition-all duration-300 ease-in-out p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 cursor-pointer"
                                                        title="Atur Limit"
                                                    >
                                                        <Cog size={14} className="shrink-0" />
                                                    </button>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty-state"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium"
                                    >
                                        Tidak ada data akun Kas/Bank.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* MODAL UPDATE LIMIT */}
            <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Atur Limit Akun">
                <form onSubmit={handleSubmitLimit} className="space-y-4">
                    <div className="space-y-1">
                        <label htmlFor="tx-amount" className={labelClass}>
                            Jumlah Limit (Rp IDR)
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                            <input
                                id="tx-amount"
                                type="number"
                                required
                                value={newAmount}
                                onChange={(e) => setNewAmount(e.target.value)}
                                placeholder="50000"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
                            />
                        </div>
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <button
                            type="button"
                            onClick={handleCloseModal}
                            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-60 cursor-pointer"
                            disabled={loading}
                        >
                            {loading ? "Menyimpan data..." : "Ubah Limit"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};

export default CashBankBalance;
