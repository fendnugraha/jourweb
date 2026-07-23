import axios from "@/app/utils/axios";
import { DateTimeNow, formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, ArrowRightLeft, Calendar, CreditCard, FileWarning, Plus, Search, Tag, Trash2 } from "lucide-react";
import { useState } from "react";

const DepositLog = ({ journals, notification, mutate }) => {
    const { today } = DateTimeNow();
    const [searchTerm, setSearchTerm] = useState("");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        date_issued: today,
        price: "",
        cost: "",
        description: "",
    });

    const filteredJournals = journals.filter((journal) => {
        const matchesSearchTerm = journal.description.toLowerCase().includes(searchTerm.toLowerCase()) && journal.trx_type === "Deposit";
        return matchesSearchTerm;
    });

    const handleAddTxSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-deposit", formData);
            const successMessage = response.data.message;
            notification(successMessage);
            mutate();
            setFormData({
                date_issued: today,
                price: "",
                cost: "",
                description: "",
            });
            // isModalOpen(false);
            // setErrors([]);
            setFormError("");
        } catch (error) {
            // setErrors(error.response.data.errors);
            setFormError(error.response?.data?.message);
            notification("Error: " + error.response?.data?.message, "error");
        } finally {
            setLoading(false);
        }
    };
    return (
        <>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side Filters */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    {/* Search SKU/Name */}
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search by SKU or Name..."
                            aria-label="Search stock item list"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>
                <h1 className="font-semibold text-lg">Total Deposit: {formatRupiah(filteredJournals.reduce((total, journal) => total + journal.amount, 0))}</h1>
            </div>

            <div className="flex gap-6">
                <div className="w-1/4 p-6 h-fit overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <form onSubmit={handleAddTxSubmit} className="space-y-4">
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

                        <div className="space-y-1 sm:col-span-2">
                            <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Harga jual (Rp IDR)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-amount"
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            price: e.target.value,
                                        });
                                    }}
                                    placeholder="53000"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </div>
                            {formData.price && !isNaN(parseFloat(formData.price)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: Rp {parseFloat(formData.price).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <label htmlFor="tx-cost" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Modal (Rp IDR)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-cost"
                                    type="number"
                                    required
                                    value={formData.cost}
                                    onChange={(e) => {
                                        setFormData({
                                            ...formData,
                                            cost: e.target.value,
                                        });
                                    }}
                                    placeholder="50000"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </div>
                            {formData.cost && !isNaN(parseFloat(formData.cost)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: Rp {parseFloat(formData.cost).toLocaleString("id-ID")}
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
                                placeholder="e.g. BRIVA, PLN, BPJS, etc."
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>

                        {/* Form Actions */}
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:bg-slate-400 disabled:cursor-not-allowed"
                            disabled={loading || formData.price === "" || formData.cost === ""}
                        >
                            {loading ? "Adding..." : "Add Entry"}
                        </button>
                    </form>
                </div>
                <div className="flex-1 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                    <th scope="col" className="px-6 py-4">
                                        Transaction Details
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right">
                                        Cash Amount
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                                {filteredJournals.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                                                <p className="font-semibold text-xs">No matching transactions found</p>
                                                <p className="text-[10px] text-slate-400">Try adjusting your filters or search query</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJournals.map((tx) => {
                                        return (
                                            <tr key={tx.id} className="group hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors duration-150">
                                                {/* Description & Date */}
                                                <td className="px-6 py-4 max-w-xs md:max-w-md text-wrap wrap-break-word">
                                                    <div className="space-y-1">
                                                        {/* 'truncate' dihapus agar teks bebas turun ke bawah */}
                                                        <span className="font-bold text-slate-800 dark:text-slate-100 block">{tx.description}</span>
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDateTime(tx.date_issued)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Amount with Rupiah custom formatting */}
                                                <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold">
                                                    <span className="text-slate-800 dark:text-slate-100">
                                                        {formatRupiah(tx.amount)}
                                                        <span className="text-slate-500 dark:text-slate-400 block" hidden={tx.fee_amount === 0}>
                                                            {formatNumber(tx.fee_amount)}
                                                        </span>
                                                    </span>
                                                </td>

                                                {/* Delete Action with SWR Sync */}
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setTxToDelete(tx.id)}
                                                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-rose-500 transition-all dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-rose-400"
                                                        title="Delete transaction entry"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default DepositLog;
