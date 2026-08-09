import StatusBadge from "@/app/components/StatusBadge";
import { useGetPayroll } from "@/app/hooks/useGetPayroll";
import { formatNumber } from "@/app/utils/format";
import { Calendar, Printer, Receipt } from "lucide-react";
import Link from "next/link";

const PayrollTable = () => {
    const { payroll } = useGetPayroll();

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                            <th scope="col" className="px-5 py-3.5 text-center">
                                Periode
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                Gaji/Tunjangan
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                Bonus/Lainnya
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                Biaya Gaji
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                Potongan
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                Total Diterima
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                Simpanan Wajib
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-right">
                                Pengajuan
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-center">
                                Status
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-center">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                        {payroll?.payrollTotal?.length > 0 ? (
                            payroll.payrollTotal.map((item, index) => {
                                const grossAndCommission = Number(item?.total_gross_pay || 0) + Number(item?.total_commissions || 0);
                                const totalCost = grossAndCommission + Number(item?.total_allowances || 0);
                                const netPay = Number(item?.net_pay || 0);
                                const totalSavings = Number(item?.total_savings || 0);

                                return (
                                    <tr key={index} className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150">
                                        <td className="px-5 py-4 text-center font-medium text-slate-800 dark:text-slate-200">
                                            <span className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
                                                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                                                {item?.payroll_date}
                                            </span>
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono font-semibold text-slate-700 dark:text-slate-300">
                                            {formatNumber(grossAndCommission)}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatNumber(Number(item?.total_allowances || 0))}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono font-bold text-slate-900 dark:text-slate-100">
                                            {formatNumber(totalCost)}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono font-semibold text-rose-500 dark:text-rose-400">
                                            {formatNumber(Number(item?.total_deductions || 0))}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono font-bold text-indigo-600 dark:text-indigo-400">
                                            {formatNumber(netPay)}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono font-medium text-amber-600 dark:text-amber-400">
                                            {formatNumber(totalSavings)}
                                        </td>
                                        <td className="px-5 py-4 text-right font-mono font-bold text-indigo-700 dark:text-indigo-300">
                                            {formatNumber(netPay + totalSavings)}
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <StatusBadge status={"Completed"} />
                                        </td>
                                        <td className="px-5 py-4 text-center">
                                            <Link
                                                href={`/employee/invoice/${item?.payroll_date}`}
                                                className="inline-flex items-center justify-center p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                                title="Cetak Slip Gaji"
                                            >
                                                <Printer className="h-4 w-4" />
                                            </Link>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={10} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                    <div className="flex flex-col items-center justify-center gap-2">
                                        <Receipt className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                        <p className="text-xs font-medium">Belum ada riwayat laporan payroll.</p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayrollTable;
