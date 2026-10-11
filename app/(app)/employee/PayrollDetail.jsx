"use client";

import { formatNumber, formatRupiah } from "@/app/utils/format";
import {
    Wallet,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Plus,
    Trash2,
    Save,
    Eye,
    Edit3,
    AlertCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

const PayrollDetail = ({ employee, onSave, onClose }) => {
    const [activeTab, setActiveTab] = useState("edit"); // "edit" | "preview"

    // Local form state
    const [formData, setFormData] = useState(() => ({
        basic_salary: employee?.basic_salary ?? 0,
        commission: employee?.commission ?? 0,
        overtime: employee?.overtime ?? 0,
        employee_receivable: employee?.employee_receivable ?? 0,
        installment_receivable: employee?.installment_receivable ?? 0,
        bonuses: Array.isArray(employee?.bonuses)
            ? employee.bonuses.map((b) => ({ name: b.name || "", amount: b.amount || 0 }))
            : [],
        deductions: Array.isArray(employee?.deductions)
            ? employee.deductions.map((d) => ({ name: d.name || "", amount: d.amount || 0 }))
            : [],
    }));

    // Input change handlers
    const handleFieldChange = (field, value) => {
        setFormData((prev) => ({
            ...prev,
            [field]: value === "" ? "" : Number(value),
        }));
    };

    // Bonuses handlers
    const handleBonusChange = (index, field, value) => {
        setFormData((prev) => {
            const nextBonuses = [...prev.bonuses];
            nextBonuses[index] = {
                ...nextBonuses[index],
                [field]: field === "amount" ? (value === "" ? "" : Number(value)) : value,
            };
            return { ...prev, bonuses: nextBonuses };
        });
    };

    const handleAddBonus = () => {
        setFormData((prev) => ({
            ...prev,
            bonuses: [...prev.bonuses, { name: "", amount: 0 }],
        }));
    };

    const handleRemoveBonus = (index) => {
        setFormData((prev) => ({
            ...prev,
            bonuses: prev.bonuses.filter((_, i) => i !== index),
        }));
    };

    // Deductions handlers
    const handleDeductionChange = (index, field, value) => {
        setFormData((prev) => {
            const nextDeductions = [...prev.deductions];
            nextDeductions[index] = {
                ...nextDeductions[index],
                [field]: field === "amount" ? (value === "" ? "" : Number(value)) : value,
            };
            return { ...prev, deductions: nextDeductions };
        });
    };

    const handleAddDeduction = () => {
        setFormData((prev) => ({
            ...prev,
            deductions: [...prev.deductions, { name: "", amount: 0 }],
        }));
    };

    const handleRemoveDeduction = (index) => {
        setFormData((prev) => ({
            ...prev,
            deductions: prev.deductions.filter((_, i) => i !== index),
        }));
    };

    // Realtime Calculations
    const calculations = useMemo(() => {
        const basicSalary = Number(formData.basic_salary) || 0;
        const commission = Number(formData.commission) || 0;
        const overtime = Number(formData.overtime) || 0;
        const bonusesTotal = formData.bonuses.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
        const totalIncome = basicSalary + commission + overtime + bonusesTotal;

        const employeeReceivable = Number(formData.employee_receivable) || 0;
        const installmentReceivable = Number(formData.installment_receivable) || 0;
        const deductionsTotal = formData.deductions.reduce((sum, item) => sum + (Number(item?.amount) || 0), 0);
        const totalDeduction = employeeReceivable + installmentReceivable + deductionsTotal;

        const netSalary = totalIncome - totalDeduction;

        return {
            basicSalary,
            commission,
            overtime,
            bonusesTotal,
            totalIncome,
            employeeReceivable,
            installmentReceivable,
            deductionsTotal,
            totalDeduction,
            netSalary,
        };
    }, [formData]);

    // Handle Submit
    const handleSave = (e) => {
        e?.preventDefault();

        // Calculate total savings if deduction named "Simpanan Wajib" exists
        const totalSavings = formData.deductions
            .filter((d) => d.name?.trim() === "Simpanan Wajib")
            .reduce((sum, d) => sum + (Number(d.amount) || 0), 0);

        const updatedEmployee = {
            ...employee,
            basic_salary: Number(formData.basic_salary) || 0,
            commission: Number(formData.commission) || 0,
            overtime: Number(formData.overtime) || 0,
            employee_receivable: Number(formData.employee_receivable) || 0,
            installment_receivable: Number(formData.installment_receivable) || 0,
            bonuses: formData.bonuses.map((b) => ({
                name: b.name?.trim() || "Bonus",
                amount: Number(b.amount) || 0,
            })),
            deductions: formData.deductions.map((d) => ({
                name: d.name?.trim() || "Potongan",
                amount: Number(d.amount) || 0,
            })),
            total_savings: totalSavings,
        };

        if (onSave) {
            onSave(updatedEmployee);
        }
    };

    return (
        <div className="space-y-4">
            {/* Header Profil Karyawan & Tab Switcher */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl shrink-0">
                        <Wallet className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                            Detail & Edit Slip Gaji
                        </p>
                        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">
                            {employee?.name || "Nama Karyawan"}
                        </h2>
                    </div>
                </div>

                {/* Sub Tab View: Edit Form vs Preview Slip */}
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl self-start sm:self-auto">
                    <button
                        type="button"
                        onClick={() => setActiveTab("edit")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === "edit"
                                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                    >
                        <Edit3 className="w-3.5 h-3.5" />
                        <span>Edit Data</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("preview")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                            activeTab === "preview"
                                ? "bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-2xs"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                    >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Preview Slip</span>
                    </button>
                </div>
            </div>

            {/* TAB CONTENT: EDIT FORM */}
            {activeTab === "edit" && (
                <form onSubmit={handleSave} className="space-y-4">
                    <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                        {/* SEKSI PENDAPATAN */}
                        <div className="rounded-2xl border border-emerald-100 dark:border-emerald-950/40 bg-emerald-50/20 dark:bg-emerald-950/10 p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                    <TrendingUp className="w-4 h-4" />
                                    <span>Komponen Pendapatan</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                    Subtotal: Rp {formatNumber(calculations.totalIncome)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                {/* Gaji Pokok */}
                                <div className="space-y-1">
                                    <label
                                        htmlFor="edit-basic-salary"
                                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                                    >
                                        Gaji Pokok
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono text-[11px]">
                                            Rp
                                        </span>
                                        <input
                                            id="edit-basic-salary"
                                            type="number"
                                            value={formData.basic_salary}
                                            onChange={(e) => handleFieldChange("basic_salary", e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Tunjangan / Komisi */}
                                <div className="space-y-1">
                                    <label
                                        htmlFor="edit-commission"
                                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                                    >
                                        Tunjangan / Komisi
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono text-[11px]">
                                            Rp
                                        </span>
                                        <input
                                            id="edit-commission"
                                            type="number"
                                            value={formData.commission}
                                            onChange={(e) => handleFieldChange("commission", e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>

                                {/* Lembur */}
                                <div className="space-y-1">
                                    <label
                                        htmlFor="edit-overtime"
                                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-300"
                                    >
                                        Uang Lembur
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono text-[11px]">
                                            Rp
                                        </span>
                                        <input
                                            id="edit-overtime"
                                            type="number"
                                            value={formData.overtime}
                                            onChange={(e) => handleFieldChange("overtime", e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Daftar Bonus / Tambahan Lainnya */}
                            <div className="pt-2 border-t border-emerald-100/80 dark:border-emerald-900/30 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                        Bonus & Tambahan Lainnya
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleAddBonus}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Bonus</span>
                                    </button>
                                </div>

                                {formData.bonuses.length === 0 ? (
                                    <p className="text-[11px] text-slate-400 italic">Belum ada bonus tambahan.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {formData.bonuses.map((bonus, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={bonus.name}
                                                    onChange={(e) => handleBonusChange(index, "name", e.target.value)}
                                                    placeholder="Nama Bonus (misal: Bonus Target)"
                                                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                                />
                                                <div className="relative w-36">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono text-[11px]">
                                                        Rp
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={bonus.amount}
                                                        onChange={(e) => handleBonusChange(index, "amount", e.target.value)}
                                                        placeholder="0"
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveBonus(index)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                    title="Hapus Bonus"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SEKSI POTONGAN */}
                        <div className="rounded-2xl border border-rose-100 dark:border-rose-950/40 bg-rose-50/20 dark:bg-rose-950/10 p-3.5 space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                                    <TrendingDown className="w-4 h-4" />
                                    <span>Komponen Potongan</span>
                                </div>
                                <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                                    Subtotal: Rp {formatNumber(calculations.totalDeduction)}
                                </span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                {/* Kasbon (Employee Receivable) */}
                                <div className="space-y-1">
                                    <label
                                        htmlFor="edit-receivable"
                                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between"
                                    >
                                        <span>Kasbon</span>
                                        {formData.employee_receivable > 0 && (
                                            <span className="text-[10px] text-emerald-600 font-normal">
                                                {formatRupiah(formData.employee_receivable)}
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono text-[11px]">
                                            Rp
                                        </span>
                                        <input
                                            id="edit-receivable"
                                            type="number"
                                            value={formData.employee_receivable}
                                            onChange={(e) => handleFieldChange("employee_receivable", e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                                        />
                                    </div>
                                </div>

                                {/* Cicilan (Installment Receivable) */}
                                <div className="space-y-1">
                                    <label
                                        htmlFor="edit-installment"
                                        className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 flex items-center justify-between"
                                    >
                                        <span>Cicilan</span>
                                        {formData.installment_receivable > 0 && (
                                            <span className="text-[10px] text-emerald-600 font-normal">
                                                {formatRupiah(formData.installment_receivable)}
                                            </span>
                                        )}
                                    </label>
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono text-[11px]">
                                            Rp
                                        </span>
                                        <input
                                            id="edit-installment"
                                            type="number"
                                            value={formData.installment_receivable}
                                            onChange={(e) => handleFieldChange("installment_receivable", e.target.value)}
                                            placeholder="0"
                                            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Daftar Potongan Lainnya */}
                            <div className="pt-2 border-t border-rose-100/80 dark:border-rose-900/30 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200">
                                        Potongan Lainnya (Denda, Simpanan, dll)
                                    </span>
                                    <button
                                        type="button"
                                        onClick={handleAddDeduction}
                                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                        <span>Tambah Potongan</span>
                                    </button>
                                </div>

                                {formData.deductions.length === 0 ? (
                                    <p className="text-[11px] text-slate-400 italic">Belum ada potongan lainnya.</p>
                                ) : (
                                    <div className="space-y-2">
                                        {formData.deductions.map((deduction, index) => (
                                            <div key={index} className="flex items-center gap-2">
                                                <input
                                                    type="text"
                                                    value={deduction.name}
                                                    onChange={(e) => handleDeductionChange(index, "name", e.target.value)}
                                                    placeholder="Nama Potongan (misal: Simpanan Wajib)"
                                                    className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                                                />
                                                <div className="relative w-36">
                                                    <span className="absolute inset-y-0 left-0 flex items-center pl-2.5 text-slate-400 font-mono text-[11px]">
                                                        Rp
                                                    </span>
                                                    <input
                                                        type="number"
                                                        value={deduction.amount}
                                                        onChange={(e) =>
                                                            handleDeductionChange(index, "amount", e.target.value)
                                                        }
                                                        placeholder="0"
                                                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-8 pr-2.5 text-xs text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus:ring-2 focus:ring-rose-500"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleRemoveDeduction(index)}
                                                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer"
                                                    title="Hapus Potongan"
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* LIVE TAKE HOME PAY SUMMARY */}
                    <div className="p-3.5 bg-linear-to-r from-indigo-600 to-indigo-700 rounded-2xl text-white flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2.5">
                            <div className="p-2 bg-white/10 rounded-xl">
                                <DollarSign className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-bold text-indigo-200 tracking-wider">
                                    Take Home Pay (Bersih)
                                </p>
                                <p className="text-xs font-semibold">Total yang akan diterima karyawan</p>
                            </div>
                        </div>
                        <span className="text-lg font-extrabold font-mono tracking-tight">
                            Rp {formatNumber(calculations.netSalary)}
                        </span>
                    </div>

                    {/* FORM ACTION BUTTONS */}
                    <div className="flex justify-end gap-2.5 pt-2">
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                            >
                                Batal
                            </button>
                        )}
                        <button
                            type="submit"
                            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white hover:bg-indigo-500 shadow-xs transition-colors cursor-pointer"
                        >
                            <Save className="w-3.5 h-3.5" />
                            <span>Simpan Perubahan</span>
                        </button>
                    </div>
                </form>
            )}

            {/* TAB CONTENT: PREVIEW SLIP GAJI */}
            {activeTab === "preview" && (
                <div className="space-y-3.5">
                    <div className="space-y-3 max-h-[55vh] overflow-y-auto pr-1">
                        {/* SEKSI PENDAPATAN PREVIEW */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                                <TrendingUp className="w-3.5 h-3.5" />
                                <span>Pendapatan</span>
                            </div>

                            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                                <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                    <span>Gaji Pokok</span>
                                    <span className="font-mono font-medium">
                                        Rp {formatNumber(calculations.basicSalary)}
                                    </span>
                                </div>

                                {calculations.commission > 0 && (
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>Tunjangan / Komisi</span>
                                        <span className="font-mono font-medium">
                                            Rp {formatNumber(calculations.commission)}
                                        </span>
                                    </div>
                                )}

                                {calculations.overtime > 0 && (
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>Lembur</span>
                                        <span className="font-mono font-medium">
                                            Rp {formatNumber(calculations.overtime)}
                                        </span>
                                    </div>
                                )}

                                {formData.bonuses?.length > 0 && (
                                    <div className="pt-1.5 space-y-1 border-t border-slate-200/60 dark:border-slate-700/50">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                            Pendapatan Lainnya
                                        </span>
                                        {formData.bonuses.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between pl-2 text-slate-500 dark:text-slate-400 text-[11px]"
                                            >
                                                <span>• {item?.name || "Bonus"}</span>
                                                <span className="font-mono">
                                                    Rp {formatNumber(Number(item?.amount) || 0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>Total Pendapatan</span>
                                    <span className="font-mono text-emerald-600 dark:text-emerald-400">
                                        Rp {formatNumber(calculations.totalIncome)}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* SEKSI POTONGAN PREVIEW */}
                        <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                                <TrendingDown className="w-3.5 h-3.5" />
                                <span>Potongan</span>
                            </div>

                            <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                                {calculations.employeeReceivable > 0 && (
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>Kasbon</span>
                                        <span className="font-mono font-medium">
                                            Rp {formatNumber(calculations.employeeReceivable)}
                                        </span>
                                    </div>
                                )}

                                {calculations.installmentReceivable > 0 && (
                                    <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                        <span>Cicilan</span>
                                        <span className="font-mono font-medium">
                                            Rp {formatNumber(calculations.installmentReceivable)}
                                        </span>
                                    </div>
                                )}

                                {formData.deductions?.length > 0 && (
                                    <div className="pt-1.5 space-y-1 border-t border-slate-200/60 dark:border-slate-700/50">
                                        <span className="text-[10px] font-semibold text-slate-400 uppercase">
                                            Potongan Lainnya
                                        </span>
                                        {formData.deductions.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex justify-between pl-2 text-slate-500 dark:text-slate-400 text-[11px]"
                                            >
                                                <span>• {item?.name || "Potongan"}</span>
                                                <span className="font-mono">
                                                    Rp {formatNumber(Number(item?.amount) || 0)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                                    <span>Total Potongan</span>
                                    <span className="font-mono text-rose-600 dark:text-rose-400">
                                        Rp {formatNumber(calculations.totalDeduction)}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* GRAND TOTAL PREVIEW */}
                    <div className="p-3 bg-linear-to-r from-indigo-600 to-indigo-700 rounded-xl text-white flex items-center justify-between shadow-xs">
                        <div className="flex items-center gap-2">
                            <div className="p-1.5 bg-white/10 rounded-lg">
                                <DollarSign className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <p className="text-[9px] uppercase font-bold text-indigo-200 tracking-wider">
                                    Take Home Pay
                                </p>
                                <p className="text-xs font-semibold">Total Diterima</p>
                            </div>
                        </div>
                        <span className="text-base font-extrabold font-mono tracking-tight">
                            Rp {formatNumber(calculations.netSalary)}
                        </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-1">
                        <button
                            type="button"
                            onClick={() => setActiveTab("edit")}
                            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                        >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Edit Komponen</span>
                        </button>
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                            >
                                Tutup
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default PayrollDetail;

