"use client";
import { useAuth } from "@/app/utils/auth";
import DailyDashboardGrid from "./DailyDashboard";
import HeaderProfile from "../HeaderProfile";
import AdminDashboard from "./AdminDashboard";
import { motion } from "motion/react";
import MobileNavDrawer from "@/app/components/MobileNavDrawer";
import { Coins, LayoutDashboard } from "lucide-react";
import { useState } from "react";

const fadeUp = (delay = 0) => ({
    initial: { opacity: 0, y: 14 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut", delay },
});

const DashboardContent = () => {
    const { user } = useAuth({ middleware: "auth" });
    const warehouseId = user.warehouse_id;
    const userRole = user.role;
    const isAdmin = ["Super Admin"].includes(userRole) && warehouseId === 1;
    const [activeTab, setActiveTab] = useState("mutation");

    const navTabs = [
        { id: "mutation", label: "Saldo Kas, Bank, Mutasi", icon: Coins },
        { id: "dashboard", label: "Dashboard Grid", icon: LayoutDashboard },
    ];

    return (
        <div className="space-y-6">
            <motion.div {...fadeUp(0)}>
                <HeaderProfile />
            </motion.div>

            {isAdmin && <MobileNavDrawer menuList={navTabs} activeTab={activeTab} setActiveTab={setActiveTab} />}

            <motion.div {...fadeUp(0.12)}>
                {isAdmin ? (
                    activeTab === "mutation" ? (
                        <AdminDashboard userRole={userRole} warehouseId={warehouseId} />
                    ) : (
                        <DailyDashboardGrid userRole={userRole} warehouseId={warehouseId} />
                    )
                ) : (
                    <DailyDashboardGrid userRole={userRole} warehouseId={warehouseId} />
                )}
            </motion.div>
        </div>
    );
};

export default DashboardContent;
