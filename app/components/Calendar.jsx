"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, getDay } from "date-fns";
import id from "date-fns/locale/id";
import { AlarmClockPlus, Check, Clock, Star, X, CalendarDays, Bed } from "lucide-react";

// Utility untuk warna badge/item individual
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
    if (item.type === "weekly_off") return { bg: "bg-amber-400 text-white", icon: <Bed size={12} /> };
    if (item.type === "company_event") return { bg: "bg-indigo-500 text-white", icon: <CalendarDays size={12} /> };
    if (item.type === "holiday") return { bg: "bg-amber-500 text-white", icon: <CalendarDays size={12} /> };
    if (item.type === "leave") return { bg: "bg-purple-500 text-white", icon: <CalendarDays size={12} /> };

    return { bg: "bg-slate-200 text-slate-800", icon: null };
};

export default function Calendar({ data = {}, className = "", maxWidth = "max-w-lg", withHeader = true, onDateClick }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    const startOffset = (getDay(monthStart) + 6) % 7;

    return (
        <div
            className={`w-full ${maxWidth} ${className} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-xs`}
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-6 px-1" hidden={!withHeader}>
                <button
                    onClick={prevMonth}
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                    ◀
                </button>
                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: id })}
                </h2>
                <button
                    onClick={nextMonth}
                    className="p-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold cursor-pointer"
                >
                    ▶
                </button>
            </div>

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
                    // Data sekarang diasumsikan berupa ARRAY (bisa berisi 1 atau banyak item)
                    const rawInfo = data[key];
                    const items = Array.isArray(rawInfo) ? rawInfo : rawInfo ? [rawInfo] : [];

                    return (
                        <div
                            key={key}
                            onClick={() => onDateClick && onDateClick(key, items)}
                            className="h-16 sm:h-24 p-1.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex flex-col justify-between transition-all cursor-pointer hover:border-emerald-500/50 overflow-hidden"
                        >
                            {/* Baris Atas: Tanggal */}
                            <div className="w-full flex justify-between items-center px-0.5">
                                <span className="text-[11px] sm:text-xs font-bold text-slate-700 dark:text-slate-300 leading-none">
                                    {format(day, "d", { locale: id })}
                                </span>
                                {items.length > 0 && (
                                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                                        {items.length}
                                    </span>
                                )}
                            </div>

                            {/* Bagian Tengah: List Event / Jadwal (Multi-Item) */}
                            <div className="w-full flex-1 flex flex-col gap-1 overflow-y-auto mt-1 no-scrollbar">
                                {items.slice(0, 2).map((item, idx) => {
                                    const style = getItemStyle(item);
                                    return (
                                        <div
                                            key={idx}
                                            className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-md font-medium truncate flex items-center gap-1 ${style.bg}`}
                                        >
                                            {style.icon}
                                            <span className="truncate">{item.name || item.status || item.type}</span>
                                        </div>
                                    );
                                })}

                                {/* Jika event lebih dari 2, tampilkan indikator "+X lainnya" */}
                                {items.length > 2 && <span className="text-[9px] text-slate-400 text-center font-semibold">+{items.length - 2} lagi</span>}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
