"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { SatelliteDishIcon, Eye, EyeOff, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/app/utils/auth";
import Label from "@/app/components/Label";
import { auth, googleProvider, signInWithPopup, sendTokenToLaravel } from "@/app/utils/firebase";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [errors, setErrors] = useState({});
    const [message, setMessage] = useState("");
    const [googleLoading, setGoogleLoading] = useState(false);

    const [loading, setLoading] = useState(false);

    // React 19 transition hook untuk penanganan async loading yang seamless
    const [isPending, startTransition] = useTransition();

    const router = useRouter();
    const { login, error: authError } = useAuth({
        middleware: "guest",
        redirectIfAuthenticated: "/transaction",
    });

    // DERIVED STATE (Sesuai Aturan React 19)
    const status = (() => {
        if (authError?.code === "ERR_NETWORK") {
            return "Error Network: Unable to reach the server. Trying to reconnect, please wait...";
        }
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
        startTransition(async () => {
            await login({
                email,
                password,
                setErrors,
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
                    // Transisi ke halaman tujuan (middleware auth akan menangani sisa session)
                    router.push("/transaction");
                }
            } catch (error) {
                console.error("Google Auth Error:", error);
                setErrors({ google: error.message || "Gagal melakukan Google Sign-In" });
            } finally {
                setGoogleLoading(false);
            }
        });
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
            <div className="flex flex-col items-center mb-6">
                <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, duration: 0.3 }} className="mb-3">
                    <Image src="/jour-logo.svg" alt="Jour Logo" width={38} height={18} priority unoptimized className="dark:brightness-200" />
                </motion.div>

                <h1 className="text-3xl font-extrabold tracking-tight mb-1 text-slate-800 dark:text-white">
                    THREE
                    <span className="bg-linear-to-r from-orange-500 to-amber-500 bg-clip-text text-transparent font-light">KOMUNIKA</span>
                </h1>

                <AnimatePresence mode="wait">
                    {authError?.code === "ERR_NETWORK" ? (
                        <motion.div
                            key="network-error"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="flex flex-col items-center mt-4 p-4 rounded-2xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 overflow-hidden"
                        >
                            <SatelliteDishIcon size={48} className="animate-pulse text-red-500 mb-2" />
                            <p className="text-xs text-center font-medium text-red-500 leading-relaxed">{status}</p>
                        </motion.div>
                    ) : (
                        <motion.p
                            key="subtitle"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="text-sm font-normal text-slate-500 dark:text-slate-400 mt-1"
                        >
                            Sign in to manage your journal accounts
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            <AnimatePresence>
                {authError?.code !== "ERR_NETWORK" && (
                    <motion.div variants={formVariants} initial="hidden" animate="show" exit={{ opacity: 0, y: 10 }} className="space-y-4">
                        {/* Alert Status Info / Errors */}
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
                                    <AnimatePresence>
                                        {errors.email && (
                                            <motion.p
                                                initial={{ opacity: 0, y: -4 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0 }}
                                                className="text-xs text-red-500 mt-1"
                                            >
                                                {errors.email}
                                            </motion.p>
                                        )}
                                    </AnimatePresence>
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
                                    className="w-full mt-4 py-3 px-4 bg-linear-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-medium rounded-xl shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm cursor-pointer"
                                    type="submit"
                                >
                                    {isPending ? (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                                            <Loader2 size={16} className="animate-spin" />
                                            <span>Signing in...</span>
                                        </motion.div>
                                    ) : (
                                        <span>Sign In</span>
                                    )}
                                </motion.button>
                            </motion.div>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default Login;
