"use client";
import { Coins, Logs, Wallet2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import WarehouseBalance from "./WarehouseBalance";
import RevenueReport from "./RevenueReport";
import LogTrack from "./LogTrack";
import MobileNavDrawer from "@/app/components/MobileNavDrawer";
import { useWarehouseBalance } from "@/app/hooks/useWarehouseBalance";
import { todayDate } from "@/app/utils/format";

const menuList = [
    { id: "balances", label: "Saldo Kas & Bank (Cabang)", icon: Coins },
    { id: "revenue", label: "Laporan Pendapatan", icon: Wallet2 },
    { id: "logtrack", label: "Log Input Tracking", icon: Logs },
];

const SummaryContent = () => {
    // const { today } = DateTimeNow();
    const today = todayDate();
    const [selectedDate, setSelectedDate] = useState(today);

    const [searchTerm, setSearchTerm] = useState("");
    const [activeSubTab, setActiveSubTab] = useState("balances");

    const { warehouseBalance, error, isLoading, isValidating, mutate } = useWarehouseBalance(selectedDate);

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
                            <WarehouseBalance
                                selectedDate={selectedDate}
                                setSelectedDate={setSelectedDate}
                                warehouseBalance={warehouseBalance}
                                error={error}
                                isLoading={isLoading}
                                isValidating={isValidating}
                                mutate={mutate}
                            />
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
                            <RevenueReport warehouseBalance={warehouseBalance} />
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
