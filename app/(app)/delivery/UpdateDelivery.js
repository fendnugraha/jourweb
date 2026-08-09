/* eslint-disable react-hooks/set-state-in-effect */
import Dropdown from "@/app/components/Dropdown";
import { AlertCircle, Loader2, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "@/app/utils/axios";
import { getLocationPromise } from "@/app/utils/format";

export default function UpdateDelivery({ selectedDelivery, isModalOpen, notification, mutate }) {
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formData, setFormData] = useState({
        status: "",
        amount: "",
        note: "",
    });

    // Load data awal saat delivery dipilih
    useEffect(() => {
        if (selectedDelivery) {
            setFormData({
                status: selectedDelivery.status || "",
                amount: selectedDelivery.amount || "",
                note: selectedDelivery.note || "",
            });
            setFormError(""); // Reset error saat modal terbuka dengan data baru
        }
    }, [selectedDelivery]);

    const statusOptions = [
        { value: "", label: "Pilih Status" },
        { value: "pending", label: "Pending (Menunggu Pick-up)" },
        { value: "in_transit", label: "Proses (Dalam Pengiriman)" },
        { value: "delivered", label: "Selesai (Sampai Tujuan)" },
        { value: "picked_up", label: "Di Ambil (Pick Up)" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError("");

        let locationData = { latitude: null, longitude: null };

        // 1. Ambil lokasi GPS (dengan fallback jika user menolak/GPS mati)
        try {
            const pos = await getLocationPromise();
            locationData = {
                latitude: pos.lat,
                longitude: pos.lng,
            };
        } catch (geoError) {
            console.warn("Gagal mendapatkan lokasi GPS:", geoError.message || geoError);
            // Opsional: Jika GPS WAJIB diisi, batalkan submit dengan baris di bawah:
            // setFormError("Gagal mengambil lokasi. Pastikan izin GPS diizinkan.");
            // setLoading(false);
            // return;
        }

        // 2. Kirim payload lengkap (Data Form + Lokasi) ke Laravel
        try {
            const payload = {
                ...formData,
                latitude: locationData.latitude,
                longitude: locationData.longitude,
            };

            const response = await axios.put(`/api/deliveries/${selectedDelivery.id}`, payload);

            const successMessage = response.data?.message || "Berhasil memperbarui pengiriman";

            if (notification) notification(successMessage, "success");
            isModalOpen(false);

            setFormData({ status: "", amount: "", note: "" });
            if (mutate) mutate();
        } catch (error) {
            const errMsg = error.response?.data?.message || "Terjadi kesalahan saat menyimpan transaksi.";
            setFormError(errMsg);
            if (notification) notification("Error: " + errMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    const deleteTransaction = async () => {
        if (!confirm("Apakah Anda yakin ingin menghapus pengiriman ini?")) return;

        setLoading(true);
        setFormError("");

        try {
            // Menghapus data delivery (atau journal tergantung API kamu)
            const response = await axios.delete(`/api/deliveries/${selectedDelivery.id}`);
            const successMessage = response.data?.message || "Pengiriman berhasil dihapus";

            if (notification) notification(successMessage, "success");
            isModalOpen(false);

            setFormData({ status: "", amount: "", note: "" });
            if (mutate) mutate();
        } catch (error) {
            const errMsg = error.response?.data?.message || "Terjadi kesalahan saat menghapus pengiriman.";
            setFormError(errMsg);
            if (notification) notification("Error: " + errMsg, "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Alert Info SWR */}
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-900/40 rounded-xl flex items-start gap-2 text-amber-700 dark:text-amber-400">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="text-[11px]">Status akan diperbarui secara langsung di memori SWR.</p>
            </div>

            {/* Alert Error dari Server (Jika ada) */}
            {formError && (
                <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200/60 dark:border-rose-900/40 rounded-xl text-rose-600 dark:text-rose-400 text-xs">
                    {formError}
                </div>
            )}

            {/* Dropdown Status */}
            <div className="space-y-1">
                <label htmlFor="tx-status" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Pilih Status
                </label>
                <Dropdown
                    id="tx-status"
                    label="Transaction status Selector"
                    options={statusOptions}
                    selectedValue={formData.status}
                    onChange={(val) => {
                        setFormData({
                            ...formData,
                            status: val,
                        });
                    }}
                />
            </div>

            {/* Input Amount */}
            <div className="space-y-1 sm:col-span-2">
                <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Amount (Rp IDR)
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-mono text-xs select-none">Rp</span>
                    <input
                        id="tx-amount"
                        type="number"
                        required
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder="50000"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3.5 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                </div>

                {/* Preview Format Rupiah */}
                <AnimatePresence>
                    {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                        <motion.p
                            initial={{ opacity: 0, y: -4 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold"
                        >
                            Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* Input Note */}
            <div className="space-y-1">
                <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Note / Memo
                </label>
                <textarea
                    id="tx-desc"
                    rows={3}
                    value={formData.note}
                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                    placeholder="Catatan update manual..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    disabled={loading}
                    onClick={deleteTransaction}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                </button>

                <div className="flex items-center gap-2">
                    {/* Perbaikan pada tombol Batal */}
                    <button
                        type="button"
                        disabled={loading}
                        onClick={() => isModalOpen(false)}
                        className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-semibold rounded-xl text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        Batal
                    </button>

                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs text-xs transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                        <span>{loading ? "Menyimpan..." : "Simpan Perubahan"}</span>
                    </button>
                </div>
            </div>
        </form>
    );
}
