import { useUserAttendance } from "@/app/hooks/useUserAttendance";
import { useAuth } from "@/app/utils/auth";
import { DateTimeNow, diffTimeHuman } from "@/app/utils/format";
import { AlarmClockPlus, Check, ClockAlert, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const AttendanceTable = () => {
    const { user } = useAuth();
    const { today } = DateTimeNow();
    const { userAttendance, mutate } = useUserAttendance({ date: today });
    const userRole = user.role;
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isModalWarehouseDetailOpen, setIsModalWarehouseDetailOpen] = useState(false);
    const [selectedZone, setSelectedZone] = useState(null);

    const filteredWarehouses = userAttendance.filter((warehouse) => {
        const zoneMatch = Number(warehouse.warehouse_zone_id) === Number(selectedZone);

        return !selectedZone || zoneMatch;
    });
    return (
        <>
            <div className="data-table-wrapper overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4 text-center">
                                Cabang
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Zona
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Waktu Buka
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Jam Masuk
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Rating
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Detail
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {filteredWarehouses?.map((warehouse) => (
                            <tr key={warehouse?.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                <td className="px-6 py-4 font-bold">
                                    <div className="flex items-start gap-4">
                                        {warehouse?.attendance?.[0]?.approval_status ? (
                                            <Image
                                                src={warehouse?.attendance?.[0]?.photo_url || "/images/placeholder-avatar.png"} // Tambahkan fallback image jika photo_url kosong
                                                alt={warehouse?.name || "Warehouse Photo"}
                                                width={32}
                                                height={32}
                                                className="rounded-full mr-2 object-cover w-8 h-8"
                                            />
                                        ) : (
                                            <div className="w-8 h-8 rounded-full bg-gray-300 mr-2"></div>
                                        )}
                                        <div>
                                            <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">{warehouse?.name}</div>
                                            <div className="text-xs text-slate-400 mt-0.5">Kasir: {warehouse?.attendance?.[0]?.contact?.name ?? "-"}</div>
                                            <div className="text-xs text-slate-400">{warehouse?.address}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center text-xs text-slate-600 dark:text-slate-300">{warehouse?.zone?.zone_name}</td>
                                <td className="text-center text-2xl font-bold text-slate-700 dark:text-slate-200">{warehouse?.opening_time ?? "-"}</td>
                                <td className="text-center text-2xl font-bold text-slate-700 dark:text-slate-200">
                                    {warehouse?.attendance?.[0]?.created_at ? (
                                        <>
                                            {warehouse?.attendance?.[0]?.time_in}
                                            <span className="block text-slate-400 font-normal text-xs">
                                                {" "}
                                                {warehouse?.attendance?.[0]?.approval_status === "Late" ? (
                                                    <span>Telat {diffTimeHuman(warehouse?.opening_time, warehouse?.attendance?.[0]?.time_in)}</span>
                                                ) : (
                                                    <span>Lebih awal {diffTimeHuman(warehouse?.attendance?.[0]?.time_in, warehouse?.opening_time)}</span>
                                                )}
                                            </span>
                                        </>
                                    ) : (
                                        <span className="text-gray-400 text-xs font-normal">Belum absen</span>
                                    )}
                                </td>
                                <td className="text-center">
                                    <div className="flex justify-center">
                                        {warehouse?.attendance?.[0]?.approval_status === "Late" ? (
                                            <ClockAlert size={20} className="text-red-500 dark:text-red-400" />
                                        ) : warehouse?.attendance?.[0]?.approval_status === "Good" ? (
                                            <Star size={20} className="text-yellow-500 dark:text-yellow-300" fill="yellow" />
                                        ) : warehouse?.attendance?.[0]?.approval_status === "Overtime" ? (
                                            <AlarmClockPlus size={20} className="text-violet-500 dark:text-violet-300" fill="yellow" />
                                        ) : (
                                            <Check size={20} className="text-green-500 dark:text-green-400" />
                                        )}
                                    </div>
                                </td>
                                <td className="text-center">
                                    <button
                                        onClick={() => {
                                            setSelectedWarehouse(warehouse);
                                            setIsModalWarehouseDetailOpen(true);
                                        }}
                                        className="small-button"
                                    >
                                        Detail
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </>
    );
};

export default AttendanceTable;
