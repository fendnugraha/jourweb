import Dropdown from "@/app/components/Dropdown";
import { useSales } from "@/app/hooks/useSales";
import { ClipboardPen, Plus, Receipt, Search, ShoppingCart } from "lucide-react";
import { useState } from "react";
import PointOfSale from "./PointOfSales";
import useProducts from "@/app/hooks/useProducts";
import axios from "@/app/utils/axios";
import SalesLog from "./SalesLog";
import SalesSummary from "./SalesSummary";
import { formatRupiah } from "@/app/utils/format";

function generateUniqueId(prefix) {
    if (typeof window !== "undefined") {
        return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    return `${prefix}-${Math.floor(Math.random() * 1000000)}`;
}

const SalesTable = ({ warehouseId, startDate, endDate, notification }) => {
    const { txByWarehouse, loading, error, mutate } = useSales({ selectedWarehouse: warehouseId, startDate, endDate });
    const { products, loading: loadingProducts, error: errorProducts } = useProducts();

    const categoryOptions = [
        { value: "all", label: "All Categories" },
        { value: "Voucher & SP", label: "Voucher & SP" },
        { value: "Accessories", label: "Accessories" },
    ];

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const [activeSubTab, setActiveSubTab] = useState("pos");
    const [transactions, setTransactions] = useState([]);
    // Process POS checkout
    const handlePOSCheckout = async (newTx, cart) => {
        const transaction = {
            ...newTx,
            id: generateUniqueId("tx"),
        };

        const updatedTxs = [transaction, ...transactions];
        setTransactions(updatedTxs);

        // let updatedStock = [...stockItems];
        // if (itemDeductions.length > 0) {
        //     updatedStock = stockItems.map((item) => {
        //         const deduction = itemDeductions.find((d) => d.id === item.id);
        //         if (deduction) {
        //             return {
        //                 ...item,
        //                 quantity: Math.max(0, item.quantity - deduction.qty),
        //             };
        //         }
        //         return item;
        //     });
        //     setStockItems(updatedStock);
        // }

        try {
            const response = await axios.post("/api/transactions", { cart, transaction_type: "Sales" });
            notification("POS Sale finalized & Stock decremented!");
            mutate();
        } catch (e) {
            console.error("Failed to sync POS checkout via API:", e);
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
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                    <h1 className="font-semibold">Total : {formatRupiah(txByWarehouse.list?.reduce((acc, tx) => acc + tx.cost * tx.quantity * -1, 0))}</h1>
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
            <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px px-4">
                {[
                    { id: "pos", label: "Register POS Checkout", icon: ShoppingCart },
                    { id: "ledger", label: "Transaction History Log", icon: Receipt },
                    { id: "summary", label: "Sales Summary", icon: ClipboardPen },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`pb-3 text-xs font-bold relative transition-colors ${
                            activeSubTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </span>
                        {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                    </button>
                ))}
            </div>

            {activeSubTab === "pos" && <PointOfSale stockItems={products} onPOSCheckout={handlePOSCheckout} />}
            {activeSubTab === "ledger" && <SalesLog txByWarehouse={txByWarehouse} />}
            {activeSubTab === "summary" && <SalesSummary txByWarehouse={txByWarehouse} />}
        </>
    );
};

export default SalesTable;
