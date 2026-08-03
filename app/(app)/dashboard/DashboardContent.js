"use client";
import { useDailyDashboard } from "@/app/hooks/useDailyDashboard";
import { useAuth } from "@/app/utils/auth";
import { DateTimeNow } from "@/app/utils/format";
import DailyDashboardGrid from "./DailyDashboard";
import HeaderProfile from "../HeaderProfile";

const DashboardContent = () => {
    const { user } = useAuth({ middleware: "auth" });
    const warehouseId = user.warehouse_id;
    const userRole = user.role;

    return (
        <div className="space-y-6">
            {/* HEADER WELCOME BANNER */}
            <HeaderProfile />
            <DailyDashboardGrid userRole={userRole} warehouseId={warehouseId} />
        </div>
    );
};

export default DashboardContent;
