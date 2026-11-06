/* eslint-disable react-hooks/immutability */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Calendar from "@/app/components/Calendar";
import Modal from "@/app/components/Modal";
import axios from "@/app/utils/axios";
import { FileSpreadsheet, Loader2 } from "lucide-react";

const TYPE_CONFIG = {
    weekly_off: {
        label: "Libur Mingguan",
        dot: "bg-amber-400",
        badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    },
    leave: {
        label: "Cuti",
        dot: "bg-rose-500",
        badge: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800",
    },
    company_event: {
        label: "Event Perusahaan",
        dot: "bg-indigo-500",
        badge: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800",
    },
    holiday: {
        label: "Hari Libur",
        dot: "bg-amber-500",
        badge: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800",
    },
    attendance: {
        label: "Absensi",
        dot: "bg-emerald-500",
        badge: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800",
    },
};

const STATUS_CONFIG = {
    approved: { label: "Disetujui", style: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
    pending: { label: "Menunggu", style: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
    rejected: { label: "Ditolak", style: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
    Hadir: { label: "Hadir", style: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300" },
    Telat: { label: "Telat", style: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
    Alpha: { label: "Alpha", style: "bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300" },
    Lembur: { label: "Lembur", style: "bg-violet-50 text-violet-700 dark:bg-violet-950/60 dark:text-violet-300" },
    Good: { label: "Good", style: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300" },
};

export default function EmployeeDayOff() {
    const router = useRouter();
    const [calendarData, setCalendarData] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        fetchSchedules();
    }, []);

    const fetchSchedules = async () => {
        try {
            setLoading(true);
            const response = await axios.get("/api/employee-schedules");
            const formattedData = {};
            console.log(response.data);
            response.data.forEach((item) => {
                formattedData[item.date] = {
                    type: item.type,
                    name: item.title || item.type,
                    status: item.status,
                    employee_id: item.employee_id,
                    employee_name: item.employee?.contact?.name || "Nama tidak ditemukan",
                };
            });
            setCalendarData(formattedData);
        } catch (err) {
            console.error("Gagal memuat data jadwal:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDateClick = (dateString, dataOnThisDate) => {
        setSelectedDate({ date: dateString, data: dataOnThisDate });
        setIsModalOpen(true);
    };

    const typeConfig = selectedDate?.data?.type ? TYPE_CONFIG[selectedDate.data.type] : null;
    const statusConfig = selectedDate?.data?.status ? STATUS_CONFIG[selectedDate.data.status] : null;

    return (
        <div className="p-4 sm:p-6 space-y-5">
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                {/* <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-500/30 shrink-0">
                        <CalendarCheck size={18} className="text-white" />
                    </div>
                    <div>
                        <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 leading-tight">Kalender &amp; Jadwal Karyawan</h1>
                        <p className="text-[11px] text-slate-400 mt-0.5">Kelola libur mingguan, cuti, dan event perusahaan.</p>
                    </div>
                </div> */}
                {/* ── Legend bar ── */}
                <div className="flex flex-wrap gap-1.5">
                    {Object.entries(TYPE_CONFIG)
                        .filter(([key]) => key !== "attendance")
                        .map(([key, cfg]) => (
                            <span
                                key={key}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] font-medium text-slate-600 dark:text-slate-400 shadow-xs"
                            >
                                <span className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
                                {cfg.label}
                            </span>
                        ))}
                </div>

                <button
                    onClick={() => router.push("/employee/employee-schedules-import")}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                >
                    <FileSpreadsheet size={14} /> Import Excel
                </button>
            </div>

            {/* ── Kalender — langsung render, Calendar sudah punya card-nya sendiri ── */}
            {loading ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-24 flex flex-col items-center justify-center gap-2 text-slate-400 shadow-xs">
                    <Loader2 size={22} className="animate-spin text-emerald-500" />
                    <span className="text-xs">Memuat kalender...</span>
                </div>
            ) : (
                <Calendar data={calendarData} maxWidth="max-w-full" className="rounded-2xl" onDateClick={handleDateClick} />
            )}

            {/* ── Modal Detail Tanggal ── */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Tanggal" maxWidth="max-w-sm">
                {selectedDate && (
                    <div className="space-y-3 text-xs">
                        {/* Tanggal pill */}
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tanggal</span>
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{selectedDate.date}</span>
                        </div>

                        {/* Type + Status badges */}
                        <div className="flex flex-wrap gap-1.5">
                            {typeConfig ? (
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${typeConfig.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${typeConfig.dot}`} />
                                    {typeConfig.label}
                                </span>
                            ) : (
                                <span className="px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                                    Hari Normal
                                </span>
                            )}
                            {statusConfig && (
                                <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${statusConfig.style}`}>{statusConfig.label}</span>
                            )}
                        </div>

                        {/* Detail rows */}
                        {selectedDate.data ? (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-3">
                                {selectedDate.data.name && (
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Keterangan</span>
                                        <span className="text-slate-700 dark:text-slate-200 font-medium">{selectedDate.data.name}</span>
                                    </div>
                                )}
                                {selectedDate.data.employee_id && (
                                    <div>
                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block mb-0.5">Karyawan</span>
                                        <span className="font-mono text-slate-700 dark:text-slate-200 font-medium">{selectedDate.data.employee_name}</span>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic text-center py-3 border-t border-slate-100 dark:border-slate-800">
                                Tidak ada catatan khusus pada tanggal ini.
                            </p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
