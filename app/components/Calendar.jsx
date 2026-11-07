"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, getDay, parseISO, isToday } from "date-fns";
import id from "date-fns/locale/id";
import { AlarmClockPlus, Check, Clock, Star, X, CalendarDays, Bed, Calendar as CalendarIcon, ListOrdered } from "lucide-react";

// Utility untuk warna dan ikon
const getItemStyle = (item) => {
    if (!item) return { bg: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300", icon: null };

    if (item.type === "attendance") {
        if (item.status === "Hadir") return { bg: "bg-emerald-500 text-white", icon: <Check size={12} strokeWidth={3} /> };
        if (item.status === "Good")
            return { bg: "bg-amber-100 text-amber-900 border border-amber-300", icon: <Star size={12} className="text-amber-600 fill-amber-500" /> };
        if (item.status === "Telat") return { bg: "bg-rose-500 text-white", icon: <Clock size={12} /> };
        if (item.status === "Lembur") return { bg: "bg-violet-500 text-white", icon: <AlarmClockPlus size={12} /> };
        if (item.status === "Alpha") return { bg: "bg-rose-600 text-white", icon: <X size={12} strokeWidth={3} /> };
    }
    if (item.type === "weekly_off") return { bg: "bg-rose-400 text-white", icon: <Bed size={12} /> };
    if (item.type === "company_event") return { bg: "bg-indigo-500 text-white", icon: <CalendarDays size={12} /> };
    if (item.type === "holiday") return { bg: "bg-amber-500 text-white", icon: <CalendarDays size={12} /> };
    if (item.type === "leave") return { bg: "bg-purple-500 text-white", icon: <CalendarDays size={12} /> };

    return { bg: "bg-slate-200 text-slate-800", icon: null };
};

export default function Calendar({ data = {}, className = "", maxWidth = "max-w-lg", withHeader = true, onDateClick }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState("grid"); // "grid" (kalender) atau "list" (tabel)

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const startOffset = (getDay(monthStart) + 6) % 7;

    // Ambil daftar event di bulan aktif untuk Tampilan List
    const currentMonthEvents = Object.entries(data)
        .filter(([dateStr]) => {
            const d = parseISO(dateStr);
            return d >= monthStart && d <= monthEnd;
        })
        .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB));

    return (
        <div
            className={`w-full ${maxWidth} ${className} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs space-y-4`}
        >
            {/* HEADER & TOGGLE SWITCH */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-3" hidden={!withHeader}>
                <div className="flex items-center gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    >
                        ◀
                    </button>
                    <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 capitalize min-w-35 text-center">
                        {format(currentMonth, "MMMM yyyy", { locale: id })}
                    </h2>
                    <button
                        onClick={nextMonth}
                        className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                    >
                        ▶
                    </button>
                </div>

                {/* Tombol Toggle View (Grid vs List) */}
                <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl">
                    <button
                        onClick={() => setViewMode("grid")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "grid"
                                ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                    >
                        <CalendarIcon size={14} /> Kalender
                    </button>
                    <button
                        onClick={() => setViewMode("list")}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                            viewMode === "list"
                                ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs"
                                : "text-slate-500 hover:text-slate-700 dark:text-slate-400"
                        }`}
                    >
                        <ListOrdered size={14} /> List
                    </button>
                </div>
            </div>

            {/* KONDISI TAMPILAN: GRID ATAU LIST */}
            {viewMode === "grid" ? (
                <>
                    {/* GRID HEADER HARI */}
                    <div className="grid grid-cols-7 gap-1.5 text-center text-xs mb-3">
                        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                            <div key={d} className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[11px]">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* GRID KALENDER */}
                    <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                        {[...Array(startOffset)].map((_, i) => (
                            <div key={`empty-${i}`} className="h-16 sm:h-24 rounded-2xl bg-transparent"></div>
                        ))}

                        {days.map((day) => {
                            const key = format(day, "yyyy-MM-dd");
                            const rawInfo = data[key];
                            const items = Array.isArray(rawInfo) ? rawInfo : rawInfo ? [rawInfo] : [];
                            const color = getItemStyle(items[0]);

                            // Cek apakah hari ini adalah tanggal hari ini
                            const todayFlag = isToday(day);

                            return (
                                // Ganti bagian class pada div tanggal di map(days) dengan kode ini:

                                <div
                                    key={key}
                                    onClick={() => onDateClick && onDateClick(key, items)}
                                    className={`h-16 sm:h-24 p-1.5 rounded-2xl flex flex-col justify-between transition-all cursor-pointer overflow-hidden border ${
                                        items.length > 0
                                            ? `${color.style} border-slate-300/80` // Jika ada event/jadwal, pakai warna background event tanpa border mencolok
                                            : "bg-slate-50/50 dark:bg-slate-800/40 border-slate-300/80 dark:border-slate-800 hover:border-emerald-500/50" // Jika kosong, pakai border tipis bawaan
                                    } ${
                                        // HIGHLIGHT HARI INI (Border hijau terang + shadow halus)
                                        todayFlag ? "border-emerald-500! dark:border-emerald-400! ring-2 ring-emerald-500/20 font-bold shadow-sm" : ""
                                    }`}
                                >
                                    {/* Baris Atas: Tanggal */}
                                    <div className="w-full flex justify-between items-center px-0.5">
                                        <span
                                            className={`text-[11px] sm:text-xs leading-none ${todayFlag ? "text-emerald-600 dark:text-emerald-400 font-extrabold" : "text-slate-700 dark:text-slate-300"}`}
                                        >
                                            {format(day, "d", { locale: id })}
                                        </span>
                                        {items.length > 0 && (
                                            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                                {items.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* Bagian Tengah: List Event / Jadwal */}
                                    <div className="w-full flex-1 flex flex-col gap-1 overflow-y-auto mt-1 no-scrollbar">
                                        {items.slice(0, 2).map((item, idx) => {
                                            const style = getItemStyle(item);
                                            return (
                                                <div
                                                    key={idx}
                                                    className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate flex items-center gap-1 ${style.bg}`}
                                                >
                                                    {style.icon}
                                                    {item.type === "weekly_off" ? (
                                                        <span className="truncate">{item.employee_name}</span>
                                                    ) : (
                                                        <span className="truncate">{item.name || item.status || item.type}</span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                        {items.length > 2 && (
                                            <span className="text-[9px] text-slate-400 text-center font-semibold">+{items.length - 2} lagi</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </>
            ) : (
                /* TAMPILAN LIST / TABEL BULANAN */
                <div className="space-y-2 max-h-125 overflow-y-auto pr-1">
                    {currentMonthEvents.length > 0 ? (
                        currentMonthEvents.map(([dateStr, rawInfo]) => {
                            const items = Array.isArray(rawInfo) ? rawInfo : [rawInfo];
                            return (
                                <div
                                    key={dateStr}
                                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-mono font-bold text-xs shrink-0">
                                            {format(parseISO(dateStr), "dd MMM yyyy", { locale: id })}
                                        </div>
                                        <div className="flex flex-wrap gap-1.5">
                                            {items.map((it, i) => {
                                                const style = getItemStyle(it);
                                                return (
                                                    <span
                                                        key={i}
                                                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${style.bg}`}
                                                    >
                                                        {style.icon}
                                                        {it.type === "weekly_off" ? (
                                                            <span className="truncate">{it.employee_name}</span>
                                                        ) : (
                                                            <span className="truncate">{it.name || it.status || it.type}</span>
                                                        )}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => onDateClick && onDateClick(dateStr, items)}
                                        className="text-xs font-semibold text-emerald-600 hover:text-emerald-500 cursor-pointer"
                                    >
                                        Detail →
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 text-center text-slate-400 text-xs italic">Tidak ada jadwal atau event tercatat di bulan ini.</div>
                    )}
                </div>
            )}
        </div>
    );
}
