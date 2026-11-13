"use client";

import { useEffect, useState } from "react";
import { Calendar, Store } from "lucide-react";
import NotificationList from "./NotificationsList";
import InformationBadge from "./InformationBadge";
import { useAuth } from "../utils/auth";

export default function TopBar({ title }) {
    const { user } = useAuth({ middleware: "auth" });
    const [dateStr, setDateStr] = useState("");
    const [timeStr, setTimeStr] = useState("");

    const warehouseName = user?.warehouse?.name;

    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setDateStr(
                now.toLocaleDateString("id-ID", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                }),
            );
            setTimeStr(
                now.toLocaleTimeString("id-ID", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                    hour12: false,
                }),
            );
        };

        updateTime();
        const interval = setInterval(updateTime, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <header className="h-16 sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between gap-3 transition-colors">
            {/* Sisi Kiri: Judul Halaman & Info Cabang */}
            <div className="flex items-center gap-3 min-w-0">
                <h1 className="font-bold text-base sm:text-lg text-slate-800 dark:text-slate-100 tracking-tight truncate">{title}</h1>

                {/* Badge Cabang Aktif (Tampil di tablet/desktop) */}
                {warehouseName && (
                    <div className="hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/50 dark:border-indigo-800/50 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 shrink-0">
                        <Store size={12} className="shrink-0" />
                        <span className="truncate max-w-35">{warehouseName}</span>
                    </div>
                )}
            </div>

            {/* Sisi Kanan: Realtime Tanggal & Jam, Info Rekening & Notifikasi */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                {/* Realtime Tanggal & Jam Live */}
                {timeStr && (
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/70 border border-slate-200/70 dark:border-slate-700/60 text-xs shadow-xs">
                        {/* Tanggal */}
                        <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 font-medium">
                            <Calendar size={13} className="text-slate-400 dark:text-slate-500" />
                            <span>{dateStr}</span>
                        </div>

                        {/* Divider */}
                        <span className="w-px h-3.5 bg-slate-300 dark:bg-slate-700" />

                        {/* Jam Live dengan Dot Pulse */}
                        <div className="flex items-center gap-1.5 font-mono font-semibold text-slate-700 dark:text-slate-200">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                            </span>
                            <span>{timeStr}</span>
                        </div>
                    </div>
                )}

                {/* Pemisah Halus */}
                <div className="hidden sm:block w-px h-5 bg-slate-200 dark:bg-slate-800" />

                {/* Container Tombol Aksi */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                    <InformationBadge />
                    <NotificationList />
                </div>
            </div>
        </header>
    );
}
