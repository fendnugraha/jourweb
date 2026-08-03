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
import axios from "@/app/utils/axios";
import ConfirmDialog from "@/app/components/ConfirmDialog";
import DateFilterDropdown from "@/app/components/DateFilterDropdown";

const FinanceContent = () => {
    const { today } = DateTimeNow();
    const [activeSubTab, setActiveSubTab] = useState("payables");
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [financeType, setFinanceType] = useState("Payable");
    const [notification, setNotification] = useState(null);

    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: "",
        endDate: "",
    });

    const { finances, financeGroup, loading, error, mutate } = useFinances({
        contact: selectedContactId,
        financeType,
        start: dateFilter.startDate || today,
        end: dateFilter.endDate || today,
    });

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

    const [journalToDelete, setJournalToDelete] = useState(null);

    const handleDeleteFinance = async (id) => {
        try {
            const response = await axios.delete(`/api/finance/${id}`);
            setNotification(response.data.message);
            fetchFinance();
        } catch (error) {
            console.log(error);
            setNotification(error.response?.data?.message || "Gagal menghapus data keuangan.");
        }
    };

    return (
        <div className="space-y-6">
            <Notification message={notification} onClose={() => setNotification(null)} />
            <motion.div
                className="grid grid-cols-1 gap-4 sm:grid-cols-3"
                initial="hidden"
                animate="show"
                variants={{
                    hidden: { opacity: 0 },
                    show: {
                        opacity: 1,
                        transition: {
                            staggerChildren: 0.08, // Tombol muncul bergantian
                        },
                    },
                }}
            >
                {[
                    { id: "payable", title: "Hutang Usaha", type: "Payable" },
                    { id: "receivable", title: "Piutang Usaha", type: "Receivable" },
                    { id: "saving", title: "Tabungan", type: "Saving" },
                ].map((item) => {
                    const isSelected = financeType === item.type;

                    return (
                        <motion.button
                            key={item.id}
                            type="button"
                            whileHover={{ y: -2, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.98 }}
                            variants={{
                                hidden: { opacity: 0, y: 15 },
                                show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
                            }}
                            className={`relative flex flex-col gap-4 text-left cursor-pointer sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors ${
                                isSelected ? "ring-2 ring-blue-500 border-transparent" : ""
                            }`}
                            onClick={() => {
                                setFinanceType(item.type);
                                setSelectedContactId("All");
                            }}
                        >
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{item.title}</h2>

                            {/* Animasi smooth saat Sisa Saldo muncul / hilang */}
                            <AnimatePresence mode="wait">
                                {isSelected && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -6 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -6 }}
                                        transition={{ duration: 0.15 }}
                                        className="text-xs font-medium text-slate-500 dark:text-slate-400"
                                    >
                                        Sisa: {formatRupiah(financeGroup?.reduce((acc, f) => acc + Number(f.sisa), 0) || 0)}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
            </motion.div>
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
                            placeholder="Search..."
                            aria-label="Search finance records"
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
                    <div>
                        <DateFilterDropdown
                            selectedPreset={dateFilter.preset}
                            customStartDate={dateFilter.startDate}
                            customEndDate={dateFilter.endDate}
                            onChange={(val) => setDateFilter(val)}
                            label="Transaction Date"
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
                            setFinanceType("Payable");
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
            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <PayableTable
                        finances={finances}
                        financeGroup={filteredFinances}
                        selectedContactId={selectedContactId}
                        setSelectedContactId={setSelectedContactId}
                        searchTerm={searchTerm}
                        setIsPaymentActive={setIsPaymentActive}
                        setIsModalOpen={setIsModalOpen}
                        setModalTitle={setModalTitle}
                        setJournalToDelete={setJournalToDelete}
                    />
                </div>
                <div className="space-y-4 sm:col-span-2">
                    <FinanceMutationHistory
                        finances={finances}
                        findContact={findContact}
                        selectedContactId={selectedContactId}
                        setJournalToDelete={setJournalToDelete}
                    />
                </div>
            </div>
            <Modal
                isOpen={isModalOpen}
                onClose={() => {
                    setIsModalOpen(false);
                    setIsPaymentActive(false);
                    setFinanceType("Payable");
                }}
                title={modalTitle}
                maxWidth="max-w-xl"
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
                            accounts={accounts}
                            notification={setNotification}
                            mutate={mutate}
                            setModalTitle={setModalTitle}
                            onClose={() => {
                                setIsModalOpen(false);
                                setIsPaymentActive(false);
                                setFinanceType("Payable");
                            }}
                        />
                    ))
                )}
            </Modal>
            <ConfirmDialog
                isOpen={journalToDelete !== null}
                onClose={() => setJournalToDelete(null)}
                onConfirm={() => {
                    if (journalToDelete) {
                        handleDeleteFinance(journalToDelete);
                        setJournalToDelete(null);
                    }
                }}
                title="Hapus Jurnal Hutang/Piutang"
                description="Apakah Anda yakin ingin menghapus entri buku besar ini? Tindakan ini akan memengaruhi laporan pendapatan kumulatif dan bersifat irreversibel."
            />
        </div>
    );
};

export default FinanceContent;
