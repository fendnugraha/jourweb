import Dropdown from "@/app/components/Dropdown";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, Box, Calendar, Search, Tag } from "lucide-react";
import { useMemo, useState } from "react";

const SalesLog = ({ txByWarehouse }) => {
    const categoryOptions = [
        { value: "all", label: "All Categories" },
        { value: "Voucher & SP", label: "Voucher & SP" },
        { value: "Accessories", label: "Accessories" },
        { value: "Kabel Data", label: "Kabel Data" },
        { value: "Charger", label: "Charger" },
    ];

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const filteredTransactions = useMemo(() => {
        // 1. Tambahkan safe-guard (?.) jika txByWarehouse.sales masih null/undefined saat loading
        return (
            txByWarehouse.list?.filter((tx) => {
                // 2. Tambahkan (?.) setelah tx.product karena tidak semua transaksi memiliki relasi produk yang utuh
                const matchesSearchTerm = tx.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false;

                const matchesCategoryFilter = categoryFilter === "all" || tx.product?.category === categoryFilter;

                return matchesSearchTerm && matchesCategoryFilter;
            }) ?? []
        ); // 3. Kembalikan array kosong jika sales belum ada, supaya UI tidak error (.map is not a function)
    }, [txByWarehouse.list, searchTerm, categoryFilter]);

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

                    {/* Account Dropdown */}
                    {/* <div>
                                        <Dropdown
                                            id="stock-account-filter"
                                            label="Stock Account Filter"
                                            options={accountOptions}
                                            selectedValue={accountFilter}
                                            onChange={(val) => setAccountFilter(val)}
                                            ariaLabel="Filter inventory by account"
                                        />
                                    </div> */}

                    {/* Status Dropdown */}
                    <div>
                        <Dropdown
                            id="stock-category-filter"
                            label="Stock category Filter"
                            options={categoryOptions}
                            selectedValue={categoryFilter}
                            onChange={(val) => setCategoryFilter(val)}
                            ariaLabel="Filter inventory by category"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                    {/* <button
                        type="button"
                        onClick={() => setIsModalAddTransactionOpen(true)}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Add Voucher & SP</span>
                    </button> */}
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                <th scope="col" className="px-6 py-4">
                                    Item Details
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Category
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Qty
                                </th>
                                <th scope="col" className="px-6 py-4 text-right">
                                    Price
                                </th>
                                <th scope="col" className="px-6 py-4 text-right">
                                    Cost
                                </th>
                                <th scope="col" className="px-6 py-4 text-right">
                                    Profit
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                            {filteredTransactions.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                                            <p className="font-semibold text-xs">No matching transactions found</p>
                                            <p className="text-[10px] text-slate-400">Try adjusting your filters or search query</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredTransactions.map((tx) => (
                                    <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50">
                                        <td className="px-6 py-4 max-w-xs md:max-w-md text-wrap wrap-break-word">
                                            <div className="space-y-1">
                                                {/* 'truncate' dihapus agar teks bebas turun ke bawah */}
                                                <span className="font-bold text-slate-800 dark:text-slate-100 block">{tx.product?.name}</span>
                                                <span className="flex items-center gap-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                                                    <Calendar className="h-3 w-3" />
                                                    {formatDateTime(tx.date_issued)}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-800 dark:text-slate-400">
                                                <Tag className="h-3 w-3 text-slate-400" />
                                                {tx.product?.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">{tx.quantity * -1}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(tx.price)}</td>
                                        <td className="px-6 py-4 text-right">{formatNumber(tx.cost)}</td>
                                        <td className="px-6 py-4 text-right font-bold text-green-500">{formatRupiah(tx.price - tx.cost)}</td>
                                        <td className="px-6 py-4 text-center">
                                            <button className="text-indigo-600 hover:text-indigo-900">Details</button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
};

export default SalesLog;
