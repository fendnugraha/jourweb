"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ClipboardCheck, CreditCard, ReceiptText, Scale } from "lucide-react";
import AttendancePage from "./Attendance";
import Payroll from "./Payroll";
import useEmployee from "@/app/hooks/useEmployee";
import Notification from "@/app/components/Notification";

const EmployeeContent = () => {
    const [activeSubTab, setActiveSubTab] = useState("attendance");
    const { employees, mutate: mutateEmployee } = useEmployee();
    const [notification, setNotification] = useState(null);
    console.log(employees);
    return (
        <>
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px pt-4 px-4">
                    {/* Sub-Tab Buttons */}
                    {[
                        { id: "attendance", label: "Absensi Karyawan", icon: ClipboardCheck },
                        { id: "payroll", label: "Gaji & Tunjangan", icon: ReceiptText },
                        { id: "receivable", label: "Piutang Karyawan", icon: CreditCard },
                        { id: "report", label: "Laporan Keuangan", icon: Scale },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`pb-3 text-sm font-bold relative transition-colors ${
                                activeSubTab === tab.id
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                            }`}
                        >
                            <span className="flex items-center gap-1.5">
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </span>
                            {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                        </button>
                    ))}
                </div>
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
                </AnimatePresence>
            </div>
        </>
    );
};

export default EmployeeContent;
