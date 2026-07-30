import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const CreateProduct = ({ isModalOpen, notification, mutate, categoryProducts }) => {
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [newProduct, setNewProduct] = useState({
        name: "",
        category: "",
        price: 0,
        cost: 0,
    });

    const handleCreateProduct = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/products", newProduct);
            notification("success", response.data.message);
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setNewProduct({
                    name: "",
                    category: "",
                    price: 0,
                    cost: 0,
                });
            }
            isModalOpen(false);
            // console.log('Form reset:', newAccount, response.status)
            mutate();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message);
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleCreateProduct} className="space-y-4">
            {/* 1. Product Name Input */}
            <div className="space-y-1">
                <label htmlFor="prod-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Product Name
                </label>
                <input
                    id="prod-name"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Enter product name..."
                    value={newProduct.name || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    className={`w-full rounded-xl border ${
                        errors.name ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* 2. Category Dropdown */}
            <div className="space-y-1">
                <label htmlFor="prod-category" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Category
                </label>
                <Dropdown
                    id="prod-category"
                    label="Select category"
                    options={[
                        { value: "", label: "Select category" },
                        ...(categoryProducts?.map((cat) => ({
                            value: cat.name,
                            label: cat.name,
                        })) || []),
                    ]}
                    selectedValue={newProduct.category}
                    onChange={(val) => setNewProduct({ ...newProduct, category: val })}
                />
                {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
            </div>

            {/* 3. Grid Row: Price & Cost */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Price Input */}
                <div className="space-y-1">
                    <label htmlFor="prod-price" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Price (Harga Jual)
                    </label>
                    <input
                        id="prod-price"
                        type="number"
                        placeholder="0"
                        value={newProduct.price || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                        className={`w-full rounded-xl border ${
                            errors.price ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono`}
                    />
                    {errors.price && <p className="text-xs text-red-500 mt-1">{errors.price}</p>}
                </div>

                {/* Cost Input */}
                <div className="space-y-1">
                    <label htmlFor="prod-cost" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Cost (Harga Modal)
                    </label>
                    <input
                        id="prod-cost"
                        type="number"
                        placeholder="0"
                        value={newProduct.cost || ""}
                        onChange={(e) => setNewProduct({ ...newProduct, cost: e.target.value })}
                        className={`w-full rounded-xl border ${
                            errors.cost ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono`}
                    />
                    {errors.cost && <p className="text-xs text-red-500 mt-1">{errors.cost}</p>}
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
                    {loading ? "Creating..." : "Create Product"}
                </button>
            </div>
        </form>
    );
};

export default CreateProduct;
