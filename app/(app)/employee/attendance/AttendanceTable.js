import Modal from "@/app/components/Modal";
import Notification from "@/app/components/Notification";
import { AlarmClockPlus, CheckCircle2, ChevronRight, Clock, ClockAlert, MapPin, Sparkles, Store, UserX } from "lucide-react";
import Image from "next/image";
import { useMemo, useState } from "react";
import AttendanceDetail from "./AttendanceDetail";

const STATUS_CONFIG = {
    Late: {
        label: "Terlambat",
        Icon: ClockAlert,
        color: "bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-200/80 dark:border-rose-800/50",
        iconStyle: "w-3.5 h-3.5 text-rose-500 dark:text-rose-400",
    },
    Approved: {
        label: "Approved",
        Icon: CheckCircle2,
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/50",
        iconStyle: "w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400",
    },
    Good: {
        label: "Excellent",
        Icon: Sparkles,
        color: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200/80 dark:border-amber-800/50",
        iconStyle: "w-3.5 h-3.5 text-amber-500 dark:text-amber-400 fill-amber-400/30",
    },
    Overtime: {
        label: "Lembur",
        Icon: AlarmClockPlus,
        color: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-200/80 dark:border-violet-800/50",
        iconStyle: "w-3.5 h-3.5 text-violet-500 dark:text-violet-400",
    },
    Normal: {
        label: "Tepat Waktu",
        Icon: CheckCircle2,
        color: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-200/80 dark:border-emerald-800/50",
        iconStyle: "w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400",
    },
};

const AttendanceTable = ({ userAttendance = [], userRole, mutate, selectedZone }) => {
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [selectedAttendance, setSelectedAttendance] = useState(null);
    const [notification, setNotification] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);

    // Filter berdasarkan Zona
    const filteredWarehouses = useMemo(() => {
        const safeData = Array.isArray(userAttendance) ? userAttendance : [];

        if (!selectedZone || selectedZone === "all") {
            return safeData;
        }

        return safeData.filter((warehouse) => {
            return Number(warehouse?.warehouse_zone_id) === Number(selectedZone);
        });
    }, [userAttendance, selectedZone]);

    const handleOpenDetail = (warehouse, attendance = null) => {
        setSelectedWarehouse(warehouse);
        setSelectedAttendance(attendance);
        setIsModalOpen(true);
    };

    const modalTitle = selectedWarehouse
        ? `${selectedWarehouse.name} ${selectedAttendance?.contact?.name ? `- ${selectedAttendance.contact.name}` : ""}`
        : "Detail Absensi Store";

    return (
        <>
            <Notification message={notification} onClose={() => setNotification("")} />

            <div className="w-full">
                {/* ========================================== */}
                {/* 1. TAMPILAN MOBILE (Modern Store Cards)    */}
                {/* ========================================== */}
                <div className="grid grid-cols-1 gap-4 md:hidden">
                    {filteredWarehouses.length > 0 ? (
                        filteredWarehouses.map((warehouse) => {
                            const attendances = warehouse?.attendance || [];
                            const defaultOpeningTime = warehouse?.opening_time || "-";
                            const hasAttendance = attendances.length > 0;

                            return (
                                <div
                                    key={warehouse?.id}
                                    className="relative rounded-2xl border border-slate-200/80 bg-white/90 p-4 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 transition-all"
                                >
                                    {/* Header Card Outlet / Store */}
                                    <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3.5 dark:border-slate-800/80">
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Avatar / Icon Store */}
                                            <div className="relative shrink-0">
                                                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-indigo-50 to-slate-100 text-indigo-600 dark:from-indigo-950/40 dark:to-slate-800 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50 shadow-2xs">
                                                    <Store className="w-5 h-5" />
                                                </div>
                                                <span
                                                    className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                                                        hasAttendance ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
                                                    }`}
                                                    title={hasAttendance ? "Aktif Beroperasi" : "Belum Ada Presensi"}
                                                />
                                            </div>

                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                                                        {warehouse?.code || "STORE"}
                                                    </span>
                                                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                                                        {warehouse?.name || "Nama Outlet"}
                                                    </h4>
                                                </div>
                                                {warehouse?.address && (
                                                    <p className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1 truncate">
                                                        <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                        <span className="truncate">{warehouse.address}</span>
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <span className="shrink-0 inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                            {warehouse?.zone?.zone_name || "Zone N/A"}
                                        </span>
                                    </div>

                                    {/* List Absensi Kasir (Mobile) */}
                                    <div className="pt-3 divide-y divide-slate-100 dark:divide-slate-800/60">
                                        {hasAttendance ? (
                                            attendances.map((att) => {
                                                const status = att?.approval_status;
                                                const targetOpeningTime = att?.work_start || defaultOpeningTime;
                                                const config = STATUS_CONFIG[status] || STATUS_CONFIG.Normal;
                                                const { Icon, label, color, iconStyle } = config;

                                                return (
                                                    <div key={att.id} className="py-3 first:pt-0 last:pb-0 space-y-2.5">
                                                        {/* Row Kasir Info & Status */}
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2.5 min-w-0">
                                                                {att?.contact?.contact_photo_url || att?.photo_url ? (
                                                                    <Image
                                                                        src={att?.contact?.contact_photo_url || att?.photo_url}
                                                                        alt={att?.contact?.name || "Kasir"}
                                                                        width={28}
                                                                        height={28}
                                                                        className="h-7 w-7 rounded-full object-cover shrink-0 ring-2 ring-slate-100 dark:ring-slate-800"
                                                                        unoptimized
                                                                    />
                                                                ) : (
                                                                    <div className="h-7 w-7 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-xs font-bold shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                                                                        {att?.contact?.name?.slice(0, 2)?.toUpperCase() || "KS"}
                                                                    </div>
                                                                )}
                                                                <div className="min-w-0">
                                                                    <span className="block text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                                                                        {att?.contact?.name || "Staf Kasir"}
                                                                    </span>
                                                                    <span className="text-[10px] text-slate-400 dark:text-slate-500">Kasir / Shift Store</span>
                                                                </div>
                                                            </div>

                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border shadow-2xs ${color}`}
                                                            >
                                                                <Icon className={iconStyle} /> {label}
                                                            </span>
                                                        </div>

                                                        {/* Info Waktu & Action */}
                                                        <div className="flex items-center justify-between gap-2 pt-1">
                                                            <div className="grid grid-cols-2 gap-2 flex-1">
                                                                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-2 border border-slate-100 dark:border-slate-800">
                                                                    <span className="block text-[9px] uppercase font-bold text-slate-400 tracking-wider">
                                                                        Jadwal Buka
                                                                    </span>
                                                                    <span className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">
                                                                        {targetOpeningTime}
                                                                    </span>
                                                                </div>
                                                                <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/30 p-2 border border-indigo-100/50 dark:border-indigo-900/30">
                                                                    <span className="block text-[9px] uppercase font-bold text-indigo-500 dark:text-indigo-400 tracking-wider">
                                                                        Jam Masuk
                                                                    </span>
                                                                    <span className="font-mono text-xs font-extrabold text-indigo-700 dark:text-indigo-300">
                                                                        {att?.time_in || "-"}
                                                                    </span>
                                                                </div>
                                                            </div>

                                                            <button
                                                                type="button"
                                                                onClick={() => handleOpenDetail(warehouse, att)}
                                                                className="inline-flex items-center gap-1 rounded-xl bg-slate-900 text-white hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 px-3 py-2 text-xs font-semibold shadow-2xs transition-all shrink-0 cursor-pointer"
                                                            >
                                                                <span>Detail</span>
                                                                <ChevronRight className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        ) : (
                                            <div className="flex items-center justify-between py-2.5">
                                                <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                                                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                                                    <span>
                                                        Jadwal Buka:{" "}
                                                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{defaultOpeningTime}</span>{" "}
                                                        (Belum Absen)
                                                    </span>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleOpenDetail(warehouse, null)}
                                                    className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold transition-all border border-slate-200/60 dark:border-slate-700/60 cursor-pointer"
                                                >
                                                    <span>Detail</span>
                                                    <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-12 px-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 text-center bg-white/50 dark:bg-slate-900/50">
                            <UserX className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Tidak ada data absensi toko untuk zona ini.</p>
                        </div>
                    )}
                </div>

                {/* ========================================== */}
                {/* 2. TAMPILAN DESKTOP (Modern Store Table)   */}
                {/* ========================================== */}
                <div className="hidden md:block w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/90 transition-all">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
                                    <th scope="col" className="px-6 py-4">
                                        Outlet / Store
                                    </th>
                                    <th scope="col" className="px-4 py-4 text-center">
                                        Zona
                                    </th>
                                    <th scope="col" className="px-5 py-4">
                                        Kasir & Staf
                                    </th>
                                    <th scope="col" className="px-4 py-4 text-center">
                                        Jadwal Buka
                                    </th>
                                    <th scope="col" className="px-4 py-4 text-center">
                                        Jam Masuk
                                    </th>
                                    <th scope="col" className="px-5 py-4 text-center">
                                        Status
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right">
                                        Aksi Detail
                                    </th>
                                </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                                {filteredWarehouses.length > 0 ? (
                                    filteredWarehouses.map((warehouse) => {
                                        const attendances = warehouse?.attendance || [];
                                        const defaultOpeningTime = warehouse?.opening_time || "-";
                                        const hasAttendance = attendances.length > 0;

                                        return (
                                            <tr key={warehouse?.id} className="group transition-colors hover:bg-slate-50/70 dark:hover:bg-slate-800/30">
                                                {/* Store Info */}
                                                <td className="px-6 py-4 align-middle">
                                                    <div className="flex items-center gap-3.5">
                                                        <div className="relative shrink-0">
                                                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-indigo-50 to-slate-100 text-indigo-600 dark:from-indigo-950/50 dark:to-slate-800 dark:text-indigo-400 border border-indigo-100/80 dark:border-indigo-900/50 shadow-2xs group-hover:scale-105 transition-transform">
                                                                <Store className="w-5 h-5" />
                                                            </div>
                                                            <span
                                                                className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-slate-900 ${
                                                                    hasAttendance ? "bg-emerald-500 animate-pulse" : "bg-slate-300 dark:bg-slate-600"
                                                                }`}
                                                                title={hasAttendance ? "Aktif Presensi" : "Belum Absen"}
                                                            />
                                                        </div>
                                                        <div className="min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-1.5 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                                                                    {warehouse?.code || "STORE"}
                                                                </span>
                                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm truncate">
                                                                    {warehouse?.name || "-"}
                                                                </span>
                                                            </div>
                                                            {warehouse?.address && (
                                                                <p className="flex items-center gap-1 text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-xs mt-1">
                                                                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                                                                    <span className="truncate">{warehouse.address}</span>
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Zona */}
                                                <td className="px-4 py-4 text-center whitespace-nowrap align-middle">
                                                    <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-slate-800 px-3 py-1 text-[11px] font-semibold text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60">
                                                        {warehouse?.zone?.zone_name || "Zone N/A"}
                                                    </span>
                                                </td>

                                                {/* Kasir & Staf */}
                                                <td className="px-5 py-4 align-middle">
                                                    {hasAttendance ? (
                                                        <div className="space-y-2.5">
                                                            {attendances.map((att) => (
                                                                <div key={att.id} className="flex items-center gap-2.5 h-7">
                                                                    {att?.contact?.contact_photo_url || att?.photo_url ? (
                                                                        <Image
                                                                            src={att?.contact?.contact_photo_url || att?.photo_url}
                                                                            alt={att?.contact?.name || "Kasir"}
                                                                            width={24}
                                                                            height={24}
                                                                            className="h-6 w-6 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                                                                            unoptimized
                                                                        />
                                                                    ) : (
                                                                        <div className="h-6 w-6 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] font-bold shrink-0 border border-indigo-100 dark:border-indigo-900/40">
                                                                            {att?.contact?.name?.slice(0, 2)?.toUpperCase() || "KS"}
                                                                        </div>
                                                                    )}
                                                                    <span className="font-semibold text-slate-800 dark:text-slate-200 text-xs truncate">
                                                                        {att?.contact?.name || "Kasir Store"}
                                                                    </span>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500 italic text-xs flex items-center gap-1.5">
                                                            <UserX className="w-3.5 h-3.5 opacity-60" /> Belum ada presensi kasir
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Jadwal Buka Store */}
                                                <td className="px-4 py-4 text-center whitespace-nowrap align-middle">
                                                    {hasAttendance ? (
                                                        <div className="space-y-2.5">
                                                            {attendances.map((att) => (
                                                                <div
                                                                    key={att.id}
                                                                    className="flex items-center justify-center h-7 font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 px-2.5 rounded-lg border border-slate-200/50 dark:border-slate-700/50"
                                                                >
                                                                    {att?.work_start || defaultOpeningTime}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center font-mono text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100/70 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-200/50 dark:border-slate-700/50">
                                                            {defaultOpeningTime}
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Jam Masuk Actual */}
                                                <td className="px-4 py-4 text-center whitespace-nowrap align-middle">
                                                    {hasAttendance ? (
                                                        <div className="space-y-2.5">
                                                            {attendances.map((att) => (
                                                                <div
                                                                    key={att.id}
                                                                    className="flex items-center justify-center h-7 font-mono text-xs font-extrabold text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-indigo-950/40 px-2.5 rounded-lg border border-indigo-100 dark:border-indigo-900/40"
                                                                >
                                                                    {att?.time_in || "-"}
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center rounded-full bg-slate-100/80 dark:bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-400 dark:text-slate-500">
                                                            Belum Absen
                                                        </span>
                                                    )}
                                                </td>

                                                {/* Status / Approval */}
                                                <td className="px-5 py-4 text-center whitespace-nowrap align-middle">
                                                    {hasAttendance ? (
                                                        <div className="space-y-2.5">
                                                            {attendances.map((att) => {
                                                                const status = att?.approval_status;
                                                                const config = STATUS_CONFIG[status] || STATUS_CONFIG.Normal;
                                                                const { Icon, label, color, iconStyle } = config;

                                                                return (
                                                                    <div key={att.id} className="flex items-center justify-center h-7">
                                                                        <span
                                                                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold border shadow-2xs ${color}`}
                                                                        >
                                                                            <Icon className={iconStyle} /> {label}
                                                                        </span>
                                                                    </div>
                                                                );
                                                            })}
                                                        </div>
                                                    ) : (
                                                        <span className="text-slate-400 dark:text-slate-500 text-xs">-</span>
                                                    )}
                                                </td>

                                                {/* Tombol Aksi Detail */}
                                                <td className="px-6 py-4 text-right whitespace-nowrap align-middle">
                                                    {hasAttendance ? (
                                                        <div className="space-y-2.5">
                                                            {attendances.map((att) => (
                                                                <div key={att.id} className="flex items-center justify-end h-7">
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => handleOpenDetail(warehouse, att)}
                                                                        className="inline-flex items-center gap-1 rounded-xl bg-slate-900 text-white hover:bg-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-600 dark:text-slate-100 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer shadow-2xs border border-transparent"
                                                                    >
                                                                        <span>Detail</span>
                                                                        <ChevronRight className="w-3.5 h-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" />
                                                                    </button>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <button
                                                            type="button"
                                                            onClick={() => handleOpenDetail(warehouse, null)}
                                                            className="inline-flex items-center gap-1 rounded-xl bg-slate-100 hover:bg-indigo-50 hover:text-indigo-600 dark:bg-slate-800 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer border border-slate-200/60 dark:border-slate-700/60"
                                                        >
                                                            <span>Detail</span>
                                                            <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={7} className="py-12 text-center text-slate-400 dark:text-slate-500">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <UserX className="w-8 h-8 text-slate-300 dark:text-slate-600" />
                                                <p className="text-xs font-medium">Tidak ada data absensi outlet untuk zona ini.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle}>
                <AttendanceDetail
                    selectedWarehouse={selectedWarehouse}
                    selectedAttendance={selectedAttendance}
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
