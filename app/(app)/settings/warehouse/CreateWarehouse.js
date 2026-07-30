import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const CreateWarehouse = ({ isModalOpen, accounts, mutate, notification }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        code: "",
        name: "",
        address: "",
        acc_code: "",
    });
    const [errors, setErrors] = useState([]);

    const availableAccounts = accounts.filter((item) => [1, 2].includes(Number(item.account_id)) && item.warehouse_id === null);

    const handleCreateWarehouse = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post("/api/warehouse", formData);
            notification("success", response.data.message);
            if (response.status === 201) {
                // Reset form fields and close modal on success
                setFormData({
                    code: "",
                    name: "",
                    address: "",
                    acc_code: "",
                });
                isModalOpen(false);
                mutate();
            }
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification("error", error.response?.data?.message);
        }
    };
    return (
        <form onSubmit={handleCreateWarehouse} className="space-y-4">
            {/* 1. Grid Row: Code & Name */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Code Input */}
                <div className="space-y-1">
                    <label htmlFor="wh-create-code" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Kode Cabang
                    </label>
                    <input
                        id="wh-create-code"
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Ex: WH-001"
                        value={formData.code || ""}
                        onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                        className={`w-full rounded-xl border ${
                            errors.code ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors uppercase font-mono`}
                    />
                    {errors.code && <p className="text-xs text-red-500 mt-1">{errors.code}</p>}
                </div>

                {/* Name Input */}
                <div className="space-y-1">
                    <label htmlFor="wh-create-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Nama Cabang
                    </label>
                    <input
                        id="wh-create-name"
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Masukkan nama cabang..."
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full rounded-xl border ${
                            errors.name ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
            </div>

            {/* 2. Cash Account Dropdown */}
            <div className="space-y-1">
                <label htmlFor="wh-create-account" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Akun Kas Utama (Cash Account)
                </label>
                <Dropdown
                    id="wh-create-account"
                    label="-Pilih Akun-"
                    options={[
                        { value: "", label: "Select Account" },
                        ...(availableAccounts?.map((account) => ({
                            value: account.id,
                            label: account.name,
                        })) || []),
                    ]}
                    selectedValue={formData.acc_code}
                    onChange={(val) => setFormData({ ...formData, acc_code: val })}
                />
                {errors.acc_code && <p className="text-xs text-red-500 mt-1">{errors.acc_code}</p>}
            </div>

            {/* 3. Address Textarea */}
            <div className="space-y-1">
                <label htmlFor="wh-create-address" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Alamat Lengkap
                </label>
                <textarea
                    id="wh-create-address"
                    rows={3}
                    required
                    autoComplete="off"
                    placeholder="Masukkan alamat lengkap cabang..."
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full rounded-xl border ${
                        errors.address ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none`}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
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
                    {loading ? "Creating..." : "Create Warehouse"}
                </button>
            </div>
        </form>
    );
};

export default CreateWarehouse;
