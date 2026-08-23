import { formatNumber } from "@/app/utils/format";
import { Wallet, TrendingUp, TrendingDown, DollarSign } from "lucide-react";

const PayrollDetail = ({ employee }) => {
    // Perhitungan Income & Safeguard
    const bonusesTotal = employee?.bonuses?.reduce((total, item) => total + (Number(item?.amount) || 0), 0) || 0;
    const basicSalary = Number(employee?.basic_salary) || 0;
    const commission = Number(employee?.commission) || 0;
    const overtime = Number(employee?.overtime) || 0;
    const totalIncome = basicSalary + commission + bonusesTotal + overtime;

    // Perhitungan Deductions
    const deductionsTotal = employee?.deductions?.reduce((t, d) => t + (Number(d?.amount) || 0), 0) || 0;
    const employeeReceivable = Number(employee?.employee_receivable) || 0;
    const installmentReceivable = Number(employee?.installment_receivable) || 0;
    const totalReceivable = employeeReceivable + installmentReceivable;
    const totalDeduction = deductionsTotal + totalReceivable;

    // Take Home Pay
    const netSalary = totalIncome - totalDeduction;

    return (
        <div className="space-y-4">
            {/* Header Profil Karyawan */}
            <div className="pb-3 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <div>
                    <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Rincian Slip Gaji</p>
                    <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">{employee?.name || "Nama Karyawan"}</h2>
                </div>
                <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-xl">
                    <Wallet className="w-5 h-5" />
                </div>
            </div>

            {/* Content Area dengan Max Height & Scroll jika terlalu panjang */}
            <div className="space-y-3.5 max-h-[60vh] overflow-y-auto pr-1">
                {/* SEKSI PENDAPATAN */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>Pendapatan</span>
                    </div>

                    <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                        <div className="flex justify-between text-slate-600 dark:text-slate-300">
                            <span>Gaji Pokok</span>
                            <span className="font-mono font-medium">Rp {formatNumber(basicSalary)}</span>
                        </div>

                        {commission > 0 && (
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Tunjangan / Komisi</span>
                                <span className="font-mono font-medium">Rp {formatNumber(commission)}</span>
                            </div>
                        )}

                        {overtime > 0 && (
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Lembur</span>
                                <span className="font-mono font-medium">Rp {formatNumber(overtime)}</span>
                            </div>
                        )}

                        {employee?.bonuses?.length > 0 && (
                            <div className="pt-1.5 space-y-1 border-t border-slate-200/60 dark:border-slate-700/50">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">Pendapatan Lainnya</span>
                                {employee.bonuses.map((item, index) => (
                                    <div key={index} className="flex justify-between pl-2 text-slate-500 dark:text-slate-400 text-[11px]">
                                        <span>• {item?.name || "Bonus"}</span>
                                        <span className="font-mono">Rp {formatNumber(item?.amount || 0)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span>Total Pendapatan</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400">Rp {formatNumber(totalIncome)}</span>
                        </div>
                    </div>
                </div>

                {/* SEKSI POTONGAN */}
                <div className="space-y-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-600 dark:text-rose-400">
                        <TrendingDown className="w-3.5 h-3.5" />
                        <span>Potongan</span>
                    </div>

                    <div className="bg-slate-50/70 dark:bg-slate-800/40 rounded-xl p-3 border border-slate-100 dark:border-slate-800/80 space-y-1.5 text-xs">
                        {employeeReceivable > 0 && (
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Kasbon</span>
                                <span className="font-mono font-medium">Rp {formatNumber(employeeReceivable)}</span>
                            </div>
                        )}

                        {installmentReceivable > 0 && (
                            <div className="flex justify-between text-slate-600 dark:text-slate-300">
                                <span>Cicilan</span>
                                <span className="font-mono font-medium">Rp {formatNumber(installmentReceivable)}</span>
                            </div>
                        )}

                        {employee?.deductions?.length > 0 && (
                            <div className="pt-1.5 space-y-1 border-t border-slate-200/60 dark:border-slate-700/50">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase">Potongan Lainnya</span>
                                {employee.deductions.map((item, index) => (
                                    <div key={index} className="flex justify-between pl-2 text-slate-500 dark:text-slate-400 text-[11px]">
                                        <span>• {item?.name || "Potongan"}</span>
                                        <span className="font-mono">Rp {formatNumber(item?.amount || 0)}</span>
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex justify-between font-bold text-slate-800 dark:text-slate-100 pt-2 border-t border-slate-200 dark:border-slate-700">
                            <span>Total Potongan</span>
                            <span className="font-mono text-rose-600 dark:text-rose-400">Rp {formatNumber(totalDeduction)}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* GRAND TOTAL / TAKE HOME PAY */}
            <div className="p-3 bg-linear-to-r from-indigo-600 to-indigo-700 rounded-xl text-white flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-white/10 rounded-lg">
                        <DollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                        <p className="text-[9px] uppercase font-bold text-indigo-200 tracking-wider">Take Home Pay</p>
                        <p className="text-xs font-semibold">Total Diterima</p>
                    </div>
                </div>
                <span className="text-base font-extrabold font-mono tracking-tight">Rp {formatNumber(netSalary)}</span>
            </div>
        </div>
    );
};

export default PayrollDetail;
