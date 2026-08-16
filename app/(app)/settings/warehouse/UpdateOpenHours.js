import axios from "@/app/utils/axios";
import { CheckCircle, Loader2, Search, Undo } from "lucide-react";
import { useState } from "react";

export default function UpdateOpenHours({ notification, mutate, isModalOpen, warehouses }) {
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [formData, setFormData] = useState({
        warehouseIds: [],
        opening_time: "",
    });
    const filteredWarehouses = warehouses.filter((wh) => wh.name?.toLowerCase().includes(searchTerm.toLowerCase()) && wh.id !== 1 && wh.status === 1);

    const handleToggleWhSelect = (warehouseId) => {
        if (!warehouseId) return;

        setFormData((prev) => {
            const exists = prev.warehouseIds.includes(warehouseId);
            return {
                ...prev,
                warehouseIds: exists ? prev.warehouseIds.filter((id) => id !== warehouseId) : [...prev.warehouseIds, warehouseId],
            };
        });
    };

    const handleSelectAll = () => {
        const allWarehouseIds = filteredWarehouses.map((w) => w.id).filter(Boolean);

        setFormData((prev) => ({
            ...prev,
            warehouseIds: Array.from(new Set([...prev.warehouseIds, ...allWarehouseIds])),
        }));
    };

    const handleResetSelect = () => {
        setFormData((prev) => ({
            ...prev,
            warehouseIds: [],
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put("/api/update-open-hours", formData);
            notification(response.data.message);
            isModalOpen(false);
            mutate();
        } catch (error) {
            console.log(error);
            notification(error.response?.data?.message);
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
                        const isSelected = formData.warehouseIds.includes(warehouse.id);

                        return (
                            <button
                                type="button"
                                key={warehouse.id}
                                onClick={() => handleToggleWhSelect(warehouse.id)}
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
                <span className="font-bold text-indigo-600 dark:text-indigo-400">{formData.warehouseIds.length}</span> Gudang Dipilih
            </p>

            <div className="space-y-1 sm:w-1/4">
                <label htmlFor="wh-opening" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Waktu Buka
                </label>
                <input
                    id="wh-opening"
                    type="time"
                    value={formData.opening_time || ""}
                    onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => isModalOpen?.(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Updating..." : "Update Warehouse"}
                </button>
            </div>
        </form>
    );
}
