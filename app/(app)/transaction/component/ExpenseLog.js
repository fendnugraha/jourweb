import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import Dropdown from "@/app/components/Dropdown";
import TabSwitcher from "@/app/components/TabSwitcher";
import useWarehouse from "@/app/hooks/useWarehouse";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, ArrowUpRight, BanknoteArrowDown, Calendar, MapPin, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";

const ExpenseLog = ({
    warehouseId,
    setWarehouseId,
    warehouseCashId,
    journals,
    notification,
    mutate,
    mutateBalance,
    accounts,
    setTxToDelete,
    userRole,
    ...props
}) => {
    const { today } = DateTimeNow();
    const [searchTerm, setSearchTerm] = useState("");
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [expenseAmount, setExpenseAmount] = useState("");
    const [errors, setErrors] = useState([]);
    const [activeTab, setActiveTab] = useState("operational");

    const [formData, setFormData] = useState({
        date_issued: today,
        debt_id: "",
        cred_id: warehouseCashId,
        amount: 0,
        fee_amount: -expenseAmount,
        trx_type: "Pengeluaran",
        description: "",
        active_tab: activeTab,
    });

    const filteredJournals = useMemo(() => {
        // 1. Proteksi jika journals berbentuk Pagination Laravel (journals.data) atau undefined
        const list = Array.isArray(journals) ? journals : journals?.data || [];

        return list.filter((journal) => {
            // 2. Filter Search Term (Safe null)
            const descriptionText = journal.description?.toLowerCase() || "";
            const matchesSearch = descriptionText.includes((searchTerm || "").toLowerCase());

            // 3. Filter trx_type (Case-insensitive / abaikan huruf besar-kecil)
            const isPengeluaran = journal.trx_type?.toLowerCase() === "pengeluaran";

            // 4. Filter Warehouse (Loloskan jika 'all', empty, null, atau cocok ID-nya)
            const isWarehouseAll = !warehouseId || warehouseId === "all";
            const matchesWarehouse = isWarehouseAll || String(journal.warehouse_id) === String(warehouseId);

            return matchesSearch && isPengeluaran && matchesWarehouse;
        });
    }, [journals, searchTerm, warehouseId]);

    const accountOptions = [
        { value: "", label: "Pilih Account" },
        ...accounts.filter((account) => account.account?.type === "Biaya").map((account) => ({ value: account.id, label: account.name })),
    ];

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

    const bankOptions = [
        { value: "", label: "Pilih Bank" },
        ...accounts
            .filter((account) => account.account_id === 2 && account.warehouse_id === warehouseId)
            .map((account) => ({ value: account.id, label: account.group })),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-mutation", formData);
            notification(response.data.message);
            setFormData({
                date_issued: today,
                debt_id: formData.debt_id,
                cred_id: warehouseCashId,
                amount: 0,
                fee_amount: 0,
                trx_type: "Pengeluaran",
                description: "",
                active_tab: formData.active_tab,
            });
            setExpenseAmount(0);
            setErrors([]);
            setFormError("");
            mutate();
            mutateBalance();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            setFormError(error.response?.data?.message || "Failed to create expense log.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const buttonList = [
        {
            icon: BanknoteArrowDown,
            value: "operational",
            label: "Operasional",
            onClick: () => {
                setActiveTab("operational");
                setFormData((prev) => ({
                    ...prev,
                    debt_id: "",
                    cred_id: warehouseCashId,
                    description: "",
                    active_tab: "operational",
                }));
            },
        },
        {
            icon: ArrowUpRight,
            value: "bankfee",
            label: "Admin Bank",
            onClick: () => {
                setActiveTab("bankfee");
                setFormData((prev) => ({
                    ...prev,
                    debt_id: warehouseCashId,
                    cred_id: formData.cred_id,
                    description: "Biaya Administrasi Bank",
                    amount: expenseAmount,
                    active_tab: "bankfee",
                }));
            },
        },
    ];

    return (
        <>
            {/* 1. HEADER BAR & FILTER */}

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-2xl bg-white/80 border border-slate-200/80 shadow-xs backdrop-blur-xl dark:bg-slate-900/80 dark:border-slate-800">
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
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
                    <div className="w-full">
                        <DateFilterDropdown
                            selectedPreset={props.dateFilter.preset}
                            customStartDate={props.dateFilter.startDate}
                            customEndDate={props.dateFilter.endDate}
                            onChange={(val) => props.setDateFilter(val)}
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

                {/* Total Biaya Stat Badge */}
                <div className="flex items-center justify-between sm:justify-end gap-3 px-4 py-2 rounded-xl bg-rose-50/60 border border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/40">
                    <span className="text-xs font-semibold text-rose-600 dark:text-rose-400">Total Biaya:</span>
                    <span className="font-mono text-base font-bold text-rose-700 dark:text-rose-300">
                        {formatRupiah(filteredJournals.reduce((total, journal) => total + journal.fee_amount * -1, 0))}
                    </span>
                </div>
            </div>

            {/* 2. MAIN CONTENT GRID */}
            <div className="grid sm:grid-cols-4 gap-6">
                {/* LEFT COLUMN: FORM EXPENSE (Sticky / Fixed Aspect) */}
                <div className="w-full rounded-2xl border border-slate-200/80 p-4 bg-white  shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:sticky lg:top-4">
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
                        <div className="space-y-1.5">
                            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Tipe Transaksi</span>

                            <TabSwitcher buttonList={buttonList} activeTab={activeTab} setActiveTab={setActiveTab} />
                        </div>

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
                        {activeTab === "operational" ? (
                            <div className="space-y-1">
                                <label id="tx-account-label" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Kategori Biaya
                                </label>
                                <Dropdown
                                    id="tx-account"
                                    label="Transaction account Selector"
                                    options={accountOptions}
                                    selectedValue={formData.debt_id}
                                    onChange={(val) => setFormData({ ...formData, debt_id: val })}
                                />
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label id="tx-bank-label" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                    Rekening Bank
                                </label>
                                <Dropdown
                                    id="tx-bank"
                                    label="Transaction bank Selector"
                                    options={bankOptions}
                                    selectedValue={formData.cred_id}
                                    onChange={(val) => setFormData({ ...formData, cred_id: val })}
                                />
                            </div>
                        )}

                        {/* Jumlah Biaya */}
                        <div className="space-y-1">
                            <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                                Jumlah (Rp)
                            </label>
                            <div className="relative">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                                <input
                                    id="tx-amount"
                                    type="number"
                                    required
                                    value={expenseAmount}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setExpenseAmount(val);

                                        // Buat objek data baru
                                        const updatedForm = {
                                            ...formData,
                                            fee_amount: -val,
                                        };

                                        // Pengecekan tab aktif
                                        if (activeTab === "bankfee") {
                                            updatedForm.amount = val;
                                        }

                                        setFormData(updatedForm);
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

                {/* RIGHT COLUMN: EXPENSE TABLE / CARD LIST */}
                <div className="flex-1 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900 sm:col-span-3">
                    {/* 1. STATE JIKA DATA KOSONG (Mobile & Desktop) */}
                    {filteredJournals.length === 0 ? (
                        <div className="p-8 sm:p-12 text-center text-slate-400 dark:text-slate-500">
                            <div className="flex flex-col items-center justify-center space-y-2">
                                <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                                <p className="font-semibold text-xs sm:text-sm text-slate-600 dark:text-slate-400">Tidak ada pencatatan biaya ditemukan</p>
                                <p className="text-[11px] text-slate-400">Coba ubah kata kunci pencarian Anda</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* 2. TAMPILAN MOBILE (Card List) - Hanya di HP (< 640px) */}
                            <div className="block sm:hidden divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                                {filteredJournals.map((tx) => (
                                    <div key={tx.id} className="p-4 space-y-3 hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors">
                                        {/* Header Kartu: Deskripsi & Tombol Hapus */}
                                        <div className="flex items-start justify-between gap-3">
                                            <div className="space-y-1.5 pr-2">
                                                <span className="font-semibold text-slate-800 dark:text-slate-100 block text-xs leading-snug capitalize">
                                                    {tx.description || "Tanpa Keterangan"}
                                                </span>

                                                {/* Info Tanggal & Gudang dalam Format Wrap yang Rapi */}
                                                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-400 font-mono">
                                                    <span className="inline-flex items-center gap-1">
                                                        <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                                                        {formatDateTime(tx.date_issued)}
                                                    </span>
                                                    {tx.warehouse?.name && (
                                                        <span className="inline-flex items-center gap-1">
                                                            <MapPin className="h-3 w-3 text-slate-400 shrink-0" />
                                                            {tx.warehouse.name}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>

                                            <button
                                                type="button"
                                                onClick={() => setTxToDelete(tx.id)}
                                                className="inline-flex shrink-0 items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-all cursor-pointer"
                                                title="Hapus Pengeluaran"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>

                                        {/* Footer Kartu: Total Nominal Biaya */}
                                        <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/40">
                                            <span className="text-[11px] text-slate-400 font-medium">Nominal Biaya:</span>
                                            <span className="font-bold text-rose-600 dark:text-rose-400 text-sm font-mono">{formatRupiah(tx.fee_amount)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* 3. TAMPILAN DESKTOP (Table Layout) - Di Layar Lebar (>= 640px) */}
                            <div className="hidden sm:block overflow-x-auto">
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
                                        {filteredJournals.map((tx) => (
                                            <tr key={tx.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-850/40 transition-colors">
                                                <td className="px-6 py-4 max-w-xs md:max-w-md">
                                                    <div className="space-y-1">
                                                        <span className="font-semibold text-slate-800 dark:text-slate-100 block text-xs leading-snug capitalize">
                                                            {tx.description || "Tanpa Keterangan"}
                                                        </span>
                                                        <span className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 font-mono">
                                                            <Calendar className="h-3 w-3 text-slate-400" />
                                                            {formatDateTime(tx.date_issued)}
                                                            {tx.warehouse?.name && (
                                                                <>
                                                                    <span className="text-slate-300 dark:text-slate-700">•</span>
                                                                    <MapPin className="h-3 w-3 text-slate-400" />
                                                                    {tx.warehouse.name}
                                                                </>
                                                            )}
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

export default ExpenseLog;
