"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Calendar, ChevronDown, Check, X, ArrowRight, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { DateTimeNow } from "../utils/format";

// Date utility helpers
function formatDateString(dateObj) {
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, "0");
    const dd = String(dateObj.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
}

function formatReadableDate(dateStr) {
    if (!dateStr) return "";
    const [y, m, d] = dateStr.split("-");
    if (!y || !m || !d) return dateStr;
    const dateObj = new Date(parseInt(y), parseInt(m) - 1, parseInt(d));
    return dateObj.toLocaleDateString("id-ID", { month: "short", day: "numeric", year: "numeric" });
}

export function getDatePresetRange(presetKey) {
    const now = new Date();
    const todayStr = formatDateString(now);

    if (presetKey === "today") {
        return { startDate: todayStr, endDate: todayStr };
    }

    if (presetKey === "yesterday") {
        const yest = new Date(now);
        yest.setDate(yest.getDate() - 1);
        const yestStr = formatDateString(yest);
        return { startDate: yestStr, endDate: yestStr };
    }

    if (presetKey === "this-week") {
        const curr = new Date(now);
        const day = curr.getDay(); // 0 is Sun
        const diffToMon = curr.getDate() - day + (day === 0 ? -6 : 1);
        const mon = new Date(curr.setDate(diffToMon));
        const sun = new Date(mon);
        sun.setDate(sun.getDate() + 6);
        return { startDate: formatDateString(mon), endDate: formatDateString(sun) };
    }

    if (presetKey === "last-7-days") {
        const start = new Date(now);
        start.setDate(start.getDate() - 6);
        return { startDate: formatDateString(start), endDate: todayStr };
    }

    if (presetKey === "this-month") {
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        return { startDate: formatDateString(start), endDate: formatDateString(end) };
    }

    if (presetKey === "last-month") {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const end = new Date(now.getFullYear(), now.getMonth(), 0);
        return { startDate: formatDateString(start), endDate: formatDateString(end) };
    }

    if (presetKey === "this-year") {
        const start = new Date(now.getFullYear(), 0, 1);
        const end = new Date(now.getFullYear(), 11, 31);
        return { startDate: formatDateString(start), endDate: formatDateString(end) };
    }

    return { startDate: "", endDate: "" };
}

export default function DateFilterDropdown({
    selectedPreset = "today",
    customStartDate = "",
    customEndDate = "",
    onChange, // ({ preset, startDate, endDate }) => void
    label = "Filter Berdasarkan Tanggal",
    className = "",
}) {
    const { today } = DateTimeNow();
    const [isOpen, setIsOpen] = useState(false);
    const [showCustomRangeInputs, setShowCustomRangeInputs] = useState(selectedPreset === "custom");
    const [tempStart, setTempStart] = useState(customStartDate);
    const [tempEnd, setTempEnd] = useState(customEndDate);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, upwards: false });

    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const dropdownRef = useRef(null);

    // Hitung posisi dropdown portal
    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const upwards = spaceBelow < 280 && spaceAbove > spaceBelow;

            setCoords({
                top: upwards ? rect.top : rect.bottom,
                left: rect.left,
                width: rect.width,
                upwards,
            });
        }
    };

    useEffect(() => {
        function handleClickOutside(e) {
            const isInsideContainer = containerRef.current?.contains(e.target);
            const isInsideDropdown = dropdownRef.current?.contains(e.target);
            if (!isInsideContainer && !isInsideDropdown) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener("scroll", updateCoords, true);
            window.addEventListener("resize", updateCoords);
            return () => {
                window.removeEventListener("scroll", updateCoords, true);
                window.removeEventListener("resize", updateCoords);
            };
        }
    }, [isOpen]);

    const PRESETS = [
        { key: "today", label: "Hari Ini" },
        { key: "yesterday", label: "Kemarin" },
        { key: "this-week", label: "Minggu Ini" },
        { key: "last-7-days", label: "7 Hari Terakhir" },
        { key: "this-month", label: "Bulan Ini" },
        { key: "last-month", label: "Bulan Lalu" },
        { key: "custom", label: "Rentang Tanggal Khusus..." },
    ];

    const handleSelectPreset = (key) => {
        if (key === "custom") {
            setShowCustomRangeInputs(true);
            return;
        }

        setShowCustomRangeInputs(false);
        const range = getDatePresetRange(key);
        onChange({
            preset: key,
            startDate: range.startDate,
            endDate: range.endDate,
        });
        setIsOpen(false);
    };

    const handleApplyCustomRange = (e) => {
        e.preventDefault();
        onChange({
            preset: "custom",
            startDate: tempStart,
            endDate: tempEnd,
        });
        setIsOpen(false);
    };

    const handleReset = () => {
        setShowCustomRangeInputs(false);
        setTempStart("");
        setTempEnd("");
        onChange({
            preset: "today",
            startDate: today,
            endDate: today,
        });
        setIsOpen(false);
    };

    const getDisplayLabel = () => {
        if (selectedPreset === "today") return "Hari Ini";
        if (selectedPreset === "yesterday") return "Kemarin";
        if (selectedPreset === "this-week") return "Minggu Ini";
        if (selectedPreset === "last-7-days") return "7 Hari Terakhir";
        if (selectedPreset === "this-month") return "Bulan Ini";
        if (selectedPreset === "last-month") return "Bulan Lalu";
        if (selectedPreset === "custom") {
            if (customStartDate && customEndDate) {
                if (customStartDate === customEndDate) {
                    return formatReadableDate(customStartDate);
                }
                return `${formatReadableDate(customStartDate)} - ${formatReadableDate(customEndDate)}`;
            } else if (customStartDate) {
                return `Dari ${formatReadableDate(customStartDate)}`;
            } else if (customEndDate) {
                return `Sampai ${formatReadableDate(customEndDate)}`;
            }
            return "Rentang Khusus";
        }
        return "Filter Tanggal";
    };

    return (
        <div className={`relative space-y-1 ${className}`} ref={containerRef}>
            <button
                ref={triggerRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold transition-all cursor-pointer shadow-xs ${
                    selectedPreset !== "today"
                        ? "border-indigo-500/80 bg-indigo-50/50 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300 dark:border-indigo-500/60"
                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-700"
                }`}
            >
                <div className="flex items-center gap-2 truncate">
                    <Calendar className={`h-4 w-4 shrink-0 ${selectedPreset !== "today" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                    <span className="truncate">{getDisplayLabel()}</span>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                    {selectedPreset !== "today" && (
                        <span
                            onClick={(e) => {
                                e.stopPropagation();
                                handleReset();
                            }}
                            title="Hapus filter tanggal"
                            className="p-0.5 rounded-full hover:bg-indigo-200 dark:hover:bg-indigo-900 text-indigo-600 dark:text-indigo-400 cursor-pointer"
                        >
                            <X className="h-3 w-3" />
                        </span>
                    )}
                    <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
                </div>
            </button>

            {/* Render Menggunakan Portal Ke Document Body */}
            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                ref={dropdownRef}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.15 }}
                                style={{
                                    position: "fixed",
                                    top: `${coords.top}px`,
                                    left: `${coords.left}px`,
                                    minWidth: `${Math.max(coords.width, 260)}px`,
                                    width: "max-content",
                                    maxWidth: "calc(100vw - 32px)",
                                    transform: coords.upwards ? "translateY(-100%) translateY(-6px)" : "translateY(6px)",
                                    transformOrigin: coords.upwards ? "bottom left" : "top left",
                                }}
                                className="z-9999 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl p-2 space-y-1 text-xs"
                            >
                                {!showCustomRangeInputs ? (
                                    <div className="space-y-0.5 max-h-64 overflow-y-auto pr-0.5">
                                        <div className="px-2.5 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pilihan Cepat</div>
                                        {PRESETS.map((p) => {
                                            const isSelected = selectedPreset === p.key;
                                            return (
                                                <button
                                                    key={p.key}
                                                    type="button"
                                                    onClick={() => handleSelectPreset(p.key)}
                                                    className={`w-full flex items-center justify-between gap-4 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold"
                                                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                                                    }`}
                                                >
                                                    <span className="whitespace-nowrap">{p.label}</span>
                                                    {isSelected && <Check className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                                                </button>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <form onSubmit={handleApplyCustomRange} className="p-1 space-y-3 min-w-60">
                                        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                                            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                                                <Calendar className="h-3.5 w-3.5 text-indigo-500" />
                                                Rentang Tanggal Khusus
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => setShowCustomRangeInputs(false)}
                                                className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline"
                                            >
                                                Kembali
                                            </button>
                                        </div>

                                        <div className="space-y-2">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Tanggal Mulai</label>
                                                <input
                                                    type="date"
                                                    value={tempStart}
                                                    onChange={(e) => setTempStart(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">Tanggal Selesai</label>
                                                <input
                                                    type="date"
                                                    value={tempEnd}
                                                    onChange={(e) => setTempEnd(e.target.value)}
                                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 font-mono focus:ring-2 focus:ring-indigo-500"
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
                                            <button
                                                type="button"
                                                onClick={handleReset}
                                                className="px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                            >
                                                <RotateCcw className="h-3 w-3" />
                                                Reset
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={!tempStart && !tempEnd}
                                                className="flex-1 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-1 disabled:opacity-50 cursor-pointer shadow-xs"
                                            >
                                                Terapkan
                                                <ArrowRight className="h-3 w-3" />
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
}
