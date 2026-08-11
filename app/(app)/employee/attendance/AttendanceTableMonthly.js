import React from "react";
import { Check, ClockAlert, Star, AlarmClockPlus, Minus } from "lucide-react";

const AttendanceTableMonthly = ({ selectedZone, warehouseMonthly }) => {
    // 💡 Safe fallback agar tidak error saat render awal
    const days = warehouseMonthly?.days || [];
    const employees = warehouseMonthly?.employees || [];

    // Helper untuk mapping warna dan icon berdasarkan status
    const getStatusConfig = (status) => {
        switch (status) {
            case "Late":
                return {
                    bg: "bg-rose-500 text-white dark:bg-rose-600",
                    border: "border-rose-400",
                    icon: <ClockAlert className="w-3 h-3" />,
                    label: "Telat",
                };
            case "Good":
                return {
                    bg: "bg-amber-400 text-slate-950 dark:bg-yellow-500",
                    border: "border-yellow-300",
                    icon: <Star className="w-5 h-5 text-orange-700 rotate-45 animate-pulse" fill="orange" />,
                    label: "Good / Excellent",
                };
            case "Overtime":
                return {
                    bg: "bg-violet-500 text-white dark:bg-violet-600",
                    border: "border-violet-400",
                    icon: <AlarmClockPlus className="w-3 h-3" />,
                    label: "Lembur",
                };
            case "Normal":
            case "Approved":
                return {
                    bg: "bg-emerald-500 text-white dark:bg-green-600",
                    border: "border-green-400",
                    icon: <Check className="w-3 h-3 stroke-3" />,
                    label: "Hadir Normal",
                };
            default:
                return {
                    bg: "bg-slate-100 text-slate-300 dark:bg-slate-800/60 dark:text-slate-600",
                    border: "border-transparent",
                    icon: <Minus className="w-3 h-3 opacity-40" />,
                    label: "Libur / Absen",
                };
        }
    };

    if (!warehouseMonthly || days.length === 0) {
        return (
            <div className="p-8 text-center text-xs font-medium text-slate-400 rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
                Memuat data presensi bulanan...
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {employees.map((employee) => {
                // Hitung ringkasan singkat kehadiran
                const attendancesList = Object.values(employee?.attendance_by_date || {}).filter(Boolean);
                const totalPresent = attendancesList.length;

                return (
                    <div
                        key={employee?.id}
                        className="group flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl border border-slate-200/80 bg-white/80 dark:border-slate-800 dark:bg-slate-900/80 shadow-xs backdrop-blur-xl transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-700"
                    >
                        {/* 1. INFORMASI KARYAWAN (Kiri) */}
                        <div className="w-full md:w-52 shrink-0 flex items-center justify-between md:block">
                            <div>
                                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">{employee?.name}</h3>
                                <p className="text-[11px] text-slate-400 mt-0.5">Kasir / Staff</p>
                            </div>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 mt-1">
                                {totalPresent} Hari Hadir
                            </span>
                        </div>

                        {/* 2. TIMELINE STRIP BAR WITH ICONS (Kanan) */}
                        <div className="flex-1 overflow-x-auto pb-1 pt-2 scrollbar-none">
                            <div className="hidden sm:flex items-center gap-1 min-w-max">
                                {days.map((day) => {
                                    const att = employee?.attendance_by_date?.[day];
                                    const dateNum = day.split("-")[2];
                                    const config = getStatusConfig(att?.status);

                                    return (
                                        <div key={day} className="group/bar relative flex flex-col items-center flex-1 min-w-7">
                                            {/* Strip Bar dengan Icon */}
                                            <div
                                                className={`
                                                    w-full h-10 rounded-xl flex items-center justify-center transition-all duration-200 
                                                    group-hover/bar:scale-110 group-hover/bar:z-10 group-hover/bar:shadow-lg cursor-pointer
                                                    ${config.bg}
                                                `}
                                            >
                                                {config.icon}
                                            </div>

                                            {/* Angka Tanggal di Bawah Bar */}
                                            <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 mt-1.5 group-hover/bar:text-slate-800 dark:group-hover/bar:text-slate-200 transition-colors">
                                                {dateNum}
                                            </span>

                                            {/* FLOATING TOOLTIP (Saat Hover) */}
                                            <div className="absolute bottom-full mb-2 hidden group-hover/bar:flex flex-col items-center z-30 pointer-events-none">
                                                <div className="rounded-xl bg-slate-900 dark:bg-slate-800 p-2 text-[11px] font-medium text-white shadow-xl whitespace-nowrap border border-slate-700/50">
                                                    <p className="font-bold text-slate-300 border-b border-slate-700/80 pb-1 mb-1">{day}</p>
                                                    <p className="flex items-center gap-1.5">
                                                        Status: <span className="font-semibold text-amber-300">{config.label}</span>
                                                    </p>
                                                    {att?.time_in && (
                                                        <p className="text-slate-300 mt-0.5">
                                                            Jam Masuk: <span className="font-mono font-semibold text-emerald-400">{att.time_in}</span>
                                                        </p>
                                                    )}
                                                </div>
                                                {/* Arrow Tooltip */}
                                                <div className="h-2 w-2 rotate-45 bg-slate-900 dark:bg-slate-800 -mt-1" />
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="grid grid-cols-7 sm:hidden gap-1.5">
                                {days.map((day) => {
                                    const att = employee?.attendance_by_date?.[day];
                                    const dateNum = day.split("-")[2];
                                    const config = getStatusConfig(att?.status);

                                    return (
                                        <div key={day} className="group/bar relative flex flex-col items-center">
                                            <div
                                                title={`${day} - Status: ${config.label}`}
                                                className={`
                            w-full h-8 sm:h-10 rounded-xl flex items-center justify-center transition-all duration-200 
                            active:scale-95 sm:group-hover/bar:scale-110 sm:group-hover/bar:z-10 cursor-pointer
                            ${config.bg}
                        `}
                                            >
                                                {config.icon}
                                            </div>

                                            <span className="text-[10px] font-mono font-medium text-slate-400 dark:text-slate-500 mt-1">{dateNum}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default AttendanceTableMonthly;
