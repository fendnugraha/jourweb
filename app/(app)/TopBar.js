"use client";

import { Clock } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import NotificationList from "./NotificationsList";

export default function TopBar({ title }) {
    const [timeStr, setTimeStr] = useState("");

    // Realtime Clock
    useEffect(() => {
        const updateTime = () => {
            const now = new Date();
            setTimeStr(
                now.toLocaleDateString("id-ID", {
                    weekday: "long",
                    month: "long",
                    day: "numeric",
                }) +
                    " " +
                    now.toLocaleTimeString(["id-ID"], {
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
        <header className="h-16 sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md dark:bg-slate-900/80 border-b border-slate-200/60 dark:border-slate-800/80 px-4 flex items-center justify-between">
            <h1 className="font-bold text-lg text-slate-800 dark:text-slate-100">{title}</h1>

            <div className="flex items-center gap-3">
                {/* Realtime Jam */}
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-mono dark:bg-slate-800 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                    <Clock className="h-3.5 w-3.5 text-indigo-500" />
                    <span>{timeStr}</span>
                </div>

                {/* Notifikasi Popover Container */}
                <NotificationList />
            </div>
        </header>
    );
}
