import Dropdown from "@/app/components/Dropdown";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "@/app/utils/axios";
import { AlertTriangle, CheckCircle, Loader2, Search, ShieldCheck, Siren, Undo } from "lucide-react";

export default function DeliveryFormMultiple({ warehouses = [], employees = [], isModalOpen, notification, mutate }) {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        destination_ids: [],
        amount: "",
        courier_id: "",
        description: "",
        trx_type: "Mutasi Kas",
        type: "delivery",
        priority: "low",
    });

    // 1. Filter warehouses berdasarkan kata kunci pencarian
    const filteredWarehouses = warehouses.filter((wh) => wh.name?.toLowerCase().includes(searchTerm.toLowerCase()) && wh.id !== 1 && wh.status === 1);

    const employeeOptions = [
        { value: "", label: "Pilih Kurir" },
        ...(employees
            .filter((emp) => emp.contact?.user?.role === "Courier")
            .map((employee) => ({
                value: employee.id,
                label: employee.contact?.name,
            })) || []),
    ];

    // 2. Samakan kunci yang digunakan: Menggunakan `primary_cash.id`
    const handleToggleWhSelect = (cashId) => {
        if (!cashId) return;

        setFormData((prev) => {
            const exists = prev.destination_ids.includes(cashId);
            return {
                ...prev,
                destination_ids: exists ? prev.destination_ids.filter((id) => id !== cashId) : [...prev.destination_ids, cashId],
            };
        });
    };

    // 3. Select All hanya memasukkan gudang yang punya primary_cash
    const handleSelectAll = () => {
        const allCashIds = filteredWarehouses.map((w) => w.primary_cash?.id).filter(Boolean);

        setFormData((prev) => ({
            ...prev,
            destination_ids: Array.from(new Set([...prev.destination_ids, ...allCashIds])),
        }));
    };

    const handleResetSelect = () => {
        setFormData((prev) => ({
            ...prev,
            destination_ids: [],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.destination_ids.length === 0) {
            notification("Pilih setidaknya satu lokasi tujuan.");
            return;
        }

        setLoading(true);

        try {
            const response = await axios.post("/api/create-delivery-multiple", formData);

            notification(response.data.message || "Pengiriman berhasil dibuat");

            setFormData({
                destination_ids: [],
                amount: "",
                courier_id: "",
                description: "",
                trx_type: "Mutasi Kas",
                type: "delivery",
                priority: "low",
            });

            if (mutate) mutate();
            if (isModalOpen) isModalOpen(false);
        } catch (e) {
            console.error(e);
            notification(e.response?.data?.message || "Terjadi kesalahan saat menyimpan transaksi.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-3">
            {/* Search & Bulk Select Actions */}
            <label htmlFor="tx-warehouse" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Pilih Cabang
            </label>
            <div className="grid grid-cols-4 gap-2">
                <div className="relative col-span-2">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                        <Search className="h-4 w-4" aria-hidden="true" />
                    </span>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Cari gudang..."
                        className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>
                <button
                    type="button"
                    onClick={handleSelectAll}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-3 py-1 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer"
                >
                    Select All
                </button>
                <button
                    type="button"
                    onClick={handleResetSelect}
                    className="inline-flex items-center justify-center rounded-xl bg-rose-500 px-3 py-1 text-xs font-semibold text-white hover:bg-rose-600 transition-colors cursor-pointer"
                >
                    <Undo size={16} />
                </button>
            </div>

            {/* Warehouse Checkbox List */}
            <div className="space-y-1.5 flex flex-col max-h-36 overflow-y-auto pr-1">
                {filteredWarehouses.length > 0 ? (
                    filteredWarehouses.map((warehouse) => {
                        const cashId = warehouse.primary_cash?.id;
                        const isSelected = cashId && formData.destination_ids.includes(cashId);

                        return (
                            <button
                                type="button"
                                key={warehouse.id}
                                onClick={() => handleToggleWhSelect(cashId)}
                                className={`text-sm gap-2 flex justify-start items-center px-2.5 py-1.5 border rounded-lg transition-colors text-left cursor-pointer ${
                                    isSelected
                                        ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                                }`}
                            >
                                <CheckCircle size={16} className={isSelected ? "text-emerald-500" : "text-slate-300 dark:text-slate-600"} />
                                <span className="font-medium text-xs">{warehouse.name}</span>
                            </button>
                        );
                    })
                ) : (
                    <p className="text-xs text-slate-400 py-2 text-center">Gudang tidak ditemukan.</p>
                )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formData.destination_ids.length}</span> Gudang Dipilih
            </p>

            {/* Nominal Amount */}
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
                        placeholder="10000000"
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

            {/* Tipe Pengiriman */}
            <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                    type="button"
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
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
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                        formData.type === "pick_up"
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => setFormData({ ...formData, type: "pick_up" })}
                >
                    Di Ambil
                </button>
            </div>

            {/* Selector Kurir */}
            {formData.type !== "pick_up" && (
                <div className="space-y-1">
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
            )}

            {/* Description / Memo */}
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
