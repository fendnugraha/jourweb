"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion"; // Atau "motion/react"
import { CheckCircle2, X } from "lucide-react";

export default function Notification({ message, onClose, duration = 3000 }) {
    useEffect(() => {
        if (message && onClose) {
            const timer = setTimeout(() => {
                onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [message, onClose, duration]);

    return (
        <AnimatePresence>
            {message && (
                /* Container Posisi: Tengah-Bawah di Mobile, Kanan-Bawah di Desktop */
                <div
                    className="fixed bottom-4 left-1/2 -translate-x-1/2 sm:left-auto sm:right-5 sm:translate-x-0 z-9999 w-[calc(100%-2rem)] max-w-sm sm:w-auto px-1 sm:px-0 pointer-events-none"
                    id="toast-notification-banner"
                >
                    <motion.div
                        // Animasi Mobile: Muncul dari bawah | Desktop: Muncul dari kanan
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 15, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        // Fitur Swipe Down untuk menutup di HP
                        drag="y"
                        dragConstraints={{ top: 0, bottom: 50 }}
                        onDragEnd={(_, info) => {
                            if (info.offset.y > 20 && onClose) onClose();
                        }}
                        className="pointer-events-auto flex items-center justify-between gap-3 rounded-2xl bg-slate-900/95 dark:bg-slate-100/95 backdrop-blur-md px-4 py-3 text-xs font-medium text-white dark:text-slate-900 shadow-2xl border border-slate-800/80 dark:border-slate-200/80 active:cursor-grabbing"
                        role="status"
                        aria-live="polite"
                    >
                        {/* Bagian Kiri: Icon & Pesan */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400 dark:text-emerald-600" />
                            <span className="truncate leading-snug">{message}</span>
                        </div>

                        {/* Bagian Kanan: Tombol Close */}
                        {onClose && (
                            <button
                                type="button"
                                onClick={onClose}
                                className="shrink-0 rounded-lg p-1 text-slate-400 hover:text-white dark:text-slate-500 dark:hover:text-slate-900 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
