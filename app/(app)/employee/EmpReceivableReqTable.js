import axios from "@/app/utils/axios";
import { formatDateTime, formatRupiah } from "@/app/utils/format";
import { Check, Contact2, Trash2, X, Clock, CheckCircle2, Inbox, Calendar, CheckSquare, Square, Loader2, Scissors, LayoutList, Wallet2 } from "lucide-react";
import { useState } from "react";

// Badge skema pembayaran yang jelas beda tampilannya
function SchemaBadge({ financeType }) {
    const isKasbon = financeType === "EmployeeReceivable R";
    const isCicilan = financeType === "InstallmentReceivable R";

    if (isKasbon) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-violet-100 text-violet-700 border border-violet-200 dark:bg-violet-950/50 dark:text-violet-300 dark:border-violet-800/60">
                <Scissors className="w-3 h-3 shrink-0" />
                Potong Gaji
            </span>
        );
    }
    if (isCicilan) {
        return (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-950/50 dark:text-sky-300 dark:border-sky-800/60">
                <LayoutList className="w-3 h-3 shrink-0" />
                Cicilan
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 text-slate-500 border border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700">
            <Wallet2 className="w-3 h-3 shrink-0" />
            Lainnya
        </span>
    );
}

// Badge status pengajuan
function StatusBadge({ isPending }) {
    if (isPending) {
        return (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200/70 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800/50">
                <Clock className="w-2.5 h-2.5 animate-pulse" />
                Menunggu
            </span>
        );
    }
    return (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50">
            <CheckCircle2 className="w-2.5 h-2.5" />
            Disetujui
        </span>
    );
}

export default function RequestTable({ finances = [], setJournalToDelete, notification, mutate }) {
    const [selectedIds, setSelectedIds] = useState([]);
    const [batchLoading, setBatchLoading] = useState(null); // "approve" | "reject" | null

    const selectableFinances = finances.filter((f) => f.finance_type?.endsWith(" R") && f.payment_status === 0);
    const allSelected = selectableFinances.length > 0 && selectableFinances.every((f) => selectedIds.includes(f.id));
    const someSelected = selectedIds.length > 0;

    const toggleAll = () => {
        setSelectedIds(allSelected ? [] : selectableFinances.map((f) => f.id));
    };

    const toggleOne = (id) => {
        setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
    };

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

    const handleBatchApprove = async () => {
        if (!selectedIds.length) return;
        setBatchLoading("approve");
        try {
            const response = await axios.post("/api/approve-request-batch", { finance_ids: selectedIds });
            notification(response.data?.message || `${selectedIds.length} pengajuan berhasil disetujui.`);
            setSelectedIds([]);
            if (mutate) mutate();
        } catch (error) {
            notification(error.response?.data?.message || "Gagal menyetujui pengajuan secara massal.");
        } finally {
            setBatchLoading(null);
        }
    };

    const handleBatchReject = async () => {
        if (!selectedIds.length) return;
        setBatchLoading("reject");
        try {
            const response = await axios.post("/api/reject-request-batch", { finance_ids: selectedIds });
            notification(response.data?.message || `${selectedIds.length} pengajuan berhasil ditolak.`);
            setSelectedIds([]);
            if (mutate) mutate();
        } catch (error) {
            notification(error.response?.data?.message || "Gagal menolak pengajuan secara massal.");
        } finally {
            setBatchLoading(null);
        }
    };

    return (
        <div className="w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all">
            {/* Batch Action Toolbar */}
            {someSelected && (
                <div className="flex items-center justify-between gap-3 px-4 py-2.5 bg-indigo-50 dark:bg-indigo-950/30 border-b border-indigo-200/70 dark:border-indigo-800/40">
                    <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">{selectedIds.length} pengajuan dipilih</span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={handleBatchApprove}
                            disabled={!!batchLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 shadow-xs"
                        >
                            {batchLoading === "approve" ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} className="stroke-3" />}
                            Setujui Semua
                        </button>
                        <button
                            type="button"
                            onClick={handleBatchReject}
                            disabled={!!batchLoading}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-semibold text-xs transition-all cursor-pointer disabled:opacity-60 shadow-xs"
                        >
                            {batchLoading === "reject" ? <Loader2 size={13} className="animate-spin" /> : <X size={13} className="stroke-3" />}
                            Tolak Semua
                        </button>
                        <button
                            type="button"
                            onClick={() => setSelectedIds([])}
                            disabled={!!batchLoading}
                            className="px-2.5 py-1.5 text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-white dark:hover:bg-slate-800 transition-colors cursor-pointer"
                        >
                            Batal
                        </button>
                    </div>
                </div>
            )}

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-left">
                    <thead>
                        <tr className="border-b border-slate-100 bg-slate-50/80 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800/80 dark:bg-slate-800/50 dark:text-slate-500">
                            <th scope="col" className="pl-4 pr-2 py-3.5 w-10">
                                {selectableFinances.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={toggleAll}
                                        className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                        title={allSelected ? "Batalkan semua" : "Pilih semua"}
                                    >
                                        {allSelected ? <CheckSquare size={15} className="text-indigo-600 dark:text-indigo-400" /> : <Square size={15} />}
                                    </button>
                                )}
                            </th>
                            <th scope="col" className="px-4 py-3.5">
                                Karyawan &amp; Detail
                            </th>
                            <th scope="col" className="px-4 py-3.5">
                                Skema
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-right">
                                Nominal
                            </th>
                            <th scope="col" className="px-4 py-3.5 text-center">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100/80 dark:divide-slate-800/50">
                        {finances.length > 0 ? (
                            finances.map((finance) => {
                                const isPositive = Number(finance.bill_amount) > 0;
                                const amountValue = isPositive ? finance.bill_amount : finance.payment_amount;

                                const isRequest = finance.finance_type?.endsWith(" R");
                                const isPending = finance.payment_status === 0;
                                const isSelectable = isRequest && isPending;
                                const isChecked = selectedIds.includes(finance.id);

                                return (
                                    <tr
                                        key={finance.id}
                                        className={`group transition-colors ${
                                            isChecked ? "bg-indigo-50/70 dark:bg-indigo-950/20" : "hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                                        }`}
                                    >
                                        {/* Checkbox */}
                                        <td className="pl-4 pr-2 py-4 w-10 align-middle">
                                            {isSelectable ? (
                                                <button
                                                    type="button"
                                                    onClick={() => toggleOne(finance.id)}
                                                    className="text-slate-300 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
                                                >
                                                    {isChecked ? (
                                                        <CheckSquare size={15} className="text-indigo-600 dark:text-indigo-400" />
                                                    ) : (
                                                        <Square size={15} />
                                                    )}
                                                </button>
                                            ) : (
                                                <div className="w-4" />
                                            )}
                                        </td>

                                        {/* Karyawan & Detail */}
                                        <td className="px-4 py-3.5 align-middle">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-100 text-sm leading-snug">
                                                        {finance.description}
                                                    </span>
                                                    {isRequest && <StatusBadge isPending={isPending} />}
                                                </div>
                                                <div className="flex items-center gap-2.5 text-[11px] text-slate-400 dark:text-slate-500">
                                                    <span className="flex items-center gap-1 font-medium text-slate-600 dark:text-slate-400">
                                                        <Contact2 size={12} className="text-indigo-400 shrink-0" />
                                                        {finance.contact?.name || "Karyawan"}
                                                    </span>
                                                    <span className="text-slate-200 dark:text-slate-700">•</span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={11} className="shrink-0" />
                                                        {formatDateTime ? formatDateTime(finance.date_issued) : finance.date_issued}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Skema */}
                                        <td className="px-4 py-3.5 align-middle">
                                            <SchemaBadge financeType={finance.finance_type} />
                                        </td>

                                        {/* Nominal */}
                                        <td className="px-4 py-3.5 text-right align-middle">
                                            <span
                                                className={`font-mono font-bold text-sm tabular-nums ${
                                                    isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
                                                }`}
                                            >
                                                {isPositive ? "+" : "−"}&nbsp;{formatRupiah ? formatRupiah(amountValue) : amountValue}
                                            </span>
                                        </td>

                                        {/* Aksi */}
                                        <td className="px-4 py-3.5 text-center align-middle">
                                            {isRequest && isPending ? (
                                                <div className="inline-flex items-center gap-1.5">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleApprove(finance)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/70 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800/50 dark:hover:bg-emerald-600 dark:hover:text-white transition-all cursor-pointer shadow-xs"
                                                        title="Setujui Pengajuan"
                                                    >
                                                        <Check size={13} strokeWidth={2.5} />
                                                        Setujui
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => handleReject(finance)}
                                                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200/70 hover:bg-rose-600 hover:text-white hover:border-rose-600 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800/50 dark:hover:bg-rose-600 dark:hover:text-white transition-all cursor-pointer shadow-xs"
                                                        title="Tolak Pengajuan"
                                                    >
                                                        <X size={13} strokeWidth={2.5} />
                                                        Tolak
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    type="button"
                                                    onClick={() => setJournalToDelete(finance.id)}
                                                    className="p-1.5 text-slate-300 hover:text-rose-500 hover:bg-rose-50 dark:text-slate-600 dark:hover:text-rose-400 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer"
                                                    title="Hapus Transaksi"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        ) : (
                            <tr>
                                <td colSpan={5} className="px-6 py-14 text-center">
                                    <div className="flex flex-col items-center gap-2">
                                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-400">
                                            <Inbox className="w-6 h-6" />
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
