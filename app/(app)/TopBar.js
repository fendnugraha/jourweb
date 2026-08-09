"use client";
import { Clock } from "lucide-react";
import { useEffect, useState } from "react";

export default function TopBar({ title }) {
    const [timeStr, setTimeStr] = useState("");
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
        <header className="h-16 sticky top-0 z-30 w-full bg-white/80 backdrop-blur-md dark:dark:bg-slate-900/80 px-4 flex items-center justify-between">
            <h1 className="font-semibold text-lg">{title}</h1>
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-200 text-slate-500 text-[10px] font-mono dark:bg-slate-700 dark:text-slate-400">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                <span>{timeStr}</span>
            </div>
        </header>
    );
}
