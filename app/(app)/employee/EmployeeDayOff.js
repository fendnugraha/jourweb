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

export default function EmployeeDayOff({ userRole }) {
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

            // FIX: Menggunakan Array per tanggal agar jika ada banyak event/libur di hari yang sama, tidak saling menimpa
            response.data.forEach((item) => {
                if (!formattedData[item.date]) {
                    formattedData[item.date] = [];
                }
                formattedData[item.date].push({
                    type: item.type,
                    name: item.title || item.type,
                    status: item.status,
                    employee_id: item.employee_id,
                    employee_name: item.employee?.contact?.name || "Nama tidak ditemukan",
                });
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

    // Pastikan data aman berupa array untuk modal detail
    const itemsList = Array.isArray(selectedDate?.data) ? selectedDate.data : selectedDate?.data ? [selectedDate.data] : [];

    return (
        <div className="p-4 sm:p-6 space-y-5">
            {/* ── Header & Legend ── */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
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
                    disabled={!["Administrator", "Super Admin"].includes(userRole)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs shadow-emerald-600/20 transition-all cursor-pointer"
                >
                    <FileSpreadsheet size={14} /> Import Excel
                </button>
            </div>

            {/* ── Kalender ── */}
            {loading ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl py-24 flex flex-col items-center justify-center gap-2 text-slate-400 shadow-xs">
                    <Loader2 size={22} className="animate-spin text-emerald-500" />
                    <span className="text-xs">Memuat kalender...</span>
                </div>
            ) : (
                <Calendar data={calendarData} maxWidth="max-w-full" className="rounded-2xl" onDateClick={handleDateClick} />
            )}

            {/* ── Modal Detail Tanggal (Support Multi-Item) ── */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Detail Tanggal" maxWidth="max-w-md">
                {selectedDate && (
                    <div className="space-y-4 text-xs">
                        {/* Tanggal pill */}
                        <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">Tanggal</span>
                            <span className="font-mono font-semibold text-slate-700 dark:text-slate-200">{selectedDate.date}</span>
                        </div>

                        {/* List Event/Jadwal di Tanggal Tersebut */}
                        {itemsList.length > 0 ? (
                            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
                                {itemsList.map((item, idx) => {
                                    const typeConfig = item.type ? TYPE_CONFIG[item.type] : null;
                                    const statusConfig = item.status ? STATUS_CONFIG[item.status] : null;

                                    return (
                                        <div
                                            key={idx}
                                            className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 space-y-2"
                                        >
                                            <div className="flex flex-wrap gap-1.5 items-center">
                                                {typeConfig ? (
                                                    <span
                                                        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-semibold ${typeConfig.badge}`}
                                                    >
                                                        <span className={`w-1.5 h-1.5 rounded-full ${typeConfig.dot}`} />
                                                        {typeConfig.label}
                                                    </span>
                                                ) : (
                                                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-semibold bg-slate-100 text-slate-500">
                                                        Hari Normal
                                                    </span>
                                                )}
                                                {statusConfig && (
                                                    <span className={`px-2 py-0.5 rounded-lg text-[10px] font-semibold ${statusConfig.style}`}>
                                                        {statusConfig.label}
                                                    </span>
                                                )}
                                            </div>

                                            <div className="space-y-1">
                                                {item.name && (
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Keterangan</span>
                                                        <span className="text-slate-700 dark:text-slate-200 font-medium">{item.name}</span>
                                                    </div>
                                                )}
                                                {item.employee_id && (
                                                    <div>
                                                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">Karyawan</span>
                                                        <span className="font-mono text-slate-700 dark:text-slate-200 font-medium">{item.employee_name}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <p className="text-slate-400 italic text-center py-4">Tidak ada catatan khusus pada tanggal ini.</p>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
