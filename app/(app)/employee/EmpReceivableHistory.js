"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet2, Receipt, Clock, CheckCircle2, AlertCircle, Trash2, Search, RefreshCw, Plus, X, Inbox, Loader2, XCircle } from "lucide-react";
import { useAuth } from "@/app/utils/auth";
import { useFinances } from "@/app/hooks/useFinance";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatDate, formatRupiah } from "@/app/utils/format";

export default function EmpReceivableHistory({ onSwitchToForm, onClose }) {
    const { user, mutate: mutateAuth } = useAuth({ middleware: "auth" });
    const { today } = DateTimeNow();

    const [statusFilter, setStatusFilter] = useState("all"); // "all" | "pending" | "approved" | "paid"
    const [searchTerm, setSearchTerm] = useState("");
    const [cancellingId, setCancellingId] = useState(null);
    const [actionMessage, setActionMessage] = useState(null);

    const contactId = user?.contact?.id;

    // Ambil data transaksi keuangan untuk kontak pengguna (rentang 1 tahun)
    const { finances, loading, isValidating, mutate } = useFinances({
        contact: contactId || "null",
        financeType: "All",
        start: "2025-01-01",
        end: today || "2027-12-31",
    });

    // Filter hanya transaksi piutang karyawan & cicilan
    const receivableItems = useMemo(() => {
        if (!Array.isArray(finances)) return [];

        const validTypes = [
            "EmployeeReceivable R",
            "InstallmentReceivable R",
            "IInstallmentReceivable R",
            "EmployeeReceivable X",
            "InstallmentReceivable X",
            "EmployeeReceivable",
            "InstallmentReceivable",
        ];

        return finances
            .filter((item) => validTypes.includes(item.finance_type))
            .map((item) => {
                const isRequest = item.finance_type.endsWith(" R");
                const isRejected = item.finance_type.endsWith(" X");
                const bill = parseFloat(item.bill_amount || 0);
                const paid = parseFloat(item.payment_amount || 0);
                const remaining = bill - paid;

                let statusKey = "approved";
                let statusLabel = "Disetujui";
                let badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60";

                if (isRequest) {
                    statusKey = "pending";
                    statusLabel = "Menunggu";
                    badgeClass = "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60";
                } else if (isRejected) {
                    statusKey = "rejected";
                    statusLabel = "Ditolak";
                    badgeClass = "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60";
                } else if (paid >= bill && bill > 0) {
                    statusKey = "paid";
                    statusLabel = "Lunas";
                    badgeClass = "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
                } else if (paid > 0) {
                    statusKey = "partial";
                    statusLabel = "Dicicil";
                    badgeClass = "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-900/60";
                }

                const isKasbon = item.finance_type.includes("EmployeeReceivable");

                return {
                    ...item,
                    isRequest,
                    isKasbon,
                    bill,
                    paid,
                    remaining,
                    statusKey,
                    statusLabel,
                    badgeClass,
                };
            });
    }, [finances]);

    // Filter berdasarkan status tab & pencarian
    const filteredList = useMemo(() => {
        return receivableItems.filter((item) => {
            // Filter Status
            if (statusFilter === "pending" && item.statusKey !== "pending") return false;
            if (statusFilter === "approved" && item.statusKey !== "approved" && item.statusKey !== "partial") return false;
            if (statusFilter === "rejected" && item.statusKey !== "rejected") return false;
            if (statusFilter === "paid" && item.statusKey !== "paid") return false;

            // Search Term
            if (searchTerm.trim()) {
                const term = searchTerm.toLowerCase();
                const desc = (item.description || "").toLowerCase();
                const inv = (item.invoice || "").toLowerCase();
                return desc.includes(term) || inv.includes(term);
            }

            return true;
        });
    }, [receivableItems, statusFilter, searchTerm]);

    // Hitung ringkasan pending
    const pendingCount = useMemo(() => {
        return receivableItems.filter((item) => item.isRequest).length;
    }, [receivableItems]);

    // Handler pembatalan pengajuan yang masih pending
    const handleCancelRequest = async (id) => {
        if (!confirm("Apakah Anda yakin ingin membatalkan pengajuan ini?")) return;

        setCancellingId(id);
        setActionMessage(null);

        try {
            const res = await axios.delete(`/api/finance/${id}`);
            setActionMessage({
                type: "success",
                text: res.data?.message || "Pengajuan berhasil dibatalkan.",
            });
            mutate();
            if (mutateAuth) mutateAuth();
        } catch (error) {
            console.error("Gagal membatalkan pengajuan:", error);
            setActionMessage({
                type: "error",
                text: error.response?.data?.message || "Gagal membatalkan pengajuan.",
            });
        } finally {
            setCancellingId(null);
        }
    };

    return (
        <div className="space-y-3.5">
            {/* 1. Header Filter & Summary Strip */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                    {[
                        { id: "all", label: "Semua" },
                        {
                            id: "pending",
                            label: `Menunggu ${pendingCount > 0 ? `(${pendingCount})` : ""}`,
                        },
                        { id: "approved", label: "Disetujui" },
                        { id: "rejected", label: "Ditolak" },
                        { id: "paid", label: "Lunas" },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setStatusFilter(tab.id)}
                            className={`rounded-lg px-2.5 py-1 text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                                statusFilter === tab.id
                                    ? "bg-indigo-600 text-white shadow-xs dark:bg-indigo-500"
                                    : "bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                            }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => mutate()}
                    disabled={isValidating}
                    title="Muat Ulang"
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-500 dark:hover:text-slate-300 dark:hover:bg-slate-800 transition-colors shrink-0 cursor-pointer"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isValidating ? "animate-spin text-indigo-500" : ""}`} />
                </button>
            </div>

            {/* 2. Search Input */}
            {receivableItems.length > 3 && (
                <div className="relative">
                    <Search className="absolute inset-y-0 left-0 my-auto ml-2.5 h-3.5 w-3.5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cari alasan atau no invoice..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full rounded-xl border border-slate-200 bg-white py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-1 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                    />
                    {searchTerm && (
                        <button
                            type="button"
                            onClick={() => setSearchTerm("")}
                            className="absolute inset-y-0 right-0 my-auto mr-2.5 text-slate-400 hover:text-slate-600"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                </div>
            )}

            {/* 3. Feedback Banner */}
            <AnimatePresence>
                {actionMessage && (
                    <motion.div
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        className={`flex items-center justify-between rounded-xl p-2.5 text-xs ${
                            actionMessage.type === "success"
                                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                                : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300"
                        }`}
                    >
                        <span>{actionMessage.text}</span>
                        <button type="button" onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600">
                            <X className="h-3.5 w-3.5" />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* 4. Daftar Riwayat Pengajuan (Card-List) */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-0.5 no-scrollbar">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
                        <Loader2 className="h-6 w-6 animate-spin text-indigo-500 mb-2" />
                        <span className="text-xs">Memuat riwayat pengajuan...</span>
                    </div>
                ) : filteredList.length > 0 ? (
                    filteredList.map((item) => {
                        const IconComponent = item.isKasbon ? Wallet2 : Receipt;

                        return (
                            <motion.div
                                key={item.id || item.invoice}
                                initial={{ opacity: 0, y: 6 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group relative rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs hover:border-slate-300 dark:border-slate-800 dark:bg-slate-800/60 dark:hover:border-slate-700 transition-all"
                            >
                                {/* Baris Atas: Icon Tipe, Tanggal, & Badge Status */}
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex items-center gap-2 min-w-0">
                                        <div
                                            className={`rounded-lg p-1.5 shrink-0 ${
                                                item.isKasbon
                                                    ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400"
                                                    : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400"
                                            }`}
                                        >
                                            <IconComponent className="h-3.5 w-3.5" />
                                        </div>
                                        <div className="min-w-0">
                                            <span className="text-xs font-bold text-slate-800 dark:text-slate-100">{item.isKasbon ? "Kasbon" : "Cicilan"}</span>
                                            <span className="text-[10px] text-slate-400 block font-mono">{formatDate(item.date_issued)}</span>
                                        </div>
                                    </div>

                                    {/* Status Badge */}
                                    <div className="flex items-center gap-1.5 shrink-0">
                                        <span
                                            className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${item.badgeClass}`}
                                        >
                                            {item.statusKey === "pending" ? (
                                                <Clock className="h-2.5 w-2.5 animate-pulse" />
                                            ) : item.statusKey === "rejected" ? (
                                                <XCircle className="h-2.5 w-2.5" />
                                            ) : item.statusKey === "paid" ? (
                                                <CheckCircle2 className="h-2.5 w-2.5" />
                                            ) : (
                                                <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                            )}
                                            <span>{item.statusLabel}</span>
                                        </span>
                                    </div>
                                </div>

                                {/* Baris Tengah: Nominal & Sisa */}
                                <div className="mt-2.5 flex items-baseline justify-between border-t border-slate-100 pt-2 dark:border-slate-800">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-[11px] text-slate-600 dark:text-slate-300 line-clamp-2">{item.description || "Tanpa keterangan"}</p>
                                    </div>
                                    <div className="text-right shrink-0 ml-3">
                                        <span className="font-mono text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-50">
                                            {formatRupiah(item.bill)}
                                        </span>
                                        {item.statusKey === "partial" && (
                                            <span className="block text-[10px] font-mono text-rose-500 font-medium">Sisa: {formatRupiah(item.remaining)}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Baris Bawah: Tombol Batalkan jika masih Pending */}
                                {item.isRequest && (
                                    <div className="mt-2 flex items-center justify-between border-t border-dashed border-slate-200/80 pt-1.5 dark:border-slate-800">
                                        <span className="text-[10px] text-slate-400">Menunggu verifikasi admin</span>
                                        <button
                                            type="button"
                                            onClick={() => handleCancelRequest(item.id)}
                                            disabled={cancellingId === item.id}
                                            className="inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40 transition-colors cursor-pointer disabled:opacity-50"
                                        >
                                            {cancellingId === item.id ? <Loader2 className="h-2.5 w-2.5 animate-spin" /> : <Trash2 className="h-2.5 w-2.5" />}
                                            <span>Batalkan</span>
                                        </button>
                                    </div>
                                )}
                            </motion.div>
                        );
                    })
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 px-4 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500 mb-2.5">
                            <Inbox className="h-6 w-6" />
                        </div>
                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                            {statusFilter === "all" ? "Belum Ada Pengajuan" : `Tidak ada pengajuan berstatus "${statusFilter}"`}
                        </h4>
                        <p className="mt-0.5 text-[11px] text-slate-400 max-w-xs">
                            Pengajuan kasbon atau cicilan yang Anda buat akan muncul di sini beserta status persetujuannya.
                        </p>

                        {onSwitchToForm && (
                            <button
                                type="button"
                                onClick={onSwitchToForm}
                                className="mt-3.5 inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                <span>Ajukan Sekarang</span>
                            </button>
                        )}
                    </div>
                )}
            </div>

            {/* 5. Bottom Navigation Bar */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                {onSwitchToForm && (
                    <button
                        type="button"
                        onClick={onSwitchToForm}
                        className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 cursor-pointer"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Form Pengajuan Baru</span>
                    </button>
                )}

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-xl border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                    >
                        Tutup
                    </button>
                )}
            </div>
        </div>
    );
}
