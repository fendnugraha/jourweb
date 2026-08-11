import Dropdown from "@/app/components/Dropdown";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import { AlertCircle, Box, Calendar, Search, Tag } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

const SalesSummary = ({ txByWarehouse }) => {
    const categoryOptions = [
        { value: "all", label: "All Categories" },
        { value: "Voucher & SP", label: "Voucher & SP" },
        { value: "Accessories", label: "Accessories" },
        { value: "Kabel Data", label: "Kabel Data" },
        { value: "Charger", label: "Charger" },
        { value: "Earphone", label: "Earphone" },
    ];

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const filteredTransactions = txByWarehouse.summary?.filter((tx) => {
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

    return (
        <>
            <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-4">
                {/* ================= FILTER BAR ================= */}
                <motion.div
                    variants={itemVariants}
                    className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 shadow-2xs"
                >
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
                                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 transition-all"
                            />
                        </div>

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

                    {/* Action Button Area */}
                    <div className="flex gap-4"></div>
                </motion.div>

                {/* ================= TABLES GRID ================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* 1. TABEL PENJUALAN VOUCHER & SP */}
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                    >
                        <h3 className="text-sm px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1 border-b border-slate-50 dark:border-slate-800/50">
                            PENJUALAN VOUCHER & SP
                            <span className="text-xs text-slate-400 block capitalize font-normal mt-0.5">
                                Tanggal: {new Date().toLocaleDateString("id-ID")}
                            </span>
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                        <th scope="col" className="px-6 py-4">
                                            Item Details
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Qty
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right hidden sm:table-cell">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right hidden sm:table-cell">
                                            Cost
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right hidden sm:table-cell">
                                            Profit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                                    <AnimatePresence mode="popLayout">
                                        {filteredTransactions.filter((tx) => tx.product?.category === "Voucher & SP").length === 0 ? (
                                            <motion.tr
                                                key="empty-voucher"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                    <div className="flex flex-col items-center justify-center space-y-2">
                                                        <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                                                        <p className="font-semibold text-xs">No matching transactions found</p>
                                                        <p className="text-[10px] text-slate-400">Try adjusting your filters or search query</p>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ) : (
                                            filteredTransactions
                                                .filter((tx) => tx.product?.category === "Voucher & SP")
                                                .map((tx) => (
                                                    <motion.tr
                                                        key={tx.product_id}
                                                        variants={rowVariants}
                                                        initial="hidden"
                                                        animate="show"
                                                        exit="exit"
                                                        layout
                                                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 max-w-xs md:max-w-md text-wrap wrap-break-word">
                                                            <div className="space-y-1">
                                                                <span className="font-bold text-slate-800 dark:text-slate-100 block">{tx.product?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">{tx.quantity * -1}</td>
                                                        <td className="px-6 py-4 text-right font-mono hidden sm:table-cell">
                                                            {formatNumber(tx.total_price * -1)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-mono hidden sm:table-cell">
                                                            {formatNumber(tx.total_cost * -1)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold font-mono text-emerald-500 hidden sm:table-cell">
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

                    {/* 2. TABEL PENJUALAN ACCESSORIES */}
                    <motion.div
                        variants={itemVariants}
                        className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xs dark:border-slate-800 dark:bg-slate-900"
                    >
                        <h3 className="text-sm px-4 py-3 font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-1 border-b border-slate-50 dark:border-slate-800/50">
                            PENJUALAN ACCESSORIES
                            <span className="text-xs text-slate-400 block capitalize font-normal mt-0.5">
                                Tanggal: {new Date().toLocaleDateString("id-ID")}
                            </span>
                        </h3>
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse text-left">
                                <thead>
                                    <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                        <th scope="col" className="px-6 py-4">
                                            Item Details
                                        </th>
                                        <th scope="col" className="px-6 py-4">
                                            Qty
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right hidden sm:table-cell">
                                            Price
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right hidden sm:table-cell">
                                            Cost
                                        </th>
                                        <th scope="col" className="px-6 py-4 text-right hidden sm:table-cell">
                                            Profit
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800">
                                    <AnimatePresence mode="popLayout">
                                        {filteredTransactions.filter((tx) => tx.product?.category !== "Voucher & SP").length === 0 ? (
                                            <motion.tr
                                                key="empty-accessories"
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                exit={{ opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                            >
                                                <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                                    <div className="flex flex-col items-center justify-center space-y-2">
                                                        <AlertCircle className="h-6 w-6 text-slate-300 dark:text-slate-700" />
                                                        <p className="font-semibold text-xs">No matching transactions found</p>
                                                        <p className="text-[10px] text-slate-400">Try adjusting your filters or search query</p>
                                                    </div>
                                                </td>
                                            </motion.tr>
                                        ) : (
                                            filteredTransactions
                                                .filter((tx) => tx.product?.category !== "Voucher & SP")
                                                .map((tx) => (
                                                    <motion.tr
                                                        key={tx.product_id}
                                                        variants={rowVariants}
                                                        initial="hidden"
                                                        animate="show"
                                                        exit="exit"
                                                        layout
                                                        className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                                                    >
                                                        <td className="px-6 py-4 max-w-xs md:max-w-md text-wrap wrap-break-word">
                                                            <div className="space-y-1">
                                                                <span className="font-bold text-slate-800 dark:text-slate-100 block">{tx.product?.name}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">{tx.quantity * -1}</td>
                                                        <td className="px-6 py-4 text-right font-mono hidden sm:table-cell">
                                                            {formatNumber(tx.total_price * -1)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-mono hidden sm:table-cell">
                                                            {formatNumber(tx.total_cost * -1)}
                                                        </td>
                                                        <td className="px-6 py-4 text-right font-bold font-mono text-emerald-500 hidden sm:table-cell">
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
                </div>
            </motion.div>
        </>
    );
};

export default SalesSummary;
