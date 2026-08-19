"use client";
import { Bell, Check, Info, AlertTriangle, CheckCircle2, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import useNotifications from "../hooks/useNotifications";

export default function NotificationList() {
    const [isOpenNotifications, setIsOpenNotifications] = useState(false);
    const notificationRef = useRef(null);

    // Ambil data & handler langsung dari SWR custom hook
    const { notifications, unreadCount, markAsRead, markAllAsRead, isLoading } = useNotifications();

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

    // Format Tanggal / Waktu Ringkas
    const formatTime = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
    };

    // Helper Dynamic Icon dari Payload Notifikasi
    const getIcon = (type) => {
        switch (type) {
            case "success":
                return <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />;
            case "warning":
            case "danger":
                return <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />;
            default:
                return <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />;
        }
    };

    return (
        <div className="relative" ref={notificationRef}>
            {/* Tombol Bell Icon */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpenNotifications(!isOpenNotifications)}
                className="relative p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-700/70 transition border border-slate-200/50 dark:border-slate-700/50 cursor-pointer"
                aria-label="Notifikasi"
            >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[9px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}
            </motion.button>

            {/* Popover UI */}
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
                                        className="p-1 text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-0.5 cursor-pointer"
                                        title="Tandai semua dibaca"
                                    >
                                        <Check className="w-3 h-3" />
                                        <span>Tandai Dibaca</span>
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpenNotifications(false)}
                                    className="p-1 rounded-lg text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition cursor-pointer"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* List Notifikasi */}
                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60">
                            {isLoading ? (
                                <div className="p-8 text-center space-y-2">
                                    <Loader2 className="w-6 h-6 text-indigo-500 animate-spin mx-auto" />
                                    <p className="text-xs text-slate-400 font-medium">Memuat notifikasi...</p>
                                </div>
                            ) : notifications.length > 0 ? (
                                notifications.map((item) => {
                                    const isUnread = !item.read_at;
                                    const title = item.data?.title || "Notifikasi Baru";
                                    const message = item.data?.body || item.data?.message || "";
                                    const type = item.data?.type || "info";

                                    return (
                                        <div
                                            key={item.id}
                                            onClick={() => isUnread && markAsRead(item.id)}
                                            className={`group p-3.5 flex items-start justify-between gap-3 transition cursor-pointer ${
                                                isUnread ? "bg-indigo-50/40 dark:bg-indigo-950/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                                            }`}
                                        >
                                            {getIcon(type)}

                                            <div className="flex-1 space-y-0.5">
                                                <div className="flex items-center justify-between gap-2">
                                                    <p
                                                        className={`text-xs font-semibold ${
                                                            isUnread ? "text-slate-900 dark:text-white" : "text-slate-600 dark:text-slate-400"
                                                        }`}
                                                    >
                                                        {title}
                                                    </p>
                                                    <span className="text-[10px] text-slate-400 font-mono shrink-0">{formatTime(item.created_at)}</span>
                                                </div>
                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">{message}</p>
                                            </div>

                                            {/* Indicator Bulat Unread */}
                                            {isUnread && <span className="h-2 w-2 rounded-full bg-indigo-600 shrink-0 mt-1" />}
                                        </div>
                                    );
                                })
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
    );
}
