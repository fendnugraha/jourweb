"use client";
import { useMemo, useState } from "react";
import PayableTable from "./PayableTable";
import { CreditCard, PiggyBank, Plus, Search, Wallet } from "lucide-react";
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
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [financeType, setFinanceType] = useState("Payable");
    const [notification, setNotification] = useState(null);

    const [dateFilter, setDateFilter] = useState({
        preset: "today",
        startDate: "",
        endDate: "",
    });

    // Hapus `contact: selectedContactId` dari hook useFinances
    const {
        finances = [],
        financeGroup = [],
        loading,
        error,
        mutate,
    } = useFinances({
        contact: "All", // Selalu minta semua kontak agar daftar di tabel kiri tidak hilang
        financeType,
        start: dateFilter.startDate || today,
        end: dateFilter.endDate || today,
    });

    const { accounts = [] } = useAccounts();
    const { contacts = [] } = useContacts();

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

    const contactOption = useMemo(
        () => [
            { value: "", label: "Pilih Kontak" },
            ...(contacts?.map((contact) => ({
                value: contact.id,
                label: contact.name,
            })) || []),
        ],
        [contacts],
    );

    // Optimize filtered finances dengan useMemo
    const filteredFinances = useMemo(() => {
        if (!Array.isArray(financeGroup)) return [];
        return financeGroup.filter((finance) => {
            const paid = Number(finance.sisa) === 0;
            const unpaid = Number(finance.sisa) > 0;

            if (status === "paid") return paid;
            if (status === "unpaid") return unpaid;
            return true; // "all"
        });
    }, [financeGroup, status]);

    // Safe Contact Lookup dengan useMemo
    const findContact = useMemo(() => {
        if (selectedContactId !== "All" && Array.isArray(financeGroup)) {
            return financeGroup.find((f) => f.contact_id === selectedContactId) || { contact_name: "Tidak Ditemukan", sisa: "-" };
        }
        return { contact_name: "All", sisa: "-" };
    }, [financeGroup, selectedContactId]);

    // Total Sisa SWR
    const totalSisa = useMemo(() => {
        if (!Array.isArray(financeGroup)) return 0;
        return financeGroup.reduce((acc, f) => acc + Number(f.sisa || 0), 0);
    }, [financeGroup]);

    const [journalToDelete, setJournalToDelete] = useState(null);

    const handleDeleteFinance = async (id) => {
        try {
            const response = await axios.delete(`/api/finance/${id}`);
            setNotification(response.data.message);
            mutate();
        } catch (err) {
            setNotification(err.response?.data?.message || "Gagal menghapus data keuangan.");
        }
    };

    return (
        <div className="space-y-6">
            <Notification message={notification} onClose={() => setNotification(null)} />

            {/* Smooth Tab Selector without Layout Jump */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                {[
                    {
                        id: "payable",
                        title: "Hutang Usaha",
                        type: "Payable",
                        icon: Wallet,
                        color: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50",
                    },
                    {
                        id: "receivable",
                        title: "Piutang Usaha",
                        type: "Receivable",
                        icon: CreditCard,
                        color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/50",
                    },
                    {
                        id: "saving",
                        title: "Tabungan",
                        type: "Saving",
                        icon: PiggyBank,
                        color: "text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/50",
                    },
                ].map((item) => {
                    const isSelected = financeType === item.type;
                    const IconComponent = item.icon;

                    return (
                        <button
                            key={item.id}
                            type="button"
                            onClick={() => {
                                setFinanceType(item.type);
                                setSelectedContactId("All");
                            }}
                            className={`relative flex items-center justify-between p-5 rounded-2xl border text-left cursor-pointer transition-all duration-200 ${
                                isSelected
                                    ? "bg-white dark:bg-slate-900 border-indigo-500/80 shadow-md ring-2 ring-indigo-500/20"
                                    : "bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 opacity-80 hover:opacity-100"
                            }`}
                        >
                            <div className="space-y-1">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">{item.title}</span>
                                <p className="text-lg font-bold font-mono text-slate-900 dark:text-slate-100">{isSelected ? formatRupiah(totalSisa) : "—"}</p>
                            </div>

                            <div
                                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-transform ${item.color} ${isSelected ? "scale-105" : ""}`}
                            >
                                <IconComponent className="h-5 w-5" />
                            </div>
                        </button>
                    );
                })}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Cari kontak..."
                            aria-label="Search finance records"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100 transition-colors"
                        />
                    </div>
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

                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => {
                            setIsModalOpen(true);
                            setModalTitle("Add Finance Mutation");
                            setFinanceType("Payable");
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden transition-colors cursor-pointer"
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
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden transition-colors cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Simpanan Karyawan</span>
                    </button>
                </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
                <div>
                    <PayableTable
                        financeGroup={filteredFinances}
                        selectedContactId={selectedContactId}
                        setSelectedContactId={setSelectedContactId}
                        searchTerm={searchTerm}
                        setIsPaymentActive={setIsPaymentActive}
                        setIsModalOpen={setIsModalOpen}
                        setModalTitle={setModalTitle}
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
                {["Payable", "Receivable", "EmployeeReceivable"].includes(financeType) ? (
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
                        <div className="p-4 text-center">Under Construction</div>
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
                description="Apakah Anda yakin ingin menghapus entri buku besar ini?"
            />
        </div>
    );
};

export default FinanceContent;
