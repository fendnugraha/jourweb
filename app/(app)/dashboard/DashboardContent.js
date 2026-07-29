"use client";
import { useDailyDashboard } from "@/app/hooks/useDailyDashboard";
import { useAuth } from "@/app/utils/auth";
import { DateTimeNow } from "@/app/utils/format";
import DailyDashboardGrid from "./DailyDashboard";

const DashboardContent = () => {
    const { today } = DateTimeNow();
    const { user } = useAuth({ middleware: "auth" });
    const { dailyDashboard, loading, error } = useDailyDashboard(user?.warehouse_id, today, today);

    return (
        <div>
            <DailyDashboardGrid dailyDashboard={dailyDashboard} isLoading={loading} />
        </div>
    );
};

export default DashboardContent;
