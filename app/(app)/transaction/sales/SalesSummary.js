import Dropdown from "@/app/components/Dropdown";
import { formatDate, formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, Box, Calendar, Search, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useMemo, useState } from "react";
import DateFilterDropdown from "@/app/components/DateFilterDropdown";
import useWarehouse from "@/app/hooks/useWarehouse";

const SalesSummary = ({ txByWarehouse = [], dateFilter, setDateFilter, mutate, selectedWarehouseId, setSelectedWarehouseId }) => {
    const categoryOptions = [
        { value: "all", label: "All Categories" },
        { value: "Voucher & SP", label: "Voucher & SP" },
        { value: "Accessories", label: "Accessories" },
        { value: "Kabel Data", label: "Kabel Data" },
        { value: "Charger", label: "Charger" },
        { value: "Earphone", label: "Earphone" },
    ];

    const { warehouses } = useWarehouse();

    const warehouseOptions = [
        { value: "all", label: "All Warehouses" },
        ...warehouses.filter((w) => w.status === 1).map((warehouse) => ({ value: warehouse.id, label: warehouse.name })),
    ];

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const filteredTransactions = txByWarehouse?.summary?.filter((tx) => {
        const matchesSearchTerm = tx.product?.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategoryFilter = categoryFilter === "all" || tx.product?.category === categoryFilter;
        return matchesSearchTerm && matchesCategoryFilter;
    });

    const containerVariants = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 12 },
        show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" } },
    };

    const rowVariants = {
        hidden: { opacity: 0, x: -8 },
        show: { opacity: 1, x: 0, transition: { duration: 0.2 } },
        exit: { opacity: 0, x: 8, transition: { duration: 0.15 } },
    };

    const totalAccessories = useMemo(
        () => filteredTransactions?.filter((tx) => tx.product?.category !== "Voucher & SP").reduce((sum, tx) => sum + Number(tx.total_cost * -1), 0),
        [filteredTransactions],
    );
    const totalVoucher = useMemo(
        () => filteredTransactions?.filter((tx) => tx.product?.category === "Voucher & SP").reduce((sum, tx) => sum + Number(tx.total_cost * -1), 0),
        [filteredTransactions],
    );
    const voucherTx = useMemo(() => filteredTransactions?.filter((tx) => tx.product?.category === "Voucher & SP") || [], [filteredTransactions]);
    const accessoriesTx = useMemo(() => filteredTransactions?.filter((tx) => tx.product?.category !== "Voucher & SP") || [], [filteredTransactions]);
    return (
        <>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                {/* ================= FILTER BAR ================= */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-2xs"
                >
                    <div className="">
                        {/* UNIFIED FILTER GRID (Search, Category, Warehouse, & Date Filter) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full">
                            {/* Search SKU/Name */}
                            <div className="relative w-full">
                                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500 pointer-events-none">
                                    <Search className="h-4 w-4" aria-hidden="true" />
                                </span>
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Search by SKU or Name..."
                                    aria-label="Search stock item list"
                                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 transition-colors"
                                />
                            </div>

                            {/* Category Filter */}
                            <div className="w-full">
                                <Dropdown
                                    id="stock-category-filter"
                                    label="Stock category Filter"
                                    options={categoryOptions}
                                    selectedValue={categoryFilter}
                                    onChange={(val) => setCategoryFilter(val)}
                                    ariaLabel="Filter inventory by category"
                                />
                            </div>

                            {/* Warehouse Filter */}
                            <div className="w-full">
                                <Dropdown
                                    id="warehouse-filter"
                                    label="Warehouse Filter"
                                    options={warehouseOptions}
                                    selectedValue={selectedWarehouseId}
                                    onChange={(val) => setSelectedWarehouseId(val)}
                                    ariaLabel="Filter transactions by warehouse"
                                />
                            </div>

                            {/* Date Filter */}
                            <div className="w-full">
                                <DateFilterDropdown
                                    selectedPreset={dateFilter.preset}
                                    customStartDate={dateFilter.startDate}
                                    customEndDate={dateFilter.endDate}
                                    onChange={(val) => {
                                        setDateFilter(val);
                                        mutate();
                                    }}
                                    label="Transaction Date"
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* ================= TABLES GRID ================= */}
                {/* PRE-COMPUTE AT TOP OF COMPONENT OR RENDER METHOD:
  const voucherTx = useMemo(() => filteredTransactions?.filter((tx) => tx.product?.category === "Voucher & SP") || [], [filteredTransactions]);
  const accessoriesTx = useMemo(() => filteredTransactions?.filter((tx) => tx.product?.category !== "Voucher & SP") || [], [filteredTransactions]);
*/}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* REUSABLE TABLE CARD LOGIC */}
                    {[
                        {
                            title: "PENJUALAN VOUCHER & SP",
                            total: totalVoucher,
                            data: voucherTx,
                            emptyKey: "empty-voucher",
                        },
                        {
                            title: "PENJUALAN ACCESSORIES",
                            total: totalAccessories,
                            data: accessoriesTx,
                            emptyKey: "empty-accessories",
                        },
                    ].map((section) => (
                        <motion.div
                            key={section.title}
                            variants={itemVariants}
                            className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900"
                        >
                            {/* Header Card (Border melintas penuh) */}
                            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                                <div>
                                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-100">{section.title}</h3>
                                    <span className="text-[11px] text-slate-400 block font-normal mt-0.5">
                                        Tanggal: {formatDate(dateFilter.startDate)} s/d {formatDate(dateFilter.endDate)}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Total</span>
                                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{formatRupiah(section.total)}</span>
                                </div>
                            </div>

                            {/* Table Area */}
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-left">
                                    <thead>
                                        <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                            <th scope="col" className="px-4 py-3">
                                                Item Details
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-center">
                                                Qty
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right hidden sm:table-cell">
                                                Price
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right hidden sm:table-cell">
                                                Cost
                                            </th>
                                            <th scope="col" className="px-4 py-3 text-right hidden sm:table-cell">
                                                Profit
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                                        <AnimatePresence mode="popLayout">
                                            {section.data.length === 0 ? (
                                                <motion.tr
                                                    key={section.emptyKey}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0 }}
                                                    transition={{ duration: 0.2 }}
                                                >
                                                    <td colSpan={5} className="px-4 py-12 text-center text-slate-400 dark:text-slate-500">
                                                        <div className="flex flex-col items-center justify-center space-y-2">
                                                            <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                                                            <p className="font-semibold text-xs">No matching transactions found</p>
                                                            <p className="text-[10px] text-slate-400">Try adjusting your filters or search query</p>
                                                        </div>
                                                    </td>
                                                </motion.tr>
                                            ) : (
                                                section.data.map((tx, idx) => (
                                                    <motion.tr
                                                        key={tx.id || `${tx.product_id}-${idx}`}
                                                        variants={rowVariants}
                                                        initial="hidden"
                                                        animate="show"
                                                        exit="exit"
                                                        layout
                                                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                                                    >
                                                        <td className="px-4 py-3 max-w-xs wrap-break-word">
                                                            <span className="font-bold text-slate-800 dark:text-slate-100 block">{tx.product?.name}</span>
                                                        </td>
                                                        <td className="px-4 py-3 text-center font-mono">{tx.quantity * -1}</td>
                                                        <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">
                                                            {formatNumber(tx.total_price * -1)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">
                                                            {formatNumber(tx.total_cost * -1)}
                                                        </td>
                                                        <td className="px-4 py-3 text-right font-bold font-mono text-emerald-500 hidden sm:table-cell">
                                                            {formatRupiah((tx.total_price - tx.total_cost) * -1)}
                                                        </td>
                                                    </motion.tr>
                                                ))
                                            )}
                                        </AnimatePresence>
                                    </tbody>
                                </table>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>
        </>
    );
};

export default SalesSummary;
