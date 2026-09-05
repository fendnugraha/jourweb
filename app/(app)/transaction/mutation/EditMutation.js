import Dropdown from "@/app/components/Dropdown";
import { useAccounts } from "@/app/hooks/useAccounts";
import axios from "@/app/utils/axios";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

const labelClass = "text-xs font-semibold text-slate-500 dark:text-slate-400";
const inputClass =
    "w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600";

export default function EditMutation({ journal, isModalOpen, mutate, notification }) {
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const { accounts = [], loading: loadingAccounts, error: errorAccounts } = useAccounts();

    const [formData, setFormData] = useState({
        date_issued: journal.date_issued,
        debt_id: journal.debt_id || "",
        cred_id: journal.cred_id || "",
        amount: journal.amount,
        fee_amount: journal.fee_amount,
        description: journal.description || "",
    });

    const patch = (fields) => setFormData((prev) => ({ ...prev, ...fields }));

    const credOptions = [{ value: "", label: "Pilih Akun" }, ...accounts.map((a) => ({ value: a.id, label: a.name }))];

    const debtOptions = [
        { value: "", label: "Select Account" },
        ...accounts.map((a) => ({
            value: a.id,
            label: a.name,
        })),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError("");

        try {
            const response = await axios.put(`/api/journals/${journal?.id}`, formData);
            notification(response.data.message);
            mutate();
            mutateBalance();
            isModalOpen(false);
        } catch (error) {
            console.log(error);
            setFormError("Failed to submit mutation edit");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                </div>
            )}

            <div className="space-y-1">
                <label htmlFor="tx-date" className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                    Tanggal Transaksi
                </label>

                <input
                    id="tx-date"
                    type="datetime-local"
                    required
                    value={formData.date_issued}
                    onChange={(e) => patch({ date_issued: e.target.value })}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
                />
            </div>

            {/* Source & Destination Accounts */}
            <div className="grid sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                    <label htmlFor="tx-cred-account" className={labelClass}>
                        Rekening Asal (Dari)
                    </label>
                    <Dropdown
                        id="tx-cred-account"
                        label="Rekening Asal"
                        options={credOptions}
                        selectedValue={formData.cred_id}
                        onChange={(val) => patch({ cred_id: val })}
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="tx-debt-account" className={labelClass}>
                        Ke Akun
                    </label>
                    <Dropdown
                        id="tx-debt-account"
                        label="Rekening Tujuan"
                        options={debtOptions}
                        selectedValue={formData.debt_id}
                        onChange={(val) => patch({ debt_id: val })}
                        disabled={!formData.cred_id}
                    />
                </div>
            </div>

            {/* Amount */}
            <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="tx-amount" className={labelClass}>
                        Jumlah (Rp IDR)
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                        <input
                            id="tx-amount"
                            type="number"
                            required
                            value={formData.amount}
                            onChange={(e) => patch({ amount: e.target.value })}
                            placeholder="50000"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
                            disabled={!formData.cred_id || !formData.debt_id}
                        />
                    </div>
                    {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                            Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                        </p>
                    )}
                </div>
            </div>

            {/* Description */}
            <div className="space-y-1">
                <label htmlFor="tx-desc" className={labelClass}>
                    Keterangan / Memo
                </label>
                <input
                    id="tx-desc"
                    type="text"
                    value={formData.description}
                    onChange={(e) => patch({ description: e.target.value })}
                    placeholder="e.g. Kelebihan Saldo"
                    className={inputClass}
                />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => typeof isModalOpen === "function" && isModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Batal
                </button>
                <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-60"
                    disabled={loading}
                >
                    {loading ? "Menyimpan data..." : "Tambah Mutasi"}
                </button>
            </div>
        </form>
    );
}
