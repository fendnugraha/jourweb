import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Trophy, Medal, ChevronUp, Store, Sparkles, X, TrendingUp, Podium } from "lucide-react";
import useGetProfit from "../hooks/useGetProfit";
import { useAuth } from "../utils/auth";
import { formatRupiah } from "../utils/format";

export default function WarehouseStanding() {
    const { user } = useAuth({ middleware: "auth" });
    const userWarehouseId = user?.warehouse_id;
    const drawerRef = useRef(null);
    const { profit, mutate } = useGetProfit();

    const [sidebarOpen, setSidebarOpen] = useState(false);

    const revenueList = profit?.data?.revenue || [];
    const warehouseRank = revenueList.findIndex((item) => Number(item.warehouse_id) === Number(userWarehouseId)) + 1 || 0;

    // Handle Click Outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (drawerRef.current && !drawerRef.current.contains(event.target)) {
                setSidebarOpen(false);
            }
        };
        if (sidebarOpen) {
            document.addEventListener("mousedown", handleClickOutside);
        }
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [sidebarOpen]);

    if (!revenueList.length) return null;

    return (
        <div ref={drawerRef} className="fixed bottom-18 right-3 left-3 sm:left-auto sm:bottom-5 sm:right-5 z-9999">
            <AnimatePresence mode="wait">
                {!sidebarOpen ? (
                    /* 1. TRIGGER BADGE (Sembunyi di Mobile via `hidden sm:flex`) */
                    <motion.button
                        key="trigger-btn"
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.96 }}
                        onClick={() => setSidebarOpen(true)}
                        className="hidden sm:flex ml-auto items-center gap-3 rounded-2xl border border-slate-200/80 bg-white/5 px-4 py-2.5 shadow-xl backdrop-blur-sm dark:border-slate-800 dark:bg-slate-900/20 cursor-pointer group"
                    >
                        <div className="flex items-center justify-center rounded-xl bg-amber-500/10 p-2 text-amber-500 dark:bg-amber-500/20">
                            <Podium className="h-4 w-4" />
                        </div>
                        <div className="text-left">
                            <div className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Leaderboard</div>
                            <div className="text-xs font-black text-slate-800 dark:text-slate-100 flex items-center gap-1">
                                {warehouseRank > 0 ? <span>Rank #{warehouseRank}</span> : <span>Cabang</span>}
                                <span className="text-[10px] text-emerald-500 font-semibold">• Live</span>
                            </div>
                        </div>
                        <ChevronUp className="h-4 w-4 text-slate-400 transition-transform group-hover:-translate-y-0.5 ml-1" />
                    </motion.button>
                ) : (
                    /* 2. FLOATING LEADERBOARD PANEL */
                    <motion.div
                        key="leaderboard-card"
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                        className="flex h-[65vh] sm:h-130 w-full sm:w-88 flex-col rounded-3xl border border-slate-200/80 bg-white/80 p-4 shadow-2xl backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/90"
                    >
                        {/* Drag Handle Indicator */}
                        <div className="mx-auto mb-2 h-1.5 w-10 shrink-0 rounded-full bg-slate-200 dark:bg-slate-700 sm:hidden" />

                        {/* Header Panel */}
                        <div className="mb-3 flex shrink-0 items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800/80">
                            <div className="flex items-center gap-2.5">
                                <button
                                    onClick={() => mutate()}
                                    className="flex h-9 w-9 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400 cursor-pointer active:scale-95 transition-transform"
                                >
                                    <Podium className="h-4 w-4" />
                                </button>
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 dark:text-slate-100">Performa Omset Cabang</h3>
                                    <p className="text-[10px] font-medium text-slate-400">Peringkat realtime hari ini</p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setSidebarOpen(false)}
                                className="flex h-8 w-8 sm:h-7 sm:w-7 items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>

                        {/* Rank List Items Container */}
                        <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto pr-0.5 pb-2">
                            {revenueList.map((item, index) => {
                                const rank = index + 1;
                                const isUserWarehouse = Number(item.warehouse_id) === Number(userWarehouseId);

                                let rankBadgeClass = "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300";
                                let RankIcon = null;

                                if (rank === 1) {
                                    rankBadgeClass = "bg-gradient-to-br from-amber-400 to-amber-500 text-white shadow-xs shadow-amber-500/20";
                                    RankIcon = <Crown className="h-3.5 w-3.5" />;
                                } else if (rank === 2) {
                                    rankBadgeClass = "bg-slate-300 text-slate-700 dark:bg-slate-700 dark:text-slate-200";
                                    RankIcon = <Medal className="h-3.5 w-3.5" />;
                                } else if (rank === 3) {
                                    rankBadgeClass = "bg-amber-700/80 text-amber-100";
                                    RankIcon = <Medal className="h-3.5 w-3.5" />;
                                }

                                const hasPhoto = Boolean(item.user?.contact?.contact_photo_url);
                                const userPhoto = item.user?.contact?.contact_photo_url;

                                return (
                                    <div
                                        key={item.warehouse_id || index}
                                        className={`group relative flex items-center justify-between rounded-2xl p-3 sm:p-2.5 transition-all ${
                                            isUserWarehouse
                                                ? "bg-indigo-50/90 border border-indigo-200 shadow-xs dark:bg-indigo-950/40 dark:border-indigo-800/80"
                                                : "bg-slate-100/60 hover:bg-slate-100 border border-slate-200/50 dark:bg-slate-800/30 dark:hover:bg-slate-800/60 dark:border-slate-800/50"
                                        }`}
                                    >
                                        {/* Konten Utama */}
                                        <div className="flex items-center gap-3 min-w-0">
                                            {/* Rank Badge dengan Foto Profil */}
                                            <div
                                                className={`relative flex h-9 w-9 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black shadow-xs overflow-hidden bg-cover bg-position-[center_top_20%] ${rankBadgeClass}`}
                                                style={{ backgroundImage: hasPhoto ? `url(${userPhoto})` : undefined }}
                                            >
                                                {/* Overlay Gelap Khusus Badge jika Ada Foto */}
                                                {hasPhoto && <div className="absolute inset-0 bg-slate-800/20 backdrop-blur-[0.5px]" />}

                                                {/* Rank Icon / Angka Rank (z-10 & text-white agar kontras dengan foto) */}
                                                <span className={`relative z-10 ${hasPhoto ? "text-white drop-shadow-md" : ""}`}>{RankIcon || rank}</span>
                                            </div>

                                            {/* Store Info */}
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-1.5">
                                                    <span className="truncate text-xs font-bold text-slate-800 dark:text-slate-100">
                                                        {item.warehouse?.code || item.warehouse?.name}
                                                    </span>
                                                    {isUserWarehouse && (
                                                        <span className="rounded-md bg-indigo-600 px-1.5 py-0.5 text-[8px] font-bold text-white tracking-wide shadow-xs">
                                                            YOU
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5">
                                                    <Store className="h-2.5 w-2.5 shrink-0" />
                                                    <span className="truncate">{item.warehouse?.name || "Cabang"}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Revenue Nominal */}
                                        <div className="text-right shrink-0">
                                            <div className="text-xs font-extrabold font-mono text-slate-900 dark:text-slate-100">
                                                {formatRupiah(item.total)}
                                            </div>
                                            <div className="flex items-center justify-end gap-0.5 text-[9px] font-bold text-emerald-500 dark:text-emerald-400">
                                                <TrendingUp className="h-2.5 w-2.5" />
                                                <span>Fee</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
