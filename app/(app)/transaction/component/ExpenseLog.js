import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, Calendar, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const ExpenseLog = ({ warehouseCashId, journals, notification, mutate, accounts }) => {
    const { today } = DateTimeNow();
    const [searchTerm, setSearchTerm] = useState("");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [expenseAmount, setExpenseAmount] = useState(0);
    const [errors, setErrors] = useState([]);

    const [formData, setFormData] = useState({
        date_issued: today,
        debt_id: "",
        cred_id: warehouseCashId,
        amount: 0,
        fee_amount: -expenseAmount,
        trx_type: "Pengeluaran",
        description: "",
    });

    const filteredJournals = useMemo(() => {
        return journals.filter((journal) => {
            const matchesSearchTerm = journal.description.toLowerCase().includes(searchTerm.toLowerCase()) && journal.trx_type === "Pengeluaran";
            return matchesSearchTerm;
        });
    }, [journals, searchTerm]);

    const accountOptions = [
        { value: "", label: "Pilih account" },
        ...accounts.filter((account) => account.account?.type === "Biaya").map((account) => ({ value: account.id, label: account.name })),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            notification(response.data.message);
            mutate();
            setFormData({
                date_issued: today,
                debt_id: formData.debt_id,
                cred_id: warehouseCashId,
                amount: 0,
                fee_amount: 0,
                trx_type: "Pengeluaran",
                description: "",
            });
            setExpenseAmount(0);
            setErrors([]);
            setFormError("");
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            setFormError(error.response?.data?.message || "Failed to create expense log.");
            console.log(error);
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
                <h1 className="font-semibold text-lg">Total Biaya: {formatRupiah(filteredJournals.reduce((total, journal) => total + journal.amount, 0))}</h1>
            </div>

            <div className="flex gap-6">
                <div className="w-1/4 p-6 h-fit overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
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

                        {/* Account drop down */}
                        <div className="space-y-1">
                            <label id="tx-account-label" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Account
                            </label>
                            <Dropdown
                                id="tx-account"
                                label="Transaction account Selector"
                                options={accountOptions}
                                selectedValue={formData.debt_id}
                                onChange={(val) => {
                                    setFormData({
                                        ...formData,
                                        debt_id: val,
                                    });
                                }}
                            />
                        </div>

                        <div className="space-y-1 sm:col-span-2">
                            <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Jumlah
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-amount"
                                    type="number"
                                    required
                                    value={expenseAmount}
                                    onChange={(e) => {
                                        setExpenseAmount(e.target.value);
                                        setFormData({
                                            ...formData,
                                            fee_amount: -e.target.value,
                                        });
                                    }}
                                    placeholder="50000"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                                />
                            </div>
                            {expenseAmount && !isNaN(parseFloat(expenseAmount)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: Rp {parseFloat(expenseAmount).toLocaleString("id-ID")}
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
                            disabled={loading || expenseAmount === ""}
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
                                                        <span className="font-bold text-slate-800 dark:text-slate-100 block capitalize">{tx.description}</span>
                                                        <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                            <Calendar className="h-3 w-3" />
                                                            {formatDateTime(tx.date_issued)}
                                                        </span>
                                                    </div>
                                                </td>

                                                {/* Amount with Rupiah custom formatting */}
                                                <td className="px-6 py-4 text-right whitespace-nowrap font-mono font-bold">
                                                    <span className="text-red-800 dark:text-red-100">
                                                        {formatRupiah(tx.fee_amount)}
                                                        {/* <span className="text-slate-500 dark:text-slate-400 block" hidden={tx.fee_amount === 0}>
                                                            {formatNumber(tx.fee_amount)}
                                                        </span> */}
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

export default ExpenseLog;
