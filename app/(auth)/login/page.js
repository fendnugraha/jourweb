/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useTransition, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Loader2, Wifi, WifiOff, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/utils/auth";
import Label from "@/app/components/Label";
import axios from "@/app/utils/axios";
import { auth, googleProvider, signInWithPopup, sendTokenToLaravel } from "@/app/utils/firebase";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);
    const [loading, setLoading] = useState(false);

    // Status koneksi ke server: "connected" | "disconnected" | "recovered"
    const [connectionStatus, setConnectionStatus] = useState("connected");
    const [isCheckingServer, setIsCheckingServer] = useState(false);
    const retryIntervalRef = useRef(null);

    // React 19 transition hook untuk penanganan async loading yang seamless
    const [isPending, startTransition] = useTransition();

    const router = useRouter();
    const { login, error: authError } = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/transaction",
    });

    // ── FUNGSI PING / HEALTHCHECK KE SERVER ──
    const checkServerConnection = useCallback(async (manual = false) => {
        try {
            setIsCheckingServer(true);
            // Ping endpoint ringan backend (timeout 4 detik agar cepat terdeteksi)
            await axios.get("/up", { timeout: 4000 });
            return true;
        } catch (err) {
            // Jika ada respon dari server (bahkan 401/404), berarti jaringan & CORS berfungsi normal
            if (err.response) {
                return true;
            }
            return false;
        } finally {
            setIsCheckingServer(false);
        }
    }, []);

    // ── AUTO-RECONNECT LOGIC KETIKA SERVER TERPUTUS (OFFLINE) ──
    useEffect(() => {
        if (connectionStatus === "disconnected") {
            // Jalankan polling setiap 4 detik untuk cek apakah server sudah pulih
            if (!retryIntervalRef.current) {
                retryIntervalRef.current = setInterval(async () => {
                    const isAlive = await checkServerConnection();
                    if (isAlive) {
                        clearInterval(retryIntervalRef.current);
                        retryIntervalRef.current = null;
                        setConnectionStatus("recovered");

                        // Kembalikan ke status "connected" normal setelah 4 detik
                        setTimeout(() => {
                            setConnectionStatus("connected");
                            setErrors((prev) => {
                                const next = { ...prev };
                                delete next.network;
                                return next;
                            });
                        }, 4000);
                    }
                }, 4000);
            }
        } else {
            if (retryIntervalRef.current) {
                clearInterval(retryIntervalRef.current);
                retryIntervalRef.current = null;
            }
        }

        return () => {
            if (retryIntervalRef.current) {
                clearInterval(retryIntervalRef.current);
                retryIntervalRef.current = null;
            }
        };
    }, [connectionStatus, checkServerConnection]);

    // Listener otomatis saat browser mendeteksi modem online
    useEffect(() => {
        const handleOnline = async () => {
            const isAlive = await checkServerConnection();
            if (isAlive) {
                setConnectionStatus("recovered");
                setTimeout(() => setConnectionStatus("connected"), 4000);
            }
        };

        window.addEventListener("online", handleOnline);
        return () => window.removeEventListener("online", handleOnline);
    }, [checkServerConnection]);

    // Sinkronkan authError dari useAuth jika terdeteksi ERR_NETWORK
    useEffect(() => {
        if (authError?.code === "ERR_NETWORK") {
            setConnectionStatus("disconnected");
        }
    }, [authError]);

    // DERIVED STATE
    const status = (() => {
        if (router.reset?.length > 0 && Object.keys(errors).length === 0) {
            try {
                return atob(router.reset);
            } catch {
                return null;
            }
        }
        return null;
    })();

    // Handler Form Action Email/Password biasa
    const handleSubmit = (e) => {
        e.preventDefault();
        setMessage("");
        setErrors({});

        startTransition(async () => {
            await login({
                email,
                password,
                setErrors: (errObj) => {
                    setErrors(errObj);
                    // Jika error network/CORS terdeteksi saat login
                    if (errObj?.email?.includes("Koneksi ke server gagal") || errObj?.network) {
                        setConnectionStatus("disconnected");
                    }
                },
                setMessage,
                setLoading,
            });
        });
    };

    // Handler Google Sign-In via Firebase -> Laravel Sanctum
    const handleGoogleLogin = () => {
        setGoogleLoading(true);
        setMessage("");
        setErrors({});

        startTransition(async () => {
            try {
                // 1. Popup Sign-In Google via Firebase Client SDK
                const result = await signInWithPopup(auth, googleProvider);

                // 2. Ambil Firebase ID Token (JWT)
                const idToken = await result.user.getIdToken();

                // 3. Exchange Token ke Endpoint Backend Laravel (/api/auth/firebase-login)
                const res = await sendTokenToLaravel(idToken);

                if (res.success) {
                    setMessage("Login Google berhasil! Mengalihkan...");
                    router.push("/transaction");
                }
            } catch (error) {
                console.error("Google Auth Error:", error);
                setErrors({ google: error.message || "Gagal melakukan Google Sign-In" });
                if (error.message?.includes("Failed to fetch") || error.message?.includes("NetworkError")) {
                    setConnectionStatus("disconnected");
                }
            } finally {
                setGoogleLoading(false);
            }
        });
    };

    // Trigger manual "Coba Lagi Sekarang"
    const handleManualRetry = async () => {
        const isAlive = await checkServerConnection(true);
        if (isAlive) {
            setConnectionStatus("recovered");
            setErrors((prev) => {
                const next = { ...prev };
                delete next.network;
                return next;
            });
            setTimeout(() => setConnectionStatus("connected"), 4000);
        }
    };

    const isLoading = isPending || googleLoading || message === "Login successful!";

    // Varian Animasi Stagger
    const formVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-md bg-white/70 dark:bg-slate-900/60 backdrop-blur-md border border-white/20 dark:border-slate-800/40 p-8 rounded-3xl shadow-xl transition-shadow duration-300 hover:shadow-2xl"
        >
            {/* Header Brand */}
            <div className="flex flex-col items-center mb-6">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }} className="mb-3">
                    <Image src="/jour-logo.svg" alt="Jour Logo" width={38} height={18} priority unoptimized className="dark:brightness-200" />
                </motion.div>

                <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800 dark:text-white">
                    THREE
                    <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-light">KOMUNIKA</span>
                </h1>

                <p className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1">Sign in to manage your journal accounts</p>
            </div>

            <motion.div variants={formVariants} initial="hidden" animate="show" className="space-y-4">
                {/* ── BANNER STATUS KONEKSI SERVER ── */}
                <AnimatePresence mode="wait">
                    {/* 1. Status Terputus / Reconnecting */}
                    {connectionStatus === "disconnected" && (
                        <motion.div
                            key="banner-disconnected"
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3.5 text-xs rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 shadow-xs space-y-2 overflow-hidden"
                        >
                            <div className="flex items-center justify-between gap-2">
                                <div className="flex items-center gap-2">
                                    <WifiOff size={16} className="text-amber-600 dark:text-amber-400 shrink-0 animate-pulse" />
                                    <span className="font-semibold text-xs leading-tight">Koneksi ke Server Terputus</span>
                                </div>
                                <span className="inline-flex items-center gap-1 text-[10px] font-mono text-amber-700 dark:text-amber-400">
                                    <Loader2 size={10} className="animate-spin" /> Auto-reconnecting...
                                </span>
                            </div>
                            <p className="text-[11px] text-amber-700 dark:text-amber-300 leading-relaxed">
                                Sedang mencoba menyambungkan ulang ke server secara otomatis. Jika baru restart modem, tunggu sebentar.
                            </p>
                            <div className="flex justify-end pt-0.5">
                                <button
                                    type="button"
                                    onClick={handleManualRetry}
                                    disabled={isCheckingServer}
                                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-200/70 hover:bg-amber-200 dark:bg-amber-900/60 dark:hover:bg-amber-800/80 text-amber-900 dark:text-amber-100 font-semibold text-[11px] transition-colors cursor-pointer disabled:opacity-50"
                                >
                                    <RefreshCw size={11} className={isCheckingServer ? "animate-spin" : ""} />
                                    {isCheckingServer ? "Memeriksa..." : "Coba Sambungkan Sekarang"}
                                </button>
                            </div>
                        </motion.div>
                    )}

                    {/* 2. Status Berhasil Pulih (Back Online) */}
                    {connectionStatus === "recovered" && (
                        <motion.div
                            key="banner-recovered"
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3.5 text-xs rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 shadow-xs flex items-center justify-between gap-2 overflow-hidden"
                        >
                            <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                                    <Wifi size={13} />
                                </div>
                                <div>
                                    <p className="font-bold text-xs">Server Kembali Online!</p>
                                    <p className="text-[11px] text-emerald-700 dark:text-emerald-300">Koneksi telah normal, Anda dapat login sekarang.</p>
                                </div>
                            </div>
                            <CheckCircle2 size={16} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Alert Status Info Lain / Errors */}
                <AnimatePresence>
                    {status && typeof status === "string" && !authError && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 text-xs rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/30 text-blue-600 dark:text-blue-400 overflow-hidden"
                        >
                            {status}
                        </motion.div>
                    )}
                    {message && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 text-xs rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/30 text-emerald-600 dark:text-emerald-400 font-medium overflow-hidden"
                        >
                            {message}
                        </motion.div>
                    )}
                    {errors.google && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-medium overflow-hidden"
                        >
                            {errors.google}
                        </motion.div>
                    )}
                    {errors.email && connectionStatus !== "disconnected" && (
                        <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="p-3 text-xs rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 font-medium overflow-hidden"
                        >
                            {errors.email}
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Tombol Login Google */}
                <motion.div variants={itemVariants}>
                    <motion.button
                        type="button"
                        whileHover={{ scale: isLoading ? 1 : 1.01 }}
                        whileTap={{ scale: isLoading ? 1 : 0.98 }}
                        onClick={handleGoogleLogin}
                        disabled={isLoading}
                        className="w-full py-2.5 px-4 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-semibold rounded-xl shadow-xs transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2.5 text-xs cursor-pointer"
                    >
                        {googleLoading ? (
                            <Loader2 size={16} className="animate-spin text-slate-500" />
                        ) : (
                            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                                <path
                                    fill="#4285F4"
                                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                    fill="#34A853"
                                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                    fill="#FBBC05"
                                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                    fill="#EA4335"
                                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                            </svg>
                        )}
                        <span>Sign in with Google</span>
                    </motion.button>
                </motion.div>

                {/* Divider */}
                <motion.div variants={itemVariants} className="relative flex items-center my-2">
                    <div className="grow border-t border-slate-200/60 dark:border-slate-800"></div>
                    <span className="shrink-0 px-3 text-[11px] font-medium text-slate-400">or sign in with email</span>
                    <div className="grow border-t border-slate-200/60 dark:border-slate-800"></div>
                </motion.div>

                {/* Form Email & Password */}
                <form onSubmit={handleSubmit} className="space-y-3.5">
                    <div className="space-y-3.5">
                        {/* Input Email */}
                        <motion.div variants={itemVariants}>
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Email address</Label>
                            <input
                                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
                                type="email"
                                placeholder="name@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                            />
                        </motion.div>

                        {/* Input Password */}
                        <motion.div variants={itemVariants}>
                            <Label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 block">Password</Label>
                            <div className="relative">
                                <input
                                    className="w-full px-4 py-3 pr-11 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 text-sm"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                >
                                    <AnimatePresence mode="wait" initial={false}>
                                        <motion.div
                                            key={showPassword ? "hide" : "show"}
                                            initial={{ opacity: 0, scale: 0.8 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.8 }}
                                            transition={{ duration: 0.15 }}
                                        >
                                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                        </motion.div>
                                    </AnimatePresence>
                                </button>
                            </div>
                            <AnimatePresence>
                                {errors.password && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="text-xs text-red-500 mt-1"
                                    >
                                        {errors.password}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>

                    {/* Tombol Submit */}
                    <motion.div variants={itemVariants}>
                        <motion.button
                            whileHover={{ scale: isLoading ? 1 : 1.01 }}
                            whileTap={{ scale: isLoading ? 1 : 0.98 }}
                            disabled={isLoading}
                            className={`w-full mt-4 py-3 px-4 font-medium rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer ${
                                connectionStatus === "disconnected"
                                    ? "bg-amber-600 hover:bg-amber-500 text-white focus:ring-amber-500/50"
                                    : "bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white focus:ring-indigo-500/50"
                            }`}
                            type="submit"
                        >
                            {isPending ? (
                                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                    <Loader2 size={16} className="animate-spin" />
                                    <span>Signing in...</span>
                                </motion.div>
                            ) : connectionStatus === "disconnected" ? (
                                <div className="flex items-center gap-2">
                                    <WifiOff size={16} />
                                    <span>Coba Masuk (Koneksi Terputus)</span>
                                </div>
                            ) : (
                                <span>Sign In</span>
                            )}
                        </motion.button>
                    </motion.div>
                </form>
            </motion.div>
        </motion.div>
    );
};

export default Login;
