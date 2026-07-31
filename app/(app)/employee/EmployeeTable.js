import Modal from "@/app/components/Modal";
import { User, UserCheck, DollarSign, TrendingUp, TrendingDown, Calendar, Briefcase, ShieldCheck, Edit2, Mars, Venus, Search, UserRound } from "lucide-react";
import EditEmployee from "./EditEmployee";
import { useMemo, useState } from "react";
import { calculateContractTillEnd, calculateWorkDuration, formatRupiah } from "@/app/utils/format";
import Dropdown from "@/app/components/Dropdown";

const EmployeeTable = ({ contacts, employees, notification, mutate }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("Add Employee");
    const [selectedEmployeeId, setSelectedEmployeeId] = useState(null);

    const selectedEmployee = useMemo(() => employees.find((e) => e.id === selectedEmployeeId), [employees, selectedEmployeeId]);
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
        const matchesSearch = employee.contact?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = status === "all" || employee.status === status;
        const matchesEmployment = employment === "all" || employee.employment_type === employment;
        return matchesSearch && matchesStatus && matchesEmployment;
    });

    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side Filters */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            aria-label="Search stock item list"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                    {/* Status Dropdown */}
                    <div>
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
                    <div>
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

                {/* Action Button */}
                <div className="flex gap-2 items-center">
                    <UserRound size={28} strokeWidth={2} />
                    <h1 className="text-xl font-bold">
                        {filteredEmployee.length || 0} <span className="text-slate-500 font-semibold">Pegawai</span>
                    </h1>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <User className="w-3.5 h-3.5" />
                                        <span>Nama</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>Gender</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <DollarSign className="w-3.5 h-3.5" />
                                        <span>Gaji Pokok</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <TrendingUp className="w-3.5 h-3.5" />
                                        <span>Tunjangan</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-right">
                                    <div className="flex items-center justify-end gap-1.5">
                                        <TrendingDown className="w-3.5 h-3.5" />
                                        <span>Potongan</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Calendar className="w-3.5 h-3.5" />
                                        <span>Hire Date</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Briefcase className="w-3.5 h-3.5" />
                                        <span>Tipe</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Status</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                            {filteredEmployee?.length > 0 ? (
                                filteredEmployee.map((employee) => (
                                    <tr key={employee.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150">
                                        {/* 1. Nama Karyawan */}
                                        <td className="px-5 py-4 font-semibold text-slate-800 dark:text-slate-100">{employee.contact?.name || "N/A"}</td>

                                        {/* 2. Gender Badge */}
                                        <td className="px-5 py-4 text-center">
                                            <span
                                                title={employee.gender === "male" ? "Laki-laki" : "Perempuan"}
                                                className={`inline-flex items-center justify-center h-7 w-7 rounded-lg transition-colors ${
                                                    employee.gender === "male"
                                                        ? "bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                                                        : "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                                }`}
                                            >
                                                {employee.gender === "male" ? <Mars className="h-3.5 w-3.5" /> : <Venus className="h-3.5 w-3.5" />}
                                            </span>
                                        </td>

                                        {/* 3. Base Salary */}
                                        <td className="px-5 py-4 text-right font-mono font-medium text-slate-800 dark:text-slate-200">
                                            {formatRupiah(employee.base_salary)}
                                        </td>

                                        {/* 4. Tunjangan (Allowance) */}
                                        <td className="px-5 py-4 text-right font-mono font-medium text-emerald-600 dark:text-emerald-400">
                                            {formatRupiah(
                                                employee.salary_components
                                                    ?.filter((c) => c.type === "allowance")
                                                    .reduce((total, component) => total + Number(component.amount), 0),
                                            )}
                                        </td>

                                        {/* 5. Potongan (Deduction) */}
                                        <td className="px-5 py-4 text-right font-mono font-medium text-rose-600 dark:text-rose-400">
                                            {formatRupiah(
                                                employee.salary_components
                                                    ?.filter((c) => c.type === "deduction")
                                                    .reduce((total, component) => total + Number(component.amount), 0),
                                            )}
                                        </td>

                                        {/* 6. Hire Date & Duration */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="font-medium text-slate-700 dark:text-slate-300">{employee.hire_date || "-"}</div>
                                            {employee.status === "active" && employee.hire_date && (
                                                <div className="mt-0.5 text-[10px] text-slate-400 font-mono">({calculateWorkDuration(employee.hire_date)})</div>
                                            )}
                                        </td>

                                        {/* 7. Employment Type */}
                                        <td className="px-5 py-4 text-center">
                                            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 capitalize">
                                                {employee.employment_type === "full_time" ? "Full Time" : calculateContractTillEnd(employee.contract_end)}
                                            </span>
                                        </td>

                                        {/* 8. Status Badge */}
                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium capitalize ${
                                                    employee.status === "active"
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
                                                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${
                                                        employee.status === "active" ? "bg-emerald-500 animate-pulse" : "bg-rose-500"
                                                    }`}
                                                />
                                                {employee.status}
                                            </span>
                                        </td>

                                        {/* 9. Action Button */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedEmployeeId(employee.id);
                                                    setModalTitle(`Edit Employee: ${employee.contact?.name}`);
                                                    setIsModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                <span>Edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty State jika data kosong */
                                <tr>
                                    <td colSpan={9} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <User className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                            <p className="text-xs font-medium">Tidak ada data karyawan ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} maxWidth="max-w-2xl">
                {modalTitle === "Add Employee" ? (
                    <h1>Add Employee</h1>
                ) : (
                    <EditEmployee
                        key={selectedEmployee?.id}
                        employee={selectedEmployee}
                        contacts={contacts}
                        isModalOpen={setIsModalOpen}
                        notification={notification}
                        mutate={mutate}
                    />
                )}
            </Modal>
        </>
    );
};

export default EmployeeTable;
