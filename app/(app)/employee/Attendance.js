import Modal from "@/app/components/Modal";
import { BarChart, Calendar, Clipboard, Plus, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import AttendanceTable from "./AttendanceTable";
import {
  DateTimeNow,
  formatLongDate,
  formatMonthYear,
  todayDate,
} from "@/app/utils/format";
import {
  useUserAttendance,
  useUserAttendanceMonthly,
} from "@/app/hooks/useUserAttendance";
import AttendanceTableMonthly from "./AttendanceTableMonthly";
import DateFilterDropdown from "@/app/components/DateFilterDropdown";

const AttendancePage = ({ userRole }) => {
  const today = todayDate();
  const [selectedDate, setSelectedDate] = useState(today);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Create Attendance Record");
  const [activeSubTab, setActiveSubTab] = useState("daily");
  const [selectedZone, setSelectedZone] = useState(null);

  const { userAttendance, mutate: mutateUserAttendance } = useUserAttendance({
    date: selectedDate,
  });

  const {
    warehouseMonthly,
    loading,
    error,
    mutate: mutateWarehouseMonthly,
  } = useUserAttendanceMonthly({ date: selectedDate });

  useEffect(() => {
    if (selectedDate) {
      mutateUserAttendance();
      mutateWarehouseMonthly();
    }
  }, [selectedDate, mutateUserAttendance, mutateWarehouseMonthly]);

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
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
              }}
              className="rounded-xl border border-slate-300 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
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
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors disabled:bg-slate-300"
            disabled={!["Administrator", "Super Admin"].includes(userRole)}
          >
            <Plus className="h-4 w-4" />
            <span>Abensi (Manual)</span>
          </button>
        </div>
      </div>
      <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl inline-flex gap-1 border border-slate-200/60 dark:border-slate-700/50 shadow-2xs">
        {[
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
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer select-none ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {/* Animasi Background Pill Meluncur */}
              {isActive && (
                <motion.div
                  layoutId="activeSubTabIndicator"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon & Text (z-10 supaya di atas background animasi) */}
              <tab.icon
                className={`h-3.5 w-3.5 z-10 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
              />
              <span className="z-10">{tab.label}</span>
            </button>
          );
        })}
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
            <AttendanceTable
              userAttendance={userAttendance}
              mutate={mutateUserAttendance}
              userRole={userRole}
            />
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
            <AttendanceTableMonthly
              warehouseMonthly={warehouseMonthly}
              selectedZone={selectedZone}
              mutate={mutateWarehouseMonthly}
            />
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
