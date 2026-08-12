"use client";

import { Clock, Bell, Check, Trash2, Info, AlertTriangle, CheckCircle2, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function TopBar({ title }) {
    const [timeStr, setTimeStr] = useState("");
    const [isOpenNotifications, setIsOpenNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Dummy Data Notifikasi
    const [notifications, setNotifications] = useState([
        // {
        //     id: 1,
        //     title: "Pengajuan Absensi Disetujui",
        //     message: "Absensi tanggal 12 Agustus telah disetujui oleh Supervisor.",
        //     time: "10 menit lalu",
        //     type: "success",
        //     unread: true,
        // },
        // {
        //     id: 2,
        //     title: "Sanksi Peringatan (SP 1)",
        //     message: "Sanksi SP 1 aktif berlaku sampai dengan tanggal yang ditentukan.",
        //     time: "1 jam lalu",
        //     type: "warning",
        //     unread: true,
        // },
        // {
        //     id: 3,
        //     title: "Pembaruan Kas Utama",
        //     message: "Limit saldo kas cabang telah diperbarui oleh Admin.",
        //     time: "Yesterday",
        //     type: "info",
        //     unread: false,
        // },
    ]);

    const unreadCount = notifications.filter((n) => n.unread).length;

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

    // Close Popover Saat Klik di Luar
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                setIsOpenNotifications(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Handlers
    const markAllAsRead = () => {
        setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    };

    const deleteNotification = (id) => {
        setNotifications((prev) => prev.filter((n) => n.id !== id));
    };

    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
            case "warning":
                return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
            default:
                return <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />;
        }
    };

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
                <div className="relative" ref={notificationRef}>
                    {/* Tombol Bell Icon */}
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIsOpenNotifications(!isOpenNotifications)}
                        className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition border border-slate-200/50 dark:border-slate-700/50"
                        aria-label="Notifikasi"
                    >
                        <Bell className="w-4 h-4" />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                                {unreadCount}
                            </span>
                        )}
                    </motion.button>

                    {/* Popover UI dengan Framer Motion */}
                    <AnimatePresence>
                        {isOpenNotifications && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                transition={{ duration: 0.18, ease: "easeInOut" }}
                                className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl z-50 overflow-hidden"
                            >
                                {/* Popover Header */}
                                <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/30">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200">Notifikasi</h3>
                                        {unreadCount > 0 && (
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 dark:bg-rose-950 text-rose-600 dark:text-rose-400 border border-rose-200/60 dark:border-rose-900/40">
                                                {unreadCount} Baru
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex items-center gap-1">
                                        {unreadCount > 0 && (
                                            <button
                                                onClick={markAllAsRead}
                                                className="p-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5"
                                                title="Tandai semua dibaca"
                                            >
                                                <Check className="w-3 h-3" />
                                                <span>Tandai Dibaca</span>
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setIsOpenNotifications(false)}
                                            className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
                                        >
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>

                                {/* List Notifikasi */}
                                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                                    {notifications.length > 0 ? (
                                        notifications.map((item) => (
                                            <div
                                                key={item.id}
                                                className={`p-3.5 flex items-start justify-between gap-3 transition ${
                                                    item.unread ? "bg-indigo-50/30 dark:bg-indigo-950/10" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                                }`}
                                            >
                                                {getIcon(item.type)}

                                                <div className="flex-1 space-y-0.5">
                                                    <div className="flex items-center justify-between">
                                                        <p
                                                            className={`text-xs font-semibold ${
                                                                item.unread ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                                                            }`}
                                                        >
                                                            {item.title}
                                                        </p>
                                                        <span className="text-[10px] text-slate-400 font-mono">{item.time}</span>
                                                    </div>
                                                    <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{item.message}</p>
                                                </div>

                                                <button
                                                    onClick={() => deleteNotification(item.id)}
                                                    className="opacity-0 group-hover:opacity-100 hover:text-rose-500 text-slate-400 p-1 transition"
                                                    title="Hapus"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-8 text-center space-y-1">
                                            <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
                                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Tidak ada notifikasi</p>
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </header>
    );
}
