import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { DateTimeNow } from "@/app/utils/format";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

const CreateSaving = ({ contacts, accounts, notification, mutate, setModalTitle, isModalOpen }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        contact_id: "",
        amount: "",
        description: "",
        debt_id: "",
        type: "Saving",
    });
    const [type, setType] = useState("single");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const accountOptions = [
        { value: "", label: "Pilih Rekening" },
        ...accounts
            .filter((account) => account.warehouse_id === 1)
            .map((account) => ({
                value: account.id,
                label: account.name,
            })),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/store-saving", formData);
            notification(response.data.message);
            isModalOpen(false);
            fetchFinance();
        } catch (error) {
            setFormError(error.response?.data?.message || "Something went wrong.");
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <div className="mb-2">
                <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <button
                        type="button"
                        onClick={() => {
                            setType("single");
                            setFormData({
                                ...formData,
                                type: "single",
                            });
                        }}
                        className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            type === "single"
                                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-300"
                        }`}
                    >
                        Single
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setType("multiple");
                            setFormData({
                                ...formData,
                                type: "multiple",
                            });
                        }}
                        className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            type === "multiple"
                                ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-300"
                        }`}
                    >
                        Multiple (Batch)
                    </button>
                </div>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                {formError && (
                    <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        <span>{formError}</span>
                    </div>
                )}

                {/* Date input */}
                <div className="space-y-1">
                    <label htmlFor="tx-date" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Date Registered
                    </label>
                    <input
                        id="tx-date"
                        type="datetime-local"
                        required
                        value={formData.date_issued}
                        onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                <div className="space-y-1">
                    <label id="tx-debt_id-label" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Rekening
                    </label>
                    <Dropdown
                        id="tx-debt_id"
                        label="Account Selector"
                        options={accountOptions}
                        selectedValue={formData.debt_id}
                        onChange={(val) => {
                            setFormData({ ...formData, debt_id: val });
                        }}
                    />
                </div>

                <div className="space-y-1">
                    <label id="tx-debt_id-label" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Kontak
                    </label>
                    <Dropdown
                        id="tx-debt_id"
                        label="Account Selector"
                        options={contacts}
                        selectedValue={formData.contact_id}
                        onChange={(val) => {
                            setFormData({ ...formData, contact_id: val });
                        }}
                    />
                </div>

                {/* Amount and Date input rows */}
                <div className="space-y-1">
                    <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Amount (Rp IDR)
                    </label>
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                        <input
                            id="tx-amount"
                            type="number"
                            required
                            value={formData.amount}
                            onChange={(e) => {
                                setFormData({
                                    ...formData,
                                    amount: e.target.value,
                                });
                            }}
                            placeholder="50000"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                    {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                        <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                            Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                        </p>
                    )}
                </div>

                {/* Description input */}
                <div className="space-y-1">
                    <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Description / Memo
                    </label>
                    <input
                        id="tx-desc"
                        type="text"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="e.g. Pinjaman Modal"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>

                {/* Form Actions */}
                <div className="flex justify-end gap-2 pt-2">
                    <button
                        type="button"
                        onClick={() => isModalOpen(false)}
                        className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                        disabled={loading}
                    >
                        {loading ? "Adding..." : "Add Entry"}
                    </button>
                </div>
            </form>
        </>
    );
};

export default CreateSaving;
