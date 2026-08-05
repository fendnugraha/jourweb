import Dropdown from "@/app/components/Dropdown";
import Notification from "@/app/components/Notification";
import useContacts from "@/app/hooks/useContacts";
import { useFinances } from "@/app/hooks/useFinance";
import { DateTimeNow, formatRupiah } from "@/app/utils/format";
import { Plus, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import PayableTable from "../finance/PayableTable";
import FinanceMutationHistory from "../finance/FinanceMutationHistory";

const EmployeeReceivable = () => {
    const { today } = DateTimeNow();
    const [selectedContactId, setSelectedContactId] = useState("All");
    const [financeType, setFinanceType] = useState("EmployeeReceivable");
    const [notification, setNotification] = useState(null);
    const { contacts, error: contactsError } = useContacts();
    const { finances, financeGroup, loading, error, mutate } = useFinances({ contact: selectedContactId, financeType, start: today, end: today });
    console.log(finances, financeGroup);

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
        <div className="space-y-6">
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="grid sm:grid-cols-2 gap-4">
                {[
                    { id: "EmployeeReceivable", title: "Piutang Karyawan" },
                    { id: "InstallmentReceivable", title: "Piutang Cicilan" },
                ].map((item) => {
                    const isSelected = financeType === item.id;
                    return (
                        <motion.button
                            key={item.id}
                            type="button"
                            whileHover={{ y: -2, transition: { duration: 0.15 } }}
                            whileTap={{ scale: 0.98 }}
                            className={`flex flex-col gap-4 text-left cursor-pointer sm:flex-row sm:items-center sm:justify-between bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-xs transition-colors ${
                                isSelected ? "ring-2 ring-indigo-500 border-transparent" : ""
                            }`}
                            onClick={() => {
                                setFinanceType(item.id);
                                setSelectedContactId("All");
                            }}
                        >
                            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-50">{item.title}</h2>
                            <AnimatePresence mode="wait">
                                {isSelected && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -4 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -4 }}
                                        transition={{ duration: 0.15 }}
                                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                                    >
                                        Sisa: {formatRupiah(financeGroup?.reduce((acc, f) => acc + Number(f.sisa), 0) || 0)}
                                    </motion.p>
                                )}
                            </AnimatePresence>
                        </motion.button>
                    );
                })}
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
                            placeholder="Search .."
                            aria-label="Search list"
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
                            setModalTitle("Add Employee Receivable");
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>Piutang Karyawan</span>
                    </button>
                </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
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
                <div className="space-y-4">
                    <FinanceMutationHistory finances={finances} findContact={findContact} selectedContactId={selectedContactId} />
                </div>
            </div>
        </div>
    );
};

export default EmployeeReceivable;
