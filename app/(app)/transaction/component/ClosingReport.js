import { formatNumber } from "@/app/utils/format";
import { CircleAlert, ReceiptText, TrendingUp, Wallet } from "lucide-react";

export default function ClosingReport({
  dailyDashboard,
  openingCash = 9000000,
  totalSetoran,
}) {
  const data = dailyDashboard?.data || {};
  const totalCash = data.totalCash ?? 0;
  const totalVoucher = data.totalVoucher?.total ?? 0;
  const totalAccessories = data.totalAccessories?.total ?? 0;
  const totalDeposit = data.totalCashDeposit?.total ?? 0;
  const totalCorrection = data.totalCorrection ?? 0;
  const totalFee = data.totalFee ?? 0;
  const totalExpense = data.totalExpense ?? 0;
  const profit = data.profit ?? 0;

  // Pre-calculated values
  const totalPendapatanGross =
    totalCash + totalDeposit + totalAccessories + totalVoucher;
  const totalPendapatanNett =
    totalFee +
    totalCash +
    totalDeposit +
    totalAccessories +
    totalVoucher +
    totalExpense;
  const isCashLess = totalCash < openingCash;
  const finalSetoran =
    totalCash > openingCash ? totalSetoran - openingCash : totalSetoran;

  return (
    <div className="text-sm space-y-3">
      {/* SECTION 1: RINCIAN PENERIMAAN */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Uang Tunai</span>
          <span
            className={`font-mono font-bold ${isCashLess ? "text-rose-500" : "text-slate-800 dark:text-slate-100"}`}
          >
            {formatNumber(totalCash)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">
            Voucher & SP
          </span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
            {formatNumber(totalVoucher)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">
            Accessories
          </span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
            {formatNumber(totalAccessories)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Deposit</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
            {formatNumber(totalDeposit)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Fee Admin</span>
          <span className="font-mono font-semibold text-slate-800 dark:text-slate-100">
            {formatNumber(totalFee)}
          </span>
        </div>

        {totalCorrection !== 0 && (
          <div className="flex justify-between items-center">
            <span className="text-slate-500 dark:text-slate-400">Koreksi</span>
            <span className="font-mono font-semibold text-amber-500 dark:text-amber-400">
              {formatNumber(totalCorrection)}
            </span>
          </div>
        )}

        {/* SUB-TOTAL PENDAPATAN */}
        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
          <span className="text-slate-700 dark:text-slate-200">
            Pendapatan Kotor
          </span>
          <span className="font-mono text-emerald-600 dark:text-emerald-400">
            {formatNumber(totalPendapatanGross)}
          </span>
        </div>
      </div>

      {/* SECTION 2: BIAYA & PROFIT */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-slate-500 dark:text-slate-400">Biaya Ops</span>
          <span className="font-mono font-semibold text-rose-500 dark:text-rose-400">
            {formatNumber(totalExpense)}
          </span>
        </div>

        <div className="pt-2 border-t border-dashed border-slate-200 dark:border-slate-800 space-y-1.5">
          <div className="flex justify-between items-center font-bold">
            <span className="text-slate-700 dark:text-slate-200 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
              Profit (Laba)
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {formatNumber(profit)}
            </span>
          </div>

          <div className="flex justify-between items-center font-bold text-[11px]">
            <span className="text-slate-500 dark:text-slate-400">
              Total Pendapatan Bersih
            </span>
            <span className="font-mono text-emerald-600 dark:text-emerald-400">
              {formatNumber(totalPendapatanNett)}
            </span>
          </div>
        </div>
      </div>

      {/* SECTION 3: TOTAL SETORAN CARD (HIGHLIGHT) */}
      <div className="mt-3 p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-100 dark:border-indigo-900/50 space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
            <Wallet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            Total Uang Disetor
          </span>
        </div>

        {/* Status Warning & Deductions */}
        {isCashLess && (
          <div className="flex items-center gap-1.5 text-rose-500 text-[11px] font-semibold bg-rose-50 dark:bg-rose-950/50 p-2 rounded-xl border border-rose-200/60 dark:border-rose-900/40">
            <CircleAlert className="w-4 h-4 shrink-0" />
            <span>Kas kurang dari uang awal!</span>
          </div>
        )}

        {openingCash > 0 && totalCash > openingCash && (
          <div className="flex justify-between items-center text-[11px] text-indigo-700/80 dark:text-indigo-300/80 font-mono">
            <span>Potongan Modal Awal:</span>
            <span>-{formatNumber(openingCash)}</span>
          </div>
        )}

        {/* Final Amount */}
        <div className="pt-1 flex justify-end items-baseline gap-1 border-t border-indigo-200/50 dark:border-indigo-800/50">
          <span className="text-xl font-black font-mono text-indigo-600 dark:text-indigo-400">
            {formatNumber(finalSetoran)}
          </span>
        </div>
      </div>

      <button
        type="button"
        className="w-full py-2 rounded-xl bg-amber-500 text-white font-semibold text-sm shadow-sm hover:bg-amber-400 active:scale-95 transition-all"
      >
        Tutup Toko
      </button>
    </div>
  );
}
