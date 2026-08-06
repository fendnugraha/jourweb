import ConfirmDialog from "@/app/components/ConfirmDialog";
import { deleteJournal } from "@/app/hooks/JournalActionService";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import {
  AlertCircle,
  ArrowRightLeft,
  Calendar,
  Coins,
  CreditCard,
  FileWarning,
  Tag,
  Trash2,
} from "lucide-react";
import { useMemo, useState } from "react";

const MutationHistoryLog = ({
  journals,
  warehouseId,
  setNotification,
  mutate,
  searchTerm,
  accountFilter,
}) => {
  const [txToDelete, setTxToDelete] = useState(null);
  const filteredTransactions = useMemo(() => {
    const macthTrxtype = journals.filter((j) => j.trx_type === "Mutasi Kas");
    const macthSearch = macthTrxtype.filter((j) =>
      j.description.toLowerCase().includes(searchTerm.toLowerCase()),
    );
    const macthAccount = macthSearch.filter((j) => {
      if (accountFilter === "all") return true;
      return j.debt_id === accountFilter || j.cred_id === accountFilter;
    });
    return macthAccount;
  }, [journals, searchTerm, accountFilter]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 w-full">
      {/* CONTAINER SCROLL TABLE */}
      <div className="overflow-x-auto no-scrollbar w-full">
        <table className="w-full border-collapse text-left hidden sm:table">
          {/* HEADER TABLE */}
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
              <th scope="col" className="px-3 sm:px-6 py-3.5">
                Transaction Details
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3.5">
                Category
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3.5">
                Settle Channel
              </th>
              <th scope="col" className="px-3 sm:px-6 py-3.5 text-right">
                Cash Amount
              </th>
              {/* Padding kanan disesuaikan agar simetris pr-4 sm:pr-6 */}
              <th
                scope="col"
                className="px-3 sm:px-6 py-3.5 pr-4 sm:pr-6 text-center"
              >
                Actions
              </th>
            </tr>
          </thead>

          {/* BODY TABLE */}
          <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800 text-slate-700 dark:text-slate-200">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                    <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                      No matching transactions found
                    </p>
                    <p className="text-[10px] text-slate-400">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx) => {
                return (
                  <tr
                    key={tx.id}
                    className="group transition-colors duration-150 hover:bg-slate-50/50 dark:hover:bg-slate-800/40"
                  >
                    {/* Description & Date */}
                    <td className="px-3 sm:px-6 py-3.5 max-w-xs md:max-w-md wrap-break-word">
                      <div className="space-y-1">
                        <span className="font-bold text-slate-800 dark:text-slate-100 block leading-snug">
                          {tx.description}
                        </span>
                        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                          {formatDateTime(tx.date_issued)}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="px-3 sm:px-6 py-3.5 whitespace-nowrap align-middle">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 border border-slate-200/60 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-400">
                        <Tag className="h-3 w-3 text-slate-400 shrink-0" />
                        {tx.trx_type}
                      </span>
                    </td>

                    {/* Settlement Channel */}
                    <td className="px-3 sm:px-6 py-3.5 whitespace-nowrap align-middle">
                      {tx.trx_type === "Mutasi Kas" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 px-2.5 py-1 text-[11px] font-bold text-indigo-600 border border-indigo-100/50 dark:bg-slate-950/40 dark:border-slate-800 dark:text-indigo-400">
                          <ArrowRightLeft className="h-3 w-3 shrink-0 text-indigo-500" />
                          <span>
                            {tx.cred?.group}
                            {tx.cred?.warehouse?.id !== warehouseId && (
                              <span className="text-slate-500 dark:text-slate-400 font-normal ml-0.5">
                                (
                                {tx.cred?.warehouse?.name.replace(
                                  /^konter\s*/i,
                                  "",
                                )}
                                )
                              </span>
                            )}
                          </span>
                          <span className="text-indigo-400">→</span>
                          <span>
                            {tx.debt?.group}
                            {tx.debt?.warehouse?.id !== warehouseId && (
                              <span className="text-slate-500 dark:text-slate-400 font-normal ml-0.5">
                                (
                                {tx.debt?.warehouse?.name.replace(
                                  /^konter\s*/i,
                                  "",
                                )}
                                )
                              </span>
                            )}
                          </span>
                          {tx.debt?.group !== tx.cred?.group && (
                            <FileWarning className="h-3 w-3 animate-bounce text-rose-500 shrink-0" />
                          )}
                        </span>
                      ) : tx.cred_id === warehouseCashId ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 px-2.5 py-1 text-[11px] font-bold text-indigo-600 border border-indigo-100/50 dark:bg-slate-950/40 dark:border-slate-800 dark:text-indigo-400">
                          <CreditCard className="h-3 w-3 shrink-0 text-indigo-500" />
                          {tx.debt?.group || "Cash"}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 px-2.5 py-1 text-[11px] font-bold text-indigo-600 border border-indigo-100/50 dark:bg-slate-950/40 dark:border-slate-800 dark:text-indigo-400">
                          <CreditCard className="h-3 w-3 shrink-0 text-indigo-500" />
                          {tx.cred?.group || "Cash"}
                        </span>
                      )}
                    </td>

                    {/* Cash Amount */}
                    <td className="px-3 sm:px-6 py-3.5 text-right whitespace-nowrap font-mono font-bold align-middle">
                      <span className="text-slate-800 dark:text-slate-100">
                        {formatRupiah(tx.amount)}
                      </span>
                      {tx.fee_amount > 0 && (
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-normal">
                          Fee: {formatNumber(tx.fee_amount)}
                        </span>
                      )}
                    </td>

                    {/* Actions (Dipertahankan ruang kanannya lewat pr-4 sm:pr-6) */}
                    <td className="px-3 sm:px-6 py-3.5 pr-4 sm:pr-6 whitespace-nowrap text-center align-middle">
                      <button
                        type="button"
                        onClick={() => setTxToDelete(tx.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-none focus:ring-2 focus:ring-rose-500/20 transition-all cursor-pointer dark:text-slate-500 dark:hover:bg-rose-950/30 dark:hover:text-rose-400"
                        title="Delete transaction entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Card mode if mobile (< 640px) */}
      <div className="divide-y divide-slate-100 sm:hidden dark:divide-slate-800/60">
        {filteredTransactions.map((tx) => (
          <div
            key={tx.id}
            className="group flex items-start justify-between gap-3 p-4 transition-colors hover:bg-slate-50/60 dark:hover:bg-slate-800/30"
          >
            <div className="min-w-0 flex-1 space-y-2">
              <p className="text-xs font-bold leading-snug text-slate-800 dark:text-slate-100 wrap-break-word">
                {tx.description}
              </p>

              <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                <span>{formatDateTime(tx.date_issued)}</span>
              </div>
            </div>

            {/* SISI KANAN: Nominal & Action Button */}
            <div className="flex shrink-0 flex-col items-end justify-between self-stretch pl-2">
              {/* Nominal Utama */}
              <div className="text-right">
                <span className="block font-mono text-xs font-bold text-slate-900 dark:text-slate-100">
                  {formatRupiah
                    ? formatRupiah(tx.amount)
                    : `Rp ${formatNumber(tx.amount)}`}
                </span>
                {tx.fee_amount > 0 && (
                  <span className="block text-[9px] font-medium text-slate-400 dark:text-slate-500">
                    Fee: {formatNumber(tx.fee_amount)}
                  </span>
                )}
              </div>

              {/* Tombol Hapus / Delete */}
              <button
                type="button"
                onClick={() => setTxToDelete(tx.id)}
                className="mt-2 rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 active:scale-95 transition-all dark:text-slate-500 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 cursor-pointer"
                title="Delete transaction entry"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CONFIRM DELETE DIALOG */}
      <ConfirmDialog
        isOpen={txToDelete !== null}
        onClose={() => setTxToDelete(null)}
        onConfirm={async () => {
          if (txToDelete) {
            try {
              const response = await deleteJournal(txToDelete);
              setTxToDelete(null);
              setNotification(
                response.message || "Failed to delete ledger entry",
              );
              mutate();
            } catch (error) {
              setNotification("Failed to delete ledger entry");
            }
          }
        }}
        title="Delete Ledger Transaction"
        description="Are you absolutely sure you want to delete this bookkeeping entry? This operational ledger action will affect cumulative revenue reports and is irreversible."
      />
    </div>
  );
};

export default MutationHistoryLog;
