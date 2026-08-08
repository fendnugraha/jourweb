"use client";
import { motion } from "framer-motion";
import { Building2 } from "lucide-react";

const AppLoading = ({
  text = "Memuat data...",
  subtext = "Mohon tunggu sebentar",
}) => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-slate-950/80 backdrop-blur-md font-sans">
      {/* Background Ambient Glow (Pulse Effect) */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1],
          opacity: [0.2, 0.4, 0.2],
        }}
        transition={{
          duration: 3.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-80 h-80 bg-indigo-500/20 dark:bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"
      />

      {/* Main Glassmorphism Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="relative flex flex-col items-center gap-5 p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 shadow-xl shadow-indigo-500/5 backdrop-blur-xl max-w-xs w-full text-center"
      >
        {/* Animated Icon & Ring Container */}
        <div className="relative flex items-center justify-center w-16 h-16">
          {/* Rotating Outer Spinner Ring */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 rounded-2xl border-2 border-transparent border-t-indigo-600 border-r-indigo-400 dark:border-t-indigo-400 dark:border-r-indigo-600/40"
          />

          {/* Inner Icon Card with Subtle Scaling */}
          <motion.div
            animate={{ scale: [0.95, 1.05, 0.95] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50"
          >
            <Building2 className="w-6 h-6 stroke-[1.75]" />
          </motion.div>
        </div>

        {/* Text Area */}
        <div className="space-y-1">
          <h3 className="text-sm font-semibold tracking-tight text-slate-800 dark:text-slate-100">
            {text}
          </h3>

          <div className="flex items-center justify-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400">
            <span>{subtext}</span>
            {/* Animated Dots */}
            <div className="flex items-center gap-0.5 ml-0.5">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ opacity: [0.3, 1, 0.3], y: [0, -1.5, 0] }}
                  transition={{
                    duration: 0.9,
                    repeat: Infinity,
                    delay: i * 0.18,
                    ease: "easeInOut",
                  }}
                  className="w-1 h-1 rounded-full bg-indigo-500"
                />
              ))}
            </div>
          </div>
        </div>

        {/* Infinite Progress Line Accent */}
        <div className="w-full h-1 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden mt-1">
          <motion.div
            animate={{
              x: ["-100%", "100%"],
            }}
            transition={{
              duration: 1.4,
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

export default AppLoading;
