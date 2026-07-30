import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const CreateAccount = ({ categoryAccounts, notification, mutate, isModalOpen }) => {
    const [formData, setFormData] = useState({
        name: "",
        category_id: "",
        account_group: "",
        st_balance: 0,
    });
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleCreateAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/accounts", formData);
            notification(response.data.message);
            setFormData({
                name: "",
                category_id: "",
                st_balance: 0,
            });
            isModalOpen(false);
            mutate();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleCreateAccount} className="space-y-4">
            {/* 1. Account Name Input */}
            <div className="space-y-1">
                <label htmlFor="acc-create-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Account Name
                </label>
                <input
                    id="acc-create-name"
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Masukkan nama akun..."
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className={`w-full rounded-xl border ${
                        errors.name ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                />
                {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
            </div>

            {/* 2. Grid Row: Category Dropdown & Account Group */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Category Dropdown */}
                <div className="space-y-1">
                    <label htmlFor="acc-create-category" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Category
                    </label>
                    <Dropdown
                        id="acc-create-category"
                        label="Select Category"
                        options={[
                            { value: "", label: "Select Category" },
                            ...(categoryAccounts?.map((item) => ({
                                value: item.id,
                                label: item.name,
                            })) || []),
                        ]}
                        selectedValue={formData.category_id}
                        onChange={(val) => setFormData({ ...formData, category_id: val })}
                    />
                    {errors.category_id && <p className="text-xs text-red-500 mt-1">{errors.category_id}</p>}
                </div>

                {/* Account Group Input */}
                <div className="space-y-1">
                    <label htmlFor="acc-create-group" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Account Group <span className="text-slate-400 font-normal">(Optional)</span>
                    </label>
                    <input
                        id="acc-create-group"
                        type="text"
                        autoComplete="off"
                        placeholder="Ex: BCA, MANDIRI, BNI"
                        value={formData.account_group || ""}
                        onChange={(e) => setFormData({ ...formData, account_group: e.target.value })}
                        className={`w-full rounded-xl border ${
                            errors.account_group ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {errors.account_group && <p className="text-xs text-red-500 mt-1">{errors.account_group}</p>}
                </div>
            </div>

            {/* 3. Starting Balance Input */}
            <div className="space-y-1">
                <label htmlFor="acc-create-balance" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Starting Balance
                </label>
                <input
                    id="acc-create-balance"
                    type="number"
                    placeholder="0"
                    value={formData.st_balance || ""}
                    onChange={(e) => setFormData({ ...formData, st_balance: e.target.value })}
                    className={`w-full rounded-xl border ${
                        errors.st_balance ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono`}
                />
                {errors.st_balance && <p className="text-xs text-red-500 mt-1">{errors.st_balance}</p>}
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
                    {loading ? "Saving..." : "Save Account"}
                </button>
            </div>
        </form>
    );
};

export default CreateAccount;
