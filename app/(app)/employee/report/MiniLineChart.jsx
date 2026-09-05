import { motion, AnimatePresence } from "motion/react";
import { useId } from "react";

export default function MiniLineChart({ data, isLoading = false }) {
    const gradientId = useId();
    const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

    if (isLoading) {
        return (
            <div className="w-full pt-2">
                <div className="h-24 w-full bg-slate-100/70 dark:bg-slate-800/40 animate-pulse rounded-xl flex items-center justify-center">
                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500">Memuat grafik...</span>
                </div>
                <div className="flex justify-between items-center mt-2 px-1">
                    {MONTHS.map((m) => (
                        <span key={m} className="text-[9px] font-medium text-slate-300 dark:text-slate-700">
                            {m}
                        </span>
                    ))}
                </div>
            </div>
        );
    }

    const validData = data.filter((v) => v > 0);
    const max = Math.max(...validData, 1);
    const min = Math.min(...validData, 0);

    const height = 90;
    const width = 300;

    const points = data.map((val, i) => {
        const x = (i / (data.length - 1)) * width;

        let y = height - 10;
        if (val > 0) {
            const range = max - min;
            const normalized = range > 0 ? (val - min) / range : 0.5;
            y = height - 15 - normalized * (height - 30);
        }
        return { x, y, val };
    });

    const linePath = points.reduce((acc, point, i, arr) => {
        if (i === 0) return `M ${point.x},${point.y}`;
        const prev = arr[i - 1];
        const cx = (prev.x + point.x) / 2;
        return `${acc} C ${cx},${prev.y} ${cx},${point.y} ${point.x},${point.y}`;
    }, "");

    const areaPath = `${linePath} L ${width},${height} L 0,${height} Z`;

    return (
        <div className="w-full pt-2">
            <div className="relative h-24 w-full">
                <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    <defs>
                        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                    </defs>

                    <motion.path initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }} d={areaPath} fill={`url(#${gradientId})`} />

                    <motion.path
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: 1 }}
                        transition={{ duration: 1.2, ease: "easeInOut" }}
                        d={linePath}
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="3"
                        strokeLinecap="round"
                    />

                    {points.map((p, i) => (
                        <g key={i}>
                            <motion.circle
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.5 + i * 0.04, duration: 0.3 }}
                                cx={p.x}
                                cy={p.y}
                                r={p.val > 0 ? "4" : "2"}
                                className={
                                    p.val > 0 ? "fill-indigo-600 dark:fill-indigo-400 stroke-white dark:stroke-slate-900" : "fill-slate-300 dark:fill-slate-700"
                                }
                                strokeWidth="2"
                            />
                        </g>
                    ))}
                </svg>
            </div>

            <div className="flex justify-between items-center mt-2 px-1">
                {MONTHS.map((m) => (
                    <span key={m} className="text-[9px] font-medium text-slate-400 dark:text-slate-500">
                        {m}
                    </span>
                ))}
            </div>
        </div>
    );
}
