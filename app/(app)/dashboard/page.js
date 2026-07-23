"use client";
import { useDailyDashboard } from "@/app/hooks/useDailyDashboard";
import { useAuth } from "@/app/utils/auth";
import { DateTimeNow } from "@/app/utils/format";

const DashboardPage = () => {
    const { today } = DateTimeNow();
    const { user } = useAuth({ middleware: "auth" });
    const { dailyDashboard, loading, error } = useDailyDashboard(user?.warehouse_id, today, today);
    console.log({ dailyDashboard });
    return <div>Dashboard</div>;
};

export default DashboardPage;

// export const metadata = {
//     title: "Dashboard",
// };
