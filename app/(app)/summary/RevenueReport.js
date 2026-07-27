import useRevenueReport from "@/app/hooks/useRevenueReport";
import { DateTimeNow, formatNumber } from "@/app/utils/format";
import { useState } from "react";

const RevenueReport = () => {
    const { today } = DateTimeNow();
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const { revenue, error, isValidating } = useRevenueReport(startDate, endDate);
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4">
                                Cabang
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Transfer
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Tarik Tunai
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Voucher
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Acc.
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Deposit
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Tx
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Bank Fee
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Biaya
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Laba Bersih
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Setoran Kas
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {revenue.revenue?.map((item, i) => (
                            <tr key={i} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="px-6 py-4"> {item.warehouse.replace(/^konter\s*/i, "")}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.transfer)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.tarikTunai)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.voucher)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.accessories)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.deposit)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.trx)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.bank_fee)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.expense)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.fee)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(item.cash)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RevenueReport;
