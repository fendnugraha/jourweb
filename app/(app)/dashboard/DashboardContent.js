"use client";
import { useAuth } from "@/app/utils/auth";
import DailyDashboardGrid from "./DailyDashboard";
import HeaderProfile from "../HeaderProfile";
import AdminDashboard from "./AdminDashboard";
import { motion } from "motion/react";

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

    return (
        <div className="space-y-6">
            <motion.div {...fadeUp(0)}>
                <HeaderProfile />
            </motion.div>

            <motion.div {...fadeUp(0.12)}>
                {isAdmin ? (
                    <AdminDashboard userRole={userRole} warehouseId={warehouseId} />
                ) : (
                    <DailyDashboardGrid userRole={userRole} warehouseId={warehouseId} />
                )}
            </motion.div>
        </div>
    );
};

export default DashboardContent;
