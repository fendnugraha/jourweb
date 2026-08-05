"use client";
import { formatRupiah, formatNumberToK } from "@/app/utils/format";
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
  Users,
  Settings2,
  Zap,
  Printer,
  Car,
  Handshake,
  HomeIcon,
  BanknoteIcon,
  ShieldCheck,
  UserCog,
  MonitorSmartphone,
  Megaphone,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";

// ─── Dummy Data ─────────────────────────────────────────────────────────────
const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

const DUMMY_DATA = {
  revenue: 485_750_000,
  branchExpenses: [
    { label: "Gaji Karyawan Cabang", amount: 78_500_000, icon: Users },
    { label: "Operasional Cabang", amount: 12_400_000, icon: Settings2 },
    { label: "Listrik & Air", amount: 4_200_000, icon: Zap },
    { label: "Perlengkapan Kantor", amount: 2_850_000, icon: Printer },
    { label: "Transportasi", amount: 3_600_000, icon: Car },
    { label: "Komisi Agen", amount: 24_300_000, icon: Handshake },
  ],
  corporateExpenses: [
    { label: "Sewa Gedung Kantor", amount: 35_000_000, icon: HomeIcon },
    { label: "Cicilan Bank BRI", amount: 28_500_000, icon: BanknoteIcon },
    { label: "Cicilan Kendaraan", amount: 8_750_000, icon: Car },
    { label: "Asuransi Kantor", amount: 3_200_000, icon: ShieldCheck },
    { label: "Gaji Manajemen", amount: 45_000_000, icon: UserCog },
    { label: "Software & IT", amount: 4_500_000, icon: MonitorSmartphone },
    { label: "Marketing & Promosi", amount: 7_800_000, icon: Megaphone },
  ],
  monthlyRevenue: [
    310, 345, 388, 420, 395, 450, 430, 475, 460, 490, 486, 0,
  ].map((v) => v * 1_000_000),
};

const totalBranch = DUMMY_DATA.branchExpenses.reduce((s, e) => s + e.amount, 0);
const totalCorporate = DUMMY_DATA.corporateExpenses.reduce(
  (s, e) => s + e.amount,
  0,
);
const totalExpenses = totalBranch + totalCorporate;
const grossProfit = DUMMY_DATA.revenue - totalBranch;
const netProfit = grossProfit - totalCorporate;
const grossMargin = ((grossProfit / DUMMY_DATA.revenue) * 100).toFixed(1);
const netMargin = ((netProfit / DUMMY_DATA.revenue) * 100).toFixed(1);

// ─── Animated Counter ─────────────────────────────────────────────────────
function AnimatedNumber({ value, prefix = "" }) {
  return (
    <motion.span
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {prefix}
      {formatRupiah(value)}
    </motion.span>
  );
}

// ─── Stat Card ──────────────────────────────────────────────────────────────
function StatCard({
  title,
  value,
  icon: Icon,
  color,
  trend,
  trendLabel,
  delay = 0,
}) {
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
    violet: {
      bg: "bg-violet-50 dark:bg-violet-950/40",
      icon: "text-violet-600 dark:text-violet-400",
      iconBg: "bg-violet-100 dark:bg-violet-900/60",
      border: "border-violet-100 dark:border-violet-900/40",
      value: "text-violet-700 dark:text-violet-300",
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
      {/* Subtle blob */}
      <div
        className={`absolute -top-6 -right-6 w-24 h-24 rounded-full ${c.iconBg} opacity-40 blur-2xl pointer-events-none`}
      />

      <div className="flex items-start justify-between">
        <div className={`p-2.5 rounded-xl ${c.iconBg}`}>
          <Icon size={18} className={c.icon} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <div
            className={`flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${isPositive ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-400"}`}
          >
            {isPositive ? (
              <ArrowUpRight size={12} />
            ) : (
              <ArrowDownRight size={12} />
            )}
            {Math.abs(trend)}%
          </div>
        )}
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-0.5">
          {title}
        </p>
        <p className={`text-base sm:text-lg font-bold font-mono ${c.value}`}>
          <AnimatedNumber value={value} />
        </p>
        {trendLabel && (
          <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
            {trendLabel}
          </p>
        )}
      </div>
    </motion.div>
  );
}

// ─── Expense Row ─────────────────────────────────────────────────────────────
function ExpenseRow({ item, total, delay = 0 }) {
  const pct = ((item.amount / total) * 100).toFixed(1);
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
          <span className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">
            {item.label}
          </span>
          <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 shrink-0">
            {formatRupiah(item.amount)}
          </span>
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
      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0 w-10 text-right">
        {pct}%
      </span>
    </motion.div>
  );
}

// ─── Collapsible Section ─────────────────────────────────────────────────────
function CollapsibleSection({
  title,
  subtitle,
  total,
  items,
  icon: Icon,
  iconColor,
  delay = 0,
}) {
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
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              {title}
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              {subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-bold font-mono text-rose-600 dark:text-rose-400">
            {formatRupiah(total)}
          </span>
          <motion.span
            animate={{ rotate: open ? 0 : -90 }}
            transition={{ duration: 0.2 }}
          >
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
              {items.map((item, i) => (
                <ExpenseRow
                  key={item.label}
                  item={item}
                  total={total}
                  delay={i * 0.04}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Mini Bar Chart ──────────────────────────────────────────────────────────
function MiniBarChart({ data }) {
  const max = Math.max(...data.filter(Boolean));
  return (
    <div className="flex items-end gap-1.5 h-20">
      {data.map((val, i) => {
        const height = val > 0 ? Math.max((val / max) * 100, 6) : 0;
        const isLast = val === 0;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <motion.div
              initial={{ height: 0 }}
              animate={{ height: `${height}%` }}
              transition={{ delay: i * 0.04, duration: 0.45, ease: "easeOut" }}
              className={`w-full rounded-t-sm ${isLast ? "bg-slate-200 dark:bg-slate-700" : "bg-indigo-400/70 dark:bg-indigo-500/70"}`}
              style={{ height: `${height}%`, minHeight: val > 0 ? 4 : 0 }}
            />
            <span className="text-[8px] text-slate-400 dark:text-slate-600 font-medium">
              {MONTHS[i]}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── P&L Summary Row ─────────────────────────────────────────────────────────
function PLRow({
  label,
  value,
  indent = false,
  bold = false,
  color,
  separator = false,
  delay = 0,
}) {
  const colorClass =
    color === "green"
      ? "text-emerald-600 dark:text-emerald-400"
      : color === "red"
        ? "text-rose-600 dark:text-rose-400"
        : color === "violet"
          ? "text-violet-600 dark:text-violet-400"
          : "text-slate-700 dark:text-slate-300";

  return (
    <>
      {separator && (
        <div className="border-t border-slate-200 dark:border-slate-700 my-1" />
      )}
      <motion.div
        initial={{ opacity: 0, x: -4 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay, duration: 0.2 }}
        className={`flex items-center justify-between py-2 ${indent ? "pl-4" : ""}`}
      >
        <span
          className={`text-xs ${bold ? "font-bold" : "font-medium"} ${indent ? "text-slate-500 dark:text-slate-400" : "text-slate-700 dark:text-slate-200"}`}
        >
          {indent && (
            <span className="text-slate-300 dark:text-slate-600 mr-1.5">└</span>
          )}
          {label}
        </span>
        <span
          className={`text-xs font-mono ${bold ? "font-bold" : "font-semibold"} ${colorClass}`}
        >
          {value < 0
            ? `(${formatRupiah(Math.abs(value))})`
            : formatRupiah(value)}
        </span>
      </motion.div>
    </>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function FinancialReport() {
  const [period, setPeriod] = useState("2025-07");

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-50">
            Laporan Keuangan
          </h1>
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

      {/* ── KPI Cards ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          title="Total Pendapatan"
          value={DUMMY_DATA.revenue}
          icon={DollarSign}
          color="indigo"
          trend={8.4}
          trendLabel="vs bulan lalu"
          delay={0}
        />
        <StatCard
          title="Total Pengeluaran"
          value={totalExpenses}
          icon={TrendingDown}
          color="rose"
          trend={-3.1}
          trendLabel="vs bulan lalu"
          delay={0.06}
        />
        <StatCard
          title="Gross Profit"
          value={grossProfit}
          icon={BarChart3}
          color="amber"
          trend={12.6}
          trendLabel={`Margin ${grossMargin}%`}
          delay={0.12}
        />
        <StatCard
          title="Net Profit"
          value={netProfit}
          icon={BadgeDollarSign}
          color="emerald"
          trend={15.2}
          trendLabel={`Margin ${netMargin}%`}
          delay={0.18}
        />
      </div>

      {/* ── Revenue Trend Chart ──────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.24, duration: 0.35 }}
        className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
              Tren Pendapatan
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-500">
              Januari – Juli 2025
            </p>
          </div>
          <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2.5 py-1 rounded-full">
            +{formatNumberToK(DUMMY_DATA.revenue)} / bln
          </span>
        </div>
        <MiniBarChart data={DUMMY_DATA.monthlyRevenue} />
      </motion.div>

      {/* ── Two column: Expenses breakdown + P&L ────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT — Expense Sections */}
        <div className="space-y-4">
          <CollapsibleSection
            title="Pengeluaran Cabang"
            subtitle={`${DUMMY_DATA.branchExpenses.length} pos pengeluaran`}
            total={totalBranch}
            items={DUMMY_DATA.branchExpenses}
            icon={Building2}
            iconColor="bg-rose-500"
            delay={0.3}
          />
          <CollapsibleSection
            title="Pengeluaran Corporate"
            subtitle={`${DUMMY_DATA.corporateExpenses.length} pos pengeluaran`}
            total={totalCorporate}
            items={DUMMY_DATA.corporateExpenses}
            icon={Landmark}
            iconColor="bg-violet-600"
            delay={0.38}
          />
        </div>

        {/* RIGHT — P&L Statement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.44, duration: 0.35 }}
          className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-hidden h-fit"
        >
          {/* Header */}
          <div className="px-5 py-4 bg-linear-to-r from-indigo-600 to-violet-600">
            <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest">
              Laporan Laba Rugi
            </p>
            <p className="text-base font-bold text-white mt-0.5">Juli 2025</p>
          </div>

          {/* P&L rows */}
          <div className="px-5 py-3">
            <PLRow
              label="Pendapatan Bruto"
              value={DUMMY_DATA.revenue}
              color="green"
              bold
              delay={0.5}
            />

            <PLRow
              label="Pengeluaran Cabang"
              value={-totalBranch}
              color="red"
              separator
              delay={0.54}
            />
            {DUMMY_DATA.branchExpenses.map((e, i) => (
              <PLRow
                key={e.label}
                label={e.label}
                value={-e.amount}
                indent
                delay={0.56 + i * 0.02}
              />
            ))}

            <PLRow
              label="GROSS PROFIT"
              value={grossProfit}
              color="green"
              bold
              separator
              delay={0.68}
            />
            <p className="text-[10px] font-semibold text-emerald-600 dark:text-emerald-400 -mt-1 mb-2 pl-0.5">
              Margin: {grossMargin}%
            </p>

            <PLRow
              label="Pengeluaran Corporate"
              value={-totalCorporate}
              color="red"
              separator
              delay={0.72}
            />
            {DUMMY_DATA.corporateExpenses.map((e, i) => (
              <PLRow
                key={e.label}
                label={e.label}
                value={-e.amount}
                indent
                delay={0.74 + i * 0.02}
              />
            ))}

            {/* Net Profit highlight */}
            <div className="border-t-2 border-indigo-200 dark:border-indigo-800 mt-3 pt-3">
              <div className="flex items-center justify-between bg-emerald-50 dark:bg-emerald-950/40 px-3 py-3 rounded-xl">
                <div>
                  <p className="text-xs font-bold text-emerald-800 dark:text-emerald-200 uppercase tracking-wide">
                    Net Profit
                  </p>
                  <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                    Margin bersih: {netMargin}%
                  </p>
                </div>
                <motion.p
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.9, type: "spring", stiffness: 300 }}
                  className="text-base font-black font-mono text-emerald-700 dark:text-emerald-300"
                >
                  {formatRupiah(netProfit)}
                </motion.p>
              </div>
            </div>

            {/* Margin progress bars */}
            <div className="mt-4 space-y-2.5 pb-2">
              {[
                {
                  label: "Gross Margin",
                  value: parseFloat(grossMargin),
                  color: "bg-amber-400",
                },
                {
                  label: "Net Margin",
                  value: parseFloat(netMargin),
                  color: "bg-emerald-500",
                },
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
                      transition={{
                        delay: 1 + i * 0.1,
                        duration: 0.7,
                        ease: "easeOut",
                      }}
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
