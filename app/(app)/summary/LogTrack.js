import { useLogActivities } from "@/app/hooks/useLogActivities";
import { formatDateTime } from "@/app/utils/format";
import { PencilRuler, Trash2 } from "lucide-react";

const LogTrack = () => {
    const { logActivities, loading, error, mutate } = useLogActivities();
    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4">
                                Activity
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Warehouse
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Description
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {logActivities.map((activity) => (
                            <tr key={activity.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="whitespace-nowrap px-6 py-4">
                                    {activity.activity === "Updated Journal" ? (
                                        <PencilRuler className="h-4 w-4 text-yellow-300" />
                                    ) : (
                                        <Trash2 className="h-4 w-4 text-red-400" />
                                    )}
                                </td>
                                <td className="whitespace-nowrap px-6 py-4">
                                    {activity.user?.name}
                                    <span className="block text-xs text-slate-400 dark:text-slate-500">({activity.warehouse?.name})</span>
                                </td>
                                <td className="whitespace-normal wrap-break-word px-6 py-4">
                                    <span className="block max-w-xs text-slate-500">{formatDateTime(activity.created_at)}</span>
                                    {activity.description}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default LogTrack;
