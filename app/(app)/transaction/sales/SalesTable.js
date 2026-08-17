import Dropdown from "@/app/components/Dropdown";
import { useSales } from "@/app/hooks/useSales";
import { ClipboardPen, Plus, Receipt, Search, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import PointOfSale from "./PointOfSales";
import useProducts from "@/app/hooks/useProducts";
import axios from "@/app/utils/axios";
import SalesLog from "./SalesLog";
import SalesSummary from "./SalesSummary";
import { motion } from "framer-motion";
import SubTabSwitcher from "@/app/components/SubTabSwitcher";
import { DateTimeNow } from "@/app/utils/format";

function generateUniqueId(prefix) {
    if (typeof window !== "undefined") {
        return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
    return `${prefix}-${Math.floor(Math.random() * 1000000)}`;
}

const SalesTable = ({ warehouseId, notification, mutateJournal }) => {
    const { today } = DateTimeNow();
    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: today,
        endDate: today,
    });

    const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouseId);

    const { txByWarehouse, loading, error, mutate } = useSales({
        selectedWarehouse: selectedWarehouseId,
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
    });
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

        try {
            const response = await axios.post("/api/transactions", {
                cart,
                transaction_type: "Sales",
            });
            notification("POS Sale finalized & Stock decremented!");
            mutate();
            mutateJournal();
        } catch (e) {
            console.error("Failed to sync POS checkout via API:", e);
        }
    };

    const tabs = [
        { id: "pos", label: "Penjualan Barang (POS)", icon: ShoppingCart },
        { id: "ledger", label: "Log Transaksi", icon: Receipt },
        { id: "summary", label: "Ringkasan Penjualan", icon: ClipboardPen },
    ];

    useEffect(() => {
        if (dateFilter) {
            mutate();
        }
    }, [dateFilter, mutate]);

    return (
        <>
            <SubTabSwitcher subMenuTabs={tabs} activeSubTab={activeSubTab} setActiveSubTab={setActiveSubTab} />

            {activeSubTab === "pos" && <PointOfSale stockItems={products} onPOSCheckout={handlePOSCheckout} />}
            {activeSubTab === "ledger" && <SalesLog txByWarehouse={txByWarehouse} mutate={mutate} mutateJournal={mutateJournal} notification={notification} />}
            {activeSubTab === "summary" && (
                <SalesSummary
                    txByWarehouse={txByWarehouse}
                    dateFilter={dateFilter}
                    setDateFilter={setDateFilter}
                    mutate={mutate}
                    selectedWarehouseId={selectedWarehouseId}
                    setSelectedWarehouseId={setSelectedWarehouseId}
                />
            )}
        </>
    );
};

export default SalesTable;
