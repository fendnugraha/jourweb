import {
  ClipboardCheck,
  Plus,
  ReceiptText,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import { useMemo, useState } from "react";
import EmployeeTable from "./EmployeeTable";
import Modal from "@/app/components/Modal";
import CreateEmployee from "./CreateEmployee";
import useContacts from "@/app/hooks/useContacts";
import { AnimatePresence, motion } from "motion/react";
import CreatePayroll from "./CreatePayroll";
import PayrollTable from "./PayrollTable";
import Dropdown from "@/app/components/Dropdown";

const Payroll = ({ employees, notification, mutateEmployee }) => {
  const [isModalAddEmployeeOpen, setIsModalAddEmployeeOpen] = useState(false);
  const { contacts } = useContacts();
  const [activeSubTab, setActiveSubTab] = useState("employees");

  const subTabs = [
    { id: "employees", label: "Employees Management", icon: Users },
    { id: "payroll", label: "Payslips & Salaries", icon: ReceiptText },
    { id: "payroll-report", label: "Payroll Report", icon: ClipboardCheck },
  ];

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === selectedEmployeeId),
    [employees, selectedEmployeeId],
  );
  const [status, setStatus] = useState("active");
  const [employment, setEmployment] = useState("all");

  const statusOptions = [
    { value: "all", label: "All Status" },
    { value: "active", label: "Active" },
    { value: "inactive", label: "Inactive" },
    { value: "resigned", label: "Resigned" },
    { value: "terminated", label: "Terminated" },
  ];

  const employmentOptions = [
    { value: "all", label: "All Types" },
    { value: "full_time", label: "Full-time" },
    { value: "part_time", label: "Part-time" },
    { value: "contract", label: "Contract" },
  ];

  const filteredEmployee = employees.filter((employee) => {
    const matchesSearch = employee.contact?.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus = status === "all" || employee.status === status;
    const matchesEmployment =
      employment === "all" || employee.employment_type === employment;
    return matchesSearch && matchesStatus && matchesEmployment;
  });

  return (
    <div className="space-y-6">
      {/* Filter & Count Header Bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
        {/* Left Side Filters */}
        <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
          <div className="relative" hidden={activeSubTab !== "employees"}>
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
          {/* Status Dropdown */}
          <div hidden={activeSubTab !== "employees"}>
            <Dropdown
              id="user-status-filter"
              label="User Status Filter"
              options={statusOptions}
              selectedValue={status}
              onChange={(val) => setStatus(val)}
              ariaLabel="Filter users by status"
            />
          </div>
          {/* Employment Dropdown */}
          <div hidden={activeSubTab !== "employees"}>
            <Dropdown
              id="employment-type-filter"
              label="Employment Type Filter"
              options={employmentOptions}
              selectedValue={employment}
              onChange={(val) => setEmployment(val)}
              ariaLabel="Filter employees by employment type"
            />
          </div>
        </div>

        {/* Count Badge & Action Button */}
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs font-bold shrink-0">
            <UserRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{filteredEmployee.length || 0}</span>
            <span className="text-indigo-500/80 font-medium">Pegawai</span>
          </div>
          <button
            type="button"
            onClick={() => setIsModalAddEmployeeOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors cursor-pointer shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Tambah Karyawan</span>
          </button>
        </div>
      </div>
      {/* Sub-Tabs Navigation */}
      <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl inline-flex gap-1 border border-slate-200/60 dark:border-slate-700/50 shadow-2xs">
        {subTabs.map((tab) => {
          const Icon = tab.icon;
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

      {/* Sub-Tab Contents */}
      <AnimatePresence mode="wait">
        {activeSubTab === "employees" && (
          <motion.div
            key="employees"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <EmployeeTable
              contacts={contacts}
              notification={notification}
              mutate={mutateEmployee}
              filteredEmployee={filteredEmployee}
              selectedEmployee={selectedEmployee}
              setSelectedEmployeeId={setSelectedEmployeeId}
            />
          </motion.div>
        )}

        {activeSubTab === "payroll" && (
          <motion.div
            key="payroll"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <CreatePayroll employees={employees} notification={notification} />
          </motion.div>
        )}

        {activeSubTab === "payroll-report" && (
          <motion.div
            key="payroll-report"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
          >
            <PayrollTable />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Register New Employee Modal */}
      <Modal
        isOpen={isModalAddEmployeeOpen}
        onClose={() => setIsModalAddEmployeeOpen(false)}
        title="Register New Employee"
        maxWidth="max-w-2xl"
      >
        <CreateEmployee
          contacts={contacts}
          notification={notification}
          mutateEmployee={mutateEmployee}
        />
      </Modal>
    </div>
  );
};

export default Payroll;
