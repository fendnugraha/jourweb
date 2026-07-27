"use client";
import { changeLockStatus } from "@/app/hooks/JournalActionService";
import { useWarehouseBalance } from "@/app/hooks/useWarehouseBalance";
import { DateTimeNow, formatNumber } from "@/app/utils/format";
import { getStorePerformanceRating } from "@/app/utils/GetStorePerformanceRating";
import { Lock, Unlock } from "lucide-react";
import { useState } from "react";

const WarehouseBalance = () => {
    const { today } = DateTimeNow();
    const [endDate, setEndDate] = useState(today);

    const { warehouseBalance, error, isValidating, mutate } = useWarehouseBalance(endDate);

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
                        <tr className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150 font-bold">
                            <td className="px-6 py-4">Total</td>
                            <td className="px-6 py-4 text-right">{formatNumber(warehouseBalance.totalCash || 0)}</td>
                            <td className="px-6 py-4 text-right">{formatNumber(warehouseBalance.totalBank || 0)}</td>
                            <td className="px-6 py-4 text-right">{formatNumber((warehouseBalance.totalCash || 0) + (warehouseBalance.totalBank || 0))}</td>
                            <td></td>
                            <td></td>
                        </tr>
                        {warehouseBalance.warehouse?.map((w, i) => (
                            <tr key={i} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="px-6 py-4">
                                    {i + 1}. {w.name.replace(/^konter\s*/i, "")}
                                </td>
                                <td className="px-6 py-4 text-right">{formatNumber(w.cash)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(w.bank)}</td>
                                <td className="px-6 py-4 text-right">{formatNumber(w.cash + w.bank)}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex items-center justify-center">
                                        <button
                                            type="button"
                                            className="flex items-center w-fit justify-center border border-slate-300 dark:border-slate-500 hover:border-slate-700 rounded-full py-1 px-2"
                                            onClick={async () => {
                                                const result = await changeLockStatus(w.id);
                                                mutate();
                                            }}
                                            hidden={w.id === 1}
                                        >
                                            {w.is_open ? (
                                                <>
                                                    <Unlock size={14} className="text-green-500" />
                                                    <span className="ml-2 text-green-500">Unlocked</span>
                                                </>
                                            ) : (
                                                <>
                                                    <Lock size={14} className="text-red-300" />
                                                    <span className="ml-2 text-red-300">Locked</span>
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">{getStorePerformanceRating(w.average_profit)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default WarehouseBalance;
