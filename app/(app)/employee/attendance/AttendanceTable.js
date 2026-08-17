import Modal from "@/app/components/Modal";
import { DateTimeNow, diffTimeHuman } from "@/app/utils/format";
import { AlarmClockPlus, Check, ChevronRight, ClockAlert, Star } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import AttendanceDetail from "./AttendanceDetail";
import Notification from "@/app/components/Notification";

const AttendanceTable = ({ userAttendance, userRole, mutate, selectedZone }) => {
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [notification, setNotification] = useState("");

    const [isModalOpen, setIsModalOpen] = useState(false);

    const filteredWarehouses = userAttendance.filter((warehouse) => {
        const zoneMatch = Number(warehouse.warehouse_zone_id) === Number(selectedZone);

        return !selectedZone || zoneMatch;
    });

    const STATUS_CONFIG = {
        Late: {
            label: "Telat",
            Icon: ClockAlert,
            color: "bg-rose-50 text-rose-700 dark:bg-rose-500/10 dark:text-rose-400 border-rose-200/60 dark:border-rose-500/20",
            iconStyle: "w-3 h-3",
        },
        Good: {
            label: "Excellent",
            Icon: Star,
            color: "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300 border-amber-200/60 dark:border-amber-500/20",
            iconStyle: "w-3 h-3 fill-amber-400 text-amber-500",
        },
        Overtime: {
            label: "Overtime",
            Icon: AlarmClockPlus,
            color: "bg-violet-50 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300 border-violet-200/60 dark:border-violet-500/20",
            iconStyle: "w-3 h-3",
        },
        // Fallback / Default
        Normal: {
            label: "Normal",
            Icon: Check,
            color: "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-500/20",
            iconStyle: "w-3 h-3",
        },
    };

    const modalTitle = selectedWarehouse ? selectedWarehouse.name : "Create Attendance";

    return (
        <>
            <Notification message={notification} onClose={() => setNotification("")} />
            <div className="w-full">
                {/* ========================================== */}
                {/* 1. TAMPILAN MOBILE (Card Stack)            */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 gap-3.5 md:hidden">
                    {filteredWarehouses?.map((warehouse) => {
                        const attendance = warehouse?.attendance?.[0];
                        const status = attendance?.approval_status;

                        return (
                            <div
                                key={warehouse?.id}
                                className="relative rounded-2xl border border-slate-200/80 bg-white/80 p-4 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80"
                            >
                                {/* Header Card: Profil, Cabang & Status Badge */}
                                <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3 dark:border-slate-800/60">
                                    <div className="flex items-center gap-3 min-w-0">
                                        {/* Photo / Avatar */}
                                        <div className="relative shrink-0">
                                            {attendance?.photo_url ? (
                                                <Image
                                                    src={attendance.photo_url}
                                                    alt={warehouse?.name || "Warehouse Photo"}
                                                    width={40}
                                                    height={40}
                                                    className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                    {warehouse?.name?.slice(0, 2)?.toUpperCase() || "WH"}
                                                </div>
                                            )}
                                            {attendance && (
                                                <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                                            )}
                                        </div>

                                        {/* Detail Cabang & Kasir */}
                                        <div className="min-w-0">
                                            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{warehouse?.name}</h4>
                                            <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                <span>Kasir:</span>
                                                <span className="font-medium text-slate-700 dark:text-slate-300 truncate">
                                                    {attendance?.contact?.name ?? "-"}
                                                </span>
                                            </p>
                                        </div>
                                    </div>

                                    {/* Status / Rating Badge */}
                                    <div className="shrink-0">
                                        {(() => {
                                            const config = STATUS_CONFIG[status] || STATUS_CONFIG.Normal;
                                            const { Icon, label, color, iconStyle } = config;

                                            return (
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${color}`}
                                                >
                                                    <Icon className={iconStyle} /> {label}
                                                </span>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Body Card: Grid Informasi (Zona, Buka, Jam Masuk) */}
                                <div className="grid grid-cols-3 gap-2 py-3 text-center">
                                    {/* Zona */}
                                    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Zona</span>
                                        <span className="mt-0.5 text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-full">
                                            {warehouse?.zone?.zone_name || "N/A"}
                                        </span>
                                    </div>

                                    {/* Waktu Buka */}
                                    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Waktu Buka</span>
                                        <span className="mt-0.5 font-mono text-xs font-bold text-slate-800 dark:text-slate-200">
                                            {warehouse?.opening_time ?? "-"}
                                        </span>
                                    </div>

                                    {/* Jam Masuk */}
                                    <div className="flex flex-col items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800/40 p-2">
                                        <span className="text-[10px] uppercase font-semibold text-slate-400 dark:text-slate-500">Jam Masuk</span>
                                        {attendance?.created_at ? (
                                            <div className="flex flex-col items-center mt-0.5">
                                                <span className="font-mono text-xs font-bold text-slate-900 dark:text-white">{attendance?.time_in}</span>
                                                {status === "Late" ? (
                                                    <span className="text-[9px] font-medium text-rose-600 dark:text-rose-400 truncate max-w-full">
                                                        Telat {diffTimeHuman(warehouse?.opening_time, attendance?.time_in)}
                                                    </span>
                                                ) : (
                                                    <span className="text-[9px] font-medium text-emerald-600 dark:text-emerald-400 truncate max-w-full">
                                                        Lebih awal {diffTimeHuman(attendance?.time_in, warehouse?.opening_time)}
                                                    </span>
                                                )}
                                            </div>
                                        ) : (
                                            <span className="mt-0.5 text-[10px] font-medium text-slate-400 dark:text-slate-500">Belum absen</span>
                                        )}
                                    </div>
                                </div>

                                {/* Footer Card: Alamat & Tombol Aksi */}
                                <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 dark:border-slate-800/60">
                                    <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate flex-1">
                                        {warehouse?.address || "Alamat tidak tersedia"}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setSelectedWarehouse(warehouse);
                                            setIsModalOpen(true);
                                        }}
                                        className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                                    >
                                        <span>Detail</span>
                                        <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* ========================================== */}
                {/* 2. TAMPILAN DESKTOP (Table Standar)        */}
                {/* ========================================== */}
                <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/80 shadow-xs backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            {/* TABLE HEADER */}
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/40 dark:text-slate-400">
                                    <th scope="col" className="px-6 py-4">
                                        Cabang & Kasir
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-center">
                                        Zona
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-center">
                                        Waktu Buka
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-center">
                                        Jam Masuk
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-center">
                                        Status / Rating
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>

                            {/* TABLE BODY */}
                            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                                {filteredWarehouses?.map((warehouse) => {
                                    const attendance = warehouse?.attendance?.[0];
                                    const status = attendance?.approval_status;

                                    return (
                                        <tr key={warehouse?.id} className="group transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
                                            {/* 1. CABANG & KASIR */}
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3.5">
                                                    <div className="relative shrink-0">
                                                        {attendance?.photo_url ? (
                                                            <Image
                                                                src={attendance.photo_url}
                                                                alt={warehouse?.name || "Warehouse Photo"}
                                                                width={40}
                                                                height={40}
                                                                className="h-10 w-10 rounded-full object-cover ring-2 ring-slate-100 dark:ring-slate-800"
                                                                unoptimized
                                                            />
                                                        ) : (
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-400 dark:bg-slate-800 dark:text-slate-500">
                                                                {warehouse?.name?.slice(0, 2)?.toUpperCase() || "WH"}
                                                            </div>
                                                        )}
                                                        {attendance && (
                                                            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-slate-900" />
                                                        )}
                                                    </div>

                                                    <div className="min-w-0">
                                                        <div className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">{warehouse?.name}</div>
                                                        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                                                            <span>Kasir:</span>
                                                            <span className="font-medium text-slate-700 dark:text-slate-300">
                                                                {attendance?.contact?.name ?? "-"}
                                                            </span>
                                                        </div>
                                                        {warehouse?.address && (
                                                            <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs mt-0.5">
                                                                {warehouse?.address}
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. ZONA */}
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                                                    {warehouse?.zone?.zone_name || "N/A"}
                                                </span>
                                            </td>

                                            {/* 3. WAKTU BUKA */}
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <span className="font-mono text-base font-bold text-slate-800 dark:text-slate-200">
                                                    {attendance?.work_start ?? "-"}
                                                </span>
                                            </td>

                                            {/* 4. JAM MASUK */}
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                {attendance?.created_at ? (
                                                    <div className="flex flex-col items-center">
                                                        <span className="font-mono text-base font-bold text-slate-900 dark:text-white">
                                                            {attendance?.time_in}
                                                        </span>
                                                        {status === "Late" ? (
                                                            <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-medium text-rose-600 dark:text-rose-400">
                                                                Telat {diffTimeHuman(attendance?.work_start, attendance?.time_in)}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                                                                Lebih awal {diffTimeHuman(attendance?.time_in, attendance?.work_start)}
                                                            </span>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 text-xs font-medium text-slate-400 dark:text-slate-500">
                                                        Belum absen
                                                    </span>
                                                )}
                                            </td>

                                            {/* 5. RATING / STATUS */}
                                            <td className="px-5 py-4 text-center whitespace-nowrap">
                                                <div className="flex justify-center">
                                                    {(() => {
                                                        const config = STATUS_CONFIG[status] || STATUS_CONFIG.Normal;
                                                        const { Icon, label, color, iconStyle } = config;

                                                        return (
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${color}`}
                                                            >
                                                                <Icon className={iconStyle} /> {label}
                                                            </span>
                                                        );
                                                    })()}
                                                </div>
                                            </td>

                                            {/* 6. AKSI */}
                                            <td className="px-6 py-4 text-right whitespace-nowrap">
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        setSelectedWarehouse(warehouse);
                                                        setIsModalOpen(true);
                                                    }}
                                                    className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold transition-all duration-150 cursor-pointer border border-transparent hover:border-indigo-200 dark:hover:border-indigo-800"
                                                >
                                                    <span>Detail</span>
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-60 group-hover:translate-x-0.5 transition-transform" />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                <AttendanceDetail
                    selectedWarehouse={selectedWarehouse}
                    mutate={mutate}
                    notification={setNotification}
                    isModalOpen={setIsModalOpen}
                    userRole={userRole}
                />
            </Modal>
        </>
    );
};

export default AttendanceTable;
