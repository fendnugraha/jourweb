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

const menuList = [
    { id: "attendance", label: "Absensi Karyawan", icon: ClipboardCheck },
    { id: "payroll", label: "Gaji & Tunjangan", icon: ReceiptText },
    { id: "receivable", label: "Piutang Karyawan", icon: CreditCard },
    { id: "report", label: "Laporan Keuangan", icon: Scale },
];

const EmployeeContent = () => {
    const [activeSubTab, setActiveSubTab] = useState("attendance");
    const { employees, mutate: mutateEmployee } = useEmployee();
    const [notification, setNotification] = useState(null);
    return (
        <>
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="space-y-6">
                <MobileNavDrawer menuList={menuList} activeTab={activeSubTab} setActiveTab={setActiveSubTab} />
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
                            <AttendancePage />
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
                            <Payroll employees={employees} notification={setNotification} mutateEmployee={mutateEmployee} />
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
                </AnimatePresence>
            </div>
        </>
    );
};

export default EmployeeContent;
