import axios from "@/app/utils/axios";
import { useState } from "react";

export default function EmployeeRcvPayment({ finances, isModalOpen, fetchFinance, notification, contactId, type }) {
    const [formData, setFormData] = useState({
        contact_id: contactId,
        account_id: 1,
        amount: "",
        notes: "",
        finance_type: type,
    });

    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/employee-rcv-payment", formData);
            notification(response.data.message);
            fetchFinance();
            isModalOpen(false);
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
            setErrors(error.response?.data?.errors);
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const contactName = finances?.[0]?.contact?.name;
    const filterDataByInvoice = finances.filter((finance) => finance.invoice === selectedInvoice);

    return (
        <form onSubmit={handleSubmit}>
            <h1 className="text-lg mb-4 font-semibold">{contactName}</h1>
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
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="e.g. Bayar Pinjaman Modal"
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
    );
}
