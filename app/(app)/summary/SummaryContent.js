"use client";
import { Coins, Logs, Wallet2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import WarehouseBalance from "./WarehouseBalance";
import RevenueReport from "./RevenueReport";
import LogTrack from "./LogTrack";
import MobileNavDrawer from "@/app/components/MobileNavDrawer";

const menuList = [
    { id: "balances", label: "Warehouse Balance", icon: Coins },
    { id: "revenue", label: "Revenue & Expenses", icon: Wallet2 },
    { id: "logtrack", label: "Log Input Tracking", icon: Logs },
];

const SummaryContent = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [activeSubTab, setActiveSubTab] = useState("balances");
    return (
        <>
            <div className="space-y-6">
                <MobileNavDrawer menuList={menuList} activeTab={activeSubTab} setActiveTab={setActiveSubTab} />
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
                            <WarehouseBalance />
                        </motion.div>
                    )}

                    {activeSubTab === "revenue" && (
                        <motion.div
                            key="revenue"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <RevenueReport />
                        </motion.div>
                    )}
                    {activeSubTab === "logtrack" && (
                        <motion.div
                            key="logtrack"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <LogTrack />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </>
    );
};

export default SummaryContent;
