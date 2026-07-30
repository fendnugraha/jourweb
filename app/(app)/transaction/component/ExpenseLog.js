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
            {/* 1. HEADER BAR & FILTER */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search expense description..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9.5 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100"
                        />
                    </div>
                </div>

                {/* Total Biaya Stat Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-xl bg-rose-50/60 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/40">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Total Biaya:</span>
                    <span className="font-mono text-base font-bold text-rose-700 dark:text-rose-300">
                        {formatRupiah(filteredJournals.reduce((total, journal) => total + journal.fee_amount * -1, 0))}
                    </span>
                </div>
            </div>

            {/* 2. MAIN CONTENT GRID */}
            <div className="mt-4 flex flex-col lg:flex-row gap-6 items-start">
                {/* LEFT COLUMN: FORM EXPENSE (Sticky / Fixed Aspect) */}
                <div className="w-full lg:w-80 lg:shrink-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-4">
                    <div className="mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Catat Biaya / Pengeluaran</h2>
                        <p className="text-[11px] text-slate-400">Masukkan rincian operasional baru</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        {formError && (
                            <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-start gap-2 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900/50">
                                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                                <span>{formError}</span>
                            </div>
                        )}

                        {/* Date Input */}
                        <div className="space-y-1">
                            <label htmlFor="tx-date" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Tanggal Registrasi
                            </label>
                            <input
                                id="tx-date"
                                type="datetime-local"
                                required
                                value={formData.date_issued}
                                onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Account Selection */}
                        <div className="space-y-1">
                            <label id="tx-account-label" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Akun / Sumber Dana
                            </label>
                            <Dropdown
                                id="tx-account"
                                label="Transaction account Selector"
                                options={accountOptions}
                                selectedValue={formData.debt_id}
                                onChange={(val) => setFormData({ ...formData, debt_id: val })}
                            />
                        </div>

                        {/* Jumlah Biaya */}
                        <div className="space-y-1">
                            <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Jumlah Biaya (Rp)
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
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-9 pr-3 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {expenseAmount && !isNaN(parseFloat(expenseAmount)) && (
                                <p className="text-[11px] text-rose-600 dark:text-rose-400 font-mono mt-1 font-semibold">
                                    Preview: -Rp {parseFloat(expenseAmount).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Keterangan / Memo
                            </label>
                            <input
                                id="tx-desc"
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. Listrik, Wifi, Biaya Admin"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Submit Action */}
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed mt-2"
                            disabled={loading || expenseAmount === ""}
                        >
                            {loading ? "Menyimpan..." : "+ Catat Biaya"}
                        </button>
                    </form>
                </div>

                {/* RIGHT COLUMN: EXPENSE TABLE */}
                <div className="flex-1 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse text-left">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                                    <th scope="col" className="px-6 py-4">
                                        Rincian Pengeluaran
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-right">
                                        Nominal Biaya
                                    </th>
                                    <th scope="col" className="px-6 py-4 text-center">
                                        Aksi
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                                {filteredJournals.length === 0 ? (
                                    <tr>
                                        {/* ✅ Fix colSpan dari 5 menjadi 3 */}
                                        <td colSpan={3} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                            <div className="flex flex-col items-center justify-center space-y-2">
                                                <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                                                <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">Tidak ada pencatatan biaya ditemukan</p>
                                                <p className="text-[11px] text-slate-400">Coba ubah kata kunci pencarian Anda</p>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    filteredJournals.map((tx) => (
                                        <tr key={tx.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors">
                                            <td className="px-6 py-4 max-w-xs md:max-w-md">
                                                <div className="space-y-1">
                                                    <span className="font-semibold text-slate-800 dark:text-slate-100 block text-xs leading-snug capitalize">
                                                        {tx.description || "Tanpa Keterangan"}
                                                    </span>
                                                    <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                                                        <Calendar className="h-3 w-3 text-slate-400" />
                                                        {formatDateTime(tx.date_issued)}
                                                    </span>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right whitespace-nowrap font-mono">
                                                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">{formatRupiah(tx.fee_amount)}</span>
                                            </td>

                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <button
                                                    type="button"
                                                    onClick={() => setTxToDelete(tx.id)}
                                                    className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-all cursor-pointer"
                                                    title="Hapus Pengeluaran"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
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
