import { useAccounts } from "@/app/hooks/useAccounts";
import { Key, Lock, Unlock, Warehouse } from "lucide-react";

const AccountTable = () => {
    const { accounts, loading, mutate } = useAccounts();
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4">
                                Name
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Warehouse
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
                        {accounts?.map((account) => (
                            <tr key={account.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="px-6 py-4">
                                    {account.name}
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">
                                        {account.account?.name || "N/A"} {" | "} {account.group || "N/A"}
                                    </span>
                                </td>
                                <td className="px-6 py-4">{account.warehouse?.name}</td>
                                <td className="px-6 py-4 text-center">
                                    <div className="flex gap-2 items-center justify-center">
                                        <span
                                            className={`inline-flex items-center justify-center rounded-full p-2 text-xs font-bold ${
                                                account.is_locked === "locked"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                            }`}
                                        >
                                            {account.is_locked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                        </span>
                                        {account.is_primary_cash === 1 && (
                                            <span
                                                className={`inline-flex items-center justify-center rounded-full p-2 text-xs font-bold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300`}
                                            >
                                                <Key className="h-4 w-4" />
                                            </span>
                                        )}
                                        {account.warehouse && (
                                            <span
                                                className={`inline-flex items-center justify-center rounded-full p-2 text-xs font-bold bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300`}
                                            >
                                                <Warehouse className="h-4 w-4" />
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <button className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AccountTable;
