"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, ArrowLeftRight, Warehouse, ArrowUpDown, Ticket, ListCheck, Signal, Sparkles, Landmark } from "lucide-react";
import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { useTransactions } from "@/app/hooks/useTransactions";
import { useAuth } from "@/app/utils/auth";
import { DateTimeNow } from "@/app/utils/format";
import CreateTransaction from "./createTransaction";
import { useAccounts } from "@/app/hooks/useAccounts";
import Notification from "@/app/components/Notification";
import axios from "@/app/utils/axios";
import JournalTable from "./JournalTable";
import { motion, AnimatePresence } from "motion/react";
import CreateMutation from "./CreateMutation";
import CashBankBalance from "./CashBankBalance";
import SalesTable from "./SalesTable";
import useCashBankBalance from "@/app/hooks/useCashBankBalance";
import DepositLog from "./DepositLog";
import ExpenseLog from "./ExpenseLog";
import CashBankMutation from "./CashBankMutation";
import useWarehouse from "@/app/hooks/useWarehouse";

const TransactionContent = () => {
    const { user } = useAuth();
    const { today } = DateTimeNow();
    const userRole = user.role;
    const warehouseId = user.warehouse_id;
    const warehouseCashId = user.warehouse?.primary_cash?.id;
    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [notification, setNotification] = useState(null);

    const { journalByWarehouse, loading, error, mutate } = useTransactions({
        selectedWarehouse: warehouseId,
        startDate: startDate,
        endDate: endDate,
    });
    const { data: accountBalance, error: balanceError, isValidating, mutate: mutateBalance } = useCashBankBalance(warehouseId, endDate);

    const { accounts, loading: loadingAccounts, error: errorAccounts } = useAccounts();
    const { warehouses, loading: loadingWarehouses, error: errorWarehouses } = useWarehouse();

    const whAccounts = accounts.filter((account) => account.warehouse_id === warehouseId);
    const hqAccounts = accounts.filter((account) => account.warehouse_id === 1);
    const hqAccountIds = hqAccounts.map((account) => account.id);

    const accountOptions = whAccounts.map((account) => ({ value: account.id, label: account.group }));

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // --- Sub-Tab State ---
    const [activeSubTab, setActiveSubTab] = useState("transactions");

    const filteredTransactions = useMemo(() => {
        return journalByWarehouse?.filter((journal) => {
            const matchAccount =
                accountFilter !== "all" && (Number(journal.cred_id) === Number(accountFilter) || Number(journal.debt_id) === Number(accountFilter));

            const matchCategory = categoryFilter !== "all" && journal.trx_type === categoryFilter;

            const matchSearchTerm =
                searchTerm &&
                ((journal.debt?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.cred?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.description ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.id ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.invoice ?? "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.amount ?? "").toString().toLowerCase().includes(searchTerm.toLowerCase()) ||
                    (journal.transaction ?? []).some((t) => (t.product?.name ?? "").toLowerCase().includes(searchTerm.toLowerCase())));

            if (accountFilter !== "all" && categoryFilter !== "all" && searchTerm) {
                return matchAccount && matchCategory && matchSearchTerm;
            }

            if (categoryFilter !== "all") {
                return matchCategory;
            }

            if (accountFilter !== "all") {
                return matchAccount;
            }

            if (searchTerm) {
                return matchSearchTerm;
            }

            return true;
        });
    }, [journalByWarehouse, accountFilter, searchTerm, categoryFilter]);

    // 1. Deklarasikan fungsi pembantu terlebih dahulu
    const lengthByType = (type) => {
        return filteredTransactions.filter((t) => t.trx_type === type).length;
    };

    // 2. Deklarasikan array options tanpa kurung kurawal ekstra di property label
    const categoryOptions = [
        { value: "all", label: "All Type" },
        { value: "Bank Fee", label: `Fee/Bunga Bank (${lengthByType("Bank Fee")})` },
        { value: "Mutasi Kas", label: `Mutasi Kas (${lengthByType("Mutasi Kas")})` },
        { value: "Pengeluaran", label: `Pengeluaran (${lengthByType("Pengeluaran")})` },
        { value: "Tarik Tunai", label: `Tarik Tunai (${lengthByType("Tarik Tunai")})` },
        { value: "Transfer Uang", label: `Transfer Uang (${lengthByType("Transfer Uang")})` },
    ];

    const [personalSetting, setPersonalSetting] = useState(() => {
        // 1. Baca langsung dari localStorage saat pertama kali state dibuat
        if (typeof window !== "undefined") {
            const storedSetting = localStorage.getItem("personalSetting");
            return storedSetting ? JSON.parse(storedSetting) : { feeAdminAuto: false, altFee: false };
        }
        return { feeAdminAuto: false, altFee: false };
    });

    // 2. Sekarang kamu cuma butuh SATU useEffect saja untuk menyimpan perubahan
    useEffect(() => {
        localStorage.setItem("personalSetting", JSON.stringify(personalSetting));
    }, [personalSetting]);

    const [isModalAddTransactionOpen, setIsModalAddTransactionOpen] = useState(false);
    const [isModalEditTransactionOpen, setIsModalEditTransactionOpen] = useState(false);
    const [isModalAddMutationOpen, setIsModalAddMutationOpen] = useState(false);
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    // --- Delete confirmation state ---
    const [txToDelete, setTxToDelete] = useState(null);

    const handleDeleteTransaction = async (id) => {
        try {
            await axios.delete(`/api/journals/${id}`);
            setNotification("Ledger entry deleted");

            mutate();
        } catch (e) {
            console.error("Failed to delete transaction via API:", e);
            setNotification("Failed to delete ledger entry");
        }
    };

    return (
        <>
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs">
                <div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-bold text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40 mb-1.5">
                        <Sparkles className="h-3 w-3" /> {user.warehouse?.name}
                    </span>
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Welcome Back, {user.name}</h2>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{user.role}</p>
                </div>
            </div>
            <div className="space-y-6" id="stock-inventory-section">
                <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px pt-4 px-4">
                    {/* Sub-Tab Buttons */}
                    {[
                        { id: "transactions", label: "Transaction Journal", icon: ArrowUpDown },
                        { id: "sales", label: "Voucher & Accessories", icon: Ticket },
                        { id: "deposits", label: "Deposit (Pulsa, Token, Dll)", icon: Signal },
                        { id: "expenses", label: "Pengeluaran (Biaya)", icon: Signal },
                        { id: "accounts", label: "Saldo Kas dan Bank", icon: Landmark },
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`pb-3 text-sm font-bold relative transition-colors ${
                                activeSubTab === tab.id
                                    ? "text-indigo-600 dark:text-indigo-400"
                                    : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
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
                <AnimatePresence mode="wait">
                    {activeSubTab === "transactions" && (
                        <motion.div
                            key="transactions"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
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
                                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                                        />
                                    </div>

                                    {/* Account Dropdown */}
                                    <div>
                                        <Dropdown
                                            id="stock-account-filter"
                                            label="Stock Account Filter"
                                            options={[{ value: "all", label: "All Accounts" }, ...accountOptions]}
                                            selectedValue={accountFilter}
                                            onChange={(val) => setAccountFilter(val)}
                                            ariaLabel="Filter inventory by account"
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

                                {/* Action Button */}
                                <div className="flex gap-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalAddTransactionOpen(true)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Transaction</span>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setIsModalAddMutationOpen(true)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-amber-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Mutation</span>
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-4">
                                <div className="sm:col-span-3">
                                    <JournalTable
                                        selectedBankAccount={selectedBankAccount}
                                        filteredTransactions={filteredTransactions}
                                        setTxToDelete={setTxToDelete}
                                        warehouseCashId={warehouseCashId}
                                        warehouseId={warehouseId}
                                        userRole={userRole}
                                        hqAccountIds={hqAccountIds}
                                    />
                                </div>
                                <div className="">
                                    <CashBankBalance
                                        journals={journalByWarehouse}
                                        accountBalance={accountBalance}
                                        warehouseId={warehouseId}
                                        endDate={endDate}
                                    />
                                </div>
                            </div>
                        </motion.div>
                    )}
                    {activeSubTab === "sales" && (
                        <motion.div
                            key="sales"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <SalesTable warehouseId={warehouseId} startDate={startDate} endDate={endDate} notification={setNotification} />
                        </motion.div>
                    )}

                    {activeSubTab === "deposits" && (
                        <motion.div
                            key="deposits"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <DepositLog journals={journalByWarehouse} notification={setNotification} mutate={mutate} />
                        </motion.div>
                    )}

                    {activeSubTab === "expenses" && (
                        <motion.div
                            key="expenses"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <ExpenseLog
                                warehouseCashId={warehouseCashId}
                                journals={journalByWarehouse}
                                notification={setNotification}
                                mutate={mutate}
                                accounts={accounts}
                            />
                        </motion.div>
                    )}

                    {activeSubTab === "accounts" && (
                        <motion.div
                            key="accounts"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <CashBankMutation
                                journals={journalByWarehouse}
                                mutate={mutate}
                                notification={setNotification}
                                accountBalance={accountBalance}
                                accounts={accounts}
                                warehouseId={warehouseId}
                                endDate={endDate}
                                setIsModalAddMutationOpen={setIsModalAddMutationOpen}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* --- ADD TRANSACTION --- */}
                <Modal isOpen={isModalAddTransactionOpen} onClose={() => setIsModalAddTransactionOpen(false)} title="Register New Transaction">
                    <CreateTransaction
                        warehouseCashId={warehouseCashId}
                        selectedBankAccount={selectedBankAccount}
                        setSelectedBankAccount={setSelectedBankAccount}
                        accounts={accounts}
                        warehouseId={warehouseId}
                        mutate={mutate}
                        mutateBalance={mutateBalance}
                        isModalOpen={setIsModalAddTransactionOpen}
                        notification={setNotification}
                        feeAuto={personalSetting.feeAdminAuto}
                        setPersonalSetting={setPersonalSetting}
                    />
                </Modal>

                {/* --- ADD MUTATION --- */}
                <Modal isOpen={isModalAddMutationOpen} onClose={() => setIsModalAddMutationOpen(false)} title="Register New Mutation">
                    <CreateMutation
                        accounts={accounts}
                        mutate={mutate}
                        mutateBalance={mutateBalance}
                        isModalOpen={setIsModalAddMutationOpen}
                        warehouseId={warehouseId}
                        notification={setNotification}
                        warehouses={warehouses}
                        userRole={userRole}
                    />
                </Modal>
                {/* --- CONFIRMATION POPOVER FOR TX DELETES --- */}
                <ConfirmDialog
                    isOpen={txToDelete !== null}
                    onClose={() => setTxToDelete(null)}
                    onConfirm={() => {
                        if (txToDelete) {
                            handleDeleteTransaction(txToDelete);
                            setTxToDelete(null);
                        }
                    }}
                    title="Delete Ledger Transaction"
                    description="Are you absolutely sure you want to delete this bookkeeping entry? This operational ledger action will affect cumulative revenue reports and is irreversible."
                />
            </div>
        </>
    );
};

export default TransactionContent;
