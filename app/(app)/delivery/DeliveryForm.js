import Dropdown from "@/app/components/Dropdown";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "@/app/utils/axios";
import { AlertTriangle, Loader2, ShieldCheck, Siren } from "lucide-react";

export default function DeliveryForm({ warehouses, employees, isModalOpen, notification, mutate }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        destination_id: "",
        amount: "",
        courier_id: "",
        description: "",
        trx_type: "Mutasi Kas",
        type: "delivery",
        priority: "low",
    });

    const warehouseOptions = [
        { value: "", label: "Pilih Cabang Tujuan" },
        ...warehouses
            .filter((warehouse) => warehouse.id !== 1 && warehouse.status === 1)
            .map((warehouse) => ({
                value: warehouse.id,
                label: warehouse.name,
            })),
    ];

    const employeeOptions = [
        { value: "", label: "Pilih Kurir" },
        ...(employees
            .filter((emp) => emp.contact?.user?.role === "Courier")
            .map((employee) => ({
                value: employee.id,
                label: employee.contact?.name,
            })) || []),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.post("/api/create-delivery", formData);

            notification(response.data.message);

            setFormData({
                destination_id: "",
                amount: "",
                courier_id: "",
                description: "",
                type: "delivery",
                priority: "low",
            });

            mutate();
            isModalOpen(false);
        } catch (e) {
            console.error(e);
            notification(e.response.data.message || "Terjadi kesalahan saat menyimpan transaksi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* 1. Cabang Tujuan */}
            <div className="space-y-1">
                <label htmlFor="emp-contact" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Cabang Tujuan
                </label>
                <Dropdown
                    id="emp-contact"
                    label="Contact Selector"
                    options={warehouseOptions}
                    selectedValue={formData.destination_id}
                    onChange={(val) => setFormData({ ...formData, destination_id: val })}
                />
            </div>

            {/* 2. Nominal / Amount */}
            <div className="space-y-1">
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
                        placeholder="10.000.000"
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3.5 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                    />
                </div>
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

            {/* 3. Tipe Pengiriman (Bar 2 Kolom) */}
            <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                    type="button"
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-98 ${
                        formData.type === "delivery"
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => setFormData({ ...formData, type: "delivery" })}
                >
                    Di Kirim
                </button>
                <button
                    type="button"
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer active:scale-98 ${
                        formData.type === "pick_up"
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => setFormData({ ...formData, type: "pick_up" })}
                >
                    Di Ambil
                </button>
            </div>

            {/* 4. Kurir (Kondisional) */}
            <div className="space-y-1" hidden={formData.type === "pick_up"}>
                <label htmlFor="emp-courier" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Nama Pengantar / Kurir
                </label>
                <Dropdown
                    id="emp-courier"
                    label="Employee Selector"
                    options={employeeOptions}
                    selectedValue={formData.courier_id}
                    onChange={(val) => setFormData({ ...formData, courier_id: val })}
                />
            </div>

            {/* 5. FITUR BARU: Prioritas Pengiriman (3 Segmented Bar) */}
            <div className="space-y-1.5 pt-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tingkat Prioritas Pengiriman</label>
                <div className="grid grid-cols-3 gap-2">
                    {/* Normal Card */}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: "low" })}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            formData.priority === "low" || !formData.priority
                                ? "border-slate-400 bg-slate-50 dark:bg-slate-800/80 dark:border-slate-600 text-slate-800 dark:text-slate-100 ring-2 ring-slate-400/20"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-300"
                        }`}
                    >
                        <ShieldCheck className="w-4 h-4 mb-1 text-slate-500 dark:text-slate-400" />
                        <span className="text-xs font-bold">Normal</span>
                        <span className="text-[10px] text-slate-400 font-normal mt-0.5">Sesuai Antrean</span>
                    </button>

                    {/* High Card */}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: "high" })}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            formData.priority === "high"
                                ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-amber-300"
                        }`}
                    >
                        <AlertTriangle
                            className={`w-4 h-4 mb-1 text-amber-500 transition duration-300 ${formData.priority === "high" ? "animate-pulse scale-120" : ""}`}
                        />
                        <span className="text-xs font-bold text-amber-600 dark:text-amber-400">Tinggi</span>
                        <span className="text-[10px] text-slate-400 font-normal mt-0.5">Didahulukan</span>
                    </button>

                    {/* Urgent Card */}
                    <button
                        type="button"
                        onClick={() => setFormData({ ...formData, priority: "urgent" })}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                            formData.priority === "urgent"
                                ? "border-rose-500 bg-rose-50/50 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 ring-2 ring-rose-500/20"
                                : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-rose-300"
                        }`}
                    >
                        <Siren
                            className={`w-4 h-4 mb-1 text-rose-500 transition duration-300 ${formData.priority === "urgent" ? "animate-ping scale-120" : ""}`}
                        />
                        <span className="text-xs font-bold text-rose-600 dark:text-rose-400">Urgent</span>
                        <span className="text-[10px] text-slate-400 font-normal mt-0.5">Kirim Segera</span>
                    </button>
                </div>
            </div>

            {/* 6. Deskripsi / Memo */}
            <div className="space-y-1">
                <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Description / Memo
                </label>
                <input
                    id="tx-desc"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Minta Recehan / Setor / dll..."
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end gap-2 pt-3">
                <button
                    type="button"
                    onClick={() => isModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Membuat Pengiriman..." : "Rilis Pengiriman"}
                </button>
            </div>
        </form>
    );
}
