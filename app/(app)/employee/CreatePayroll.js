import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import { DateTimeNow, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlarmClockPlus, Clock, Dot, Pencil, Play, Plus, ReceiptText, Search, Star, Undo2, Wallet } from "lucide-react";
import { useState } from "react";
import CreateSalaryComponents from "./CreateSalaryComponent";
import axios from "@/app/utils/axios";
import PayrollDetail from "./PayrollDetail";
import useEmployee from "@/app/hooks/useEmployee";

const CreatePayroll = ({ notification }) => {
    const { thisMonth, thisYear } = DateTimeNow();
    const [searchTerm, setSearchTerm] = useState("");
    const [month, setMonth] = useState(thisMonth);
    const [year, setYear] = useState(thisYear);
    const [loading, setLoading] = useState(false);
    const [payrollType, setPayrollType] = useState("monthly");

    const { employees, mutate: mutateEmployee } = useEmployee(month, year);
    const [processData, setProcessData] = useState(() => {
        const saved = localStorage.getItem("processData");
        return saved ? JSON.parse(saved) : [];
    });
    const [selectedEmployee, setSelectedEmployee] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalTitle, setModalTitle] = useState("");
    const [modalFormActive, setModalFormActive] = useState("summary");

    const monthOptions = [
        { value: 1, label: "January" },
        { value: 2, label: "February" },
        { value: 3, label: "March" },
        { value: 4, label: "April" },
        { value: 5, label: "May" },
        { value: 6, label: "June" },
        { value: 7, label: "July" },
        { value: 8, label: "August" },
        { value: 9, label: "September" },
        { value: 10, label: "October" },
        { value: 11, label: "November" },
        { value: 12, label: "December" },
    ];

    const yearOptions = [
        { value: 2025, label: 2025 },
        { value: 2026, label: 2026 },
    ];

    const payrollTypeOptions = [
        { value: "monthly", label: "Gaji Bulanan" },
        { value: "yearly", label: "Tahunan (THR)" },
        { value: "one-time", label: "Satu Kali (Bonus)" },
    ];

    const updateLocalStorage = (data) => {
        setProcessData(data);
        localStorage.setItem("processData", JSON.stringify(data));
    };

    const AddToProcessData = (employees, month, year, payroll = true) => {
        const payload = employees
            .filter((employee) => employee.status === "active")
            .map((employee) => {
                const lateCount = employee.attendances?.filter((item) => item.approval_status === "Late").length || 0;
                const overtimeCount = employee.attendances?.filter((item) => item.approval_status === "Overtime").length || 0;

                const receivable = Number(employee.contact?.employee_receivables_sum?.total) || 0;
                const installment = Number(employee.contact?.installment_receivables_sum?.total) || 0;

                const deductions = [
                    ...(employee.salary_components
                        ?.filter((sc) => sc.type === "deduction")
                        .map((sc) => ({
                            name: sc.name,
                            amount: Number(sc.amount),
                        })) || []),
                    ...(lateCount > 0
                        ? [
                              {
                                  name: "Denda Keterlambatan",
                                  amount: lateCount * 10000,
                              },
                          ]
                        : []),
                ];

                const totalSavings = deductions?.filter((d) => d.name === "Simpanan Wajib").reduce((sum, d) => sum + d.amount, 0) || 0;

                return {
                    employee_id: employee.id,
                    contact_id: employee.contact_id,
                    name: employee.contact?.name,
                    ...(payroll && {
                        basic_salary: employee.base_salary,
                        commission: employee.salary_components?.filter((sc) => sc.type === "allowance").reduce((sum, sc) => sum + Number(sc.amount), 0) || 0,
                        overtime: overtimeCount > 0 ? overtimeCount * 100000 : 0,
                        employee_receivable: receivable > 0 ? receivable : 0,
                        installment_receivable: installment > 0 ? installment : 0,
                        attendances: employee.attendances || [],
                        total_savings: totalSavings,
                        deductions,
                    }),
                    month,
                    year,
                    bonuses: [],
                };
            });

        updateLocalStorage(payload);
    };

    const totalSalary = processData.reduce((total, item) => total + Number(item.basic_salary || 0), 0);
    const totalCommission = processData.reduce((total, item) => total + Number(item.commission || 0), 0);
    const totalBonus =
        processData.reduce((total, item) => total + (item.bonuses?.reduce((t, bonus) => t + (Number(bonus.amount) || 0), 0) || 0), 0) +
        processData.reduce((total, item) => total + Number(item.overtime || 0), 0);
    const totalReceivable =
        processData.reduce((total, item) => total + Number(item.employee_receivable || 0), 0) +
        processData.reduce((total, item) => total + Number(item.installment_receivable || 0), 0);
    const totalDeduction = processData.reduce((total, item) => {
        const deductions = item.deductions || [];
        const deductionTotal = deductions.reduce((t, deduction) => t + Number(deduction.amount || 0), 0);
        return total + deductionTotal;
    }, 0);
    const totalSavingSum = processData.reduce((total, item) => total + (item.total_savings || 0), 0);

    const calculateTotalItem = (item) => {
        const basicSalary = Number(item.basic_salary) || 0;
        const commission = Number(item.commission) || 0;
        const overtime = Number(item.overtime) || 0;
        const bonuses = item.bonuses?.reduce((t, b) => t + Number(b.amount || 0), 0) || 0;
        const deductions = item.deductions?.reduce((t, d) => t + Number(d.amount || 0), 0) || 0;
        const receivable = Number(item.employee_receivable) || 0;
        const installment = Number(item.installment_receivable) || 0;

        const total = basicSalary + commission + overtime + bonuses - deductions - receivable - installment;
        return formatNumber(total);
    };

    const clearProcessData = () => {
        setProcessData([]);
        localStorage.removeItem("processData");
    };

    const handleUpdateDeductionSubmit = (e) => {
        e.preventDefault();
        if (!selectedEmployee) return;

        const updatedData = processData.map((item) => {
            if (item.employee_id === selectedEmployee.employee_id) {
                return {
                    ...item,
                    employee_receivable: Number(selectedEmployee.employee_receivable) || 0,
                    installment_receivable: Number(selectedEmployee.installment_receivable) || 0,
                };
            }
            return item;
        });

        updateLocalStorage(updatedData);
        setIsModalOpen(false);
        notification(`Potongan/Piutang untuk ${selectedEmployee.name} berhasil diperbarui`);
    };

    const handleSubmit = async (e) => {
        if (!confirm("Anda yakin ingin menyimpan payroll?")) return;
        e.preventDefault();

        if (!processData.length) {
            notification({
                type: "error",
                message: "Data payroll masih kosong",
            });
            return;
        }

        if (!month || !year) {
            notification({
                type: "error",
                message: "Bulan dan tahun wajib diisi",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("/api/payrolls", {
                employees: processData,
                month,
                year,
                type: payrollType,
            });

            notification(response.data?.message || "Payroll berhasil disimpan");
            setIsModalOpen(false);
            clearProcessData();
        } catch (error) {
            console.error(error);
            notification(error.response?.data?.message || "Terjadi kesalahan saat menyimpan payroll");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex-1 grid gap-3 sm:grid-cols-2 max-w-xl">
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
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setModalFormActive("summary");
                            setModalTitle("Payroll Summary");
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-between gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                        hidden={processData.length === 0}
                    >
                        <span className="flex gap-1 items-center">
                            <ReceiptText className="h-4 w-4" /> {month}/{year}
                        </span>
                        <span>{formatRupiah(totalSalary + totalCommission + totalBonus - totalDeduction - totalReceivable + totalSavingSum)}</span>
                    </button>
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setModalFormActive("bonus-deduction");
                            setModalTitle("Bonus/Potongan");
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                        hidden={processData.length === 0}
                    >
                        <Plus className="h-4 w-4" />
                        <span>Bonus/Potongan</span>
                    </button>
                    <button
                        type="button"
                        onClick={clearProcessData}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-red-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-500 transition-colors"
                        hidden={processData.length === 0}
                    >
                        <Undo2 className="h-4 w-4" />
                        <span>Reset</span>
                    </button>
                </div>
            </div>

            <div className="data-table-wrapper overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4 text-center">
                                Karyawan
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Gaji Pokok
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Tunjangan
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Bonus/Lainnya
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Potongan
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Total Diterima
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {processData.length > 0 ? (
                            processData
                                .filter((emp) => emp.name.toLowerCase().includes(searchTerm.toLowerCase()))
                                .map((employee) => (
                                    <tr
                                        key={employee.employee_id}
                                        className="group text-xs hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150"
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex gap-1 items-center">
                                                {employee.name} {employee.employee_receivable > 0 && <div className="bg-green-400 h-2 w-2 rounded-full" />}
                                                {employee.installment_receivable > 0 && <div className="bg-red-400 h-2 w-2 rounded-full" />}
                                            </div>
                                            <div className="flex gap-4 items-center font-normal mt-1">
                                                <div className="flex gap-1 items-center" title="Hadir Tepat Waktu / Good">
                                                    <Star size={12} fill="yellow" className="text-amber-500" />
                                                    {employee.attendances?.filter((a) => a.approval_status === "Good").length || 0}
                                                </div>
                                                <div className="flex gap-1 items-center" title="Lembur">
                                                    <AlarmClockPlus size={12} className="text-violet-500" />
                                                    {employee.attendances?.filter((a) => a.approval_status === "Overtime").length || 0}
                                                </div>
                                                <div className="flex gap-1 items-center" title="Terlambat">
                                                    <Clock size={12} className="text-red-500" />
                                                    {employee.attendances?.filter((a) => a.approval_status === "Late").length || 0}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">{formatNumber(employee.basic_salary ?? 0)}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(employee.commission ?? 0)}</td>
                                        <td className="px-6 py-4 text-right">
                                            {formatNumber(
                                                (employee.bonuses?.reduce((total, bonus) => total + Number(bonus.amount || 0), 0) || 0) +
                                                    (employee.overtime || 0),
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {formatNumber(
                                                (employee?.deductions?.reduce((total, deduction) => total + Number(deduction.amount || 0), 0) || 0) +
                                                    Number(employee.employee_receivable || 0) +
                                                    Number(employee.installment_receivable || 0),
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right font-bold text-green-500">{calculateTotalItem(employee)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEmployee(employee);
                                                        setModalTitle("Edit Potongan Piutang: " + employee.name);
                                                        setModalFormActive("update-deduction");
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                                    title="Edit Potongan / Kasbon"
                                                >
                                                    <Pencil size={16} />
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEmployee(employee);
                                                        setModalTitle("Receipt Detail: " + employee.name);
                                                        setModalFormActive("receipt-detail");
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="p-1 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                                                    title="Rincian Slip Gaji"
                                                >
                                                    <ReceiptText size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                        ) : (
                            <tr>
                                <td colSpan="7" className="px-6 py-8 text-center">
                                    <div className="grid grid-cols-2 gap-4 mx-auto sm:w-1/3">
                                        <div>
                                            <Dropdown
                                                id="month-filter"
                                                label="Month"
                                                options={monthOptions}
                                                selectedValue={month}
                                                onChange={(val) => setMonth(val)}
                                                ariaLabel="Filter month"
                                            />
                                        </div>
                                        <div>
                                            <Dropdown
                                                id="year-filter"
                                                label="Year"
                                                options={yearOptions}
                                                selectedValue={year}
                                                onChange={(val) => setYear(val)}
                                                ariaLabel="Filter year"
                                            />
                                        </div>
                                        <div className="sm:col-span-2">
                                            <Dropdown
                                                id="type-filter"
                                                label="Type"
                                                options={payrollTypeOptions}
                                                selectedValue={payrollType}
                                                onChange={(val) => setPayrollType(val)}
                                                ariaLabel="Filter payroll type"
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => AddToProcessData(employees, month, year)}
                                            className="w-full sm:w-auto sm:col-span-2 inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                                        >
                                            <Plus className="h-4 w-4" />
                                            <span>Generate new payroll</span>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} maxWidth="max-w-xl">
                {modalFormActive === "receipt-detail" && selectedEmployee && <PayrollDetail employee={selectedEmployee} />}

                {modalFormActive === "summary" && (
                    <>
                        {/* Detail */}
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-slate-500">Gaji Pokok</span>
                                <span>{formatNumber(totalSalary)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">Tunjangan</span>
                                <span className="text-emerald-600 dark:text-emerald-400">+ {formatNumber(totalCommission)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">Bonus</span>
                                <span className="text-emerald-600 dark:text-emerald-400">+ {formatNumber(totalBonus)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">Potongan</span>
                                <span className="text-rose-600 dark:text-rose-400">- {formatNumber(totalDeduction + totalReceivable)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">Simpanan Wajib</span>
                                <span>{formatNumber(totalSavingSum)}</span>
                            </div>

                            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-3" />

                            <div className="flex justify-between font-semibold">
                                <span>Total Diterima</span>
                                <span>{formatNumber(totalSalary + totalCommission + totalBonus - totalDeduction - totalReceivable)}</span>
                            </div>
                        </div>

                        {/* Highlight */}
                        <div className="mt-6 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 p-4 text-white">
                            <div className="flex items-center gap-2 opacity-90">
                                <Wallet size={16} />
                                <span className="text-xs uppercase tracking-wider">Pengajuan Gaji</span>
                            </div>

                            <div className="mt-2 text-3xl font-bold">
                                {formatRupiah(totalSalary + totalCommission + totalBonus - totalDeduction - totalReceivable + totalSavingSum)}
                            </div>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-yellow-300 disabled:opacity-50"
                            >
                                <Play size={16} />
                                {loading ? "Processing..." : "Process"}
                            </button>
                        </div>
                    </>
                )}

                {modalFormActive === "bonus-deduction" && (
                    <CreateSalaryComponents employees={employees} setProcessData={setProcessData} isModalOpen={setIsModalOpen} notification={notification} />
                )}

                {modalFormActive === "update-deduction" && selectedEmployee && (
                    <form onSubmit={handleUpdateDeductionSubmit} className="space-y-4">
                        <div className="space-y-1">
                            <label htmlFor="tx-receivable" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Kasbon (Rp)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-receivable"
                                    type="number"
                                    value={selectedEmployee.employee_receivable ?? ""}
                                    onChange={(e) =>
                                        setSelectedEmployee((prev) => ({
                                            ...prev,
                                            employee_receivable: e.target.value,
                                        }))
                                    }
                                    placeholder="50000"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </div>
                            {selectedEmployee.employee_receivable !== "" && !isNaN(parseFloat(selectedEmployee.employee_receivable)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: {formatRupiah(selectedEmployee.employee_receivable)}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="tx-installment" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Cicilan (Rp)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-installment"
                                    type="number"
                                    value={selectedEmployee.installment_receivable ?? ""}
                                    onChange={(e) =>
                                        setSelectedEmployee((prev) => ({
                                            ...prev,
                                            installment_receivable: e.target.value,
                                        }))
                                    }
                                    placeholder="50000"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </div>
                            {selectedEmployee.installment_receivable !== "" && !isNaN(parseFloat(selectedEmployee.installment_receivable)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: {formatRupiah(selectedEmployee.installment_receivable)}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                            <button
                                type="button"
                                onClick={() => setIsModalOpen(false)}
                                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                            >
                                Simpan Perubahan
                            </button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    );
};

export default CreatePayroll;
