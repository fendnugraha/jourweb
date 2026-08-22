import { Cable, Key, Search, Unplug } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import axios from "@/app/utils/axios";

const AssignAccount = ({ warehouse, isModalOpen, accounts = [], notification, mutate, mutateAccounts }) => {
    const [searchTerm, setSearchTerm] = useState("");

    // Filter: Gabungkan syarat kelayakan akun DENGAN pencarian kata kunci
    const filteredAvailableAccounts = accounts.filter((account) => {
        const isEligible = (account.warehouse_id === null && [1, 2].includes(account.account_id)) || account.warehouse_id === warehouse?.id;

        const matchesSearch = account.name?.toLowerCase().includes(searchTerm.toLowerCase());

        return isEligible && matchesSearch;
    });

    // Varian Animasi Container
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.04,
            },
        },
    };

    // Varian Animasi Item List
    const itemVariants = {
        hidden: { opacity: 0, y: 8, scale: 0.98 },
        visible: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15 } },
    };

    const toggleCashBank = async (warehouse_id, account_id) => {
        try {
            await axios.put(`/api/warehouse/${warehouse_id}/add-cash-bank/${account_id}`);
            notification("Assigned account updated successfully.");
            mutate();
            mutateAccounts();
        } catch (error) {
            console.log(error);
            notification(error.response?.data?.message || "Something went wrong.");
        }
    };

    return (
        <div className="space-y-3 text-sm">
            {/* Input Search */}
            <div>
                <label htmlFor="tx-warehouse" className="block mb-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Pilih Akun
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                        <Search className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari akun..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 transition-shadow"
                    />
                </div>
            </div>

            {/* List Akun Teranimasi */}
            <div className="no-scrollbar flex max-h-72 flex-col space-y-1 overflow-y-auto rounded-xl border border-slate-100 p-1 dark:border-slate-800">
                <AnimatePresence mode="popLayout">
                    {filteredAvailableAccounts.length > 0 ? (
                        <motion.div key="account-list" variants={containerVariants} initial="hidden" animate="visible" className="space-y-1">
                            {filteredAvailableAccounts.map((account) => {
                                const isAssigned = account.warehouse_id === warehouse?.id;

                                return (
                                    <motion.div
                                        key={account.id}
                                        layout
                                        variants={itemVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="exit"
                                        whileHover={{ scale: 1.005, x: 2 }}
                                        className="flex items-center justify-between rounded-lg p-2 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/60"
                                    >
                                        <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate max-w-50">{account.name}</span>

                                        {/* Action Buttons */}
                                        <div className="flex items-center gap-1.5">
                                            {account.is_primary_cash && isAssigned ? (
                                                <motion.button
                                                    type="button"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    title="Kas Utama"
                                                    className="inline-flex items-center justify-center rounded-lg bg-amber-100 p-1.5 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                                >
                                                    <Key className="h-3.5 w-3.5" />
                                                </motion.button>
                                            ) : null}

                                            <motion.button
                                                type="button"
                                                whileHover={{ scale: 1.1 }}
                                                whileTap={{ scale: 0.95 }}
                                                title={isAssigned ? "Putuskan Sambungan" : "Hubungkan Akun"}
                                                onClick={() => toggleCashBank(warehouse.id, account.id)}
                                                className={`inline-flex items-center justify-center rounded-lg p-1.5 transition-colors ${
                                                    isAssigned
                                                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-400 dark:hover:bg-emerald-900/80"
                                                        : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700"
                                                }`}
                                            >
                                                {isAssigned ? <Cable className="h-3.5 w-3.5" /> : <Unplug className="h-3.5 w-3.5" />}
                                            </motion.button>
                                        </div>
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
                            className="p-4 text-center text-xs text-slate-400"
                        >
                            Tidak ada akun ditemukan.
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default AssignAccount;
