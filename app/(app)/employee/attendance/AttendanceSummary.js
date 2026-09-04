"use client";

import useEmployee from "@/app/hooks/useEmployee";
import { toOrdinal } from "@/app/utils/format";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUpRight, ArrowDownRight, Clock, Star, Trophy, Medal, AlertCircle, Crown, Sparkles } from "lucide-react";
import { useMemo } from "react";

export default function AttendanceSummary({ dateString, search, selectedZone }) {
    const date = new Date(dateString);
    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    const { employees, loading } = useEmployee(month, year);
    // Filter & Sorting logic
    const filteredSortedEmployees = useMemo(() => {
        return [...employees].sort((a, b) => {
            // 1. Ambil nilai total menit dari backend
            const netMinutesA = a.time_diff_summary?.total_net_minutes ?? 0;
            const netMinutesB = b.time_diff_summary?.total_net_minutes ?? 0;

            // 2. Jika total menit beda, urutkan dari yang terbesar (paling rajin/awal datang)
            if (netMinutesB !== netMinutesA) {
                return netMinutesB - netMinutesA;
            }

            // 3. Jika total menit persis sama, urutkan berdasarkan Rating
            const ratingA = a.attendance_rating?.rating ?? 0;
            const ratingB = b.attendance_rating?.rating ?? 0;

            return ratingB - ratingA;
        });
    }, [employees]);

    // Indikator Trend Performance
    const renderTrendBadge = (current, previous) => {
        if (current > previous) {
            return (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 dark:bg-emerald-500/20 px-2 py-0.5 rounded-full border border-emerald-500/20">
                    <ArrowUpRight className="w-3 h-3 text-emerald-500" />+{(current - previous).toFixed(1)}
                </span>
            );
        }
        if (current < previous) {
            return (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 dark:bg-rose-500/20 px-2 py-0.5 rounded-full border border-rose-500/20">
                    <ArrowDownRight className="w-3 h-3 text-rose-500" />
                    {(current - previous).toFixed(1)}
                </span>
            );
        }
        return <span className="text-[10px] text-slate-400 font-mono">-</span>;
    };

    if (loading) {
        return (
            <div className="p-12 text-center text-slate-400 dark:text-slate-500 text-xs flex flex-col items-center justify-center gap-3">
                <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                <p>Memuat performa peringkat karyawan...</p>
            </div>
        );
    }

    if (!filteredSortedEmployees || filteredSortedEmployees.length === 0) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center rounded-3xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md"
            >
                <AlertCircle className="w-8 h-8 text-slate-300 dark:text-slate-700 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700 dark:text-slate-300">Tidak ada data peringkat ditemukan</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Coba sesuaikan pencarian atau pilih bulan lainnya.</p>
            </motion.div>
        );
    }

    const top1 = filteredSortedEmployees[0];
    const top2 = filteredSortedEmployees[1];
    const top3 = filteredSortedEmployees[2];

    return (
        <div className="space-y-6">
            {/* ========================================================================= */}
            {/* 1. SECTION PODIUM TOP 3 (Vibrant Colors & Motion Glow)                  */}
            {/* ========================================================================= */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="relative overflow-hidden rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-linear-to-br from-indigo-900/5 via-slate-50 to-amber-500/5 dark:from-indigo-950/40 dark:via-slate-900 dark:to-amber-950/20 p-5 sm:p-7 shadow-sm"
            >
                {/* Visual Ambient Light Effect */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-80 h-80 bg-amber-400/10 dark:bg-amber-500/10 blur-3xl rounded-full pointer-events-none" />

                <div className="relative z-10 flex items-center justify-between mb-6 pb-3 border-b border-slate-200/60 dark:border-slate-800">
                    <div className="flex items-center gap-2.5">
                        <div className="p-2 rounded-xl bg-linear-to-tr from-amber-500 to-yellow-400 text-slate-950 shadow-md shadow-amber-500/20">
                            <Trophy className="w-4 h-4 fill-slate-950" />
                        </div>
                        <div>
                            <div className="flex items-center gap-1.5">
                                <h3 className="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-100">Peringkat Kehadiran</h3>
                                <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                            </div>
                            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Performa Terbaik Karyawan Bulan Ini</p>
                        </div>
                    </div>
                </div>

                {/* Grid Podium (2nd - 1st - 3rd) */}
                <div className="relative z-10 grid grid-cols-3 gap-2 sm:gap-4 items-end pt-4 max-w-xl mx-auto">
                    {/* --- JUARA 2 (Perak - Sky/Slate Gradient) --- */}
                    <div className="flex flex-col items-center">
                        {top2 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.1 }}
                                className="w-full flex flex-col items-center"
                            >
                                <div className="text-center mb-2">
                                    <div className="inline-flex p-2 rounded-full bg-slate-200 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 mb-1 shadow-xs">
                                        <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
                                    </div>
                                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-20 sm:max-w-30">
                                        {top2.contact?.name}
                                    </h4>
                                    <span className="font-mono text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                                        {top2.attendance_rating?.rating ?? 0}/10
                                    </span>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="w-full h-36 sm:h-44 rounded-t-2xl bg-linear-to-b from-slate-200 via-slate-100 to-white dark:from-slate-800 dark:via-slate-800/80 dark:to-slate-900 border-t-4 border-slate-400 p-2 flex flex-col justify-between items-center text-center shadow-md"
                                >
                                    <span className="text-xs sm:text-sm font-black text-slate-500 dark:text-slate-400">2nd</span>
                                    <div className="flex flex-col items-center gap-1 w-full">
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
                                            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                                <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                                                {top2.attendance_rating?.good ?? 0}
                                            </span>
                                            <span className="flex items-center gap-0.5 text-rose-500 font-bold">
                                                <Clock className="w-3 h-3 text-rose-500" />
                                                {top2.attendance_rating?.late ?? 0}
                                            </span>
                                        </div>
                                        {top2.time_diff_summary?.formatted_text && (
                                            <span
                                                className={`text-[9px] sm:text-[10px] font-mono font-bold truncate max-w-full px-1.5 py-0.5 rounded ${
                                                    (top2.time_diff_summary?.total_net_minutes ?? 0) < 0
                                                        ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                                                        : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                                                }`}
                                            >
                                                {top2.time_diff_summary.formatted_text}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="h-32 w-full rounded-t-2xl bg-slate-200/30 dark:bg-slate-800/20" />
                        )}
                    </div>

                    {/* --- JUARA 1 (Emas - Vibrant Amber/Gold Glow) --- */}
                    <div className="flex flex-col items-center">
                        {top1 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.2 }}
                                className="w-full flex flex-col items-center"
                            >
                                <div className="text-center mb-2">
                                    <motion.div
                                        animate={{ y: [0, -4, 0] }}
                                        transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                                        className="inline-flex p-2.5 rounded-full bg-linear-to-tr from-amber-500 to-yellow-300 text-slate-950 mb-1 shadow-lg shadow-amber-500/30 border border-yellow-200"
                                    >
                                        <Crown className="w-5 h-5 sm:w-6 sm:h-6 fill-amber-950 text-amber-950" />
                                    </motion.div>
                                    <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 truncate max-w-22.5 sm:max-w-35">
                                        {top1.contact?.name}
                                    </h4>
                                    <span className="font-mono text-xs font-black text-amber-600 dark:text-amber-400">
                                        {top1.attendance_rating?.rating ?? 0}/10
                                    </span>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="w-full h-44 sm:h-56 rounded-t-2xl bg-linear-to-b from-amber-400 via-amber-500/10 to-transparent dark:from-amber-500/30 dark:via-amber-500/10 dark:to-slate-900 border-t-4 border-amber-400 p-2 flex flex-col justify-between items-center text-center shadow-lg shadow-amber-500/10"
                                >
                                    <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">1st</span>
                                    <div className="flex flex-col items-center gap-1 w-full">
                                        <div className="flex items-center justify-center gap-2.5 text-[10px] sm:text-xs font-mono">
                                            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-extrabold">
                                                <Star className="w-3.5 h-3.5 fill-emerald-500 text-emerald-500" />
                                                {top1.attendance_rating?.good ?? 0}
                                            </span>
                                            <span className="flex items-center gap-1 text-rose-500 font-extrabold">
                                                <Clock className="w-3.5 h-3.5 text-rose-500" />
                                                {top1.attendance_rating?.late ?? 0}
                                            </span>
                                        </div>
                                        {top1.time_diff_summary?.formatted_text && (
                                            <span
                                                className={`text-[9px] sm:text-[10px] font-mono font-bold truncate max-w-full px-2 py-0.5 rounded ${
                                                    (top1.time_diff_summary?.total_net_minutes ?? 0) < 0
                                                        ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                                                        : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                                                }`}
                                            >
                                                {top1.time_diff_summary.formatted_text}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="h-40 w-full rounded-t-2xl bg-slate-200/30 dark:bg-slate-800/20" />
                        )}
                    </div>

                    {/* --- JUARA 3 (Perunggu - Bronze Orange Gradient) --- */}
                    <div className="flex flex-col items-center">
                        {top3 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5, delay: 0.3 }}
                                className="w-full flex flex-col items-center"
                            >
                                <div className="text-center mb-2">
                                    <div className="inline-flex p-2 rounded-full bg-amber-900/10 dark:bg-amber-950/60 border border-amber-700/30 text-amber-700 dark:text-amber-500 mb-1 shadow-xs">
                                        <Medal className="w-4 h-4 sm:w-5 sm:h-5 text-amber-700 dark:text-amber-600" />
                                    </div>
                                    <h4 className="text-[10px] sm:text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-20 sm:max-w-30">
                                        {top3.contact?.name}
                                    </h4>
                                    <span className="font-mono text-[10px] font-extrabold text-slate-600 dark:text-slate-300">
                                        {top3.attendance_rating?.rating ?? 0}/10
                                    </span>
                                </div>

                                <motion.div
                                    whileHover={{ scale: 1.02 }}
                                    className="w-full h-32 sm:h-40 rounded-t-2xl bg-linear-to-b from-amber-700/20 via-amber-900/5 to-transparent dark:from-amber-900/30 dark:via-slate-900 dark:to-slate-900 border-t-4 border-amber-600/70 p-2 flex flex-col justify-between items-center text-center shadow-md"
                                >
                                    <span className="text-xs sm:text-sm font-black text-amber-800 dark:text-amber-500">3rd</span>
                                    <div className="flex flex-col items-center gap-1 w-full">
                                        <div className="flex items-center justify-center gap-2 text-[10px] font-mono">
                                            <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-bold">
                                                <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                                                {top3.attendance_rating?.good ?? 0}
                                            </span>
                                            <span className="flex items-center gap-0.5 text-rose-500 font-bold">
                                                <Clock className="w-3 h-3 text-rose-500" />
                                                {top3.attendance_rating?.late ?? 0}
                                            </span>
                                        </div>
                                        {top3.time_diff_summary?.formatted_text && (
                                            <span
                                                className={`text-[9px] sm:text-[10px] font-mono font-bold truncate max-w-full px-1.5 py-0.5 rounded ${
                                                    (top3.time_diff_summary?.total_net_minutes ?? 0) < 0
                                                        ? "text-rose-600 bg-rose-50 dark:bg-rose-950/40"
                                                        : "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40"
                                                }`}
                                            >
                                                {top3.time_diff_summary.formatted_text}
                                            </span>
                                        )}
                                    </div>
                                </motion.div>
                            </motion.div>
                        ) : (
                            <div className="h-28 w-full rounded-t-2xl bg-slate-200/30 dark:bg-slate-800/20" />
                        )}
                    </div>
                </div>
            </motion.div>

            {/* ========================================================================= */}
            {/* 2. DAFTAR KARYAWAN (Mobile Card Animated & Desktop Table)                */}
            {/* ========================================================================= */}

            {/* A. MOBILE VIEW (Card Stack Motion) */}
            <div className="block sm:hidden space-y-2.5">
                <AnimatePresence>
                    {filteredSortedEmployees.map((employee, index) => {
                        const isLateAlert = (employee.attendance_rating?.late ?? 0) > 5;
                        const rating = employee.attendance_rating?.rating ?? 0;
                        const lastRating = employee.attendance_rating_last_month?.rating ?? 0;
                        const timeDiff = employee.time_diff_summary;

                        return (
                            <motion.div
                                key={employee.id || index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.04 }}
                                whileTap={{ scale: 0.98 }}
                                className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center justify-between gap-3"
                            >
                                <div className="flex items-center gap-3 min-w-0">
                                    <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-slate-600 dark:text-slate-300 shrink-0">
                                        {index + 1}
                                    </span>
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-1.5">
                                            <h4 className="font-bold text-xs text-slate-800 dark:text-slate-100 truncate">{employee.contact?.name}</h4>
                                            {isLateAlert && <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 animate-pulse" />}
                                        </div>
                                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono text-slate-400 mt-0.5">
                                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                                                Tepat: {employee.attendance_rating?.good ?? 0}
                                            </span>
                                            <span>•</span>
                                            <span className="text-rose-500 font-semibold">Telat: {employee.attendance_rating?.late ?? 0}</span>
                                        </div>
                                        {timeDiff?.formatted_text && (
                                            <div className="mt-1">
                                                <span
                                                    className={`text-[10px] font-mono font-bold ${
                                                        (timeDiff.total_net_minutes ?? 0) < 0 ? "text-rose-500" : "text-emerald-600 dark:text-emerald-400"
                                                    }`}
                                                >
                                                    {timeDiff.formatted_text}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="text-right shrink-0 flex flex-col items-end gap-1">
                                    <span className="font-mono text-xs font-black text-slate-900 dark:text-slate-100">
                                        {rating}
                                        <span className="text-[10px] text-slate-400 font-normal">/10</span>
                                    </span>
                                    {renderTrendBadge(rating, lastRating)}
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* B. DESKTOP VIEW (Clean Table Animated) */}
            <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="hidden sm:block overflow-hidden rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs"
            >
                <table className="w-full border-collapse text-left text-xs">
                    <thead>
                        <tr className="border-b border-slate-200/80 bg-slate-50/80 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                            <th scope="col" className="px-5 py-3.5 w-16 text-center">
                                Pos.
                            </th>
                            <th scope="col" className="px-5 py-3.5">
                                Nama Karyawan
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-center">
                                Lebih Awal
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-center">
                                Terlambat
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-center">
                                Selisih Waktu
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-center">
                                Rating
                            </th>
                            <th scope="col" className="px-5 py-3.5 text-center">
                                Perubahan
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
                        {filteredSortedEmployees.map((employee, index) => {
                            const isLateAlert = (employee.attendance_rating?.late ?? 0) > 5;
                            const rating = employee.attendance_rating?.rating ?? 0;
                            const lastRating = employee.attendance_rating_last_month?.rating ?? 0;
                            const timeDiff = employee.time_diff_summary;

                            return (
                                <motion.tr
                                    key={employee.id || index}
                                    initial={{ opacity: 0, y: 5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2, delay: index * 0.03 }}
                                    className="hover:bg-indigo-500/5 dark:hover:bg-indigo-500/10 transition-colors"
                                >
                                    <td className="px-5 py-3.5 text-center font-mono font-bold text-slate-500">{toOrdinal(index + 1)}</td>
                                    <td className="px-5 py-3.5 font-bold text-slate-800 dark:text-slate-100">
                                        <div className="flex items-center gap-2">
                                            <span>{employee.contact?.name}</span>
                                            {isLateAlert && (
                                                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-rose-600 bg-rose-500/10 dark:bg-rose-500/20 border border-rose-500/20 px-2 py-0.5 rounded-full">
                                                    <AlertCircle className="w-3 h-3 text-rose-500 animate-pulse" />
                                                    Sering Telat
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                                        {employee.attendance_rating?.good ?? 0}
                                    </td>
                                    <td className="px-4 py-3.5 text-center font-mono font-extrabold text-rose-500">{employee.attendance_rating?.late ?? 0}</td>

                                    {/* Kolom Baru: Selisih Waktu */}
                                    <td className="px-4 py-3.5 text-center font-mono">
                                        {timeDiff?.formatted_text ? (
                                            <span
                                                className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold border ${
                                                    (timeDiff.total_net_minutes ?? 0) < 0
                                                        ? "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-200/60 dark:border-rose-900/40"
                                                        : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-900/40"
                                                }`}
                                            >
                                                {timeDiff.formatted_text}
                                            </span>
                                        ) : (
                                            <span className="text-slate-400 text-[11px]">-</span>
                                        )}
                                    </td>

                                    <td className="px-4 py-3.5 text-center font-mono font-black text-slate-900 dark:text-slate-100">
                                        {rating}
                                        <span className="text-[10px] font-normal text-slate-400">/10</span>
                                    </td>
                                    <td className="px-5 py-3.5 text-center">{renderTrendBadge(rating, lastRating)}</td>
                                </motion.tr>
                            );
                        })}
                    </tbody>
                </table>
            </motion.div>
        </div>
    );
}
