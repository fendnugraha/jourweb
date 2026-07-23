"use client";
import { useWarehouseBalance } from "@/app/hooks/useWarehouseBalance";
import { DateTimeNow } from "@/app/utils/format";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";

const WarehouseBalance = () => {
    const { today } = DateTimeNow();
    const [endDate, setEndDate] = useState(today);

    const { warehouseBalance, error, isValidating, mutate } = useWarehouseBalance(endDate);

    return (
        <div>
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                        <th scope="col" className="px-6 py-4">
                            Cabang
                        </th>
                        <th scope="col" className="px-6 py-4">
                            Kas (Tunai)
                        </th>
                        <th scope="col" className="px-6 py-4">
                            Saldo Bank
                        </th>
                        <th scope="col" className="px-6 py-4 text-right">
                            Total
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Lock Status
                        </th>
                        <th scope="col" className="px-6 py-4 text-center">
                            Rate
                        </th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                    {warehouseBalance.warehouse.map((w, i) => (
                        <tr key={i} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                            <td className="px-6 py-4">
                                {i + 1}. {w.name.replace(/^konter\s*/i, "")}
                            </td>
                            <td className="px-6 py-4">{w.cash}</td>
                            <td className="px-6 py-4">{w.bank}</td>
                            <td className="px-6 py-4 text-right">{w.cash + w.bank}</td>
                            <td className="px-6 py-4 text-center">
                                {w.status === 1 ? <Unlock size={14} className="text-green-500" /> : <Lock size={14} className="text-red-300" />}
                            </td>
                            <td className="px-6 py-4 text-center">{w.rate}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default WarehouseBalance;
