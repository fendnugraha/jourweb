"use client";
import { Coins, Logs, Wallet2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import WarehouseBalance from "./WarehouseBalance";

const SummaryContent = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSubTab, setActiveSubTab] = useState("balances");
    return (
        <>
            <div className="space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px pt-4 px-4">
                    {/* Sub-Tab Buttons */}
                    {[
                        { id: "balances", label: "Warehouse Balance", icon: Coins },
                        { id: "revenue", label: "Revenue & Expenses", icon: Wallet2 },
                        { id: "logtrack", label: "Log Input Tracking", icon: Logs },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`pb-3 text-sm font-bold relative transition-colors ${
                                activeSubTab === tab.id
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                    <motion.div
                        key="transactions"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        {activeSubTab === "balances" && <WarehouseBalance />}
                    </motion.div>
                    {activeSubTab === "revenue" && <div className="p-4">Revenue & Expenses</div>}
                    {activeSubTab === "logtrack" && <div className="p-4">Log Input Tracking</div>}
                </AnimatePresence>
            </div>
        </>
    );
};

export default SummaryContent;
