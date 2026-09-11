"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet2, Receipt, AlertCircle, CheckCircle2, Loader2, X, Info, Send, Clock, Plus } from "lucide-react";
import { useAuth } from "@/app/utils/auth";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatRupiah } from "@/app/utils/format";
import EmpReceivableHistory from "./EmpReceivableHistory";

const QUICK_AMOUNTS = [50000, 100000, 200000, 500000, 1000000];
const QUICK_REASONS = ["Darurat Medis", "Keluarga", "Kendaraan", "Kebutuhan Rumah"];

export default function EmpReceivableRequest({
    onClose,
    onSuccess,
    mutate: propMutate,
    defaultTab = "form",
    hasPendingRequest = false,
    pendingRequest = null,
}) {
    const { user, mutate: mutateAuth } = useAuth({ middleware: "auth" });
    const { today } = DateTimeNow();

    const [activeTab, setActiveTab] = useState(defaultTab);
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [isSuccess, setIsSuccess] = useState(false);
    const [submittedData, setSubmittedData] = useState(null);

    const [formData, setFormData] = useState({
        amount: "",
        description: "",
        type: "EmployeeReceivable R",
    });

    const empReceivable = parseFloat(user?.contact?.employee_receivables_sum?.total || 0);
    const instReceivable = parseFloat(user?.contact?.installment_receivables_sum?.total || 0);
    const totalReceivables = empReceivable + instReceivable;

    const handleSelectAmount = (value) => {
        setFormData((prev) => ({ ...prev, amount: String(value) }));
        if (formError) setFormError("");
    };

    const handleQuickReason = (reason) => {
        setFormData((prev) => {
            if (!prev.description) return { ...prev, description: reason };
            if (prev.description.includes(reason)) return prev;
            return { ...prev, description: `${prev.description}, ${reason}` };
        });
        if (formError) setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");

        if (hasPendingRequest) {
            setFormError("Anda masih memiliki pengajuan yang sedang diproses.");
            return;
        }

        const numericAmount = parseFloat(formData.amount);
        if (!numericAmount || isNaN(numericAmount) || numericAmount <= 0) {
            setFormError("Nominal pengajuan harus lebih dari Rp 0.");
            return;
        }
        if (!formData.description?.trim()) {
            setFormError("Keterangan atau alasan pengajuan wajib diisi.");
            return;
        }

        const effectiveContactId = user?.contact?.id;
        if (!effectiveContactId) {
            setFormError("ID Kontak tidak ditemukan. Pastikan akun Anda telah terhubung.");
            return;
        }

        setLoading(true);

        const payload = {
            date_issued: today,
            contact_id: effectiveContactId,
            amount: numericAmount,
            description: formData.description.trim(),
            debt_id: 8,
            cred_id: 1,
            debt_code: 8,
            cred_code: 1,
            type: formData.type,
        };

        try {
            const response = await axios.post("/api/finance", payload);
            setSubmittedData({
                amount: numericAmount,
                type: formData.type === "EmployeeReceivable R" ? "Kasbon" : "Cicilan",
                message: response.data?.message || "Pengajuan kasbon berhasil dikirim.",
            });
            setIsSuccess(true);
            if (mutateAuth) mutateAuth();
            if (propMutate) propMutate();
            if (onSuccess) onSuccess(response.data);
            setTimeout(() => {
                if (onClose) onClose();
            }, 2000);
        } catch (error) {
            console.error("EmpReceivableRequest error:", error);
            const resError =
                error.response?.data?.message || error.response?.data?.errors?.[0] || "Terjadi kesalahan saat mengirim pengajuan. Coba lagi nanti.";
            setFormError(resError);
        } finally {
            setLoading(false);
        }
    };

    if (isSuccess && submittedData) {
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 px-2 text-center"
            >
                <div className="relative mb-4">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/20 dark:text-emerald-400 ring-8 ring-emerald-500/5"
                    >
                        <CheckCircle2 className="h-9 w-9" />
                    </motion.div>
                </div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Pengajuan Berhasil Dikirim!</h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-xs">
                    Pengajuan Anda telah masuk ke sistem dan menunggu persetujuan supervisor/manajemen.
                </p>
                <div className="mt-5 w-full rounded-2xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/60">
                    <div className="flex items-center justify-between text-xs py-1">
                        <span className="text-slate-500 dark:text-slate-400">Jenis Pengajuan</span>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{submittedData.type}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs py-1 border-t border-slate-200/60 dark:border-slate-700/60 mt-1.5 pt-1.5">
                        <span className="text-slate-500 dark:text-slate-400">Nominal Diajukan</span>
                        <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400 text-sm">{formatRupiah(submittedData.amount)}</span>
                    </div>
                </div>
                <div className="mt-6 flex flex-col sm:flex-row gap-2 w-full">
                    <button
                        type="button"
                        onClick={() => {
                            setIsSuccess(false);
                            setActiveTab("history");
                        }}
                        className="w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                    >
                        Lihat Riwayat & Status
                    </button>
                    {onClose && (
                        <button
                            type="button"
                            onClick={onClose}
                            className="w-full rounded-xl border border-slate-300 bg-white py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                        >
                            Tutup
                        </button>
                    )}
                </div>
            </motion.div>
        );
    }

    const isKasbon = formData.type === "EmployeeReceivable R";
    const pendingTypeLabel = pendingRequest?.finance_type?.includes("Installment") ? "Cicilan" : "Kasbon";
    const pendingAmount = parseFloat(pendingRequest?.bill_amount || pendingRequest?.amount || 0);

    return (
        <div className="space-y-4">
            {/* Tab Switcher */}
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1 dark:bg-slate-800/80">
                <button
                    type="button"
                    onClick={() => {
                        setActiveTab("form");
                        setIsSuccess(false);
                    }}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "form"
                            ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Ajukan Baru</span>
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab("history")}
                    className={`flex items-center justify-center gap-1.5 rounded-lg py-1.5 px-3 text-xs font-bold transition-all cursor-pointer ${
                        activeTab === "history"
                            ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                            : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                    }`}
                >
                    <Clock className="h-3.5 w-3.5" />
                    <span>Riwayat & Status</span>
                </button>
            </div>

            {/* Tab Konten */}
            {activeTab === "history" ? (
                <EmpReceivableHistory onSwitchToForm={() => setActiveTab("form")} onClose={onClose} />
            ) : (
                <>
                    {/* LOCK SCREEN: Ada Pengajuan Pending */}
                    {hasPendingRequest ? (
                        <motion.div
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-2xl border border-amber-200 bg-amber-50/80 p-5 dark:border-amber-900/60 dark:bg-amber-950/25 text-center space-y-3"
                        >
                            <div className="flex justify-center">
                                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-950/60 ring-8 ring-amber-500/10">
                                    <Clock className="h-7 w-7 text-amber-600 dark:text-amber-400 animate-pulse" />
                                </div>
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-amber-800 dark:text-amber-200">Pengajuan Sedang Diproses</h3>
                                <p className="mt-1 text-[11px] text-amber-700/80 dark:text-amber-300/70 max-w-xs mx-auto leading-relaxed">
                                    Anda sudah memiliki pengajuan yang menunggu persetujuan. Tidak bisa mengajukan kasbon baru sebelum pengajuan ini selesai.
                                </p>
                            </div>

                            {pendingRequest && (
                                <div className="rounded-xl border border-amber-200/70 bg-white/70 p-3 dark:border-amber-900/40 dark:bg-slate-900/50 text-left space-y-1.5">
                                    <div className="flex items-center justify-between text-[11px]">
                                        <span className="text-slate-500 dark:text-slate-400">Jenis</span>
                                        <span className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1">
                                            {pendingTypeLabel === "Kasbon" ? (
                                                <Wallet2 className="h-3 w-3 text-indigo-500" />
                                            ) : (
                                                <Receipt className="h-3 w-3 text-emerald-500" />
                                            )}
                                            {pendingTypeLabel}
                                        </span>
                                    </div>
                                    {pendingAmount > 0 && (
                                        <div className="flex items-center justify-between text-[11px] border-t border-slate-100 dark:border-slate-800 pt-1.5">
                                            <span className="text-slate-500 dark:text-slate-400">Nominal</span>
                                            <span className="font-mono font-bold text-amber-700 dark:text-amber-300">{formatRupiah(pendingAmount)}</span>
                                        </div>
                                    )}
                                    {pendingRequest?.description && (
                                        <div className="flex items-start justify-between gap-3 text-[11px] border-t border-slate-100 dark:border-slate-800 pt-1.5">
                                            <span className="text-slate-500 dark:text-slate-400 shrink-0">Alasan</span>
                                            <span className="text-slate-600 dark:text-slate-300 text-right line-clamp-2">{pendingRequest.description}</span>
                                        </div>
                                    )}
                                </div>
                            )}

                            <button
                                type="button"
                                onClick={() => setActiveTab("history")}
                                className="w-full rounded-xl bg-amber-600 py-2 text-xs font-bold text-white hover:bg-amber-500 transition-colors cursor-pointer"
                            >
                                Pantau Status Pengajuan
                            </button>
                        </motion.div>
                    ) : (
                        /* FORM PENGAJUAN NORMAL */
                        <form onSubmit={handleSubmit} className="space-y-4">
                            {/* 1. Context Pengaju */}
                            <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-800/40">
                                <div className="flex items-center justify-between gap-2">
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pengaju</p>
                                        <p className="truncate text-xs font-bold text-slate-800 dark:text-slate-200">{user?.name || "Karyawan"}</p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Sisa Piutang</p>
                                        <p className="font-mono text-xs font-bold text-slate-700 dark:text-slate-300">{formatRupiah(totalReceivables)}</p>
                                    </div>
                                </div>
                            </div>

                            {/* 2. Toggle Tipe */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pilih Skema Pengajuan</label>
                                <div className="grid grid-cols-2 gap-2 rounded-2xl bg-slate-100 p-1.5 dark:bg-slate-800/80">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, type: "EmployeeReceivable R" }));
                                            if (formError) setFormError("");
                                        }}
                                        className={`relative flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                                            isKasbon
                                                ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                                                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        <Wallet2 className={`h-4 w-4 shrink-0 ${isKasbon ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                                        <div className="text-left">
                                            <div className="leading-tight font-bold">Kasbon</div>
                                            <div className="text-[9px] opacity-70 font-normal">Potong Gaji Bulan Ini</div>
                                        </div>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setFormData((prev) => ({ ...prev, type: "InstallmentReceivable R" }));
                                            if (formError) setFormError("");
                                        }}
                                        className={`relative flex items-center justify-center gap-2 rounded-xl py-2 px-3 text-xs font-semibold transition-all cursor-pointer ${
                                            !isKasbon
                                                ? "bg-white text-indigo-600 shadow-xs dark:bg-slate-900 dark:text-indigo-400"
                                                : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                        }`}
                                    >
                                        <Receipt className={`h-4 w-4 shrink-0 ${!isKasbon ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`} />
                                        <div className="text-left">
                                            <div className="leading-tight font-bold">Cicilan</div>
                                            <div className="text-[9px] opacity-70 font-normal">Pembayaran Bertahap</div>
                                        </div>
                                    </button>
                                </div>
                            </div>

                            {/* 3. Input Nominal */}
                            <div className="space-y-1.5">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="req-amount" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                        Nominal (IDR) <span className="text-rose-500">*</span>
                                    </label>
                                    {formData.amount && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, amount: "" }))}
                                            className="text-[10px] text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 cursor-pointer transition-colors"
                                        >
                                            Reset
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-mono text-sm font-bold">
                                        Rp
                                    </div>
                                    <input
                                        id="req-amount"
                                        type="number"
                                        min="1000"
                                        step="1000"
                                        required
                                        value={formData.amount}
                                        onChange={(e) => {
                                            setFormData({ ...formData, amount: e.target.value });
                                            if (formError) setFormError("");
                                        }}
                                        placeholder="0"
                                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-11 pr-9 text-base font-bold font-mono text-slate-800 placeholder-slate-300 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 dark:placeholder-slate-600 transition-all"
                                    />
                                    {formData.amount && (
                                        <button
                                            type="button"
                                            onClick={() => setFormData((prev) => ({ ...prev, amount: "" }))}
                                            className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                                {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="flex items-center gap-1.5 px-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 font-mono"
                                    >
                                        <span>Terbaca:</span>
                                        <span>{formatRupiah(formData.amount)}</span>
                                    </motion.div>
                                )}
                                <div className="pt-1">
                                    <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mb-1.5">Pilihan Cepat:</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {QUICK_AMOUNTS.map((val) => {
                                            const isSelected = String(val) === String(formData.amount);
                                            const label = val >= 1000000 ? `${val / 1000000}jt` : `${val / 1000}rb`;
                                            return (
                                                <button
                                                    key={val}
                                                    type="button"
                                                    onClick={() => handleSelectAmount(val)}
                                                    className={`rounded-lg px-2.5 py-1 text-[11px] font-mono font-medium transition-all cursor-pointer ${
                                                        isSelected
                                                            ? "bg-indigo-600 text-white shadow-xs dark:bg-indigo-500"
                                                            : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750"
                                                    }`}
                                                >
                                                    Rp {label}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* 4. Deskripsi */}
                            <div className="space-y-1.5">
                                <label htmlFor="req-desc" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                                    Alasan / Keperluan <span className="text-rose-500">*</span>
                                </label>
                                <textarea
                                    id="req-desc"
                                    rows={2}
                                    required
                                    placeholder="Contoh: Kebutuhan medis mendadak, biaya darurat keluarga..."
                                    value={formData.description}
                                    onChange={(e) => {
                                        setFormData({ ...formData, description: e.target.value });
                                        if (formError) setFormError("");
                                    }}
                                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-850 dark:text-slate-100 dark:placeholder-slate-500 transition-all resize-none"
                                />
                                <div className="flex flex-wrap items-center gap-1">
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 mr-0.5">Saran:</span>
                                    {QUICK_REASONS.map((reason) => (
                                        <button
                                            key={reason}
                                            type="button"
                                            onClick={() => handleQuickReason(reason)}
                                            className="rounded-md border border-slate-200/80 bg-slate-50 px-1.5 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 dark:border-slate-700/60 dark:bg-slate-800/60 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer transition-colors"
                                        >
                                            + {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* 5. Catatan */}
                            <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 p-2.5 text-[11px] text-amber-800 dark:bg-amber-950/20 dark:text-amber-300/90 border border-amber-200/60 dark:border-amber-900/40">
                                <Info className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                                <p className="leading-tight">
                                    Pengajuan akan diteruskan ke manajemen untuk diverifikasi. Pencairan dilakukan setelah pengajuan disetujui.
                                </p>
                            </div>

                            {/* 6. Error */}
                            <AnimatePresence>
                                {formError && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300"
                                        role="alert"
                                    >
                                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                                        <span className="flex-1 leading-snug">{formError}</span>
                                        <button
                                            type="button"
                                            onClick={() => setFormError("")}
                                            className="text-rose-400 hover:text-rose-600 dark:hover:text-rose-200 cursor-pointer"
                                        >
                                            <X className="h-3.5 w-3.5" />
                                        </button>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* 7. Actions */}
                            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                                {onClose && (
                                    <motion.button
                                        whileHover={{ scale: 1.01 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="button"
                                        onClick={onClose}
                                        disabled={loading}
                                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors cursor-pointer disabled:opacity-50"
                                    >
                                        Batal
                                    </motion.button>
                                )}
                                <motion.button
                                    whileHover={{ scale: loading ? 1 : 1.01 }}
                                    whileTap={{ scale: loading ? 1 : 0.98 }}
                                    type="submit"
                                    disabled={loading || !formData.amount || !formData.description?.trim()}
                                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <>
                                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            <span>Memproses...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Send className="h-3.5 w-3.5" />
                                            <span>Kirim Pengajuan</span>
                                        </>
                                    )}
                                </motion.button>
                            </div>
                        </form>
                    )}
                </>
            )}
        </div>
    );
}
