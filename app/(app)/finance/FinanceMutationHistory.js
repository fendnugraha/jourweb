import { formatDateTime, formatRupiah } from "@/app/utils/format";
import { Contact2, Trash2, UserCheck } from "lucide-react";
import { useMemo } from "react";

const FinanceMutationHistory = ({ finances = [], findContact, selectedContactId, setJournalToDelete }) => {
    const filteredFinances = useMemo(() => {
        if (!Array.isArray(finances)) return [];
        if (selectedContactId === "All") return finances;
        return finances.filter((finance) => finance.contact_id === selectedContactId);
    }, [finances, selectedContactId]);

    return (
        <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Header Informasi Kontak Terpilih */}
            <div className="flex flex-col gap-2 border-b border-slate-100 bg-slate-50/50 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-950/30">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                        <UserCheck className="h-5 w-5" />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{findContact?.contact_name || "Semua Kontak"}</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Status Transaksi Keuangan</p>
                    </div>
                </div>
                <div className="text-left sm:text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">Total Sisa Tagihan</span>
                    <span className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{formatRupiah(Number(findContact?.sisa) || 0)}</span>
                </div>
            </div>

            {/* Tabel Riwayat Mutasi */}
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/30 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900">
                            <th scope="col" className="px-6 py-3.5">
                                Deskripsi
                            </th>
                            <th scope="col" className="px-6 py-3.5 text-right">
                                Jumlah
                            </th>
                            <th scope="col" className="px-6 py-3.5 text-center">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                        {filteredFinances.length > 0 ? (
                            filteredFinances.map((finance) => {
                                const isPositive = finance.bill_amount > 0;
                                const amountValue = isPositive ? finance.bill_amount : finance.payment_amount;

                                return (
                                    <tr key={finance.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                        <td className="px-6 py-3.5">
                                            <span className="font-semibold capitalize block text-slate-800 dark:text-slate-200">{finance.description}</span>
                                            <div className="flex items-center gap-1">
                                                <Contact2 size={12} className="text-slate-400" />{" "}
                                                <span className="text-slate-600 dark:text-slate-300">{finance.contact?.name}</span>
                                                <span>•</span>
                                                <span className="text-[10px] text-slate-400 font-normal">{formatDateTime(finance.date_issued)}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-3.5 text-right font-mono font-bold">
                                            <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                                {isPositive ? "+" : "-"} {formatRupiah(amountValue)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-3.5 text-center">
                                            <button
                                                type="button"
                                                onClick={() => setJournalToDelete(finance.id)}
                                                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors"
                                                title="Hapus Transaksi"
                                            >
                                                <Trash2 size={15} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                    Belum ada transaksi pada kontak ini.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default FinanceMutationHistory;
