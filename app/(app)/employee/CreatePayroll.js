"use client";

import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import { DateTimeNow, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlarmClockPlus, AlertCircle, Clock, Pencil, Play, Plus, ReceiptText, Search, Star, Undo2, Wallet } from "lucide-react";
import { useState } from "react";
import CreateSalaryComponents from "./CreateSalaryComponent";
import axios from "@/app/utils/axios";
import PayrollDetail from "./PayrollDetail";
import useEmployee from "@/app/hooks/useEmployee";
import { useAccounts } from "@/app/hooks/useAccounts";

const getStoredProcessData = () => {
    if (typeof window === "undefined") return [];
    try {
        const saved = localStorage.getItem("processData");
        return saved ? JSON.parse(saved) : [];
    } catch {
        return [];
    }
};

const CreatePayroll = ({ notification }) => {
    const { thisMonth, thisYear } = DateTimeNow();

    const [processData, setProcessData] = useState(getStoredProcessData);

    const storedMonth = processData[0]?.month;
    const storedYear = processData[0]?.year;

    const [searchTerm, setSearchTerm] = useState("");
    const [month, setMonth] = useState(storedMonth || thisMonth);
    const [year, setYear] = useState(storedYear || thisYear);
    const [loading, setLoading] = useState(false);
    const [payrollType, setPayrollType] = useState("monthly");

    const { employees } = useEmployee(month, year);
    const { accounts = [] } = useAccounts();
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
        { value: 2026, label: 2026 },
        { value: 2027, label: 2027 },
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

                // Ambil sumber dana dari jurnal pencairan cicilan terakhir (ID 1 = Potong Laba, > 1 = Kas Modal)
                const latestInstallmentCredId = Number(employee.contact?.latest_installment_receivable?.journal?.cred_id) || 1;
                const defaultInstallmentAccountId = installment > 0 ? latestInstallmentCredId : 1;
                const matchedAcc =
                    defaultInstallmentAccountId > 1 ? accounts.find((a) => Number(a.id) === defaultInstallmentAccountId) : null;
                const matchedWhName = matchedAcc?.warehouse?.name ? matchedAcc.warehouse.name.replace(/^konter\s*/i, "") : null;
                const defaultInstallmentAccountName =
                    installment > 0
                        ? defaultInstallmentAccountId === 1
                            ? "Potong Laba (Pendapatan)"
                            : matchedAcc
                              ? matchedWhName && matchedAcc.warehouse_id !== 1
                                  ? `${matchedAcc.name} (${matchedWhName})`
                                  : matchedAcc.name
                              : `Akun #${defaultInstallmentAccountId}`
                        : null;

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
                        installment_account_id: defaultInstallmentAccountId,
                        installment_account_name: defaultInstallmentAccountName,
                        attendances: employee.attendances || [],
                        total_savings: totalSavings,
                        deductions,
                    }),
                    month: month || storedMonth,
                    year: year || storedYear,
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
    const totalKasbon = processData.reduce((total, item) => total + Number(item.employee_receivable || 0), 0);

    // Pisahkan cicilan berdasarkan akun tujuannya:
    // 1. Cicilan Potong Laba (installment_account_id === 1 atau kosong) -> mengurangi pengajuan gaji ke owner
    // 2. Cicilan Kas Modal (installment_account_id > 1) -> tetap diajukan ke owner karena uangnya disetor kembali ke Kas Modal
    const totalInstallmentLaba = processData.reduce((total, item) => {
        const accId = Number(item.installment_account_id || item.account_id || 1);
        return accId === 1 ? total + Number(item.installment_receivable || 0) : total;
    }, 0);
    const totalInstallmentModal = processData.reduce((total, item) => {
        const accId = Number(item.installment_account_id || item.account_id || 1);
        return accId > 1 ? total + Number(item.installment_receivable || 0) : total;
    }, 0);

    const totalInstallment = totalInstallmentLaba + totalInstallmentModal;
    const totalReceivable = totalKasbon + totalInstallment;
    const totalDeduction = processData.reduce((total, item) => {
        const deductions = item.deductions || [];
        const deductionTotal = deductions.reduce((t, deduction) => t + Number(deduction.amount || 0), 0);
        return total + deductionTotal;
    }, 0);
    const totalSavingSum = processData.reduce((total, item) => total + Number(item.total_savings || 0), 0);

    // Total gaji bersih yang diterima seluruh karyawan (Take Home Pay)
    const totalNetPay = totalSalary + totalCommission + totalBonus - totalDeduction - totalReceivable;

    // Total permintaan dana gaji kepada Admin/Owner:
    // Take Home Pay Karyawan + Simpanan Wajib + Cicilan yang masuk ke Kas Modal (sedangkan Kasbon & Cicilan Potong Laba otomatis memotong pengajuan)
    const totalPayrollRequest = totalNetPay + totalSavingSum + totalInstallmentModal;

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

    const handleUpdateEmployeeSalary = (updatedEmployee) => {
        if (!updatedEmployee) return;

        const updatedData = processData.map((item) => {
            if (item.employee_id === updatedEmployee.employee_id) {
                return updatedEmployee;
            }
            return item;
        });

        updateLocalStorage(updatedData);
        setSelectedEmployee(updatedEmployee);
        setIsModalOpen(false);
        if (typeof notification === "function") {
            notification(`Rincian gaji untuk ${updatedEmployee.name} berhasil diperbarui`);
        }
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
                        <span>{formatRupiah(totalPayrollRequest)}</span>
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
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                <span className="font-semibold text-slate-800 dark:text-slate-100">{employee.name}</span>
                                                {employee.employee_receivable > 0 && (
                                                    <span
                                                        className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60"
                                                        title="Potongan Kasbon (Potong Laba)"
                                                    >
                                                        <span className="bg-emerald-500 h-1.5 w-1.5 rounded-full" />
                                                        Kasbon
                                                    </span>
                                                )}
                                                {employee.installment_receivable > 0 && (
                                                    <span
                                                        className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[10px] font-medium border ${
                                                            Number(employee.installment_account_id || 1) > 1
                                                                ? "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60"
                                                                : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60"
                                                        }`}
                                                        title={
                                                            Number(employee.installment_account_id || 1) > 1
                                                                ? `Cicilan masuk ke Kas Modal: ${employee.installment_account_name || "Kas Modal"}`
                                                                : "Cicilan Potong Laba (Mengurangi pengajuan gaji ke Owner)"
                                                        }
                                                    >
                                                        <span
                                                            className={`h-1.5 w-1.5 rounded-full ${
                                                                Number(employee.installment_account_id || 1) > 1 ? "bg-indigo-500" : "bg-rose-500"
                                                            }`}
                                                        />
                                                        {Number(employee.installment_account_id || 1) > 1
                                                            ? `Cicilan → ${employee.installment_account_name || "Kas Modal"}`
                                                            : "Cicilan (Potong Laba)"}
                                                    </span>
                                                )}
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
                                            <div className="flex items-center justify-center">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedEmployee(employee);
                                                        setModalTitle("Rincian & Edit Gaji: " + employee.name);
                                                        setModalFormActive("receipt-detail");
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-750 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors shadow-2xs cursor-pointer text-xs font-medium"
                                                    title="Lihat Rincian & Edit Slip Gaji"
                                                >
                                                    <ReceiptText size={14} className="text-indigo-600 dark:text-indigo-400" />
                                                    <span>Detail & Edit</span>
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
                {modalFormActive === "receipt-detail" && selectedEmployee && (
                    <PayrollDetail
                        key={selectedEmployee?.employee_id}
                        employee={selectedEmployee}
                        accounts={accounts}
                        onSave={handleUpdateEmployeeSalary}
                        onClose={() => setIsModalOpen(false)}
                    />
                )}

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
                                <span className="text-slate-500">Bonus & Lembur</span>
                                <span className="text-emerald-600 dark:text-emerald-400">+ {formatNumber(totalBonus)}</span>
                            </div>

                            <div className="flex justify-between">
                                <span className="text-slate-500">Potongan (Komponen, Kasbon, Cicilan)</span>
                                <span className="text-rose-600 dark:text-rose-400">- {formatNumber(totalDeduction + totalReceivable)}</span>
                            </div>

                            <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-3" />

                            <div className="flex justify-between font-semibold text-slate-800 dark:text-slate-100">
                                <span>Total Diterima Karyawan (Take Home Pay)</span>
                                <span>{formatNumber(totalNetPay)}</span>
                            </div>

                            <div className="flex justify-between text-xs pt-1">
                                <span className="text-slate-500">Simpanan Wajib (Masuk Tabungan)</span>
                                <span className="font-medium text-indigo-600 dark:text-indigo-400">+ {formatNumber(totalSavingSum)}</span>
                            </div>

                            {totalInstallmentModal > 0 && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Setoran Cicilan (Masuk ke Kas Modal)</span>
                                    <span className="font-medium text-indigo-600 dark:text-indigo-400">+ {formatNumber(totalInstallmentModal)}</span>
                                </div>
                            )}

                            {totalInstallmentLaba > 0 && (
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500">Cicilan Potong Laba (Sudah Mengurangi Pengajuan)</span>
                                    <span className="font-medium text-slate-500 dark:text-slate-400">({formatNumber(totalInstallmentLaba)})</span>
                                </div>
                            )}
                        </div>

                        {/* Highlight */}
                        <div className="mt-6 rounded-xl bg-linear-to-r from-indigo-600 to-violet-600 p-4 text-white">
                            <div className="flex items-center justify-between gap-2 opacity-90">
                                <div className="flex items-center gap-2">
                                    <Wallet size={16} />
                                    <span className="text-xs uppercase tracking-wider font-semibold">Pengajuan Dana Gaji (Ke Admin/Owner)</span>
                                </div>
                            </div>

                            <div className="mt-2 text-3xl font-bold">{formatRupiah(totalPayrollRequest)}</div>
                            <p className="mt-1 text-[11px] text-indigo-100 opacity-85">
                                Take Home Pay + Simpanan Wajib + Cicilan Kas Modal (Kasbon & Cicilan Potong Laba sudah dipotong)
                            </p>

                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-white py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                            >
                                <Play size={16} />
                                {loading ? "Processing..." : "Process"}
                            </button>
                        </div>
                    </>
                )}

                {modalFormActive === "bonus-deduction" && (
                    <CreateSalaryComponents
                        employees={employees}
                        setProcessData={setProcessData}
                        onClose={() => setIsModalOpen(false)}
                        notification={notification}
                    />
                )}
            </Modal>
        </div>
    );
};

export default CreatePayroll;
