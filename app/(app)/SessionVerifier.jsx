"use client";

import { motion } from "framer-motion";
import { ShieldCheck, Lock } from "lucide-react";

const SessionVerifier = ({ title = "Memverifikasi Sesi Anda", subtitle = "Pemeriksaan autentikasi & enkripsi akun" }) => {
    return (
        <div
            suppressHydrationWarning
            className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 font-sans dark:bg-slate-950 p-4 overflow-hidden"
        >
            {/* Background Ambient Security Glow */}
            <motion.div
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.15, 0.35, 0.15],
                }}
                transition={{
                    duration: 3.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
                className="absolute h-80 w-80 rounded-full bg-indigo-500/20 blur-3xl dark:bg-indigo-500/10 pointer-events-none"
            />

            {/* Glassmorphism Verification Card */}
            <motion.div
                initial={{ opacity: 0, scale: 0.94, y: 10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="relative flex flex-col items-center gap-4 rounded-3xl border border-slate-200/80 bg-white/70 p-6 text-center shadow-xl shadow-slate-200/30 backdrop-blur-xl dark:border-slate-800/80 dark:bg-slate-900/70 dark:shadow-none max-w-xs w-full"
            >
                {/* Animated Security Icon with Pulse Ring */}
                <div className="relative flex h-14 w-14 items-center justify-center">
                    <motion.div
                        animate={{
                            scale: [1, 1.45, 1],
                            opacity: [0.5, 0, 0.5],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="absolute inset-0 rounded-2xl bg-indigo-500/20 dark:bg-indigo-500/30"
                    />

                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100/80 dark:bg-indigo-950/60 dark:text-indigo-400 dark:border-indigo-900/50 shadow-sm">
                        <ShieldCheck className="h-6 w-6 stroke-[1.75]" />
                    </div>

                    <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-emerald-500 text-white shadow-sm">
                        <Lock className="h-2.5 w-2.5" />
                    </div>
                </div>

                {/* Text Details & Animated Dots */}
                <div className="space-y-1">
                    <h4 className="text-xs font-semibold tracking-tight text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1">
                        <span>{title}</span>
                        <span className="flex items-center gap-0.5 ml-0.5">
                            {[0, 1, 2].map((i) => (
                                <motion.span
                                    key={i}
                                    animate={{ opacity: [0.2, 1, 0.2] }}
                                    transition={{
                                        duration: 1,
                                        repeat: Infinity,
                                        delay: i * 0.2,
                                        ease: "easeInOut",
                                    }}
                                    className="h-1 w-1 rounded-full bg-indigo-500"
                                />
                            ))}
                        </span>
                    </h4>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium leading-relaxed">{subtitle}</p>
                </div>

                {/* Shimmer Infinite Progress Line */}
                <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden mt-1">
                    <motion.div
                        animate={{
                            x: ["-100%", "100%"],
                        }}
                        transition={{
                            duration: 1.2,
                            repeat: Infinity,
                            ease: "easeInOut",
                        }}
                        className="w-1/2 h-full bg-linear-to-r from-transparent via-indigo-500 to-transparent rounded-full"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default SessionVerifier;
