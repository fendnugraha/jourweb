/* eslint-disable react-hooks/set-state-in-effect */
import useCashBankBalance from "@/app/hooks/useCashBankBalance";
import { useTransactions } from "@/app/hooks/useTransactions";
import { DateTimeNow } from "@/app/utils/format";
import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import CreateMutation from "../transaction/mutation/CreateMutation";
import { useAccounts } from "@/app/hooks/useAccounts";
import useWarehouse from "@/app/hooks/useWarehouse";
import Notification from "@/app/components/Notification";
import CashBankMutation from "../transaction/mutation/CashBankMutation";
import { motion, AnimatePresence } from "motion/react";
import { RefreshCw } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.35, ease: "easeOut" } },
};

export default function AdminDashboard({ userRole, warehouseId }) {
  const { today } = DateTimeNow();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [notification, setNotification] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouseId);
  const [isModalAddMutationOpen, setIsModalAddMutationOpen] = useState(false);

  useEffect(() => {
    if (warehouseId) setSelectedWarehouseId(warehouseId);
  }, [warehouseId]);

  // --- Data Fetching ---

  const {
    cashBankBalanceData,
    isLoading: isBalanceLoading,
    isValidating: isBalanceValidating,
    mutate: mutateBalance,
  } = useCashBankBalance(selectedWarehouseId, endDate);

  const {
    journalByWarehouse,
    isLoading: isJournalLoading,
    isValidating: isJournalValidating,
    mutate,
  } = useTransactions({
    selectedWarehouse: selectedWarehouseId,
    startDate,
    endDate,
  });

  const { accounts = [] } = useAccounts();
  const { warehouses = [] } = useWarehouse();

  const isRefreshing = (isBalanceValidating && !isBalanceLoading) || (isJournalValidating && !isJournalLoading);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="space-y-4"
    >
      <Notification message={notification} onClose={() => setNotification(null)} />

      {/* Revalidation indicator */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900/40 w-fit"
          >
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            <span>Refreshing data...</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main content */}
      <motion.div variants={itemVariants}>
        <CashBankMutation
          journals={journalByWarehouse}
          accounts={accounts}
          accountBalance={cashBankBalanceData}
          warehouseId={selectedWarehouseId}
          onWarehouseChange={setSelectedWarehouseId}
          setIsModalAddMutationOpen={setIsModalAddMutationOpen}
          setNotification={setNotification}
          mutate={mutate}
          mutateBalance={mutateBalance}
          warehouses={warehouses}
          userRole={userRole}
        />
      </motion.div>

      {/* Add Mutation Modal */}
      <Modal
        isOpen={isModalAddMutationOpen}
        onClose={() => setIsModalAddMutationOpen(false)}
        title="Register New Mutation"
      >
        <CreateMutation
          accounts={accounts}
          mutate={mutate}
          mutateBalance={mutateBalance}
          isModalOpen={setIsModalAddMutationOpen}
          warehouseId={selectedWarehouseId}
          notification={setNotification}
          warehouses={warehouses}
          userRole={userRole}
        />
      </Modal>
    </motion.div>
  );
}
