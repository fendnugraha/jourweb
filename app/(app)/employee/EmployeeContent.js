"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardCheck, CreditCard, ReceiptText, Scale } from "lucide-react";
import AttendancePage from "./Attendance";
import Payroll from "./Payroll";
import useEmployee from "@/app/hooks/useEmployee";
import Notification from "@/app/components/Notification";
import EmployeeReceivable from "./EmployeeReceivable";
import MobileNavDrawer from "@/app/components/MobileNavDrawer";
import { useAuth } from "@/app/utils/auth";
import FinancialReport from "./report/FinancialReport";

const EmployeeContent = () => {
  const { user } = useAuth();
  const userRole = user?.role;
  const [activeSubTab, setActiveSubTab] = useState("attendance");
  const { employees, mutate: mutateEmployee } = useEmployee();
  const [notification, setNotification] = useState(null);

  // 1. Menu dasar untuk semua role
  const menuList = [
    { id: "attendance", label: "Absensi Karyawan", icon: ClipboardCheck },
  ];

  // 2. Tambahkan menu khusus jika user adalah Admin
  if (["Administrator", "Super Admin"].includes(userRole)) {
    menuList.push(
      { id: "payroll", label: "Gaji & Tunjangan", icon: ReceiptText },
      { id: "receivable", label: "Piutang Karyawan", icon: CreditCard },
      { id: "report", label: "Laporan Keuangan", icon: Scale },
    );
  }

  return (
    <>
      <Notification
        message={notification}
        onClose={() => setNotification(null)}
      />
      <div className="space-y-6">
        <MobileNavDrawer
          menuList={menuList}
          activeTab={activeSubTab}
          setActiveTab={setActiveSubTab}
        />
        <AnimatePresence mode="wait">
          {activeSubTab === "attendance" && (
            <motion.div
              key="attendance"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <AttendancePage userRole={userRole} />
            </motion.div>
          )}

          {activeSubTab === "payroll" && (
            <motion.div
              key="payroll"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <Payroll
                employees={employees}
                notification={setNotification}
                mutateEmployee={mutateEmployee}
              />
            </motion.div>
          )}

          {activeSubTab === "receivable" && (
            <motion.div
              key="receivable"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <EmployeeReceivable />
            </motion.div>
          )}

          {activeSubTab === "report" && (
            <motion.div
              key="report"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
              className="space-y-6"
            >
              <FinancialReport />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default EmployeeContent;
