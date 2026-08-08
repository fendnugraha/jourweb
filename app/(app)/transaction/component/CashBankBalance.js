import { formatNumber } from "@/app/utils/format";
import { AlertCircle, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

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

const CashBankBalance = ({
  accountBalance,
  isLoading,
  isValidating,
  dailyDashboard,
}) => {
  const summarizeBalance =
    accountBalance?.data?.chartOfAccounts?.reduce(
      (total, account) => total + account.balance,
      0,
    ) || 0;
  const accounts = accountBalance?.data?.chartOfAccounts || [];

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
      dailyDashboard?.data?.totalCash > openingCash
        ? totalSetoran - openingCash
        : totalSetoran,
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
    const isConfirmed = confirm(
      "Anda yakin ingin menutup shift, pastikan semua data sudah diinput?\n(Semua input data akan terkunci setelah kas disetor)",
    );
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
      localStorage.setItem(
        "last_telegram_data",
        JSON.stringify(telegramResponseObj),
      );

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
    <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/80 p-5 rounded-2xl shadow-sm space-y-4">
      {/* HEADER */}
      <div className="flex sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          {/* <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                        <Coins className="h-4 w-4" />
                    </div> */}
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                KAS / BANK
              </h3>
              {/* Indikator Revalidating (Sync di background) */}
              {isValidating && !isLoading && (
                <RefreshCw
                  className="w-3 h-3 text-indigo-500 animate-spin"
                  title="Memperbarui data..."
                />
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Ringkasan Saldo Akun
            </p>
          </div>
        </div>

        {/* TOTAL BADGE */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/50 px-3 py-1.5 rounded-xl flex items-center gap-2">
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
              Total:
            </span>
            {isLoading ? (
              <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 animate-pulse rounded" />
            ) : (
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
                {formatNumber(summarizeBalance)}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ACCOUNT LIST CONTENT */}
      <div className="relative">
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
                <div
                  key={index}
                  className="flex items-center justify-between py-2.5 px-3 -mx-1 animate-pulse"
                >
                  <div className="space-y-1.5 flex-1 pr-4">
                    <div className="h-3.5 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
                    <div className="h-2.5 bg-slate-100 dark:bg-slate-800/60 rounded w-1/4" />
                  </div>
                  <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-20" />
                </div>
              ))}
            </motion.div>
          ) : accounts.length > 0 ? (
            /* 2. STATE DATA TERSEDIA (DENGAN ANIMASI) */
            <motion.div
              key="account-list"
              variants={containerVariants}
              initial="hidden"
              animate="show"
              exit="hidden"
              className="space-y-1"
            >
              {accounts.map((account) => (
                <motion.div
                  key={account.id}
                  variants={itemVariants}
                  whileHover={{ x: 2 }} // Menggeser sedikit ke kanan saat hover
                  whileTap={{ scale: 0.98 }} // Efek menekan saat diklik
                  title={account.name}
                  className="group flex items-center justify-between py-2.5 px-3 -mx-1 rounded-xl transition-colors duration-150 ease-in-out hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 cursor-pointer"
                >
                  {/* Bagian Kiri: Info Akun */}
                  <div className="min-w-0 flex-1 pr-4">
                    <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate leading-tight">
                      {account.group}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                      {account.name}
                    </p>
                  </div>

                  {/* Bagian Kanan: Saldo */}
                  <div className="text-right shrink-0 flex items-center gap-1.5">
                    <span
                      className={`text-xs sm:text-sm font-bold font-mono tracking-tight ${
                        account.balance < 0
                          ? "text-rose-600 dark:text-rose-400"
                          : "text-slate-700 dark:text-slate-300"
                      }`}
                    >
                      {formatNumber(account.balance)}
                    </span>

                    {/* Warning jika saldo minus */}
                    {account.balance < 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="inline-flex items-center text-rose-500"
                        title="Saldo Minus"
                      >
                        <AlertCircle className="w-3.5 h-3.5" />
                      </motion.span>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            /* 3. STATE EMPTY / DATA KOSONG */
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
    </div>
  );
};

export default CashBankBalance;
