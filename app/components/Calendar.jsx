"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, getDay } from "date-fns";
import id from "date-fns/locale/id";
import { AlarmClockPlus, Check, Clock, Star, X, CalendarDays } from "lucide-react";

const getColor = (data) => {
    if (!data)
        return { style: "bg-slate-50 text-slate-700 dark:bg-slate-800/60 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700/60", icon: null };

    if (data.type === "attendance") {
        if (data.status === "Hadir") return { style: "bg-emerald-500 text-white shadow-xs shadow-emerald-500/20", icon: <Check size={13} strokeWidth={3} /> };
        if (data.status === "Good")
            return {
                style: "bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800",
                icon: <Star size={13} className="text-amber-600 fill-amber-500" />,
            };
        if (data.status === "Telat") return { style: "bg-rose-500 text-white shadow-xs shadow-rose-500/20", icon: <Clock size={13} /> };
        if (data.status === "Lembur") return { style: "bg-violet-500 text-white shadow-xs shadow-violet-500/20", icon: <AlarmClockPlus size={13} /> };
        if (data.status === "Alpha") return { style: "bg-rose-600 text-white shadow-xs shadow-rose-600/20", icon: <X size={13} strokeWidth={3} /> };
    }

    if (data.type === "holiday") {
        return { style: "bg-amber-500 text-white shadow-xs shadow-amber-500/20", icon: <CalendarDays size={12} /> };
    }

    if (data.type === "event") {
        return { style: "bg-indigo-500 text-white shadow-xs shadow-indigo-500/20", icon: <CalendarDays size={12} /> };
    }

    return { style: "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300", icon: null };
};

// Tambahkan prop onDateClick di parameter komponen
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
            className={`w-full ${maxWidth} ${className} bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 shadow-xs`}
        >
            {/* HEADER */}
            <div className="flex justify-between items-center mb-5 px-1" hidden={!withHeader}>
                <button
                    onClick={prevMonth}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer text-xs font-bold"
                >
                    ◀
                </button>

                <h2 className="text-sm sm:text-base font-bold text-slate-800 dark:text-slate-100 capitalize">
                    {format(currentMonth, "MMMM yyyy", { locale: id })}
                </h2>

                <button
                    onClick={nextMonth}
                    className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer text-xs font-bold"
                >
                    ▶
                </button>
            </div>

            {/* GRID HEADER HARI */}
            <div className="grid grid-cols-7 gap-1.5 text-center text-xs mb-2">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                    <div key={d} className="font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-[11px]">
                        {d}
                    </div>
                ))}
            </div>

            {/* GRID KALENDER */}
            <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                {[...Array(startOffset)].map((_, i) => (
                    <div key={`empty-${i}`} className="h-12 sm:h-20 rounded-xl bg-transparent"></div>
                ))}

                {days.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const info = data[key];
                    const color = getColor(info);

                    return (
                        <div
                            key={key}
                            // Trigger fungsi onDateClick dengan mengirimkan tanggal (key) dan datanya jika ada
                            onClick={() => onDateClick && onDateClick(key, info)}
                            className={`h-14 sm:h-20 p-1 sm:p-1.5 rounded-xl flex flex-col justify-between items-center transition-all cursor-pointer hover:opacity-95 hover:ring-2 hover:ring-indigo-500/50 ${color.style}`}
                        >
                            <div className="w-full flex justify-between items-center px-0.5">
                                <span className="text-[11px] sm:text-xs font-bold leading-none">{format(day, "d", { locale: id })}</span>
                                {info?.type === "attendance" && <span className="text-[10px] sm:hidden">{color.icon}</span>}
                            </div>

                            <div className="w-full flex-1 flex flex-col justify-center items-center text-center overflow-hidden gap-0.5">
                                {info?.type === "attendance" && (
                                    <>
                                        <span className="hidden sm:flex items-center justify-center">{color.icon}</span>
                                        {info.time_in && <span className="text-[10px] font-mono font-semibold hidden sm:block opacity-90">{info.time_in}</span>}
                                    </>
                                )}

                                {info?.type === "holiday" && (
                                    <span className="text-[9px] sm:text-[10px] font-semibold leading-tight line-clamp-2 px-0.5">{info.name}</span>
                                )}

                                {info?.type === "event" && (
                                    <span className="text-[9px] sm:text-[10px] italic leading-tight line-clamp-2 px-0.5">{info.name}</span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
