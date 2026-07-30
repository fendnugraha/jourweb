import StatusBadge from "@/app/components/StatusBadge";
import { useGetPayroll } from "@/app/hooks/useGetPayroll";
import { formatNumber } from "@/app/utils/format";
import { Printer } from "lucide-react";
import Link from "next/link";

const PayrollTable = () => {
    const { payroll, error, isValidating, mutate } = useGetPayroll();
    console.log(payroll);

    return (
        <div className="data-table-wrapper overflow-x-auto">
            <table className="w-full border-collapse text-left text-xs">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-xs font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                        <th scope="col" className="px-6 py-4 text-center">
                            Periode
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Gaji/Tunjangan
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Bonus/Lainnya
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Biaya Gaji
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Potongan
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Total Diterima
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Simpanan Wajib
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Pengajuan
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Status
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Aksi
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                    {payroll.payrollTotal?.map((payroll, index) => (
                        <tr key={index} className="group text-xs hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                            <td className="px-6 py-4 text-center">{payroll?.payroll_date}</td>
                            <td className="px-6 py-4 text-center text-green-500">
                                {formatNumber(Number(payroll?.total_gross_pay) + Number(payroll?.total_commissions))}
                            </td>
                            <td className="px-6 py-4 text-center text-green-500">{formatNumber(payroll?.total_allowances)}</td>

                            <td className="px-6 py-4 text-center font-bold text-green-500">
                                {formatNumber(Number(payroll?.total_gross_pay) + Number(payroll?.total_commissions) + Number(payroll?.total_allowances))}
                            </td>
                            <td className="px-6 py-4 text-center text-red-500 dark:text-red-300">{formatNumber(payroll?.total_deductions)}</td>
                            <td className="px-6 py-4 text-center text-indigo-500 dark:text-indigo-300">{formatNumber(payroll?.net_pay)}</td>
                            <td className="px-6 py-4 text-center text-indigo-500 dark:text-indigo-300">{formatNumber(payroll?.total_savings)}</td>
                            <td className="px-6 py-4 text-center text-indigo-500 dark:text-indigo-300">
                                {formatNumber(Number(payroll?.net_pay) + Number(payroll?.total_savings))}
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge status={"Completed"} />
                            </td>
                            <td className="px-6 py-4 text-center">
                                <Link href={`/employee/payroll/invoice/${payroll?.payroll_date}`}>
                                    <Printer size={20} />
                                </Link>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default PayrollTable;
