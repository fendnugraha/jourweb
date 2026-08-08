import { motion } from "framer-motion";
import { ShieldAlert, ArrowLeft, Home, Lock } from "lucide-react";

const AccessDeniedScreen = ({ onBack, onGoHome }) => {
  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-slate-50 p-4 font-sans dark:bg-slate-950 overflow-hidden">
      {/* Background Ambient Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.15, 0.3, 0.15],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute h-96 w-96 rounded-full bg-amber-500/15 blur-3xl dark:bg-amber-500/10 pointer-events-none"
      />

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative flex w-full max-w-md flex-col items-center rounded-3xl border border-slate-200/80 bg-white/80 p-8 text-center shadow-xl shadow-slate-200/40 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-900/80 dark:shadow-none"
      >
        {/* Visual Badge Icon */}
        <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-amber-50 text-amber-600 ring-8 ring-amber-500/10 dark:bg-amber-950/40 dark:text-amber-400 dark:ring-amber-500/20">
          <ShieldAlert className="h-10 w-10 stroke-[1.75]" />
          <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-amber-500 text-white shadow-xs">
            <Lock className="h-3 w-3" />
          </div>
        </div>

        {/* Status Badge & Text */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 dark:bg-amber-950/60 px-3 py-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/50">
            <span>Error 403 • Restricted Area</span>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
            Anda Tidak Memiliki Akses
          </h1>

          <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
            Maaf, akun atau peran (*role*) Anda tidak memiliki izin untuk
            membuka halaman ini. Hubungi Administrator jika Anda memerlukan
            akses khusus.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex w-full flex-col sm:flex-row items-center gap-2.5">
          <button
            type="button"
            onClick={onBack || (() => window.history.back())}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200/80 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700/80 transition-all duration-150 cursor-pointer shadow-2xs"
          >
            <ArrowLeft className="h-4 w-4 text-slate-400" />
            <span>Halaman Sebelumnya</span>
          </button>

          <button
            type="button"
            onClick={onGoHome || (() => (window.location.href = "/"))}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-500 transition-all duration-150 cursor-pointer shadow-2xs"
          >
            <Home className="h-4 w-4" />
            <span>Ke Dashboard</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default AccessDeniedScreen;
