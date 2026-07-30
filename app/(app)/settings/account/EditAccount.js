import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const EditAccount = ({ account, isModalOpen, notification, mutate }) => {
    const [formData, setFormData] = useState({
        id: account?.id,
        name: account?.name,
        account_group: account?.group || "",
        st_balance: account?.st_balance,
    });
    const [loading, setLoading] = useState(false);

    const handleUpdateAccount = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/accounts/${account.id}`, formData);
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
        <form onSubmit={handleUpdateAccount} className="space-y-4">
            {/* 1. Account Name Input */}
            <div className="space-y-1">
                <label htmlFor="acc-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Account Name
                </label>
                <input
                    id="acc-name"
                    type="text"
                    required
                    placeholder="Masukkan nama akun..."
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
            </div>

            {/* 2. Grid Row: Account Group & Starting Balance */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Account Group Input */}
                <div className="space-y-1">
                    <label htmlFor="acc-group" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Account Group
                    </label>
                    <input
                        id="acc-group"
                        type="text"
                        placeholder="Ex: Asset, Expense, dll."
                        value={formData.account_group || ""}
                        onChange={(e) => setFormData({ ...formData, account_group: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>

                {/* Starting Balance Input */}
                <div className="space-y-1">
                    <label htmlFor="st-balance" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Starting Balance
                    </label>
                    <input
                        id="st-balance"
                        type="number"
                        required
                        placeholder="0"
                        value={formData.st_balance || ""}
                        onChange={(e) => setFormData({ ...formData, st_balance: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono"
                    />
                </div>
            </div>

            {/* 3. Form Actions */}
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
                    {loading ? "Updating..." : "Update Account"}
                </button>
            </div>
        </form>
    );
};

export default EditAccount;
