import Modal from "@/app/components/Modal";
import { BarChart, Calendar, Clipboard, Plus, Search } from "lucide-react";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import AttendanceTable from "./AttendanceTable";
import { DateTimeNow } from "@/app/utils/format";
import { useUserAttendance, useUserAttendanceMonthly } from "@/app/hooks/useUserAttendance";
import AttendanceTableMonthly from "./AttendanceTableMonthly";
import DateFilterDropdown from "@/app/components/DateFilterDropdown";

const AttendancePage = () => {
    const { today } = DateTimeNow();
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("Create Attendance Record");
    const [activeSubTab, setActiveSubTab] = useState("daily");
    const [selectedZone, setSelectedZone] = useState(null);
    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: "",
        endDate: "",
    });

    const { userAttendance, mutate: mutateUserAttendance } = useUserAttendance({ date: dateFilter.startDate || today });
    const { warehouseMonthly, loading, error, mutate: mutateWarehouseMonthly } = useUserAttendanceMonthly({ date: dateFilter.startDate || today });

    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side Filters */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    {/* Search SKU/Name */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by SKU or Name..."
                            aria-label="Search stock item list"
                            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    <div>
                        <DateFilterDropdown
                            selectedPreset={dateFilter.preset}
                            customStartDate={dateFilter.startDate}
                            customEndDate={dateFilter.endDate}
                            onChange={(val) => setDateFilter(val)}
                            label="Transaction Date"
                        />
                    </div>
                    {/* Status Dropdown */}
                    {/* <div>
                        <Dropdown
                            id="stock-status-filter"
                            label="Stock Status Filter"
                            options={statusOptions}
                            selectedValue={status}
                            onChange={(val) => setStatus(val)}
                            ariaLabel="Filter inventory by status"
                        />
                    </div> */}
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Abensi (Manual)</span>
                    </button>
                </div>
            </div>
            <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px px-4">
                {[
                    { id: "daily", label: "Daily Attendance", icon: Clipboard },
                    { id: "monthly", label: "Monthly Attendance", icon: Calendar },
                    { id: "summary", label: "Attendance Summary", icon: BarChart },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`pb-3 text-xs font-bold relative transition-colors ${
                            activeSubTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                {activeSubTab === "daily" && (
                    <motion.div
                        key="daily"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <AttendanceTable userAttendance={userAttendance} />
                    </motion.div>
                )}
                {activeSubTab === "monthly" && (
                    <motion.div
                        key="monthly"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <AttendanceTableMonthly warehouseMonthly={warehouseMonthly} selectedZone={selectedZone} />
                    </motion.div>
                )}
            </AnimatePresence>
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                }}
                title={modalTitle}
            ></Modal>
        </>
    );
};

export default AttendancePage;
