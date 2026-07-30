import Modal from "@/app/components/Modal";
import { Mars, Plus, Search, UserCircle, UserRound, Venus } from "lucide-react";
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
            <div className="data-table-wrapper overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4 text-center">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Gender
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Base Salary
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Tunjangan
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Potongan
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Hire Date
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Type
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Status
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Action
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {filteredEmployee.map((employee) => (
                            <tr key={employee.id} className="group text-xs hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="px-6 py-4">{employee.contact?.name}</td>
                                <td className="px-6 py-4 text-right">
                                    {employee.gender === "male" ? <Mars size={12} className="text-blue-400" /> : <Venus size={12} className="text-pink-400" />}
                                </td>
                                <td className="px-6 py-4 text-right">{formatRupiah(employee.base_salary)}</td>
                                <td className="px-6 py-4 text-right text-green-400">
                                    {formatRupiah(
                                        employee.salary_components
                                            ?.filter((c) => c.type === "allowance")
                                            .reduce((total, component) => total + Number(component.amount), 0),
                                    )}
                                </td>
                                <td className="px-6 py-4 text-right text-red-400">
                                    {formatRupiah(
                                        employee.salary_components
                                            ?.filter((c) => c.type === "deduction")
                                            .reduce((total, component) => total + Number(component.amount), 0),
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <div className="text-xs text-slate-700 dark:text-slate-300">{employee.hire_date}</div>
                                    {employee.status === "active" && (
                                        <div className="text-[10px] text-slate-400">({calculateWorkDuration(employee.hire_date)})</div>
                                    )}
                                </td>
                                <td className="px-6 py-4 text-center capitalize">
                                    {employee.employment_type === "full_time" ? "Full Time" : calculateContractTillEnd(employee.contract_end)}
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={`inline-flex capitalize items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                            employee.status === "active"
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                        }`}
                                    >
                                        {employee.status}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button
                                        className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                        onClick={() => {
                                            setSelectedEmployeeId(employee.id);
                                            setModalTitle(`Edit Employee: ${employee.contact?.name}`);
                                            setIsModalOpen(true);
                                        }}
                                    >
                                        Edit
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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
