/* eslint-disable react-hooks/set-state-in-effect */
import Dropdown from "@/app/components/Dropdown";
import Notification from "@/app/components/Notification";
import { AnimatePresence, motion } from "motion/react";
import { Coins, Plus, ReceiptText, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import CashBankSummary from "../component/CashBankSummary";
import MutationHistoryLog from "./MutationHistoryLog";

const CashBankMutation = ({
  journals = [],
  accountBalance,
  accounts = [],
  warehouseId,
  onWarehouseChange,
  setIsModalAddMutationOpen,
  mutate,
  mutateBalance,
  warehouses = [],
  userRole,
}) => {
  const [notification, setNotification] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [accountFilter, setAccountFilter] = useState("all");
  const [activeSubTab, setActiveSubTab] = useState("balances");
  const [localWarehouseId, setLocalWarehouseId] = useState(warehouseId);

  useEffect(() => {
    if (warehouseId) {
      setLocalWarehouseId(warehouseId);
    }
  }, [warehouseId]);

  const activeWarehouseId = onWarehouseChange ? warehouseId : localWarehouseId;

  const handleWarehouseChange = (val) => {
    setLocalWarehouseId(val);
    if (typeof onWarehouseChange === "function") {
      onWarehouseChange(val);
    }
  };

  const accountOptions = [
    { value: "all", label: "Semua akun" },
    ...accounts
      .filter(
        (account) =>
          Number(account.warehouse_id) === Number(activeWarehouseId),
      )
      .map((account) => ({ value: account.id, label: account.group })),
  ];

  const warehouseOptions = useMemo(() => {
    return warehouses
      .filter((w) => Number(w.status) === 1)
      .map((w) => ({ value: w.id, label: w.name }));
  }, [warehouses]);

  return (
    <div className="space-y-6">
      <Notification
        message={notification}
        onClose={() => setNotification(null)}
      />
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
        {/* Left Side Filters */}
        <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
          {/* Search Input */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
              <Search className="h-4 w-4" aria-hidden="true" />
            </span>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search..."
              aria-label="Search mutation history"
              className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>

          {/* Account Dropdown */}
          <div>
            <Dropdown
              id="stock-account-filter"
              label="Stock Account Filter"
              options={accountOptions}
              selectedValue={accountFilter}
              onChange={(val) => setAccountFilter(val)}
              ariaLabel="Filter inventory by account"
            />
          </div>

          {["Administrator", "Super Admin"].includes(userRole) && (
            <div className="w-full">
              <Dropdown
                id="admin-warehouse-selector"
                label="Filter Cabang"
                options={warehouseOptions}
                selectedValue={activeWarehouseId}
                onChange={handleWarehouseChange}
              />
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-4">
          <button
            type="button"
            onClick={() =>
              setIsModalAddMutationOpen && setIsModalAddMutationOpen(true)
            }
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Mutation</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px px-4">
        {[
          { id: "balances", label: "Saldo Kas & Bank", icon: Coins },
          { id: "history", label: "Mutation History Log", icon: ReceiptText },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`pb-3 text-xs font-bold relative transition-colors cursor-pointer ${
              activeSubTab === tab.id
                ? "text-indigo-600 dark:text-indigo-400"
                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            }`}
          >
            <span className="flex items-center gap-1.5">
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </span>
            {activeSubTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {activeSubTab === "balances" && (
          <motion.div
            key="balances"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <CashBankSummary
              accountBalance={accountBalance}
              journals={journals}
              warehouseId={activeWarehouseId}
            />
          </motion.div>
        )}
        {activeSubTab === "history" && (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="space-y-6"
          >
            <MutationHistoryLog
              journals={journals}
              warehouseId={activeWarehouseId}
              setNotification={setNotification}
              mutate={mutate}
              mutateBalance={mutateBalance}
              searchTerm={searchTerm}
              accountFilter={accountFilter}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CashBankMutation;
