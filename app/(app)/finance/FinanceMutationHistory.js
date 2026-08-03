import { formatDateTime, formatRupiah } from "@/app/utils/format";
import { Trash2 } from "lucide-react";
import { useMemo } from "react";

const FinanceMutationHistory = ({ finances, findContact, selectedContactId, setJournalToDelete }) => {
    const filteredFinances = useMemo(() => {
        return finances.filter((finance) => finance.contact_id === selectedContactId);
    }, [finances, selectedContactId]);

    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <div>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{findContact.contact_name || "-"}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Sisa: {formatRupiah(Number(findContact.sisa) || 0)}</p>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                {/* Alignment disesuaikan dengan isi selnya */}
                                <th scope="col" className="px-6 py-4 text-left">
                                    Description
                                </th>
                                <th scope="col" className="px-6 py-4 text-right">
                                    Amount
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Action
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                            {filteredFinances.length > 0 ? (
                                filteredFinances.map((finance) => {
                                    const isPositive = finance.bill_amount > 0;
                                    const amountValue = isPositive ? finance.bill_amount : finance.payment_amount;

                                    return (
                                        <tr key={finance.id} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                            <td className="px-6 py-4">
                                                <span className="font-medium capitalize block text-slate-800 dark:text-slate-100">{finance.description}</span>
                                                <span className="text-[10px] text-slate-400 font-normal">{formatDateTime(finance.date_issued)}</span>
                                            </td>
                                            <td
                                                className={`px-6 py-4 text-right font-mono ${isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}`}
                                            >
                                                <span className="font-bold">
                                                    {isPositive ? "+" : "-"} {formatRupiah(amountValue)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setJournalToDelete(finance.id)}
                                                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg transition-colors"
                                                    title="Hapus Transaksi"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                /* State Data Kosong */
                                <tr>
                                    <td colSpan={3} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                                        Tidak ada data keuangan untuk kontak ini.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default FinanceMutationHistory;
