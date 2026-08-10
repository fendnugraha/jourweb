"use client";
import { formatRupiah, formatNumberToK, DateTimeNow } from "@/app/utils/format";
import {
    TrendingDown,
    DollarSign,
    Building2,
    BadgeDollarSign,
    Landmark,
    ChevronDown,
    BarChart3,
    ArrowUpRight,
    ArrowDownRight,
    FileText,
    Calendar,
    Receipt,
    Coins,
} from "lucide-react";
import { useEffect, useId, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import useRevenueReport from "@/app/hooks/useRevenueReport";
import axios from "@/app/utils/axios";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];

// Komponen Reusable Skeleton untuk Loading
function Skeleton({ className = "" }) {
    return <div className={`animate-pulse bg-slate-200 dark:bg-slate-800 rounded-md ${className}`} />;
}

function AnimatedNumber({ value, prefix = "" }) {
    return (
        <motion.span initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: "easeOut" }}>
            {prefix}
            {formatRupiah(value || 0)}
        </motion.span>
    );
}

function StatCard({ title, value, icon: Icon, color, trend, trendLabel, delay = 0, isLoading = false }) {
    const isPositive = trend >= 0;
    const colorMap = {
        indigo: {
            bg: "bg-indigo-50 dark:bg-indigo-950/40",
            icon: "text-indigo-600 dark:text-indigo-400",
            iconBg: "bg-indigo-100 dark:bg-indigo-900/60",
            border: "border-indigo-100 dark:border-indigo-900/40",
            value: "text-indigo-700 dark:text-indigo-300",
        },
        emerald: {
            bg: "bg-emerald-50 dark:bg-emerald-950/40",
            icon: "text-emerald-600 dark:text-emerald-400",
            iconBg: "bg-emerald-100 dark:bg-emerald-900/60",
            border: "border-emerald-100 dark:border-emerald-900/40",
            value: "text-emerald-700 dark:text-emerald-300",
        },
        rose: {
            bg: "bg-rose-50 dark:bg-rose-950/40",
            icon: "text-rose-600 dark:text-rose-400",
            iconBg: "bg-rose-100 dark:bg-rose-900/60",
            border: "border-rose-100 dark:border-rose-900/40",
            value: "text-rose-700 dark:text-rose-300",
        },
        amber: {
            bg: "bg-amber-50 dark:bg-amber-950/40",
            icon: "text-amber-600 dark:text-amber-400",
            iconBg: "bg-amber-100 dark:bg-amber-900/60",
            border: "border-amber-100 dark:border-amber-900/40",
            value: "text-amber-700 dark:text-amber-300",
        },
    };
    const c = colorMap[color] ?? colorMap.indigo;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35, ease: "easeOut" }}
            className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-4 sm:p-5 flex flex-col gap-3`}
        >
            <div className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.iconBg} opacity-40 blur-2xl pointer-events-none`} />

            <div className="flex items-start justify-between">
                <div className={`p-2.5 rounded-xl ${c.iconBg}`}>
                    <Icon size={18} className={c.icon} strokeWidth={2} />
                </div>
                {trend !== undefined && (
                    <div
                        className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"}`}
                    >
                        {isPositive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                        {Math.abs(trend)}%
                    </div>
                )}
            </div>

            <div>
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">{title}</p>
                {isLoading ? (
                    <Skeleton className="h-6 w-28 my-1" />
                ) : (
                    <p className={`text-base sm:text-lg font-bold font-mono ${c.value}`}>
                        <AnimatedNumber value={value} />
                    </p>
                )}
                {trendLabel && <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">{trendLabel}</p>}
            </div>
        </motion.div>
    );
}

function ExpenseRow({ item, total, delay = 0 }) {
    const pct = total > 0 ? ((item.amount / total) * 100).toFixed(1) : "0.0";
    return (
        <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay, duration: 0.25 }}
            className="flex items-center gap-3 py-2.5"
        >
            <span className="shrink-0 p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                <item.icon size={14} strokeWidth={2} />
            </span>
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{item.label}</span>
                    <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 shrink-0">{formatRupiah(item.amount)}</span>
                </div>
                <div className="h-1 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: delay + 0.1, duration: 0.6, ease: "easeOut" }}
                        className="h-full rounded-full bg-indigo-400/60 dark:bg-indigo-500/60"
                    />
                </div>
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 w-10 text-right">{pct}%</span>
        </motion.div>
    );
}

function CollapsibleSection({ title, subtitle, total, items, icon: Icon, iconColor, delay = 0, isLoading = false }) {
    const [open, setOpen] = useState(true);
    return (
        <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay, duration: 0.35 }}
            className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden"
        >
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
            >
                <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-xl ${iconColor}`}>
                        <Icon size={16} className="text-white" strokeWidth={2.2} />
                    </div>
                    <div className="text-left">
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{title}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{subtitle}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {isLoading ? (
                        <Skeleton className="h-5 w-20" />
                    ) : (
                        <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">{formatRupiah(total)}</span>
                    )}
                    <motion.span animate={{ rotate: open ? 0 : -90 }} transition={{ duration: 0.2 }}>
                        <ChevronDown size={16} className="text-slate-400" />
                    </motion.span>
                </div>
            </button>

            <AnimatePresence initial={false}>
                {open && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                        className="overflow-hidden"
                    >
                        <div className="px-5 pb-4 divide-y divide-slate-100 dark:divide-slate-800">
                            {isLoading ? (
                                <div className="py-3 space-y-2">
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-3/4" />
                                </div>
                            ) : items.length > 0 ? (
                                items.map((item, i) => <ExpenseRow key={item.label} item={item} total={total} delay={i * 0.04} />)
                            ) : (
                                <p className="text-xs text-slate-400 dark:text-slate-500 py-3 text-center">Tidak ada pengeluaran</p>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}

function MiniLineChart({ data, isLoading = false }) {
    const gradientId = useId();

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

function PLRow({ label, value, indent = false, bold = false, color, separator = false, delay = 0, isLoading = false }) {
    const colorClass =
        color === "green"
            ? "text-emerald-600 dark:text-emerald-400"
            : color === "red"
              ? "text-rose-600 dark:text-rose-400"
              : "text-slate-700 dark:text-slate-300";

    return (
        <>
            {separator && <div className="border-t border-slate-200 dark:border-slate-700 my-1" />}
            <motion.div
                initial={{ opacity: 0, x: -4 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay, duration: 0.2 }}
                className={`flex items-center justify-between py-2 ${indent ? "pl-4" : ""}`}
            >
                <span
                    className={`text-xs ${bold ? "font-bold" : "font-medium"} ${indent ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-200"}`}
                >
                    {indent && <span className="text-slate-300 dark:text-slate-600 mr-1.5">└</span>}
                    {label}
                </span>
                {isLoading ? (
                    <Skeleton className="h-4 w-20" />
                ) : (
                    <span className={`text-xs font-mono ${bold ? "font-bold" : "font-semibold"} ${colorClass}`}>
                        {value < 0 ? `(${formatRupiah(Math.abs(value))})` : formatRupiah(value)}
                    </span>
                )}
            </motion.div>
        </>
    );
}

export default function FinancialReport() {
    const { thisMonth, thisYear } = DateTimeNow();

    const initialMonth = String(thisMonth).padStart(2, "0");
    const [period, setPeriod] = useState(`${thisYear}-${initialMonth}`);
    const [corpExpense, setCorpExpense] = useState([]);
    const [isExpenseLoading, setIsExpenseLoading] = useState(true);

    const { startPeriod, endPeriod, formattedPeriodName } = useMemo(() => {
        if (!period) return { startPeriod: null, endPeriod: null, formattedPeriodName: "" };

        const [yearStr, monthStr] = period.split("-");
        const year = Number(yearStr);
        const month = Number(monthStr);

        const lastDay = new Date(year, month, 0).getDate();
        const lastDayStr = String(lastDay).padStart(2, "0");

        const start = `${yearStr}-${monthStr}-01T00:00:00`;
        const end = `${yearStr}-${monthStr}-${lastDayStr}T23:59:59`;

        const monthName = MONTHS[month - 1] || "";
        const formattedPeriodName = `${monthName} ${yearStr}`;

        return { startPeriod: start, endPeriod: end, formattedPeriodName };
    }, [period]);

    // Hook Revenue Bulanan
    const { revenue, isLoading: isRevenueLoading } = useRevenueReport(startPeriod, endPeriod);

    // Total Revenue
    const totalRevenue = useMemo(() => {
        if (!revenue || !Array.isArray(revenue.revenue)) return 0;
        return revenue.revenue.reduce((sum, item) => sum + (Number(item.fee) + Number(item.expense) || 0), 0);
    }, [revenue]);

    const totalRevenueLastMonth = useMemo(() => {
        if (!revenue || !Array.isArray(revenue.revenue)) return 0;
        return revenue.revenue_last_month.reduce((sum, item) => sum + (Number(item.fee) + Number(item.expense) || 0), 0);
    }, [revenue]);

    const revenueTrend = useMemo(() => {
        // 1. Jika data bulan lalu 0 atau tidak ada, return 0 (atau sesuaikan dengan kebutuhan)
        if (!totalRevenueLastMonth || totalRevenueLastMonth === 0) return 0;

        // 2. Hitung persentase pertumbuhan
        const growth = ((totalRevenue - totalRevenueLastMonth) / totalRevenueLastMonth) * 100;

        // 3. Batasi 1-2 angka di belakang koma dan ubah kembali ke tipe Number
        return Number(growth.toFixed(1));
    }, [totalRevenue, totalRevenueLastMonth]);

    // Fetch Corp & Branch Expenses
    useEffect(() => {
        const fetchCorpExpense = async () => {
            if (!startPeriod || !endPeriod) return;
            setIsExpenseLoading(true);
            try {
                const response = await axios.get(`/api/cash-flows`, {
                    params: {
                        start_date: startPeriod,
                        end_date: endPeriod,
                    },
                });
                setCorpExpense(response.data?.data?.cash_flows_grouped || []);
            } catch (err) {
                console.error("Error fetching corp expense data:", err);
            } finally {
                setIsExpenseLoading(false);
            }
        };

        fetchCorpExpense();
    }, [startPeriod, endPeriod]);

    const [monthlyPayrollSum, setMonthlyPayrollSum] = useState(0);

    useEffect(() => {
        const fetchMonthlyPayrollSum = async () => {
            try {
                const response = await axios.get(`/api/monthly-payroll-sum/${endPeriod.split("T")[0]}`);
                setMonthlyPayrollSum(response.data?.total_salary || 0);
            } catch (err) {
                console.error("Error fetching monthly payroll sum:", err);
            }
        };

        fetchMonthlyPayrollSum();
    }, [endPeriod]);

    const corporateExpenses = useMemo(() => {
        if (!Array.isArray(corpExpense)) return [];
        return corpExpense
            .filter((item) => item.is_corporate === 1)
            .map((item) => ({
                label: item.category || item.name || "Lainnya",
                amount: Number(item.total || 0),
                icon: Receipt,
            }));
    }, [corpExpense]);

    const branchExpenses = useMemo(() => {
        // 1. Tapis corpExpense secara aman tanpa membatalkan monthlyPayroll
        const items = Array.isArray(corpExpense)
            ? corpExpense
                  .filter((item) => item.is_corporate === 0)
                  .map((item) => ({
                      label: item.category || item.name || "Lainnya",
                      amount: Number(item.total || 0),
                      icon: Receipt,
                  }))
            : [];

        // 2. Buat objek gaji karyawan dengan casting Number untuk keamanan data
        const monthlyPayroll = {
            label: "Gaji Karyawan",
            amount: Number(monthlyPayrollSum || 0),
            icon: Coins,
        };

        // 3. Gabungkan menggunakan spread operator
        return [monthlyPayroll, ...items];
    }, [corpExpense, monthlyPayrollSum]);

    const totalBranch = useMemo(() => branchExpenses.reduce((s, e) => s + e.amount, 0), [branchExpenses]);
    const totalCorporate = useMemo(() => corporateExpenses.reduce((s, e) => s + e.amount, 0), [corporateExpenses]);

    const totalExpenses = totalBranch + totalCorporate;
    const grossProfit = totalRevenue - totalBranch;
    const netProfit = grossProfit - totalCorporate;

    const grossMargin = totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : "0.0";
    const netMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100).toFixed(1) : "0.0";

    // State untuk Tren Tahunan
    const [monthlyRevenue, setMonthlyRevenue] = useState(Array(12).fill(0));
    const [isTrendLoading, setIsTrendLoading] = useState(true);

    useEffect(() => {
        const fetchMonthlyRevenue = async () => {
            if (!period) return;
            setIsTrendLoading(true);
            const [yearStr] = period.split("-");

            try {
                const response = await axios.get(`/api/yearly-profit-report/${yearStr}`);
                if (response.data?.success) {
                    setMonthlyRevenue(response.data.data);
                }
            } catch (error) {
                console.error("Gagal mengambil data tren bulanan:", error);
            } finally {
                setIsTrendLoading(false);
            }
        };

        fetchMonthlyRevenue();
    }, [period]);

    // Flag apakah data utama (revenue/expenses) sedang dimuat
    const isMainLoading = isRevenueLoading || isExpenseLoading;

    return (
        <div className="space-y-6">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
            >
                <div>
                    <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">Laporan Keuangan</h1>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                        <FileText size={11} className="inline mr-1 mb-px" />
                        Ringkasan Laba Rugi Perusahaan
                    </p>
                </div>
                <div className="flex items-center gap-2 self-start sm:self-auto">
                    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
                        <Calendar size={14} className="text-slate-400" />
                        <input
                            type="month"
                            value={period}
                            onChange={(e) => setPeriod(e.target.value)}
                            className="text-xs font-semibold text-slate-700 dark:text-slate-200 bg-transparent focus:outline-none cursor-pointer"
                        />
                    </div>
                </div>
            </motion.div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatCard
                    title="Total Pendapatan"
                    value={totalRevenue}
                    icon={DollarSign}
                    color="indigo"
                    trend={revenueTrend}
                    trendLabel="vs bulan lalu"
                    isLoading={isRevenueLoading}
                    delay={0}
                />
                <StatCard
                    title="Total Pengeluaran"
                    value={totalExpenses}
                    icon={TrendingDown}
                    color="rose"
                    trend={-3.1}
                    trendLabel="vs bulan lalu"
                    isLoading={isExpenseLoading}
                    delay={0.06}
                />
                <StatCard
                    title="Gross Profit"
                    value={grossProfit}
                    icon={BarChart3}
                    color="amber"
                    trend={12.6}
                    trendLabel={`Margin ${grossMargin}%`}
                    isLoading={isMainLoading}
                    delay={0.12}
                />
                <StatCard
                    title="Net Profit"
                    value={netProfit}
                    icon={BadgeDollarSign}
                    color="emerald"
                    trend={15.2}
                    trendLabel={`Margin ${netMargin}%`}
                    isLoading={isMainLoading}
                    delay={0.18}
                />
            </div>

            {/* Chart Card */}
            <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.24, duration: 0.35 }}
                className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5"
            >
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">Tren Pendapatan (Gross Profit)</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">Grafik Pergerakan Bulanan</p>
                    </div>
                    {isRevenueLoading ? (
                        <Skeleton className="h-6 w-24 rounded-full" />
                    ) : (
                        <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
                            +{formatNumberToK(totalRevenue)} / bln
                        </span>
                    )}
                </div>

                <MiniLineChart data={monthlyRevenue} isLoading={isTrendLoading} />
            </motion.div>

            {/* Expenses breakdown + P&L */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <CollapsibleSection
                        title="Pengeluaran Cabang"
                        subtitle={`${branchExpenses.length} pos pengeluaran`}
                        total={totalBranch}
                        items={branchExpenses}
                        icon={Building2}
                        iconColor="bg-rose-500"
                        isLoading={isExpenseLoading}
                        delay={0.3}
                    />
                    <CollapsibleSection
                        title="Pengeluaran Corporate/Owner"
                        subtitle={`${corporateExpenses.length} pos pengeluaran`}
                        total={totalCorporate}
                        items={corporateExpenses}
                        icon={Landmark}
                        iconColor="bg-violet-600"
                        isLoading={isExpenseLoading}
                        delay={0.38}
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.44, duration: 0.35 }}
                    className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden h-fit"
                >
                    <div className="px-5 py-4 bg-linear-to-r from-indigo-600 to-violet-600">
                        <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">Laporan Laba Rugi</p>
                        <p className="text-base font-bold text-white mt-0.5">{formattedPeriodName}</p>
                    </div>

                    <div className="px-5 py-3">
                        <PLRow label="Pendapatan Bruto" value={totalRevenue} color="green" bold isLoading={isRevenueLoading} delay={0.5} />

                        <PLRow label="Pengeluaran Cabang" value={-totalBranch} color="red" separator isLoading={isExpenseLoading} delay={0.54} />
                        {branchExpenses.map((e, i) => (
                            <PLRow key={e.label} label={e.label} value={-e.amount} indent isLoading={isExpenseLoading} delay={0.56 + i * 0.02} />
                        ))}

                        <PLRow label="GROSS PROFIT" value={grossProfit} color="green" bold separator isLoading={isMainLoading} delay={0.68} />
                        <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 -mt-1 mb-2 pl-0.5">Margin: {grossMargin}%</p>

                        <PLRow label="Pengeluaran Corporate/Owner" value={-totalCorporate} color="red" separator isLoading={isExpenseLoading} delay={0.72} />
                        {corporateExpenses.map((e, i) => (
                            <PLRow key={e.label} label={e.label} value={-e.amount} indent isLoading={isExpenseLoading} delay={0.74 + i * 0.02} />
                        ))}

                        <div className="border-t-2 border-indigo-200 dark:border-indigo-800 mt-3 pt-3">
                            <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 px-3 py-3 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">Net Profit</p>
                                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">Margin bersih: {netMargin}%</p>
                                </div>
                                {isMainLoading ? (
                                    <Skeleton className="h-6 w-28" />
                                ) : (
                                    <motion.p
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
                                        className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300"
                                    >
                                        {formatRupiah(netProfit)}
                                    </motion.p>
                                )}
                            </div>
                        </div>

                        <div className="mt-4 space-y-2.5 pb-2">
                            {[
                                { label: "Gross Margin", value: Math.max(0, Math.min(100, parseFloat(grossMargin))), color: "bg-amber-400" },
                                { label: "Net Margin", value: Math.max(0, Math.min(100, parseFloat(netMargin))), color: "bg-emerald-500" },
                            ].map((bar, i) => (
                                <div key={bar.label}>
                                    <div className="flex justify-between text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1">
                                        <span>{bar.label}</span>
                                        <span>{bar.value}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${bar.value}%` }}
                                            transition={{ delay: 1 + i * 0.1, duration: 0.7, ease: "easeOut" }}
                                            className={`h-full rounded-full ${bar.color}`}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
