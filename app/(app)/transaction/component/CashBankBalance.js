import { formatNumber } from "@/app/utils/format";
import { AlertCircle, ChevronDown, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";

const containerVariants = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05, // Jeda antar item 0.05 detik
        },
    },
};

// Variasi animasi untuk tiap item
const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    show: {
        opacity: 1,
        y: 0,
        transition: { type: "spring", stiffness: 300, damping: 24 },
    },
    exit: { opacity: 0, y: -8, transition: { duration: 0.15 } },
};

const CashBankBalance = ({ accountBalance, isLoading, isValidating, dailyDashboard }) => {
    const summarizeBalance = accountBalance?.data?.chartOfAccounts?.reduce((total, account) => total + account.balance, 0) || 0;
    const accounts = accountBalance?.data?.chartOfAccounts || [];
    const [loading, setLoading] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const [isOpen, setIsOpen] = useState(false);

    const copyData = async () => {
        await navigator.clipboard.writeText(copyDailyReport());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 9000);
    };

    const copySalesVoucher = async () => {
        await navigator.clipboard.writeText(formatVoucherText());
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 3000);
    };

    const copyDailyReport = () => {
        const dailyReportData = [
            {
                name: "Kas",
                value: formatNumber(dailyDashboard?.data?.totalCash - openingCash),
            },
            {
                name: "Voucher",
                value: formatNumber(dailyDashboard?.data?.totalVoucher?.total),
            },
            {
                name: "Deposit",
                value: formatNumber(dailyDashboard?.data?.totalCashDeposit?.total),
            },
            {
                name: "Koreksi",
                value: formatNumber(dailyDashboard?.data?.totalCorrection ?? 0),
            },
            {
                name: "Acc",
                value: formatNumber(dailyDashboard?.data?.totalAccessories?.total),
            },
            { name: "Laba", value: formatNumber(dailyDashboard?.data?.profit) },
        ];

        const lines = dailyReportData.map(({ name, value }) => `${name}: ${value}`);

        return `${formatDateTime(today)}\nReport ${warehouseName}:\n\n${lines.join("\n")}\n\nTotal Setoran: ${formatNumber(
            dailyDashboard?.data?.totalCash > openingCash ? totalSetoran - openingCash : totalSetoran,
        )}`;
    };

    const closingStatus = () => {
        setIsClosingComplete(true);
        setStatusText("Selesai.");
        setTimeout(() => {
            setIsClosingComplete(false);
            setStatusText("");
        }, 300000);
    };

    const handleClosing = async () => {
        // Variabel menggunakan bahasa Inggris pro (isConfirmed)
        const isConfirmed = confirm("Anda yakin ingin menutup shift, pastikan semua data sudah diinput?\n(Semua input data akan terkunci setelah kas disetor)");
        if (!isConfirmed) return;

        setLoading(true);
        setStatusText("Menutup shift...");

        try {
            await copyData();

            setStatusText("Mengunci cabang...");
            await changeLockStatus(warehouse);

            setStatusText("Mengambil data transaksi...");
            const latestTransactions = await fetchTransaction();

            const result = await closingShift({
                cred_id: warehouseCashId,
                amount: dailyDashboard?.data?.totalCash - openingCash,
                warehouse: warehouseName,
                message: copyDailyReport(),
                warehouseId: warehouse,
            });

            const telegramResponseObj = result.telegramData.data;
            setRawTelegramData(telegramResponseObj);
            localStorage.setItem(`last_telegram_data_${warehouse}`, JSON.stringify(telegramResponseObj));
            localStorage.setItem("last_telegram_data", JSON.stringify(telegramResponseObj));

            setStatusText("Mengirim laporan...");
            await sendTelegramAlert({
                title: "PENJUALAN BARANG", // Kembali ke teks asli Anda
                source: warehouseName,
                message: formatVoucherText(latestTransactions),
                // forwardChatId: 986761281,
                forwardChatId: 851552604,
            });

            // set duration in milliseconds
            const LOCK_DURATION_MS = 1 * 60 * 1000;
            const lockTargetTime = Date.now() + LOCK_DURATION_MS;

            localStorage.setItem(`target_lock_time_${warehouse}`, lockTargetTime);
            localStorage.setItem(`lock_warehouse_id_${warehouse}`, warehouse);
            localStorage.setItem("target_lock_time", lockTargetTime);
            localStorage.setItem("lock_warehouse_id", warehouse);

            setCountdown(LOCK_DURATION_MS / 1000); // Menghitung detik
            setIsLocking(true);

            // Timer otomatis menggunakan durasi milidetik yang benar
            setTimeout(() => {
                setRawTelegramData(null);
                localStorage.removeItem("last_telegram_data");
            }, LOCK_DURATION_MS);

            setStatusText("Menutup shift...");
            alert("Shift berhasil ditutup!");
            closingStatus();
        } catch (error) {
            console.error("Closing shift error:", error);
            alert("Terjadi kesalahan saat menutup shift.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden">
            {/* HEADER - Tap Target Luas di Mobile */}
            <div
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between gap-2 p-3.5 sm:p-4 cursor-pointer select-none active:bg-slate-50 dark:active:bg-slate-800/50 transition-colors"
            >
                {/* Bagian Kiri: Panah, Judul & Subtitle */}
                <div className="flex items-center gap-2.5 min-w-0">
                    <motion.div
                        animate={{ rotate: isOpen ? 0 : -90 }}
                        transition={{ duration: 0.2 }}
                        className="p-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0"
                    >
                        <ChevronDown className="w-4 h-4" />
                    </motion.div>

                    <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 truncate">KAS / BANK</h3>
                            {isValidating && !isLoading && <RefreshCw className="w-3 h-3 text-indigo-500 animate-spin shrink-0" title="Memperbarui data..." />}
                        </div>
                        <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium truncate">Ringkasan Saldo Akun</p>
                    </div>
                </div>

                {/* TOTAL BADGE - Kompak di Mobile */}
                <div className="shrink-0">
                    <div className="bg-indigo-50/80 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl flex items-center gap-1.5">
                        <span className="text-[10px] sm:text-[11px] font-medium text-indigo-600 dark:text-indigo-400">Total:</span>
                        {isLoading ? (
                            <div className="h-4 w-16 sm:w-20 bg-indigo-200/50 dark:bg-indigo-900/50 animate-pulse rounded" />
                        ) : (
                            <span className="text-xs sm:text-sm font-bold text-indigo-700 dark:text-indigo-300 font-mono tracking-tight">
                                {formatNumber(summarizeBalance)}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* ACCOUNT LIST CONTENT */}
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        key="collapsible-content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="overflow-hidden border-t border-slate-100 dark:border-slate-800/80"
                    >
                        <div className="p-2 sm:p-3">
                            <AnimatePresence mode="wait">
                                {/* 1. STATE LOADING (SKELETON) */}
                                {isLoading ? (
                                    <motion.div
                                        key="loading-skeleton"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="space-y-1"
                                    >
                                        {Array.from({ length: 4 }).map((_, index) => (
                                            <div key={index} className="flex items-center justify-between py-2.5 px-3 animate-pulse">
                                                <div className="space-y-1.5 flex-1 pr-4">
                                                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                                                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4" />
                                                </div>
                                                <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                                            </div>
                                        ))}
                                    </motion.div>
                                ) : accounts.length > 0 ? (
                                    /* 2. STATE DATA TERSEDIA */
                                    <motion.div
                                        key="account-list"
                                        variants={containerVariants}
                                        initial="hidden"
                                        animate="show"
                                        exit="hidden"
                                        className="divide-y divide-slate-100 dark:divide-slate-800/50"
                                    >
                                        {accounts.map((account) => {
                                            const hasLimit = Boolean(account.limit?.limit_amount);
                                            const diff = account.balance - (account.limit?.limit_amount || 0);

                                            return (
                                                <motion.div
                                                    key={account.id}
                                                    variants={itemVariants}
                                                    whileTap={{ scale: 0.98 }}
                                                    className="group flex items-center justify-between py-2.5 px-2 rounded-xl transition-colors active:bg-slate-100 dark:active:bg-slate-800/80 cursor-pointer"
                                                >
                                                    {/* Info Akun */}
                                                    <div className="min-w-0 flex-1 pr-3">
                                                        <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                                                            {account.group}
                                                        </h4>
                                                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                                                            {account.name}
                                                        </p>
                                                    </div>

                                                    {/* Saldo & Selisih Limit */}
                                                    <div className="text-right shrink-0 flex flex-col items-end justify-center">
                                                        <span
                                                            className={`text-xs sm:text-sm font-bold font-mono tracking-tight ${
                                                                account.balance < 0 ? "text-rose-600 dark:text-rose-400" : "text-slate-700 dark:text-slate-300"
                                                            }`}
                                                        >
                                                            {formatNumber(account.balance)}
                                                        </span>

                                                        {hasLimit && diff !== 0 && (
                                                            <span
                                                                className={`text-[9px] sm:text-[10px] font-mono font-medium ${
                                                                    diff > 0 ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                                                                }`}
                                                            >
                                                                {diff > 0 ? "+" : ""}
                                                                {formatNumber(diff)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            );
                                        })}
                                    </motion.div>
                                ) : (
                                    /* 3. STATE EMPTY */
                                    <motion.div
                                        key="empty-state"
                                        initial={{ opacity: 0, y: 5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium"
                                    >
                                        Tidak ada data akun Kas/Bank.
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CashBankBalance;
