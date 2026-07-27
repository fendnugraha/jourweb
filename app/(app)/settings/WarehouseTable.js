import useWarehouse from "@/app/hooks/useWarehouse";
import { Lock, Unlock } from "lucide-react";

const WarehouseTable = () => {
    const { warehouses, loading, mutate } = useWarehouse();
    console.log(warehouses);
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
                                Open At
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Zone
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Address
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Is Locked
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
                        {warehouses?.map((warehouse) => (
                            <tr key={warehouse.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="px-6 py-4">
                                    {warehouse.name}
                                    <span className="block text-xs text-slate-500 dark:text-slate-400">{warehouse.code || "N/A"}</span>
                                </td>
                                <td className="px-6 py-4">{warehouse.opening_time}</td>
                                <td className="px-6 py-4">{warehouse.zone?.zone_name}</td>
                                <td className="px-6 py-4">{warehouse.address}</td>
                                <td className="px-6 py-4">
                                    <div className="flex gap-2 items-center justify-center">
                                        <button
                                            type="button"
                                            className={`inline-flex items-center justify-center rounded-full p-2 text-xs font-bold ${
                                                warehouse.is_locked === "locked"
                                                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                    : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                            }`}
                                        >
                                            {!warehouse.is_open ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                        </button>
                                    </div>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span
                                        className={`inline-flex items-center justify-center rounded-full px-2 py-1 text-xs font-bold ${
                                            warehouse.status
                                                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                                : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                                        }`}
                                    >
                                        {warehouse.status ? "Active" : "Inactive"}
                                    </span>
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

export default WarehouseTable;
