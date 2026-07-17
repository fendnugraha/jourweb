"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, getDay } from "date-fns";
import id from "date-fns/locale/id";
import { AlarmClockPlus, Check, Clock, Star, X } from "lucide-react";

// Utility untuk memberi warna
const getColor = (data) => {
    if (!data) return { style: "bg-gray-200 dark:bg-gray-700", icon: "" };

    if (data.type === "attendance") {
        if (data.status === "Hadir") return { style: "bg-green-500 dark:bg-green-600 text-white", icon: <Check size={15} /> };
        if (data.status === "Good")
            return {
                style: "bg-yellow-200 dark:bg-yellow-300 text-slate-800",
                icon: <Star size={20} strokeWidth={2} className="text-orange-700" fill="orange" />,
            };
        if (data.status === "Telat") return { style: "bg-red-500 dark:bg-red-600 text-white", icon: <Clock size={15} /> };
        if (data.status === "Lembur") return { style: "bg-violet-500 dark:bg-violet-600 text-white", icon: <AlarmClockPlus size={15} /> };
        if (data.status === "Alpha") return { style: "bg-red-500 dark:bg-red-600 text-white", icon: <X size={15} /> };
    }

    if (data.type === "holiday") {
        return { style: "bg-amber-500 dark:bg-amber-600 text-white", icon: "" };
    }

    if (data.type === "event") {
        return { style: "bg-blue-500 dark:bg-blue-600 text-white", icon: "Calendar" };
    }

    return { style: "bg-gray-100 dark:bg-gray-700", icon: "" };
};

export default function Calendar({ data = {}, className, maxWidth = "max-w-lg", withHeader = true }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(addMonths(currentMonth, -1));

    // Hitung offset hari awal bulan (Senin = 1)
    const startOffset = (getDay(monthStart) + 6) % 7;

    return (
        <div className={`w-full ${maxWidth} ${className} p-4`}>
            {/* HEADER */}
            <div className="flex justify-between items-center mb-4" hidden={!withHeader}>
                <button onClick={prevMonth} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                    ◀
                </button>

                <h2 className="text-lg font-semibold">{format(currentMonth, "MMMM yyyy", { locale: id })}</h2>

                <button onClick={nextMonth} className="px-3 py-1 bg-gray-200 dark:bg-gray-700 rounded">
                    ▶
                </button>
            </div>

            {/* GRID */}
            <div className="grid grid-cols-7 gap-2 text-center text-sm mb-2">
                {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((d) => (
                    <div key={d} className="font-semibold text-gray-500 dark:text-gray-400">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                {/* OFFSET kosong sebelum tanggal 1 */}
                {[...Array(startOffset)].map((_, i) => (
                    <div key={i}></div>
                ))}

                {/* RENDER TANGGAL */}
                {days.map((day) => {
                    const key = format(day, "yyyy-MM-dd");
                    const info = data[key];
                    const color = getColor(info);

                    return (
                        <div key={key} className={`h-10 sm:h-20 rounded-xl flex flex-col justify-center items-center cursor-pointer ${color.style}`}>
                            <span className="font-bold hidden sm:block">{format(day, "d", { locale: id })}</span>
                            <span className="font-bold sm:hidden block">
                                {info?.status === "Good" ? <Star size={15} className="text-yellow-700" fill="orange" /> : format(day, "d", { locale: id })}
                            </span>

                            {info?.type === "attendance" && <span className="text-xs hidden sm:block">{color.icon}</span>}
                            {info?.type === "attendance" && <span className="text-xs hidden sm:block">{info.time_in}</span>}

                            {info?.type === "holiday" && <span className="text-[10px]">{info.name}</span>}

                            {info?.type === "event" && <span className="text-[10px] italic">{info.name}</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
