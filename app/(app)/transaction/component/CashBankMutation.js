import Dropdown from "@/app/components/Dropdown";
import { DateTimeNow, formatNumber } from "@/app/utils/format";
import { Search, Plus, Coins, ReceiptText } from "lucide-react";
import { useState } from "react";
import CashBankSummary from "./CashBankSummary";
import { motion, AnimatePresence } from "motion/react";

const CashBankMutation = ({ journals, notification, mutate, accountBalance, accounts, warehouseId, endDate, setIsModalAddMutationOpen }) => {
    const { today } = DateTimeNow();
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [activeSubTab, setActiveSubTab] = useState("balances");

    const accountOptions = [
        { value: "all", label: "All Accounts" },
        ...accounts.filter((account) => account.warehouse_id === warehouseId).map((account) => ({ value: account.id, label: account.group })),
    ];
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
                            placeholder="Search by SKU or Name..."
                            aria-label="Search stock item list"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    {/* Account Dropdown */}
                    <div>
                        <Dropdown
                            id="stock-account-filter"
                            label="Stock Account Filter"
                            options={accountOptions}
                            selectedValue={accountFilter}
                            onChange={(val) => setAccountFilter(val)}
                            ariaLabel="Filter inventory by account"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => setIsModalAddMutationOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Mutation</span>
                    </button>
                </div>
            </div>
            <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px px-4">
                {[
                    { id: "balances", label: "Saldo Kas & Bank", icon: Coins },
                    { id: "history", label: "Mutation History Log", icon: ReceiptText },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`pb-3 text-xs font-bold relative transition-colors ${
                            activeSubTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </span>
                        {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                {activeSubTab === "balances" && (
                    <motion.div
                        key="balances"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <CashBankSummary accountBalance={accountBalance} journals={journals} warehouseId={warehouseId} endDate={endDate} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};
export default CashBankMutation;
