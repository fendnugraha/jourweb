import ConfirmDialog from "@/app/components/ConfirmDialog";
import { deleteJournal } from "@/app/hooks/JournalActionService";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, ArrowRightLeft, Calendar, Coins, CreditCard, FileWarning, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const MutationHistoryLog = ({ journals, warehouseId, setNotification, mutate }) => {
    const [txToDelete, setTxToDelete] = useState(null);
    const filteredTransactions = useMemo(() => {
        const macthTrxtype = journals.filter((j) => j.trx_type === "Mutasi Kas");
        return macthTrxtype || [];
    }, [journals]);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                            <th scope="col" className="px-6 py-4">
                                Transaction Details
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Category
                            </th>
                            <th scope="col" className="px-6 py-4">
                                Settle Channel
                            </th>
                            <th scope="col" className="px-6 py-4 text-right">
                                Cash Amount
                            </th>
                            <th scope="col" className="px-6 py-4 text-center">
                                Actions
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                        {filteredTransactions.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                                        <p className="font-semibold text-xs">No matching transactions found</p>
                                        <p className="text-[10px] text-slate-400">Try adjusting your filters or search query</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            filteredTransactions.map((tx) => {
                                return (
                                    <tr key={tx.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                        {/* Description & Date */}
                                        <td className="px-6 py-4 max-w-xs md:max-w-md text-wrap wrap-break-word">
                                            <div className="space-y-1">
                                                {/* 'truncate' dihapus agar teks bebas turun ke bawah */}
                                                <span className="font-bold text-slate-800 dark:text-slate-100 block">{tx.description}</span>
                                                <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDateTime(tx.date_issued)}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Category */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-400">
                                                <Tag className="h-3 w-3 text-slate-400" />
                                                {tx.trx_type}
                                            </span>
                                        </td>

                                        {/* Settlement Channel */}
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {tx.trx_type === "Mutasi Kas" ? (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-600 border border-indigo-100/30 dark:bg-slate-950/40 dark:border-slate-800 dark:text-indigo-400">
                                                    <ArrowRightLeft className="h-3 w-3" />
                                                    {tx.cred?.group}
                                                    {tx.cred?.warehouse?.id !== warehouseId && (
                                                        <span className="text-slate-500 dark:text-slate-400">
                                                            ({tx.cred?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                        </span>
                                                    )}{" "}
                                                    {"->"} {tx.debt?.group}{" "}
                                                    {tx.debt?.warehouse?.id !== warehouseId && (
                                                        <span className="text-slate-500 dark:text-slate-400">
                                                            ({tx.debt?.warehouse?.name.replace(/^konter\s*/i, "")})
                                                        </span>
                                                    )}
                                                    {tx.debt?.group !== tx.cred?.group && <FileWarning className="h-3 w-3 animate-bounce text-red-400" />}
                                                </span>
                                            ) : tx.cred_id === warehouseCashId ? (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-600 border border-indigo-100/30 dark:bg-slate-950/40 dark:border-slate-800 dark:text-indigo-400">
                                                    <CreditCard className="h-3 w-3" />
                                                    {tx.debt?.group || "Cash"}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50/70 px-2.5 py-1 text-xs font-bold text-indigo-600 border border-indigo-100/30 dark:bg-slate-950/40 dark:border-slate-800 dark:text-indigo-400">
                                                    <CreditCard className="h-3 w-3" />
                                                    {tx.cred?.group || "Cash"}
                                                </span>
                                            )}
                                        </td>

                                        {/* Amount with Rupiah custom formatting */}
                                        <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold">
                                            <span className="text-slate-800 dark:text-slate-100">
                                                {formatRupiah(tx.amount)}
                                                <span className="text-slate-500 dark:text-slate-400 block" hidden={tx.fee_amount === 0}>
                                                    {formatNumber(tx.fee_amount)}
                                                </span>
                                            </span>
                                        </td>

                                        {/* Delete Action with SWR Sync */}
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <button
                                                type="button"
                                                onClick={() => setTxToDelete(tx.id)}
                                                className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 transition-all dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-rose-400"
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
            <ConfirmDialog
                isOpen={txToDelete !== null}
                onClose={() => setTxToDelete(null)}
                onConfirm={async () => {
                    if (txToDelete) {
                        try {
                            const response = await deleteJournal(txToDelete);
                            setTxToDelete(null);
                            setNotification(response.message || "Failed to delete ledger entry");
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
