"use client";
import { useDailyDashboard } from "@/app/hooks/useDailyDashboard";
import { useAuth } from "@/app/utils/auth";
import { DateTimeNow } from "@/app/utils/format";
import DailyDashboardGrid from "./DailyDashboard";
import HeaderProfile from "../HeaderProfile";
import AdminDashboard from "./AdminDashboard";

const DashboardContent = () => {
  const { user } = useAuth({ middleware: "auth" });
  const warehouseId = user.warehouse_id;
  const userRole = user.role;

  return (
    <div className="space-y-6">
      {/* HEADER WELCOME BANNER */}
      <HeaderProfile />
      {["Administrator", "Super Admin"].includes(userRole) &&
      warehouseId === 1 ? (
        <AdminDashboard userRole={userRole} warehouseId={warehouseId} />
      ) : (
        <DailyDashboardGrid userRole={userRole} warehouseId={warehouseId} />
      )}
    </div>
  );
};

export default DashboardContent;
