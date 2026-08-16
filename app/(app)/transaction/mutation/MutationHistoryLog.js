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
  mutateBalance,
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
      return (
        Number(j.debt_id) === Number(accountFilter) ||
        Number(j.cred_id) === Number(accountFilter)
      );
    });
    return macthAccount;
  }, [journals, searchTerm, accountFilter]);

  if (filteredTransactions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
        <FileWarning className="h-8 w-8 text-slate-300 dark:text-slate-600 mb-2" />
        <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          No mutation records found
        </p>
        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
          Try adjusting your search or filter settings.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-2.5">
        {filteredTransactions.map((tx) => (
          <div
            key={tx.id}
            className="flex items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition-colors shadow-2xs"
          >
            {/* SISI KIRI: Icon & Detail Mutasi */}
            <div className="flex items-start gap-3 min-w-0 flex-1">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400 shrink-0 mt-0.5">
                <ArrowRightLeft className="h-4 w-4" />
              </div>

              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 text-[10px] font-semibold font-mono">
                    <CreditCard className="h-3 w-3 text-slate-400" />
                    {tx.cred?.group || tx.cred?.name || "Asal"}
                  </span>
                  <span className="text-slate-400 text-[10px]">→</span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 text-[10px] font-semibold font-mono">
                    <Coins className="h-3 w-3 text-indigo-500" />
                    {tx.debt?.group || tx.debt?.name || "Tujuan"}
                  </span>
                </div>

                <p className="text-xs font-bold leading-snug text-slate-800 dark:text-slate-100 wrap-break-word">
                  {tx.description}
                </p>

                <div className="flex items-center gap-1.5 text-[10px] font-mono text-slate-400 dark:text-slate-500">
                  <Calendar className="h-3 w-3 shrink-0 text-slate-400" />
                  <span>{formatDateTime(tx.date_issued)}</span>
                </div>
              </div>
            </div>

            {/* SISI KANAN: Nominal & Action Button */}
            <div className="flex shrink-0 flex-col items-end justify-between self-stretch pl-2">
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
                response.message || "Mutation entry deleted successfully",
              );
              if (typeof mutate === "function") mutate();
              if (typeof mutateBalance === "function") mutateBalance();
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
