import { formatNumber } from "@/app/utils/format";
import {
  Wallet,
  Landmark,
  ArrowDownLeft,
  ArrowUpRight,
  Coins,
} from "lucide-react";
import { useMemo } from "react";

const CashBankSummary = ({ journals, accountBalance, warehouseId }) => {
  const mutationInSumById = (acc_id) => {
    return journals.reduce(
      (sum, journal) =>
        Number(journal.debt_id) === Number(acc_id) &&
        journal.trx_type === "Mutasi Kas"
          ? sum + Number(journal.amount)
          : sum,
      0,
    );
  };

  const mutationOutSumById = (acc_id) => {
    return journals.reduce(
      (sum, journal) =>
        Number(journal.cred_id) === Number(acc_id) &&
        journal.trx_type === "Mutasi Kas"
          ? sum + Number(journal.amount)
          : sum,
      0,
    );
  };

  const totals = useMemo(() => {
    const accounts = accountBalance?.data?.chartOfAccounts || [];

    const kasAccounts = accounts.filter(
      (acc) => Number(acc.account_id ?? acc.account_id) === 1,
    );
    const bankAccounts = accounts.filter(
      (acc) => Number(acc.account_id ?? acc.account_id) === 2,
    );

    const kasBalance = kasAccounts.reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0,
    );
    const kasIn = kasAccounts.reduce(
      (sum, acc) => sum + (Number(mutationInSumById(acc.id)) || 0),
      0,
    );
    const kasOut = kasAccounts.reduce(
      (sum, acc) => sum + (Number(mutationOutSumById(acc.id)) || 0),
      0,
    );

    const bankBalance = bankAccounts.reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0,
    );
    const bankIn = bankAccounts.reduce(
      (sum, acc) => sum + (Number(mutationInSumById(acc.id)) || 0),
      0,
    );
    const bankOut = bankAccounts.reduce(
      (sum, acc) => sum + (Number(mutationOutSumById(acc.id)) || 0),
      0,
    );

    const grandTotalBalance = accounts.reduce(
      (sum, acc) => sum + (Number(acc.balance) || 0),
      0,
    );

    // Perhitungan Persentase dari Grand Total (Safe Division)
    const kasPercent =
      grandTotalBalance > 0 ? (kasBalance / grandTotalBalance) * 100 : 0;
    const bankPercent =
      grandTotalBalance > 0 ? (bankBalance / grandTotalBalance) * 100 : 0;

    return {
      kas: {
        balance: kasBalance,
        in: kasIn,
        out: kasOut,
        count: kasAccounts.length,
        percentage: Math.max(0, kasPercent).toFixed(1), // format 1 desimal (e.g. 35.5)
      },
      bank: {
        balance: bankBalance,
        in: bankIn,
        out: bankOut,
        count: bankAccounts.length,
        percentage: Math.max(0, bankPercent).toFixed(1),
      },
      grandTotalBalance,
    };
  }, [accountBalance, mutationInSumById, mutationOutSumById]);

  const getAccountBadge = (accountId) => {
    switch (Number(accountId)) {
      case 1: // Kas
        return (
          <div className="p-2 rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
        );
      case 2: // Bank
        return (
          <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0">
            <Landmark className="w-4 h-4" />
          </div>
        );
      default: // Akun Lainnya / Fallback
        return (
          <div className="p-2 rounded-xl bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 shrink-0">
            <Coins className="w-4 h-4" />
          </div>
        );
    }
  };
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
      {/* ========================================================================= */}
      {/* KIRI: TABEL DAFTAR AKUN (7 Kolom di Desktop)                             */}
      {/* ========================================================================= */}
      <div className="lg:col-span-7 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 w-full">
        <div className="overflow-x-auto no-scrollbar w-full">
          <table className="w-full border-collapse text-left table-fixed sm:table-auto">
            <colgroup>
              <col className="w-[45%] sm:w-auto" />
              <col className="w-[18%] sm:w-auto" />
              <col className="w-[18%] sm:w-auto" />
              <col className="w-[19%] sm:w-auto" />
            </colgroup>

            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                <th scope="col" className="px-3 sm:px-6 py-3.5">
                  Akun
                </th>
                <th scope="col" className="px-2 sm:px-6 py-3.5 text-right">
                  Saldo
                </th>
                <th scope="col" className="px-2 sm:px-6 py-3.5 text-right">
                  Masuk
                </th>
                <th
                  scope="col"
                  className="px-3 sm:px-6 py-3.5 text-right pr-4 sm:pr-6"
                >
                  Keluar
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {accountBalance?.data?.chartOfAccounts?.map((account, index) => (
                <tr
                  key={account.id || index}
                  className="transition-colors hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                >
                  {/* Kolom 1: Akun dengan Ikon & Layout Flexbox */}
                  <td className="px-3 sm:px-6 py-3 font-medium text-slate-800 dark:text-slate-100">
                    <div className="flex items-center gap-3">
                      {/* Render Ikon Berdasarkan account_id / account_id */}
                      {getAccountBadge(
                        account.account_id ?? account.account_id,
                      )}

                      <div className="min-w-0 flex-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block truncate leading-snug">
                          {account.group}
                        </span>
                        <span className="font-medium text-slate-500 dark:text-slate-400 block text-[11px] truncate">
                          {account.name}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Kolom 2: Saldo */}
                  <td className="px-2 sm:px-6 py-3 text-right font-bold text-sm whitespace-nowrap font-mono">
                    {formatNumber(account.balance)}
                  </td>

                  {/* Kolom 3: Masuk */}
                  <td className="px-2 sm:px-6 py-3 text-right text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap font-mono">
                    {formatNumber(mutationInSumById(account.id))}
                  </td>

                  {/* Kolom 4: Keluar */}
                  <td className="px-3 sm:px-6 py-3 text-right text-rose-600 dark:text-rose-400 font-medium whitespace-nowrap pr-4 sm:pr-6 font-mono">
                    {formatNumber(mutationOutSumById(account.id))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* KANAN: RINGKASAN TOTAL KAS & BANK DENGAN PERSENTASE                      */}
      {/* ========================================================================= */}
      <div className="lg:col-span-5 space-y-3">
        {/* Card Total Kas */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
                <Wallet className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Total Kas
                  </h4>
                  {/* Badge Persentase */}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400 font-mono">
                    {totals.kas.percentage}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {totals.kas.count} Akun Terdaftar
                </p>
              </div>
            </div>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-50">
              {formatNumber(totals.kas.balance)}
            </span>
          </div>

          {/* Progress Bar Porsi Kas */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, totals.kas.percentage)}%` }}
              />
            </div>
          </div>

          {/* Arus Masuk & Keluar */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> Masuk
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatNumber(totals.kas.in)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <ArrowUpRight className="w-3 h-3 text-rose-500" /> Keluar
              </span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {formatNumber(totals.kas.out)}
              </span>
            </div>
          </div>
        </div>

        {/* Card Total Bank */}
        <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-xs space-y-3 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
                <Landmark className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
                    Total Bank
                  </h4>
                  {/* Badge Persentase */}
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] font-extrabold bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400 font-mono">
                    {totals.bank.percentage}%
                  </span>
                </div>
                <p className="text-[10px] text-slate-400 font-medium">
                  {totals.bank.count} Akun Terdaftar
                </p>
              </div>
            </div>
            <span className="text-base font-bold font-mono text-slate-900 dark:text-slate-50">
              {formatNumber(totals.bank.balance)}
            </span>
          </div>

          {/* Progress Bar Porsi Bank */}
          <div className="space-y-1">
            <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, totals.bank.percentage)}%` }}
              />
            </div>
          </div>

          {/* Arus Masuk & Keluar */}
          <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 dark:border-slate-800/80 text-xs font-mono">
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <ArrowDownLeft className="w-3 h-3 text-emerald-500" /> Masuk
              </span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {formatNumber(totals.bank.in)}
              </span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-50 dark:bg-slate-800/40">
              <span className="text-[10px] text-slate-400 flex items-center gap-1 font-sans">
                <ArrowUpRight className="w-3 h-3 text-rose-500" /> Keluar
              </span>
              <span className="font-semibold text-rose-600 dark:text-rose-400">
                {formatNumber(totals.bank.out)}
              </span>
            </div>
          </div>
        </div>

        {/* Card Grand Total Saldo */}
        <div className="p-4 rounded-2xl bg-slate-900 dark:bg-indigo-950/40 text-white border border-slate-800 dark:border-indigo-900/50 space-y-3 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/10 text-amber-400">
                <Coins className="w-4 h-4" />
              </div>
              <div>
                <h5 className="text-[11px] font-medium text-slate-300">
                  Grand Total Saldo
                </h5>
                <p className="text-[9px] text-slate-400">
                  Akumulasi Seluruh Akun
                </p>
              </div>
            </div>
            <span className="text-base font-extrabold font-mono text-amber-400">
              {formatNumber(totals.grandTotalBalance)}
            </span>
          </div>

          {/* Visual Bar Komposisi Kas vs Bank */}
          <div className="pt-2 border-t border-white/10 space-y-1.5">
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
                Kas {totals.kas.percentage}%
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-400 inline-block"></span>
                Bank {totals.bank.percentage}%
              </span>
            </div>

            {/* Combined Proportion Bar */}
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
              <div
                className="bg-amber-400 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, totals.kas.percentage)}%` }}
              />
              <div
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, totals.bank.percentage)}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CashBankSummary;
