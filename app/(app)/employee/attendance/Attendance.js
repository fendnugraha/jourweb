import Modal from "@/app/components/Modal";
import { BarChart, Calendar, Clipboard, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import AttendanceTable from "./AttendanceTable";
import { DateTimeNow, formatLongDate, formatMonthYear, todayDate } from "@/app/utils/format";
import { useUserAttendance, useUserAttendanceMonthly } from "@/app/hooks/useUserAttendance";
import SubTabSwitcher from "@/app/components/SubTabSwitcher";
import AttendanceTableMonthly from "./AttendanceTableMonthly";
import AttendanceSummary from "./AttendanceSummary";
import useWarehouseZone from "@/app/hooks/useWarehouseZone";
import Dropdown from "@/app/components/Dropdown";

const AttendancePage = ({ userRole }) => {
    const today = todayDate();
    const [selectedDate, setSelectedDate] = useState(today);
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("Create Attendance Record");
    const [activeSubTab, setActiveSubTab] = useState("daily");
    const [selectedZone, setSelectedZone] = useState("all");

    const { zones } = useWarehouseZone();

    const zoneOptions = [{ value: "all", label: "All Zones" }, ...zones.map((zone) => ({ value: zone.id, label: zone.zone_name }))];

    const { userAttendance, mutate: mutateUserAttendance } = useUserAttendance({
        date: selectedDate,
    });

    const { warehouseMonthly, loading, error, mutate: mutateWarehouseMonthly } = useUserAttendanceMonthly({ date: selectedDate });

    useEffect(() => {
        if (selectedDate) {
            mutateUserAttendance();
            mutateWarehouseMonthly();
        }
    }, [selectedDate, mutateUserAttendance, mutateWarehouseMonthly]);

    const subMenuTabs = [
        {
            id: "daily",
            label: `${formatLongDate(selectedDate, true)} (Daily)`,
            icon: Clipboard,
        },
        {
            id: "monthly",
            label: `${formatMonthYear(selectedDate)} (Monthly)`,
            icon: Calendar,
        },
        { id: "summary", label: "Ringkasan Absensi", icon: BarChart },
    ];

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
                            placeholder="Search..."
                            aria-label="Search employees"
                            className="w-full rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>

                    {/* Status Dropdown */}
                    <div>
                        <Dropdown
                            id="zone-filter"
                            label="Zone Filter"
                            options={zoneOptions}
                            selectedValue={selectedZone}
                            onChange={(val) => setSelectedZone(val)}
                            ariaLabel="Filter workers by zone"
                        />
                    </div>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Calendar className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="date"
                            value={selectedDate}
                            onChange={(e) => setSelectedDate(e.target.value)}
                            placeholder="Select date..."
                            aria-label="Select date"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors disabled:bg-slate-300"
                        disabled={!["Administrator", "Super Admin"].includes(userRole)}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Abensi (Manual)</span>
                    </button>
                </div>
            </div>
            <SubTabSwitcher subMenuTabs={subMenuTabs} activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />
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
                        <AttendanceTable userAttendance={userAttendance} selectedZone={selectedZone} mutate={mutateUserAttendance} userRole={userRole} />
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
                        <AttendanceTableMonthly warehouseMonthly={warehouseMonthly} selectedZone={selectedZone} mutate={mutateWarehouseMonthly} />
                    </motion.div>
                )}

                {activeSubTab === "summary" && (
                    <motion.div
                        key="summary"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <AttendanceSummary dateString={selectedDate} search={searchTerm} selectedZone={selectedZone} />
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default AttendancePage;
