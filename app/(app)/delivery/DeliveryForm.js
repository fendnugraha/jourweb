import Dropdown from "@/app/components/Dropdown";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "@/app/utils/axios";
import { AlertTriangle, Loader2, ShieldCheck, Siren, Plus, Trash2, Send, PackageCheck } from "lucide-react";

export default function DeliveryForm({ warehouses, employees, isModalOpen, notification, mutate }) {
    const [loading, setLoading] = useState(false);
    const [cart, setCart] = useState([]);

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
            ?.filter((emp) => emp.contact?.user?.role === "Courier")
            ?.map((employee) => ({
                value: employee.id,
                label: employee.contact?.name,
            })) || []),
    ];

    const handleAddToCart = (e) => {
        e.preventDefault();

        if (!formData.destination_id || !formData.amount) {
            notification("Cabang Tujuan dan Nominal wajib diisi!");
            return;
        }

        const selectedWarehouse = warehouses.find((w) => w.id === parseInt(formData.destination_id));
        const selectedCourier = employees.find((e) => e.id === parseInt(formData.courier_id));

        const newItem = {
            ...formData,
            id: Date.now(),
            destination_name: selectedWarehouse?.name || "Tujuan",
            courier_name: selectedCourier?.contact?.name || "Tanpa Kurir",
        };

        setCart([...cart, newItem]);

        setFormData({
            destination_id: "",
            amount: "",
            courier_id: formData.courier_id,
            description: "",
            trx_type: "Mutasi Kas",
            type: formData.type,
            priority: "low",
        });
    };

    const handleRemoveFromCart = (id) => {
        setCart(cart.filter((item) => item.id !== id));
    };

    const handleSubmitAll = async () => {
        if (cart.length === 0) return;
        setLoading(true);

        try {
            const response = await axios.post("/api/create-delivery", { deliveries: cart });

            notification(response.data.message || "Semua pengiriman berhasil dirilis!");
            setCart([]);
            mutate();
            isModalOpen(false);
        } catch (e) {
            console.error(e);
            notification(e.response?.data?.message || "Terjadi kesalahan saat menyimpan transaksi.");
        } finally {
            setLoading(false);
        }
    };

    const getPriorityBadge = (priority) => {
        switch (priority) {
            case "urgent":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-950/40 px-1.5 py-0.5 rounded-md border border-rose-200 dark:border-rose-900">
                        <Siren className="w-3 h-3 text-rose-500 animate-pulse" /> Urgent
                    </span>
                );
            case "high":
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
                        <AlertTriangle className="w-3 h-3 text-amber-500" /> Tinggi
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md border border-slate-200/60 dark:border-slate-700/60">
                        <ShieldCheck className="w-3 h-3 text-slate-400" /> Normal
                    </span>
                );
        }
    };

    return (
        <div className="space-y-4">
            {/* FORM INPUT ITEM */}
            <form
                onSubmit={handleAddToCart}
                className="space-y-3 p-3.5 bg-slate-50/50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800"
            >
                {/* Cabang Tujuan */}
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

                {/* Nominal / Amount */}
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
                                exit={{ opacity: 0, y: -4 }}
                                className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold"
                            >
                                Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                            </motion.p>
                        )}
                    </AnimatePresence>
                </div>

                {/* Tipe Pengiriman & Kurir */}
                <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                        <label className="text-[11px] font-semibold text-slate-500">Tipe Opsional</label>
                        <div className="grid grid-cols-2 gap-1 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                    formData.type === "delivery" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-500"
                                }`}
                                onClick={() => setFormData({ ...formData, type: "delivery" })}
                            >
                                Kirim
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                type="button"
                                className={`py-1.5 rounded-lg text-[11px] font-semibold transition-all cursor-pointer ${
                                    formData.type === "pick_up" ? "bg-indigo-600 text-white shadow-xs" : "text-slate-500"
                                }`}
                                onClick={() => setFormData({ ...formData, type: "pick_up" })}
                            >
                                Ambil
                            </motion.button>
                        </div>
                    </div>

                    <div className="space-y-1" hidden={formData.type === "pick_up"}>
                        <label htmlFor="emp-courier" className="text-[11px] font-semibold text-slate-500">
                            Kurir
                        </label>
                        <Dropdown
                            id="emp-courier"
                            label="Employee Selector"
                            options={employeeOptions}
                            selectedValue={formData.courier_id}
                            onChange={(val) => setFormData({ ...formData, courier_id: val })}
                        />
                    </div>
                </div>

                {/* Prioritas (Visual Animated Buttons) */}
                <div className="space-y-1">
                    <label className="text-[11px] font-semibold text-slate-500">Tingkat Prioritas</label>
                    <div className="grid grid-cols-3 gap-2">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority: "low" })}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                formData.priority === "low" || !formData.priority
                                    ? "border-slate-400 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100 ring-2 ring-slate-400/20 font-bold"
                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-slate-300"
                            }`}
                        >
                            <ShieldCheck className="w-3.5 h-3.5 mb-0.5 text-slate-500 dark:text-slate-400" />
                            <span className="text-[11px]">Normal</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority: "high" })}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                formData.priority === "high"
                                    ? "border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 ring-2 ring-amber-500/20 font-bold"
                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-amber-300"
                            }`}
                        >
                            <AlertTriangle className={`w-3.5 h-3.5 mb-0.5 text-amber-500 ${formData.priority === "high" ? "animate-pulse" : ""}`} />
                            <span className="text-[11px]">Tinggi</span>
                        </motion.button>

                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.95 }}
                            type="button"
                            onClick={() => setFormData({ ...formData, priority: "urgent" })}
                            className={`flex flex-col items-center justify-center p-2 rounded-xl border text-center transition-all cursor-pointer ${
                                formData.priority === "urgent"
                                    ? "border-rose-500 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 ring-2 ring-rose-500/20 font-bold"
                                    : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-400 hover:border-rose-300"
                            }`}
                        >
                            <Siren className={`w-3.5 h-3.5 mb-0.5 text-rose-500 ${formData.priority === "urgent" ? "animate-pulse" : ""}`} />
                            <span className="text-[11px]">Urgent</span>
                        </motion.button>
                    </div>
                </div>

                {/* Deskripsi */}
                <div className="space-y-1">
                    <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Deskripsi / Memo singkat..."
                        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden"
                    />
                </div>

                <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-2 bg-slate-800 dark:bg-slate-700 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                    <Plus className="w-4 h-4" /> Tambah ke Daftar
                </motion.button>
            </form>

            {/* DAFTAR KERANJANG (CART LIST WITH MOTION) */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-600 dark:text-slate-300 px-1">
                    <span className="flex items-center gap-1.5">
                        <PackageCheck className="w-4 h-4 text-indigo-500" />
                        Daftar Antrean Pengiriman ({cart.length})
                    </span>
                    {cart.length > 0 && (
                        <motion.span
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-[11px] font-mono text-indigo-600 dark:text-indigo-400 font-bold"
                        >
                            Total: Rp {cart.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0).toLocaleString("id-ID")}
                        </motion.span>
                    )}
                </div>

                <div className="max-h-48 overflow-y-auto space-y-2 pr-0.5">
                    <AnimatePresence mode="popLayout">
                        {cart.length === 0 ? (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="text-center py-6 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs"
                            >
                                Belum ada pengiriman ditambahkan ke daftar.
                            </motion.div>
                        ) : (
                            cart.map((item) => (
                                <motion.div
                                    key={item.id}
                                    layout
                                    initial={{ opacity: 0, y: -12, scale: 0.96 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, x: -20, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                    className="flex items-center justify-between p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-2xs text-xs"
                                >
                                    <div className="space-y-0.5">
                                        <div className="flex items-center gap-2">
                                            <span className="font-bold text-slate-800 dark:text-slate-100">{item.destination_name}</span>
                                            {getPriorityBadge(item.priority)}
                                        </div>
                                        <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2 font-mono">
                                            <span className="font-bold text-emerald-600 dark:text-emerald-400">
                                                Rp {parseFloat(item.amount).toLocaleString("id-ID")}
                                            </span>
                                            <span>•</span>
                                            <span>{item.type === "delivery" ? `Kurir: ${item.courier_name}` : "Ambil Sendiri"}</span>
                                        </div>
                                        {item.description && <p className="text-[10px] text-slate-400 italic">{item.description}</p>}
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                        onClick={() => handleRemoveFromCart(item.id)}
                                        className="p-1.5 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </motion.button>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* ACTION BUTTONS FINAL */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => isModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer transition-colors"
                >
                    Batal
                </button>
                <motion.button
                    whileHover={{ scale: cart.length > 0 ? 1.02 : 1 }}
                    whileTap={{ scale: cart.length > 0 ? 0.98 : 1 }}
                    type="button"
                    disabled={loading || cart.length === 0}
                    onClick={handleSubmitAll}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
                >
                    {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                    {loading ? "Memproses..." : `Rilis ${cart.length} Pengiriman`}
                </motion.button>
            </div>
        </div>
    );
}
