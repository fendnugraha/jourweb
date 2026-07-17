"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, ArrowLeftRight, Warehouse, ArrowUpDown, Ticket, ListCheck } from "lucide-react";
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

const TransactionContent = () => {
    const { user } = useAuth();
    const { today } = DateTimeNow();
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
    const { accounts, loading: loadingAccounts, error: errorAccounts } = useAccounts();

    const whAccounts = accounts.filter((account) => account.warehouse_id === warehouseId);
    const hqAccounts = accounts.filter((account) => account.warehouse_id === 1);

    const accountOptions = [{ value: "all", label: "All Accounts" }, ...whAccounts.map((account) => ({ value: account.id, label: account.group }))];
    const categoryOptions = [
        { value: "all", label: "All Type" },
        { value: "Transfer Uang", label: "Transfer Uang" },
        { value: "Tarik Tunai", label: "Tarik Tunai" },
        { value: "Mutasi Kas", label: "Mutasi Kas" },
        { value: "Pengeluaran", label: "Pengeluaran" },
    ];
    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [accountFilter, setAccountFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");

    // --- Sorting State ---
    const [sortField, setSortField] = useState("quantity");
    const [sortOrder, setSortOrder] = useState("asc");

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
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    // --- Delete confirmation state ---
    const [txToDelete, setTxToDelete] = useState(null);

    const handleDeleteTransaction = async (id) => {
        setNotification("Ledger entry deleted");

        try {
            await axios.delete(`/api/journals/${id}`);
            mutate();
        } catch (e) {
            console.error("Failed to delete transaction via API:", e);
        }
    };

    return (
        <>
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="space-y-6" id="stock-inventory-section">
                <div className="border-b border-slate-150 dark:border-slate-800 flex gap-6 pb-px">
                    <button
                        onClick={() => setActiveSubTab("transactions")}
                        className={`pb-3 text-sm font-bold relative transition-colors ${
                            activeSubTab === "transactions"
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <ArrowUpDown className="h-4 w-4" />
                            Transactions Journal
                        </span>
                        {activeSubTab === "transactions" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                    </button>
                    <button
                        onClick={() => setActiveSubTab("sales")}
                        className={`pb-3 text-sm font-bold relative transition-colors ${
                            activeSubTab === "sales" ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <Ticket className="h-4 w-4" />
                            Voucher & Deposit
                        </span>
                        {activeSubTab === "sales" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                    </button>
                    <button
                        onClick={() => setActiveSubTab("attendance")}
                        className={`pb-3 text-sm font-bold relative transition-colors ${
                            activeSubTab === "attendance"
                                ? "text-indigo-600 dark:text-indigo-400"
                                : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <ListCheck className="h-4 w-4" />
                            Absensi Karyawan
                        </span>
                        {activeSubTab === "attendance" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                    </button>
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
                                            options={accountOptions}
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
                                <div className="flex gap-2">
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
                                        onClick={() => setIsModalAddTransactionOpen(true)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                                    >
                                        <Plus className="h-4 w-4" />
                                        <span>Add Mutation</span>
                                    </button>
                                </div>
                            </div>

                            <JournalTable filteredTransactions={filteredTransactions} setTxToDelete={setTxToDelete} />
                        </motion.div>
                    )}
                </AnimatePresence>
                {/* --- ADD TRANSACTION --- */}
                <Modal isOpen={isModalAddTransactionOpen} onClose={() => setIsModalAddTransactionOpen(false)} title="Register New Transaction">
                    <CreateTransaction
                        warehouseCashId={warehouseCashId}
                        selectedBankAccount={selectedBankAccount}
                        setSelectedBankAccount={setSelectedBankAccount}
                        accountOptions={accountOptions}
                        mutate={mutate}
                        isModalOpen={setIsModalAddTransactionOpen}
                        notification={setNotification}
                        feeAuto={personalSetting.feeAdminAuto}
                        setPersonalSetting={setPersonalSetting}
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
