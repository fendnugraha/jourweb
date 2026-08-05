import { formatNumber } from "@/app/utils/format";
import { AlertCircle, RefreshCw } from "lucide-react";

const CashBankBalance = ({ accountBalance, isLoading, isValidating }) => {
  const summarizeBalance =
    accountBalance?.data?.chartOfAccounts?.reduce(
      (total, account) => total + account.balance,
      0,
    ) || 0;
  const accounts = accountBalance?.data?.chartOfAccounts || [];

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
      <div className="space-y-1">
        {/* 1. STATE LOADING (SKELETON) */}
        {isLoading ? (
          Array.from({ length: 4 }).map((_, index) => (
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
          ))
        ) : accounts.length > 0 ? (
          /* 2. STATE DATA TERSEDIA */
          accounts.map((account) => (
            <div
              key={account.id}
              title={account.name}
              className="group flex items-center justify-between py-2.5 px-3 -mx-1 rounded-xl transition-all duration-150 ease-in-out hover:bg-slate-50 dark:hover:bg-slate-800/50 border border-transparent hover:border-slate-100 dark:hover:border-slate-800 cursor-pointer"
            >
              {/* Bagian Kiri: Info Akun */}
              <div className="min-w-0 flex-1 pr-4">
                <h4 className="text-xs font-semibold text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate leading-tight">
                  {account.name}
                </h4>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 font-medium truncate mt-0.5">
                  {account.group}
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
                  <span
                    className="inline-flex items-center text-rose-500"
                    title="Saldo Minus"
                  >
                    <AlertCircle className="w-3.5 h-3.5" />
                  </span>
                )}
              </div>
            </div>
          ))
        ) : (
          /* 3. STATE EMPTY / DATA KOSONG */
          <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs font-medium">
            Tidak ada data akun Kas/Bank.
          </div>
        )}
      </div>
    </div>
  );
};

export default CashBankBalance;
