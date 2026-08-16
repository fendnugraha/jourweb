/* eslint-disable react-hooks/set-state-in-effect */
import useCashBankBalance from "@/app/hooks/useCashBankBalance";
import CashBankSummary from "../transaction/component/CashBankSummary";
import { useTransactions } from "@/app/hooks/useTransactions";
import { DateTimeNow } from "@/app/utils/format";
import { useState, useEffect } from "react";
import Modal from "@/app/components/Modal";
import CreateMutation from "../transaction/mutation/CreateMutation";
import { useAccounts } from "@/app/hooks/useAccounts";
import useWarehouse from "@/app/hooks/useWarehouse";
import Notification from "@/app/components/Notification";
import CashBankMutation from "../transaction/mutation/CashBankMutation";

export default function AdminDashboard({ userRole, warehouseId }) {
  const { today } = DateTimeNow();
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState(today);
  const [notification, setNotification] = useState(null);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState(warehouseId);
  const [isModalAddMutationOpen, setIsModalAddMutationOpen] = useState(false);

  useEffect(() => {
    if (warehouseId) {
      setSelectedWarehouseId(warehouseId);
    }
  }, [warehouseId]);

  // --- Data Fetching ---

  const {
    cashBankBalanceData,
    error: balanceError,
    isLoading: isBalanceLoading,
    isValidating: isBalanceValidating,
    mutate: mutateBalance,
  } = useCashBankBalance(selectedWarehouseId, endDate);

  const {
    journalByWarehouse,
    isLoading: isJournalLoading,
    isValidating: isJournalValidating,
    error: journalError,
    mutate,
  } = useTransactions({
    selectedWarehouse: selectedWarehouseId,
    startDate: startDate,
    endDate: endDate,
  });

  const {
    accounts = [],
    loading: loadingAccounts,
    error: errorAccounts,
  } = useAccounts();

  const {
    warehouses = [],
    loading: loadingWarehouses,
    error: errorWarehouses,
  } = useWarehouse();

  return (
    <div className="space-y-4">
      <Notification
        message={notification}
        onClose={() => setNotification(null)}
      />

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
    </div>
  );
}
