import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const EditProduct = ({ product, categoryProducts, isModalOpen, notification, mutate }) => {
    const [formData, setFormData] = useState(product);
    const [loading, setLoading] = useState(false);

    const handleUpdateProduct = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/products/${product.id}`, formData);
            notification(response.data.message);
            isModalOpen(false);
            mutate();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleUpdateProduct} className="space-y-4">
            {/* 1. Product ID & Name Input */}
            <div className="grid sm:grid-cols-3 gap-2">
                <div className="space-y-1 sm:col-span-2">
                    <div className="flex items-center justify-between">
                        <label htmlFor="edit-prod-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Product Name
                        </label>
                        {product?.id && (
                            <span className="inline-flex items-center rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400">
                                ID: #{product.id}
                            </span>
                        )}
                    </div>
                    <input
                        id="edit-prod-name"
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Masukkan nama produk..."
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="edit-prod-status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Status
                    </label>
                    <Dropdown
                        id="edit-prod-status"
                        label="Select status"
                        options={[
                            { value: "", label: "Select status" },
                            { value: 1, label: "Active" },
                            { value: 0, label: "Inactive" },
                        ]}
                        selectedValue={formData.is_active}
                        onChange={(val) => setFormData({ ...formData, is_active: val })}
                    />
                </div>
            </div>

            {/* 2. Category Dropdown */}
            <div className="space-y-1">
                <label htmlFor="edit-prod-category" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Category
                </label>
                <Dropdown
                    id="edit-prod-category"
                    label="Select category"
                    options={[
                        { value: "", label: "Select category" },
                        ...(categoryProducts?.map((cat) => ({
                            value: cat.name,
                            label: cat.name,
                        })) || []),
                    ]}
                    selectedValue={formData.category}
                    onChange={(val) => setFormData({ ...formData, category: val })}
                />
            </div>

            {/* 3. Grid Row: Price & Cost */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Price Input */}
                <div className="space-y-1">
                    <label htmlFor="edit-prod-price" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Price (Harga Jual)
                    </label>
                    <input
                        id="edit-prod-price"
                        type="number"
                        required
                        placeholder="0"
                        value={formData.price || ""}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono"
                    />
                </div>

                {/* Cost Input */}
                <div className="space-y-1">
                    <label htmlFor="edit-prod-cost" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Cost (Harga Beli)
                    </label>
                    <input
                        id="edit-prod-cost"
                        type="number"
                        required
                        placeholder="0"
                        value={formData.cost || ""}
                        onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono"
                    />
                </div>
            </div>

            {/* 4. Form Actions */}
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
                    {loading ? "Saving..." : "Simpan"}
                </button>
            </div>
        </form>
    );
};

export default EditProduct;
