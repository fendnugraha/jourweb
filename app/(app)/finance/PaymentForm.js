import Dropdown from "@/app/components/Dropdown";
import { useGetFinanceByContactId } from "@/app/hooks/useGetFinanceByContactId";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatNumber } from "@/app/utils/format";
import { AlertCircle, Calendar, CreditCard, DollarSign, FileCheck, Loader2, UserCheck, Wallet } from "lucide-react";
import { useState } from "react";

const PaymentForm = ({ accounts = [], type, contactId, notification, fetchFinance, isModalOpen }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        contact_id: contactId,
        invoice: "",
        account_id: "",
        amount: "",
        notes: "",
    });
    const [formError, setFormError] = useState("");
    const { financeData = [], mutate } = useGetFinanceByContactId({ contactId, type });
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState("");
    const [errors, setErrors] = useState(null);

    const accountOptions = [
        { value: "", label: "-- Pilih Rekening Pembayaran --" },
        ...accounts
            .filter((account) => account.warehouse_id === 1)
            .map((account) => ({
                value: account.id,
                label: account.name,
            })),
    ];

    const invoiceOptions = [
        { value: "", label: "-- Pilih Invoice Tagihan --" },
        ...financeData
            .filter((finance) => finance.sisa > 0)
            .map((finance) => ({
                value: finance.invoice,
                label: `${finance.invoice} • Sisa: Rp ${formatNumber(finance.sisa)}`,
            })),
    ];

    const selectedInvoiceData = financeData.find((finance) => finance.invoice === selectedInvoice);
    const contactName = financeData[0]?.contact?.name;

    const setPercentageAmount = (percentage) => {
        if (!selectedInvoiceData?.sisa) return;
        const calculated = Math.round((selectedInvoiceData.sisa * percentage) / 100);
        setFormData((prev) => ({ ...prev, amount: String(calculated) }));
        if (formError) setFormError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormError("");
        setErrors(null);

        if (!formData.invoice) {
            setFormError("Silakan pilih invoice terlebih dahulu.");
            return;
        }
        if (!formData.account_id) {
            setFormError("Silakan pilih rekening pembayaran.");
            return;
        }

        const numericAmount = parseFloat(formData.amount);
        if (isNaN(numericAmount) || numericAmount <= 0) {
            setFormError("Nominal pembayaran harus lebih dari Rp 0.");
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post("/api/store-payment", formData);
            notification(response.data?.message || "Pembayaran berhasil disimpan.");
            if (mutate) mutate();
            if (fetchFinance) fetchFinance();
            if (isModalOpen) isModalOpen(false);
        } catch (error) {
            const msg = error.response?.data?.message || "Gagal menyimpan transaksi pembayaran.";
            setFormError(msg);
            setErrors(error.response?.data?.errors || null);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Context Badge Kontak & Status */}
            {contactName && (
                <div className="flex items-center justify-between rounded-xl bg-indigo-50/60 p-3 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/40">
                    <div className="flex items-center gap-2">
                        <UserCheck className="h-4 w-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Pelanggan / Kontak</p>
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{contactName}</p>
                        </div>
                    </div>
                    <span className="rounded-full bg-indigo-100 dark:bg-indigo-900/60 px-2.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
                        {type === "receivable" ? "Piutang" : "Hutang"}
                    </span>
                </div>
            )}

            {/* Error Notification Alert */}
            {formError && (
                <div className="rounded-xl border border-rose-200 bg-rose-50/80 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-300 space-y-1">
                    <div className="flex items-center gap-2 font-semibold">
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span>{formError}</span>
                    </div>
                    {errors && typeof errors === "object" && (
                        <ul className="pl-6 list-disc text-[11px] space-y-0.5 text-rose-600 dark:text-rose-400">
                            {Object.entries(errors).map(([key, errMsgs]) => (
                                <li key={key}>{Array.isArray(errMsgs) ? errMsgs[0] : errMsgs}</li>
                            ))}
                        </ul>
                    )}
                </div>
            )}

            {/* SECTION 1: Detail Tagihan & Rekening */}
            <div className="space-y-3">
                <div className="space-y-1">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <FileCheck className="h-3.5 w-3.5 text-slate-400" />
                        <span>Pilih Invoice Tagihan</span>
                        <span className="text-rose-500">*</span>
                    </label>
                    <Dropdown
                        id="tx-invoice"
                        label="Pilih Invoice"
                        options={invoiceOptions}
                        selectedValue={formData.invoice}
                        onChange={(val) => {
                            setFormData({ ...formData, invoice: val, amount: "" });
                            setSelectedInvoice(val);
                            if (formError) setFormError("");
                        }}
                    />
                </div>

                {/* Highlight Card Sisa Tagihan */}
                {selectedInvoiceData && (
                    <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-3 dark:border-emerald-900/40 dark:bg-emerald-950/20 flex items-center justify-between">
                        <div>
                            <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400">Sisa Tagihan Invoice Ini</p>
                            <p className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">Rp {formatNumber(selectedInvoiceData.sisa)}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setPercentageAmount(100)}
                            className="rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-xs hover:bg-emerald-500 transition-colors cursor-pointer"
                        >
                            Bayar Lunas
                        </button>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                        <label htmlFor="tx-date" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Calendar className="h-3.5 w-3.5 text-slate-400" />
                            <span>Tanggal Transaksi</span>
                        </label>
                        <input
                            id="tx-date"
                            type="datetime-local"
                            required
                            value={formData.date_issued}
                            onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-medium text-slate-800 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 transition-colors"
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                            <Wallet className="h-3.5 w-3.5 text-slate-400" />
                            <span>Rekening Pembayaran</span>
                            <span className="text-rose-500">*</span>
                        </label>
                        <Dropdown
                            id="tx-account"
                            label="Pilih Rekening"
                            options={accountOptions}
                            selectedValue={formData.account_id}
                            onChange={(val) => {
                                setFormData({ ...formData, account_id: val });
                                if (formError) setFormError("");
                            }}
                        />
                    </div>
                </div>
            </div>

            <hr className="border-slate-100 dark:border-slate-800" />

            {/* SECTION 2: Nominal & Quick Presets */}
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <label htmlFor="tx-amount" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                        <DollarSign className="h-3.5 w-3.5 text-slate-400" />
                        <span>Jumlah Setoran / Bayar</span>
                        <span className="text-rose-500">*</span>
                    </label>

                    {/* Quick Percentage Presets */}
                    {selectedInvoiceData?.sisa > 0 && (
                        <div className="flex items-center gap-1">
                            {[25, 50, 75].map((pct) => (
                                <button
                                    key={pct}
                                    type="button"
                                    onClick={() => setPercentageAmount(pct)}
                                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600 hover:bg-indigo-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors cursor-pointer"
                                >
                                    {pct}%
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="relative flex items-center">
                    <span className="pointer-events-none absolute left-3.5 font-mono text-xs font-bold text-slate-400">Rp</span>
                    <input
                        id="tx-amount"
                        type="number"
                        min="1"
                        step="any"
                        required
                        value={formData.amount}
                        onChange={(e) => {
                            setFormData({ ...formData, amount: e.target.value });
                            if (formError) setFormError("");
                        }}
                        placeholder="0"
                        className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-9 pr-3.5 text-base font-bold font-mono text-slate-800 placeholder-slate-300 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-600 transition-colors"
                    />
                </div>

                {formData.amount && !isNaN(parseFloat(formData.amount)) && parseFloat(formData.amount) > 0 && (
                    <div className="flex items-center justify-between text-[11px] font-mono px-1">
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            Terbaca: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                        </span>
                        {selectedInvoiceData?.sisa && (
                            <span className="text-slate-400">
                                Sisa Akhir: Rp {formatNumber(Math.max(0, selectedInvoiceData.sisa - parseFloat(formData.amount)))}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* SECTION 3: Catatan */}
            <div className="space-y-1">
                <label htmlFor="tx-desc" className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                    <span>Catatan / Keterangan (Opsional)</span>
                </label>
                <input
                    id="tx-desc"
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Contoh: Pembayaran angsuran ke-2 via Transfer"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder-slate-500 transition-colors"
                />
            </div>

            {/* Form Action Buttons */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => isModalOpen && isModalOpen(false)}
                    disabled={loading}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-750 transition-colors cursor-pointer disabled:opacity-50"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    disabled={loading || !formData.invoice || !formData.account_id || !formData.amount}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-5 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-500 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed min-w-32.5"
                >
                    {loading ? (
                        <>
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                            <span>Memproses...</span>
                        </>
                    ) : (
                        <span>Simpan Transaksi</span>
                    )}
                </button>
            </div>
        </form>
    );
};

export default PaymentForm;
