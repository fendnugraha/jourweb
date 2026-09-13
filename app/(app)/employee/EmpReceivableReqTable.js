import axios from "@/app/utils/axios";
import { formatDateTime, formatRupiah } from "@/app/utils/format";
import { Check, Contact2, Trash2, X, Clock, CheckCircle2, Inbox, Calendar } from "lucide-react";

export default function RequestTable({ finances = [], setJournalToDelete, notification, mutate }) {
    const handleApprove = async (financeItem) => {
        try {
            const response = await axios.put(`/api/approve-request/${financeItem.id}`);
            notification(response.data?.message || "Pengajuan berhasil disetujui.");
            if (mutate) mutate();
        } catch (error) {
            notification(error.response?.data?.message || "Gagal menyetujui pengajuan.");
        }
    };

    const handleReject = async (financeItem) => {
        try {
            const response = await axios.put(`/api/reject-request/${financeItem.id}`);
            notification(response.data?.message || "Pengajuan berhasil ditolak.");
            if (mutate) mutate();
        } catch (error) {
            notification(error.response?.data?.message || "Gagal menolak pengajuan.");
        }
    };

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all">
            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/70 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-800/40 dark:text-slate-500">
                            <th scope="col" className="px-5 py-4">
                                Detail Pengajuan
                            </th>
                            <th scope="col" className="px-5 py-4">
                                Skema Pembayaran
                            </th>
                            <th scope="col" className="px-5 py-4 text-right">
                                Nominal
                            </th>
                            <th scope="col" className="px-5 py-4 text-center">
                                Status & Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                        {finances.length > 0 ? (
                            finances.map((finance) => {
                                const isPositive = Number(finance.bill_amount) > 0;
                                const amountValue = isPositive ? finance.bill_amount : finance.payment_amount;

                                const isRequest = finance.finance_type?.endsWith(" R");
                                const isPending = finance.payment_status === 0;

                                const isKasbon = finance.finance_type === "EmployeeReceivable R";

                                return (
                                    <tr key={finance.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                        {/* Deskripsi & Meta Info */}
                                        <td className="px-5 py-4">
                                            <div className="flex items-start gap-2.5">
                                                <div className="min-w-0 space-y-1">
                                                    <div className="flex items-center gap-2 flex-wrap">
                                                        <span className="font-bold text-slate-800 dark:text-slate-100 text-sm leading-snug">
                                                            {finance.description}
                                                        </span>
                                                        {isRequest && (
                                                            <span
                                                                className={`inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full border ${
                                                                    isPending
                                                                        ? "bg-amber-50 text-amber-700 border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-900/50"
                                                                        : "bg-emerald-50 text-emerald-700 border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-900/50"
                                                                }`}
                                                            >
                                                                {isPending ? (
                                                                    <>
                                                                        <Clock className="w-3 h-3 text-amber-500 animate-pulse" />
                                                                        <span>Menunggu</span>
                                                                    </>
                                                                ) : (
                                                                    <>
                                                                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                                        <span>Disetujui</span>
                                                                    </>
                                                                )}
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400">
                                                        <span className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                                                            <Contact2 size={13} className="text-indigo-500" />
                                                            {finance.contact?.name || "Karyawan"}
                                                        </span>
                                                        <span className="text-slate-300 dark:text-slate-700">•</span>
                                                        <span className="flex items-center gap-1 text-slate-400">
                                                            <Calendar size={12} />
                                                            {formatDateTime ? formatDateTime(finance.date_issued) : finance.date_issued}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Method / Skema */}
                                        <td className="px-5 py-4 vertical-middle">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium border ${
                                                    isKasbon
                                                        ? "bg-indigo-50/70 text-indigo-700 border-indigo-100 dark:bg-indigo-950/30 dark:text-indigo-300 dark:border-indigo-900/40"
                                                        : "bg-slate-100/70 text-slate-700 border-slate-200/60 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700/50"
                                                }`}
                                            >
                                                {isKasbon ? "Potong Gaji" : finance.finance_type === "InstallmentReceivable R" ? "Cicilan" : "-"}
                                            </span>
                                        </td>

                                        {/* Nominal */}
                                        <td className="px-5 py-4 text-right">
                                            <div className="font-mono font-bold text-sm">
                                                <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                                    {isPositive ? "+" : "-"} {formatRupiah ? formatRupiah(amountValue) : amountValue}
                                                </span>
                                            </div>
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-center gap-1.5">
                                                {isRequest && isPending ? (
                                                    <>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleApprove(finance)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded-xl font-medium text-xs dark:bg-emerald-950/50 dark:text-emerald-400 dark:hover:bg-emerald-600 dark:hover:text-white transition-all cursor-pointer shadow-xs"
                                                            title="Setujui Pengajuan"
                                                        >
                                                            <Check size={14} className="stroke-3" />
                                                            <span>Setujui</span>
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleReject(finance)}
                                                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white rounded-xl font-medium text-xs dark:bg-rose-950/50 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white transition-all cursor-pointer shadow-xs"
                                                            title="Tolak Pengajuan"
                                                        >
                                                            <X size={14} className="stroke-3" />
                                                            <span>Tolak</span>
                                                        </button>
                                                    </>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        onClick={() => setJournalToDelete(finance.id)}
                                                        className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                                                        title="Hapus Transaksi"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={4} className="px-6 py-12 text-center">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                                            <Inbox className="h-6 w-6" />
                                        </div>
                                        <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Belum ada pengajuan</p>
                                        <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs">
                                            Transaksi atau pengajuan kasbon terbaru pada kontak ini akan muncul di sini.
                                        </p>
                                    </div>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
