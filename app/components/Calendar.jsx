"use client";

import { useState } from "react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, addMonths, subMonths, getDay, parseISO, isToday, isSameMonth } from "date-fns";
import id from "date-fns/locale/id";
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    ListFilter,
    CalendarDays,
    Bed,
    Clock,
    Check,
    Star,
    X,
    AlarmClockPlus,
    CalendarCheck,
    Sparkles,
} from "lucide-react";

// Config style per tipe jadwal/event (selaras dark & light mode)
const TYPE_CONFIG = {
    weekly_off: {
        label: "Libur Mingguan",
        dot: "bg-amber-500",
        desktopBadge: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
        listBadge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        icon: Bed,
    },
    leave: {
        label: "Cuti",
        dot: "bg-rose-500",
        desktopBadge: "bg-rose-50 text-rose-800 border-rose-200/80 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800/60",
        listBadge: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800",
        icon: CalendarDays,
    },
    company_event: {
        label: "Event Kantor",
        dot: "bg-indigo-500",
        desktopBadge: "bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
        listBadge: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
        icon: Sparkles,
    },
    holiday: {
        label: "Hari Libur",
        dot: "bg-amber-500",
        desktopBadge: "bg-amber-50 text-amber-800 border-amber-200/80 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60",
        listBadge: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800",
        icon: CalendarDays,
    },
    event: {
        label: "Event",
        dot: "bg-indigo-500",
        desktopBadge: "bg-indigo-50 text-indigo-800 border-indigo-200/80 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/60",
        listBadge: "bg-indigo-50 text-indigo-800 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800",
        icon: Sparkles,
    },
    attendance: {
        label: "Absensi",
        dot: "bg-emerald-500",
        desktopBadge: "bg-emerald-50 text-emerald-800 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/60",
        listBadge: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800",
        icon: Check,
    },
};

const getItemConfig = (item) => {
    if (!item) return null;

    if (item.type === "attendance") {
        if (item.status === "Hadir") {
            return {
                label: "Hadir",
                dot: "bg-emerald-500",
                desktopBadge: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800",
                icon: Check,
            };
        }
        if (item.status === "Good") {
            return {
                label: "Good",
                dot: "bg-amber-500",
                desktopBadge: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800",
                icon: Star,
            };
        }
        if (item.status === "Telat") {
            return {
                label: "Telat",
                dot: "bg-rose-500",
                desktopBadge: "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800",
                icon: Clock,
            };
        }
        if (item.status === "Lembur") {
            return {
                label: "Lembur",
                dot: "bg-violet-500",
                desktopBadge: "bg-violet-50 text-violet-700 border-violet-200 dark:bg-violet-950/40 dark:text-violet-300 dark:border-violet-800",
                icon: AlarmClockPlus,
            };
        }
        if (item.status === "Alpha") {
            return {
                label: "Alpha",
                dot: "bg-rose-600",
                desktopBadge: "bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800",
                icon: X,
            };
        }
    }

    return (
        TYPE_CONFIG[item.type] || {
            label: item.title || item.name || item.type || "Jadwal",
            dot: "bg-slate-400",
            desktopBadge: "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700",
            icon: CalendarDays,
        }
    );
};

export default function Calendar({ data = {}, className = "", maxWidth = "max-w-5xl", withHeader = true, onDateClick }) {
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [viewMode, setViewMode] = useState("grid"); // "grid" | "list"

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    const nextMonth = () => setCurrentMonth((prev) => addMonths(prev, 1));
    const prevMonth = () => setCurrentMonth((prev) => subMonths(prev, 1));
    const goToToday = () => setCurrentMonth(new Date());

    // Hari Senin sebagai awal minggu (0=Senin, 6=Minggu)
    const startOffset = (getDay(monthStart) + 6) % 7;
    const totalSlots = startOffset + days.length;
    const trailingOffset = (7 - (totalSlots % 7)) % 7;

    // Filter data untuk list view
    const currentMonthEvents = Object.entries(data)
        .filter(([dateStr]) => {
            try {
                const d = parseISO(dateStr);
                return d >= monthStart && d <= monthEnd;
            } catch {
                return false;
            }
        })
        .sort(([a], [b]) => new Date(a) - new Date(b));

    const isCurrentActiveMonth = isSameMonth(currentMonth, new Date());

    return (
        <div
            className={`w-full ${maxWidth} ${className} bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs space-y-4`}
        >
            {/* ── HEADER CONTROLS ── */}
            {withHeader && (
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-2 border-b border-slate-100 dark:border-slate-800/80">
                    {/* Month Title & Nav */}
                    <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-start">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                type="button"
                                onClick={prevMonth}
                                aria-label="Bulan sebelumnya"
                                className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                                <ChevronLeft size={16} />
                            </button>
                            <button
                                type="button"
                                onClick={nextMonth}
                                aria-label="Bulan berikutnya"
                                className="p-2 sm:p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                            >
                                <ChevronRight size={16} />
                            </button>
                        </div>

                        {/* Month & Year Title */}
                        <div className="flex items-baseline gap-2">
                            <h2 className="text-base sm:text-lg font-bold text-slate-800 dark:text-slate-100 capitalize tracking-tight">
                                {format(currentMonth, "MMMM", { locale: id })}
                            </h2>
                            <span className="text-xs sm:text-sm font-semibold text-slate-400 dark:text-slate-500 font-mono">
                                {format(currentMonth, "yyyy")}
                            </span>
                        </div>

                        {/* Tombol Hari Ini */}
                        {!isCurrentActiveMonth && (
                            <button
                                type="button"
                                onClick={goToToday}
                                className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 dark:hover:bg-emerald-900/60 transition-colors cursor-pointer"
                            >
                                Hari Ini
                            </button>
                        )}
                    </div>

                    {/* View Switcher (Kalender / List Agenda) */}
                    <div className="flex items-center self-end sm:self-auto p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl border border-slate-200/50 dark:border-slate-700/50">
                        <button
                            type="button"
                            onClick={() => setViewMode("grid")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                viewMode === "grid"
                                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            <CalendarIcon size={13} /> Kalender
                        </button>
                        <button
                            type="button"
                            onClick={() => setViewMode("list")}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                                viewMode === "list"
                                    ? "bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 shadow-xs"
                                    : "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            <ListFilter size={13} /> Agenda
                            {currentMonthEvents.length > 0 && (
                                <span className="ml-0.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                                    {currentMonthEvents.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            )}

            {/* ── TAMPILAN GRID KALENDER ── */}
            {viewMode === "grid" ? (
                <div className="space-y-2">
                    {/* Nama Hari (Sen - Min) */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
                        {["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"].map((dayName, idx) => {
                            const isSunday = idx === 6;
                            const isSaturday = idx === 5;
                            return (
                                <div
                                    key={dayName}
                                    className={`py-1 text-[11px] font-bold uppercase tracking-wider ${
                                        isSunday
                                            ? "text-rose-500 dark:text-rose-400"
                                            : isSaturday
                                              ? "text-amber-600/80 dark:text-amber-400/80"
                                              : "text-slate-400 dark:text-slate-500"
                                    }`}
                                >
                                    {dayName}
                                </div>
                            );
                        })}
                    </div>

                    {/* Grid Kotak Tanggal */}
                    <div className="grid grid-cols-7 gap-1 sm:gap-2">
                        {/* Leading Offset (Slot hari kosong sebelum tanggal 1) */}
                        {[...Array(startOffset)].map((_, i) => (
                            <div
                                key={`leading-${i}`}
                                className="min-h-13 sm:min-h-24 p-1 rounded-xl sm:rounded-2xl border border-dashed border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/20 opacity-30 pointer-events-none"
                            />
                        ))}

                        {/* List Tanggal Bulan Ini */}
                        {days.map((day) => {
                            const dateKey = format(day, "yyyy-MM-dd");
                            const rawInfo = data[dateKey];
                            const items = Array.isArray(rawInfo) ? rawInfo : rawInfo ? [rawInfo] : [];
                            const isCurrentDay = isToday(day);
                            const isSunday = getDay(day) === 0;

                            return (
                                <div
                                    key={dateKey}
                                    onClick={() => onDateClick && onDateClick(dateKey, items)}
                                    className={`group min-h-13 sm:min-h-24 p-1 sm:p-2 rounded-xl sm:rounded-2xl flex flex-col justify-between transition-all cursor-pointer relative border select-none ${
                                        isCurrentDay
                                            ? "border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 bg-emerald-50/30 dark:bg-emerald-950/20 font-semibold"
                                            : items.length > 0
                                              ? "border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800 hover:border-emerald-400 dark:hover:border-emerald-500 hover:shadow-xs"
                                              : "border-slate-300 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-900/30 hover:bg-white dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700"
                                    }`}
                                >
                                    {/* Baris Atas: Nomor Tanggal & Counter Badge */}
                                    <div className="flex items-center justify-between w-full px-0.5">
                                        {/* Tanggal */}
                                        <span
                                            className={`text-[11px] sm:text-xs font-semibold leading-none flex items-center justify-center ${
                                                isCurrentDay
                                                    ? "w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-emerald-600 text-white font-bold text-[10px] sm:text-[11px] shadow-xs shadow-emerald-600/30"
                                                    : isSunday
                                                      ? "text-rose-500 dark:text-rose-400"
                                                      : "text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white"
                                            }`}
                                        >
                                            {format(day, "d")}
                                        </span>

                                        {/* Counter badge jika ada lebih dari 1 data di desktop */}
                                        {items.length > 1 && (
                                            <span className="hidden sm:inline-flex px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-900 dark:text-slate-300">
                                                {items.length}
                                            </span>
                                        )}
                                    </div>

                                    {/* ── MOBILE VIEW: Dot Indicators ── */}
                                    {items.length > 0 && (
                                        <div className="flex sm:hidden items-center justify-center gap-1 mt-1">
                                            {items.slice(0, 3).map((item, idx) => {
                                                const cfg = getItemConfig(item);
                                                return <span key={idx} className={`w-1.5 h-1.5 rounded-full ${cfg?.dot || "bg-emerald-500"}`} />;
                                            })}
                                            {items.length > 3 && <span className="text-[8px] font-bold text-slate-400 leading-none">+{items.length - 3}</span>}
                                        </div>
                                    )}

                                    {/* ── DESKTOP VIEW: Pills dengan Text & Icon ── */}
                                    <div className="hidden sm:flex flex-col gap-1 mt-1 w-full overflow-hidden">
                                        {items.slice(0, 2).map((item, idx) => {
                                            const cfg = getItemConfig(item);
                                            const IconComp = cfg?.icon || CalendarDays;
                                            const displayName = item.employee_name || item.title || item.name || cfg?.label || item.type;

                                            return (
                                                <div
                                                    key={idx}
                                                    className={`px-1.5 py-0.5 rounded-lg border text-[10px] font-medium truncate flex items-center gap-1 ${
                                                        cfg?.desktopBadge || "bg-slate-100 text-slate-700 border-slate-200"
                                                    }`}
                                                >
                                                    <IconComp size={10} className="shrink-0" />
                                                    <span className="truncate">{item.type === "company_event" ? item.title : displayName}</span>
                                                </div>
                                            );
                                        })}

                                        {items.length > 2 && (
                                            <span className="text-[9px] text-slate-400 dark:text-slate-500 font-semibold text-center">
                                                +{items.length - 2} lainnya
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}

                        {/* Trailing Offset (Slot kosong penutup di akhir bulan) */}
                        {[...Array(trailingOffset)].map((_, i) => (
                            <div
                                key={`trailing-${i}`}
                                className="min-h-13 sm:min-h-24 p-1 rounded-xl sm:rounded-2xl border border-dashed border-slate-100 dark:border-slate-800/40 bg-slate-50/20 dark:bg-slate-900/20 opacity-30 pointer-events-none"
                            />
                        ))}
                    </div>
                </div>
            ) : (
                /* ── TAMPILAN AGENDA / LIST BULANAN ── */
                <div className="space-y-2 max-h-130 overflow-y-auto pr-1">
                    {currentMonthEvents.length > 0 ? (
                        currentMonthEvents.map(([dateStr, rawInfo]) => {
                            const items = Array.isArray(rawInfo) ? rawInfo : [rawInfo];
                            const parsedDate = parseISO(dateStr);
                            const isCurrentDay = isToday(parsedDate);

                            return (
                                <div
                                    key={dateStr}
                                    onClick={() => onDateClick && onDateClick(dateStr, items)}
                                    className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                                        isCurrentDay
                                            ? "border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/20 ring-1 ring-emerald-500/20"
                                            : "border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850 hover:border-slate-300 dark:hover:border-slate-700"
                                    }`}
                                >
                                    <div className="flex items-start sm:items-center gap-3">
                                        {/* Tanggal badge */}
                                        <div
                                            className={`px-3 py-1.5 rounded-xl text-center shrink-0 ${
                                                isCurrentDay
                                                    ? "bg-emerald-600 text-white font-bold"
                                                    : "bg-slate-200/80 dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-semibold"
                                            }`}
                                        >
                                            <span className="block text-xs font-mono">{format(parsedDate, "dd MMM", { locale: id })}</span>
                                            <span className="block text-[10px] text-slate-500 dark:text-slate-400 uppercase font-medium">
                                                {format(parsedDate, "EEEE", { locale: id })}
                                            </span>
                                        </div>

                                        {/* Event badges */}
                                        <div className="flex flex-wrap gap-1.5">
                                            {items.map((it, i) => {
                                                const cfg = getItemConfig(it);
                                                const IconComp = cfg?.icon || CalendarDays;
                                                const name = it.employee_name || it.title || it.name || cfg?.label || it.type;
                                                return (
                                                    <span
                                                        key={i}
                                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border ${
                                                            cfg?.listBadge || "bg-slate-100 text-slate-700 border-slate-200"
                                                        }`}
                                                    >
                                                        <IconComp size={12} className="shrink-0" />
                                                        <span>{name}</span>
                                                        {it.status && <span className="text-[10px] opacity-75 capitalize">• {it.status}</span>}
                                                    </span>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <button
                                        type="button"
                                        className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 self-end sm:self-center hover:underline cursor-pointer"
                                    >
                                        Lihat Detail →
                                    </button>
                                </div>
                            );
                        })
                    ) : (
                        <div className="py-16 text-center text-slate-400 dark:text-slate-500 text-xs italic flex flex-col items-center justify-center gap-2">
                            <CalendarCheck size={28} className="text-slate-300 dark:text-slate-600" />
                            <span>Tidak ada jadwal atau event tercatat di bulan ini.</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
