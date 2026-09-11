import axios from "@/app/utils/axios";
import { formatDateTime, formatRupiah } from "@/app/utils/format";
import { Check, Contact2, Trash2, X } from "lucide-react";

export default function RequestTable({ finances = [], setJournalToDelete, notification, mutate }) {
    // Pass ID item secara langsung ke handler tanpa mengandalkan state selectedFinance
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
        <div className="overflow-x-auto rounded-xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <table className="w-full border-collapse text-left">
                <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-900/50">
                        <th scope="col" className="px-6 py-3.5">
                            Deskripsi Pengajuan
                        </th>
                        <th scope="col" className="px-6 py-3.5 text-center">
                            Method
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
                    {finances.length > 0 ? (
                        finances.map((finance) => {
                            const isPositive = Number(finance.bill_amount) > 0;
                            const amountValue = isPositive ? finance.bill_amount : finance.payment_amount;

                            const isRequest = finance.finance_type?.endsWith(" R");
                            const isPending = finance.payment_status === 0;

                            return (
                                <tr key={finance.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/30 transition-colors">
                                    <td className="px-6 py-3.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-semibold capitalize text-slate-800 dark:text-slate-200">{finance.description}</span>
                                            {isRequest && (
                                                <span
                                                    className={`px-1.5 py-0.5 text-[10px] font-bold rounded-md ${
                                                        isPending
                                                            ? "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                                    }`}
                                                >
                                                    {isPending ? "Pending" : "Disetujui"}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-1 mt-0.5">
                                            <Contact2 size={12} className="text-slate-400" />{" "}
                                            <span className="text-slate-600 dark:text-slate-300">{finance.contact?.name || "-"}</span>
                                            <span>•</span>
                                            <span className="text-[10px] text-slate-400 font-normal">
                                                {formatDateTime ? formatDateTime(finance.date_issued) : finance.date_issued}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3.5 text-center">
                                        <span className="text-xs text-slate-500 font-medium">
                                            {finance.finance_type === "EmployeeReceivable R"
                                                ? "Potong Gaji Bulan Ini"
                                                : finance.finance_type === "InstallmentReceivable R"
                                                  ? "Piutang Cicilan"
                                                  : "-"}
                                        </span>
                                    </td>

                                    <td className="px-6 py-3.5 text-right font-mono font-bold">
                                        <span className={isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"}>
                                            {isPositive ? "+" : "-"} {formatRupiah ? formatRupiah(amountValue) : amountValue}
                                        </span>
                                    </td>

                                    <td className="px-6 py-3.5 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            {isRequest && isPending ? (
                                                <>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApprove(finance)}
                                                        className="inline-flex items-center gap-1 p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg transition-colors cursor-pointer"
                                                        title="Setujui Pengajuan"
                                                    >
                                                        <Check size={16} className="stroke-[2.5]" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReject(finance)}
                                                        className="inline-flex items-center gap-1 p-1.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                                        title="Tolak Pengajuan"
                                                    >
                                                        <X size={16} className="stroke-[2.5]" />
                                                    </button>
                                                </>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setJournalToDelete(finance.id)}
                                                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                                    title="Hapus Transaksi"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })
                    ) : (
                        <tr>
                            <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                Belum ada pengajuan transaksi pada kontak ini.
                            </td>
                        </tr>
                    )}
                </tbody>
            </table>
        </div>
    );
}
