import Dropdown from "@/app/components/Dropdown";
import { useSales } from "@/app/hooks/useSales";
import {
  ClipboardPen,
  Plus,
  Receipt,
  Search,
  ShoppingCart,
} from "lucide-react";
import { useState } from "react";
import PointOfSale from "./PointOfSales";
import useProducts from "@/app/hooks/useProducts";
import axios from "@/app/utils/axios";
import SalesLog from "./SalesLog";
import SalesSummary from "./SalesSummary";
import { motion } from "framer-motion";

function generateUniqueId(prefix) {
  if (typeof window !== "undefined") {
    return `${prefix}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  }
  return `${prefix}-${Math.floor(Math.random() * 1000000)}`;
}

const SalesTable = ({
  warehouseId,
  startDate,
  endDate,
  notification,
  mutateJournal,
}) => {
  const { txByWarehouse, loading, error, mutate } = useSales({
    selectedWarehouse: warehouseId,
    startDate,
    endDate,
  });
  const {
    products,
    loading: loadingProducts,
    error: errorProducts,
  } = useProducts();

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

  return (
    <>
      <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl inline-flex gap-1 border border-slate-200/60 dark:border-slate-700/50 shadow-2xs">
        {tabs.map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer select-none ${
                isActive
                  ? "text-indigo-600 dark:text-indigo-400 font-bold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              }`}
            >
              {/* Animasi Background Pill Meluncur */}
              {isActive && (
                <motion.div
                  layoutId="activeSubTabIndicator"
                  className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}

              {/* Icon & Text (z-10 supaya di atas background animasi) */}
              <tab.icon
                className={`h-3.5 w-3.5 z-10 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
              />
              <span className="z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {activeSubTab === "pos" && (
        <PointOfSale stockItems={products} onPOSCheckout={handlePOSCheckout} />
      )}
      {activeSubTab === "ledger" && (
        <SalesLog
          txByWarehouse={txByWarehouse}
          mutate={mutate}
          mutateJournal={mutateJournal}
          notification={notification}
        />
      )}
      {activeSubTab === "summary" && (
        <SalesSummary txByWarehouse={txByWarehouse} />
      )}
    </>
  );
};

export default SalesTable;
