"use client";

import React, { useEffect, useMemo, useState } from "react";
import { Search, Plus, ArrowUpDown, Ticket, Signal, Landmark, CreditCard, Filter, ReceiptText, Loader2 } from "lucide-react";
import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import { useTransactions } from "@/app/hooks/useTransactions";
import { useAuth } from "@/app/utils/auth";
import { DateTimeNow, formatRupiah } from "@/app/utils/format";
import CreateTransaction from "./createTransaction";
import { useAccounts } from "@/app/hooks/useAccounts";
import Notification from "@/app/components/Notification";
import axios from "@/app/utils/axios";
import JournalTable from "./JournalTable";
import { motion, AnimatePresence } from "motion/react";
import CreateMutation from "../mutation/CreateMutation";
import CashBankBalance from "./CashBankBalance";
import SalesTable from "../sales/SalesTable";
import { useDailyDashboard } from "@/app/hooks/useDailyDashboard";
import useCashBankBalance from "@/app/hooks/useCashBankBalance";
import DepositLog from "../deposit/DepositLog";
import ExpenseLog from "./ExpenseLog";
import CashBankMutation from "../mutation/CashBankMutation";
import useWarehouse from "@/app/hooks/useWarehouse";
import MobileNavDrawer from "@/app/components/MobileNavDrawer";
import HeaderProfile from "../../HeaderProfile";
import ClosingReport from "./ClosingReport";

const TransactionContent = () => {
    const { user } = useAuth();
    const { today } = DateTimeNow();
    const userRole = user?.role;
    const warehouseId = user?.warehouse_id;
    const warehouseName = user?.warehouse?.name;
    const warehouseOpenCash = user?.warehouse?.primary_cash?.limit?.limit_amount || 9000000;

    const { warehouses = [], loading: loadingWarehouses, error: errorWarehouses } = useWarehouse();
    const warehouseCashId = warehouses.find((warehouse) => warehouse.id === warehouseId)?.primary_cash?.id;

    const [startDate, setStartDate] = useState(today);
    const [endDate, setEndDate] = useState(today);
    const [notification, setNotification] = useState(null);
    const [modalName, setModalName] = useState("create-transaction");

    // --- Data Fetching ---

    const { cashBankBalanceData, error: balanceError, isLoading, isValidating, mutate: mutateBalance } = useCashBankBalance(warehouseId, endDate);

    const {
        journalByWarehouse,
        isLoading: isJournalLoading,
        isValidating: isJournalValidating,
        error,
        mutate,
    } = useTransactions({
        selectedWarehouse: warehouseId,
        startDate: startDate,
        endDate: endDate,
    });

    const {
        dailyDashboard,
        mutate: mutateDashboard,
        isLoading: isDashboardLoading,
        isValidating: isDashboardValidating,
    } = useDailyDashboard(warehouseId, startDate, endDate);

    const totalSetoran =
        dailyDashboard?.data?.totalFee +
        dailyDashboard?.data?.totalCash +
        dailyDashboard?.data?.totalCashDeposit?.total +
        dailyDashboard?.data?.totalAccessories?.total +
        dailyDashboard?.data?.totalVoucher?.total +
        dailyDashboard?.data?.totalExpense;

    const { accounts = [], loading: loadingAccounts, error: errorAccounts } = useAccounts();

    const whAccounts = useMemo(() => accounts.filter((account) => account.warehouse_id === warehouseId), [accounts, warehouseId]);
    const hqAccounts = useMemo(() => accounts.filter((account) => account.warehouse_id === 1), [accounts]);
    const hqAccountIds = useMemo(() => hqAccounts.map((account) => account.id), [hqAccounts]);

    const accountOptions = useMemo(
        () =>
            whAccounts.map((account) => ({
                value: account.id,
                label: account.group,
            })),
        [whAccounts],
    );

    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [accountFilter, setAccountFilter] = useState("all");
    const [categoryFilter, setCategoryFilter] = useState("all");

    // --- Sub-Tab State ---
    const [activeSubTab, setActiveSubTab] = useState("transactions");

    // Objek data tab agar re-usable
    const navTabs = [
        { id: "transactions", label: "Transaction Journal", icon: ArrowUpDown },
        { id: "sales", label: "Voucher & Accessories", icon: Ticket },
        { id: "deposits", label: "Deposit (Pulsa, Token, Dll)", icon: Signal },
        { id: "expenses", label: "Pengeluaran (Biaya)", icon: CreditCard },
        { id: "accounts", label: "Saldo Kas dan Bank", icon: Landmark },
    ];

    // --- Filtered Transactions Memo ---
    const filteredTransactions = useMemo(() => {
        if (!journalByWarehouse) return [];
        return journalByWarehouse.filter((journal) => {
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

    // --- Category Options with Memoization ---
    const categoryOptions = useMemo(() => {
        const counts = (journalByWarehouse || []).reduce((acc, curr) => {
            acc[curr.trx_type] = (acc[curr.trx_type] || 0) + 1;
            return acc;
        }, {});

        return [
            { value: "all", label: "All Type", count: journalByWarehouse.length },
            {
                value: "Accessories",
                label: `Accessories`,
                count: counts["Accessories"] || 0,
            },
            {
                value: "Bank Fee",
                label: `Fee/Bunga Bank`,
                count: counts["Bank Fee"] || 0,
            },
            {
                value: "Mutasi Kas",
                label: `Mutasi Kas`,
                count: counts["Mutasi Kas"] || 0,
            },
            {
                value: "Pengeluaran",
                label: `Pengeluaran`,
                count: counts["Pengeluaran"] || 0,
            },
            {
                value: "Tarik Tunai",
                label: `Tarik Tunai`,
                count: counts["Tarik Tunai"] || 0,
            },
            {
                value: "Transfer Uang",
                label: `Transfer Uang`,
                count: counts["Transfer Uang"] || 0,
            },
            {
                value: "Voucher & SP",
                label: `Voucher & SP`,
                count: counts["Voucher & SP"] || 0,
            },
        ];
    }, [journalByWarehouse]);

    // --- Personal Setting Lazy Load Safe Check ---
    const [personalSetting, setPersonalSetting] = useState(() => {
        if (typeof window !== "undefined") {
            try {
                const storedSetting = localStorage.getItem("personalSetting");
                return storedSetting ? JSON.parse(storedSetting) : { feeAdminAuto: false, altFee: false };
            } catch (e) {
                console.error("Failed to parse personalSetting from localStorage", e);
            }
        }
        return { feeAdminAuto: false, altFee: false };
    });

    useEffect(() => {
        localStorage.setItem("personalSetting", JSON.stringify(personalSetting));
    }, [personalSetting]);

    // --- Modals State ---
    const [isModalAddTransactionOpen, setIsModalAddTransactionOpen] = useState(false);
    const [isModalAddMutationOpen, setIsModalAddMutationOpen] = useState(false);
    const [selectedBankAccount, setSelectedBankAccount] = useState(null);
    const [txToDelete, setTxToDelete] = useState(null);

    const handleDeleteTransaction = async (id) => {
        try {
            await axios.delete(`/api/journals/${id}`);
            setNotification("Ledger entry deleted");
            mutate();
            mutateBalance();
        } catch (e) {
            console.error("Failed to delete transaction via API:", e);
            setNotification("Failed to delete ledger entry");
        }
    };

    return (
        <div className="space-y-6">
            <Notification message={notification} onClose={() => setNotification(null)} />

            {/* HEADER WELCOME BANNER */}
            <HeaderProfile />

            <div className="space-y-6" id="stock-inventory-section">
                <MobileNavDrawer menuList={navTabs} activeTab={activeSubTab} setActiveTab={setActiveSubTab} />

                {/* TAB CONTENT WITH ANIMATION */}
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
                            {/* FILTER & BUTTON ACTIONS */}
                            <div className="p-3.5 sm:p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800 space-y-4">
                                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-3xl">
                                        {/* Search Input */}
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
                                                className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                                            />
                                        </div>

                                        {/* Account Dropdown */}
                                        <div className="w-full">
                                            <Dropdown
                                                id="stock-account-filter"
                                                label="Stock Account Filter"
                                                options={[{ value: "all", label: "Semua Akun" }, ...accountOptions]}
                                                selectedValue={accountFilter}
                                                onChange={(val) => setAccountFilter(val)}
                                                ariaLabel="Filter inventory by account"
                                            />
                                        </div>
                                    </div>

                                    {/* Action Buttons (Sejajar di Mobile) */}
                                    <div className="grid grid-cols-2 sm:flex sm:items-center gap-2.5 w-full lg:w-auto">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalName("create-transaction");
                                                setIsModalAddTransactionOpen(true);
                                            }}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-all"
                                        >
                                            <Plus className="h-4 w-4 shrink-0" />
                                            <span className="truncate">Tambah Transaksi</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setModalName("add-mutation");
                                                setIsModalAddMutationOpen(true);
                                            }}
                                            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-amber-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-amber-500 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 dark:bg-amber-600 dark:hover:bg-amber-500 transition-all"
                                        >
                                            <Plus className="h-4 w-4 shrink-0" />
                                            <span className="truncate">Mutasi Saldo</span>
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                mutateDashboard();
                                                setModalName("closing-report");
                                                setIsModalAddTransactionOpen(true);
                                            }}
                                            className="inline-flex items-center justify-between gap-1.5 rounded-xl bg-slate-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-lime-300 shadow-xs hover:bg-slate-500 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-500 dark:bg-slate-600 dark:hover:bg-slate-500 transition-all w-full sm:w-68 truncate col-span-2 sm:col-span-1"
                                        >
                                            <ReceiptText className="h-4 w-4 shrink-0" />
                                            {isDashboardLoading ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <span className={`${isDashboardValidating ? "animate-pulse" : ""} truncate`}>
                                                    {formatRupiah(totalSetoran - warehouseOpenCash)}
                                                </span>
                                            )}
                                        </button>
                                    </div>
                                </div>
                                <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                                    {categoryOptions.map((opt) => {
                                        const Icon = opt.icon;
                                        const isActive = categoryFilter === opt.value;

                                        return (
                                            <button
                                                key={opt.value}
                                                onClick={() => setCategoryFilter(opt.value)}
                                                className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors shrink-0 select-none ${
                                                    isActive
                                                        ? "text-white"
                                                        : "text-slate-600 hover:text-slate-900 bg-slate-100/80 hover:bg-slate-200/70 dark:bg-slate-800/80 dark:text-slate-300 dark:hover:bg-slate-700/60"
                                                }`}
                                            >
                                                {/* Background aktif yang meluncur/sliding */}
                                                {isActive && (
                                                    <motion.div
                                                        layoutId="activeCategoryTab"
                                                        transition={{
                                                            type: "spring",
                                                            stiffness: 400,
                                                            damping: 30,
                                                        }}
                                                        className="absolute inset-0 bg-indigo-600 rounded-xl shadow-sm shadow-indigo-500/30"
                                                    />
                                                )}

                                                {/* Konten Tab (diberi z-10 & motion.span agar animasi angka count mulus) */}
                                                <span className="relative z-10 flex items-center gap-1.5">
                                                    {Icon && <Icon className="w-3.5 h-3.5" />}
                                                    <span>{opt.label}</span>
                                                    <motion.span
                                                        key={opt.count} // Bikin angka mentransisi jika nilainya berubah
                                                        initial={{ scale: 0.8 }}
                                                        animate={{ scale: 1 }}
                                                        transition={{ duration: 0.15 }}
                                                        className={`px-1.5 py-0.5 text-[10px] font-mono rounded-full transition-colors ${
                                                            isActive
                                                                ? "bg-white/20 text-white"
                                                                : "bg-slate-200/80 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                                                        }`}
                                                    >
                                                        {opt.count}
                                                    </motion.span>
                                                </span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* MAIN GRID LAYOUT */}
                            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                                <div className="lg:col-span-1 lg:order-2">
                                    <CashBankBalance
                                        accountBalance={cashBankBalanceData}
                                        isLoading={isLoading}
                                        isValidating={isValidating}
                                        dailyDashboard={dailyDashboard}
                                    />
                                </div>

                                <div className="lg:col-span-3 lg:order-1 overflow-hidden">
                                    <JournalTable
                                        selectedBankAccount={selectedBankAccount}
                                        filteredTransactions={filteredTransactions}
                                        setTxToDelete={setTxToDelete}
                                        warehouseCashId={warehouseCashId}
                                        warehouseId={warehouseId}
                                        userRole={userRole}
                                        hqAccounts={hqAccounts}
                                        hqAccountIds={hqAccountIds}
                                        isJournalLoading={isJournalLoading}
                                        isJournalValidating={isJournalValidating}
                                        whAccounts={whAccounts}
                                        mutate={mutate}
                                        mutateBalance={mutateBalance}
                                        notification={setNotification}
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
                            <SalesTable
                                warehouseId={warehouseId}
                                startDate={startDate}
                                endDate={endDate}
                                notification={setNotification}
                                mutateJournal={mutate}
                            />
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
                            <DepositLog journals={journalByWarehouse} notification={setNotification} mutate={mutate} setTxToDelete={setTxToDelete} />
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
                                warehouseId={warehouseId}
                                warehouseCashId={warehouseCashId}
                                journals={journalByWarehouse}
                                notification={setNotification}
                                mutate={mutate}
                                mutateBalance={mutateBalance}
                                accounts={accounts}
                                setTxToDelete={setTxToDelete}
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
                                accountBalance={cashBankBalanceData}
                                accounts={accounts}
                                warehouseId={warehouseId}
                                endDate={endDate}
                                setIsModalAddMutationOpen={setIsModalAddMutationOpen}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* MODALS & CONFIRM DIALOGS */}
                <Modal
                    isOpen={isModalAddTransactionOpen}
                    onClose={() => setIsModalAddTransactionOpen(false)}
                    title={modalName === "create-transaction" ? "Register New Transaction" : "Laporan Harian"}
                >
                    {modalName == "create-transaction" && (
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
                    )}
                    {modalName === "closing-report" && (
                        <ClosingReport
                            dailyDashboard={dailyDashboard}
                            totalSetoran={totalSetoran}
                            warehouseName={warehouseName}
                            warehouseId={warehouseId}
                            warehouseCashId={warehouseCashId}
                            notification={setNotification}
                        />
                    )}
                </Modal>

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
        </div>
    );
};

export default TransactionContent;
