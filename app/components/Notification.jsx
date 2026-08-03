"use client";

import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle } from "lucide-react";

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
                <div className="fixed bottom-4 right-4 z-900" id="toast-notification-banner">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        className="flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-xs text-white shadow-lg dark:bg-slate-50 dark:text-slate-950 font-semibold border border-slate-800 dark:border-slate-200"
                        role="status"
                        aria-live="polite"
                    >
                        <CheckCircle className="h-4 w-4 text-indigo-400 dark:text-indigo-600" />
                        <span>{message}</span>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
