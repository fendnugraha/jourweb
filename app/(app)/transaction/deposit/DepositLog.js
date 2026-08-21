import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import Dropdown from "@/app/components/Dropdown";
import useWarehouse from "@/app/hooks/useWarehouse";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, ArrowRightLeft, Calendar, CreditCard, FileWarning, MapPin, Plus, Search, Tag, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const DepositLog = ({ journals, notification, mutate, setTxToDelete, dateFilter, setDateFilter, warehouseId, setWarehouseId, userRole }) => {
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

    const { warehouses } = useWarehouse();

    const warehouseOptions = [
        { value: "all", label: "Semua Cabang" },
        ...warehouses
            .filter((w) => w.status === 1)
            .map((warehouse) => ({
                value: warehouse.id,
                label: warehouse.name,
            })),
    ];

    const filteredJournals = useMemo(() => {
        return journals.filter((journal) => {
            const matchesSearchTerm = journal.description.toLowerCase().includes(searchTerm.toLowerCase()) && journal.trx_type === "Deposit";
            const isWarehouseAll = !warehouseId || warehouseId === "all";
            const matchesWarehouse = isWarehouseAll || String(journal.warehouse_id) === String(warehouseId);
            return matchesSearchTerm && matchesWarehouse;
        });
    }, [journals, searchTerm, warehouseId]);

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
            {/* 1. TOP HEADER & FILTER BAR */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
                <div className="flex-1 grid gap-3 sm:grid-cols-4 max-w-3xl">
                    <div className="relative sm:col-span-2">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search transaction memo or SKU..."
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9.5 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-100"
                        />
                    </div>
                    <div className="w-full">
                        <DateFilterDropdown
                            selectedPreset={dateFilter.preset}
                            customStartDate={dateFilter.startDate}
                            customEndDate={dateFilter.endDate}
                            onChange={(val) => setDateFilter(val)}
                            label="Transaction Date"
                        />
                    </div>
                    {["Administrator", "Super Admin"].includes(userRole) && (
                        <div>
                            <Dropdown
                                id="warehouse-filter"
                                label="Warehouse Filter"
                                options={warehouseOptions}
                                selectedValue={warehouseId}
                                onChange={(val) => setWarehouseId(val)}
                                ariaLabel="Filter by warehouse"
                                disabled={!["Administrator", "Super Admin"].includes(userRole)}
                            />
                        </div>
                    )}
                </div>

                {/* Total Deposit Stat Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-xl bg-indigo-50/60 border border-indigo-100 dark:bg-indigo-950/40 dark:border-indigo-900/50">
                    <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">Total Deposit:</span>
                    <span className="font-mono text-base font-bold text-indigo-700 dark:text-indigo-300">
                        {formatRupiah(filteredJournals.reduce((total, journal) => total + journal.amount, 0))}
                    </span>
                </div>
            </div>

            {/* 2. MAIN CONTENT GRID (Responsive Layout) */}
            <div className="mt-4 flex flex-col lg:flex-row gap-6 items-start">
                {/* LEFT COLUMN: FORM ENTRY (Sticky / Fixed Aspect) */}
                <div className="w-full lg:w-80 lg:shrink-0 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-4">
                    <div className="mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
                        <h2 className="text-sm font-bold text-slate-800 dark:text-slate-100">Tambah Transaksi</h2>
                        <p className="text-[11px] text-slate-400">Catat deposit atau penjualan baru</p>
                    </div>

                    <form onSubmit={handleAddTxSubmit} className="space-y-4">
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

                        {/* Harga Jual */}
                        <div className="space-y-1">
                            <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Harga Jual (Rp)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-amount"
                                    type="number"
                                    required
                                    value={formData.price}
                                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                    placeholder="53000"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-9 pr-3 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {formData.price && !isNaN(parseFloat(formData.price)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: Rp {parseFloat(formData.price).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>

                        {/* Modal / Cost */}
                        <div className="space-y-1">
                            <label htmlFor="tx-cost" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Modal / HPP (Rp)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-cost"
                                    type="number"
                                    required
                                    value={formData.cost}
                                    onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                                    placeholder="50000"
                                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 py-2 pl-9 pr-3 text-xs font-mono text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            {formData.cost && !isNaN(parseFloat(formData.cost)) && (
                                <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                    Preview: Rp {parseFloat(formData.cost).toLocaleString("id-ID")}
                                </p>
                            )}
                        </div>

                        {/* Description */}
                        <div className="space-y-1">
                            <label htmlFor="tx-desc" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Catatan / Memo
                            </label>
                            <input
                                id="tx-desc"
                                type="text"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                placeholder="e.g. BRIVA, PLN, BPJS"
                                className="w-full rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-800 dark:text-slate-100 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full rounded-xl bg-indigo-600 hover:bg-indigo-500 px-4 py-2.5 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer disabled:bg-slate-300 dark:disabled:bg-slate-800 disabled:cursor-not-allowed mt-2"
                            disabled={loading || formData.price === "" || formData.cost === ""}
                        >
                            {loading ? "Menyimpan..." : "+ Tambah Transaksi"}
                        </button>
                    </form>
                </div>

                {/* RIGHT COLUMN: TRANSACTION TABLE / CARD LIST */}
                <div className="flex-1 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                    {/* 1. STATE JIKA DATA KOSONG (Mobile & Desktop) */}
                    {filteredJournals.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center text-slate-400 dark:text-slate-500">
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                                <p className="font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-400">Tidak ada transaksi ditemukan</p>
                                <p className="text-[11px] text-slate-400">Coba ubah kata kunci pencarian Anda</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 2. TAMPILAN MOBILE (Card List) - Hanya muncul di layar kecil (< 640px) */}
                            <div className="block sm:hidden divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                                {filteredJournals.map((tx) => (
                                    <div key={tx.id} className="p-4 space-y-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                        {/* Baris Atas: Deskripsi & Tombol Hapus */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1 pr-2">
                                                <span className="font-semibold text-slate-800 dark:text-slate-100 block text-xs leading-snug">
                                                    {tx.description || "Tanpa Catatan"}
                                                </span>
                                                <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                                                    <Calendar className="h-3 w-3 text-slate-400" />
                                                    {formatDateTime(tx.date_issued)}
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => setTxToDelete(tx.id)}
                                                className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-all cursor-pointer"
                                                title="Hapus Transaksi"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Baris Bawah: Nominal & Fee */}
                                        <div className="flex items-center justify-between pt-1 border-t border-slate-50 dark:border-slate-800/40">
                                            <span className="text-[11px] text-slate-400 font-medium">Nominal:</span>
                                            <div className="text-right font-mono">
                                                <span className="font-bold text-slate-900 dark:text-slate-100 text-sm block">{formatRupiah(tx.amount)}</span>
                                                {tx.fee_amount > 0 && (
                                                    <span className="text-[10px] text-slate-400 font-normal block">Fee: {formatNumber(tx.fee_amount)}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 3. TAMPILAN DESKTOP (Table Layout) - Sembunyi di Mobile (>= 640px) */}
                            <div className="hidden sm:block overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                                            <th scope="col" className="px-6 py-4">
                                                Detail Transaksi
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-right">
                                                Nominal (Rp)
                                            </th>
                                            <th scope="col" className="px-6 py-4 text-center">
                                                Aksi
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                                        {filteredJournals.map((tx) => (
                                            <tr key={tx.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                                <td className="px-6 py-4 max-w-xs md:max-w-md">
                                                    <div className="space-y-1">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-100 block text-xs leading-snug">
                                                            {tx.description || "Tanpa Catatan"}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-mono">
                                                            <Calendar className="h-3 w-3 text-slate-400" />
                                                            {formatDateTime(tx.date_issued)}
                                                            <MapPin className="h-3 w-3 text-slate-400" />
                                                            {tx.warehouse?.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right whitespace-nowrap font-mono">
                                                    <span className="font-bold text-slate-900 dark:text-slate-100 text-sm">{formatRupiah(tx.amount)}</span>
                                                    {tx.fee_amount > 0 && (
                                                        <span className="text-[11px] text-slate-400 block font-normal">Fee: {formatNumber(tx.fee_amount)}</span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                                    <button
                                                        type="button"
                                                        onClick={() => setTxToDelete(tx.id)}
                                                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-all cursor-pointer"
                                                        title="Hapus Transaksi"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </>
    );
};

export default DepositLog;
