"use client";
import { useMemo, useState } from "react";
import PayableTable from "./PayableTable";
import { Clock11, CreditCard, PiggyBank, Plus, Search, Wallet } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useFinances } from "@/app/hooks/useFinance";
import { DateTimeNow, formatRupiah } from "@/app/utils/format";
import Modal from "@/app/components/Modal";
import { useAccounts } from "@/app/hooks/useAccounts";
import useContacts from "@/app/hooks/useContacts";
import CreateFinance from "./CreateFinance";
import Notification from "@/app/components/Notification";
import FinanceMutationHistory from "./FinanceMutationHistory";
import PaymentForm from "./PaymentForm";
import Dropdown from "@/app/components/Dropdown";
import CreateSaving from "./CreateSaving";

const FinanceContent = () => {
    const { today } = DateTimeNow();
    const [activeSubTab, setActiveSubTab] = useState("payables");
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [financeType, setFinanceType] = useState("Payable");
    const [notification, setNotification] = useState(null);
    const { finances, financeGroup, loading, error, mutate } = useFinances({ contact: selectedContactId, financeType, start: today, end: today });
    const { accounts, error: accountsError } = useAccounts();
    const { contacts, error: contactsError } = useContacts();
    // --- Search & Filter State ---
    const [searchTerm, setSearchTerm] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isPaymentActive, setIsPaymentActive] = useState(false);
    const [modalTitle, setModalTitle] = useState("Add Finance Mutation");
    const [status, setStatus] = useState("unpaid");
    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: "paid", label: "Paid" },
        { value: "unpaid", label: "Unpaid" },
    ];

    const contactOption = [
        { value: "", label: "Pilih Kontak" },
        ...contacts.map((contact) => ({
            value: contact.id,
            label: contact.name,
        })),
    ];

    const filteredFinances = useMemo(() => {
        return financeGroup.filter((finance) => {
            const paid = Number(finance.sisa) === 0;
            const unpaid = Number(finance.sisa) > 0;

            if (status === "all") {
                return true;
            }
            if (status === "paid") {
                return paid;
            }
            if (status === "unpaid") {
                return unpaid;
            }
            return false;
        });
    }, [financeGroup, status]);

    // ✅ Berikan properti default agar tidak undefined saat diakses
    const findContact =
        selectedContactId !== "All"
            ? financeGroup?.find((f) => f.contact_id === selectedContactId) || { contact_name: "Tidak Ditemukan", sisa: "-" }
            : { contact_name: "All", sisa: "-" };

    return (
        <>
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="grid sm:grid-cols-3 gap-4 mb-6">
                <button
                    type="button"
                    className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs ${financeType === "Payable" ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => {
                        setFinanceType("Payable");
                        setSelectedContactId("All");
                    }}
                >
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Hutang Usaha</h2>
                    {financeType === "Payable" && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sisa: {formatRupiah(financeGroup?.reduce((acc, f) => acc + Number(f.sisa), 0) || 0)}
                        </p>
                    )}
                </button>
                <button
                    type="button"
                    className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs ${financeType === "Receivable" ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => {
                        setFinanceType("Receivable");
                        setSelectedContactId("All");
                    }}
                >
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Piutang Usaha</h2>
                    {financeType === "Receivable" && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sisa: {formatRupiah(financeGroup?.reduce((acc, f) => acc + Number(f.sisa), 0) || 0)}
                        </p>
                    )}
                </button>
                <button
                    type="button"
                    className={`flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs ${financeType === "Saving" ? "ring-2 ring-blue-500" : ""}`}
                    onClick={() => {
                        setFinanceType("Saving");
                        setSelectedContactId("All");
                    }}
                >
                    <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Simpanan Karyawan</h2>
                    {financeType === "Saving" && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                            Sisa: {formatRupiah(financeGroup?.reduce((acc, f) => acc + Number(f.sisa), 0) || 0)}
                        </p>
                    )}
                </button>
            </div>
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
                    {/* Status Dropdown */}
                    <div>
                        <Dropdown
                            id="stock-status-filter"
                            label="Stock Status Filter"
                            options={statusOptions}
                            selectedValue={status}
                            onChange={(val) => setStatus(val)}
                            ariaLabel="Filter inventory by status"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setIsModalOpen(true);
                            setModalTitle("Add Finance Mutation");
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Hutang/Piutang</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            setFinanceType("Saving");
                            setIsModalOpen(true);
                            setModalTitle("Add Employee Savings");
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Simpanan Karyawan</span>
                    </button>
                </div>
            </div>
            <div className="space-y-6">
                <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px pt-4 px-4">
                    {/* Sub-Tab Buttons */}
                    {[
                        { id: "payables", label: "Financial Statements", icon: CreditCard },
                        { id: "history", label: `History Log ${findContact.contact_name}`, icon: Clock11 },
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
                    {activeSubTab === "payables" && (
                        <motion.div
                            key="payables"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.15 }}
                            className="space-y-6"
                        >
                            <PayableTable
                                finances={finances}
                                financeGroup={filteredFinances}
                                selectedContactId={selectedContactId}
                                setSelectedContactId={setSelectedContactId}
                                searchTerm={searchTerm}
                                setIsPaymentActive={setIsPaymentActive}
                                setIsModalOpen={setIsModalOpen}
                                setModalTitle={setModalTitle}
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
                            <FinanceMutationHistory finances={finances} findContact={findContact} selectedContactId={selectedContactId} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsPaymentActive(false);
                }}
                title={modalTitle}
            >
                {["Payable", "Receivable"].includes(financeType) ? (
                    isPaymentActive ? (
                        <PaymentForm
                            accounts={accounts}
                            type={financeType}
                            contactId={selectedContactId}
                            notification={setNotification}
                            fetchFinance={mutate}
                            isModalOpen={setIsModalOpen}
                        />
                    ) : (
                        <CreateFinance
                            contacts={contactOption}
                            accounts={accounts}
                            notification={setNotification}
                            mutate={mutate}
                            setModalTitle={setModalTitle}
                        />
                    )
                ) : (
                    financeType === "Saving" &&
                    (isPaymentActive ? (
                        <h1>Under Construction</h1>
                    ) : (
                        <CreateSaving
                            contacts={contactOption}
                            accounts={accounts}
                            notification={setNotification}
                            mutate={mutate}
                            setModalTitle={setModalTitle}
                        />
                    ))
                )}
            </Modal>
        </>
    );
};

export default FinanceContent;
