import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import Notification from "@/app/components/Notification";
import { useAccounts } from "@/app/hooks/useAccounts";
import { UserCheck, Building2, ShieldCheck, Edit2, Lock, Unlock, Key, Warehouse, FileText, Search, Plus, Wallet2, Scale } from "lucide-react";
import { useState } from "react";
import CreateAccount from "./account/CreateAccount";
import EditAccount from "./account/EditAccount";
import { useCategoryAccounts } from "@/app/hooks/useCategoryAccount";

const AccountTable = () => {
    const { categoryAccounts } = useCategoryAccounts();
    const { accounts, loading, mutate } = useAccounts();
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedAccount, setSelectedAccount] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalName, setModalName] = useState("create");
    const [modalTitle, setModalTitle] = useState("");

    const filteredAccounts = accounts?.filter((account) => account.name.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <>
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side Filters */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 dark:text-slate-500">
                            <Search className="h-4 w-4" aria-hidden="true" />
                        </span>
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search..."
                            aria-label="Search stock item list"
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-2 items-center">
                    <Scale size={28} strokeWidth={2} />
                    <h1 className="text-xl font-bold">
                        {filteredAccounts?.length || 0} <span className="text-slate-500 font-semibold">Accounts</span>
                    </h1>
                    <button
                        type="button"
                        onClick={() => {
                            setModalTitle("Create Account");
                            setModalName("create");
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Account</span>
                    </button>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <UserCheck className="w-3.5 h-3.5" />
                                        <span>Nama Akun</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>Warehouse</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <Wallet2 className="w-3.5 h-3.5" />
                                        <span>Saldo Awal</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Atribut & Akses</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                            {filteredAccounts?.length > 0 ? (
                                filteredAccounts.map((account) => (
                                    <tr key={account.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150">
                                        {/* 1. Nama Akun & Parent / Group */}
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-100">{account.name}</div>
                                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                <FileText className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span>{account.account?.name || "N/A"}</span>
                                                <span className="text-slate-300 dark:text-slate-700">•</span>
                                                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-medium text-slate-600 dark:text-slate-400">
                                                    {account.group || "N/A"}
                                                </span>
                                            </div>
                                        </td>

                                        {/* 2. Warehouse */}
                                        <td className="px-5 py-4">
                                            {account.warehouse?.name ? (
                                                <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 font-medium">
                                                    <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                                                    {account.warehouse.name}
                                                </span>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-600 font-medium italic">Tanpa Warehouse</span>
                                            )}
                                        </td>

                                        <td className="px-5 py-4 text-right">
                                            {account.st_balance !== undefined ? (
                                                <span className="font-medium">Rp {account.st_balance.toLocaleString()}</span>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-600 font-medium italic">Belum Ditentukan</span>
                                            )}
                                        </td>

                                        {/* 3. Status Badges & Icons */}
                                        <td className="px-5 py-4 text-center">
                                            <div className="flex items-center justify-start gap-1.5">
                                                {/* Lock / Unlock Badge */}
                                                <span
                                                    title={account.is_locked ? "Terkunci" : "Terbuka"}
                                                    className={`inline-flex items-center justify-center h-7 w-7 rounded-lg transition-colors ${
                                                        account.is_locked
                                                            ? "bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400"
                                                            : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                                    }`}
                                                >
                                                    {account.is_locked ? <Lock className="h-3.5 w-3.5" /> : <Unlock className="h-3.5 w-3.5" />}
                                                </span>

                                                {/* Primary Cash Badge */}
                                                {account.is_primary_cash === 1 && (
                                                    <span
                                                        title="Kas Utama (Primary Cash)"
                                                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400"
                                                    >
                                                        <Key className="h-3.5 w-3.5" />
                                                    </span>
                                                )}

                                                {/* Has Warehouse Attached Badge */}
                                                {account.warehouse && (
                                                    <span
                                                        title="Terikat ke Warehouse"
                                                        className="inline-flex items-center justify-center h-7 w-7 rounded-lg bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400"
                                                    >
                                                        <Warehouse className="h-3.5 w-3.5" />
                                                    </span>
                                                )}
                                            </div>
                                        </td>

                                        {/* 4. Action Button */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedAccount(account);
                                                    setModalName("edit");
                                                    setModalTitle("Edit Account");
                                                    setIsModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                <span>Edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty State jika data kosong */
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <UserCheck className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                            <p className="text-xs font-medium">Tidak ada data akun ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} maxWidth="max-w-md">
                {modalName === "create" && (
                    <CreateAccount isModalOpen={setIsModalOpen} categoryAccounts={categoryAccounts} notification={setNotification} mutate={mutate} />
                )}
                {modalName === "edit" && (
                    <EditAccount
                        key={selectedAccount?.id}
                        account={selectedAccount}
                        accounts={accounts}
                        isModalOpen={setIsModalOpen}
                        notification={setNotification}
                        mutate={mutate}
                    />
                )}
            </Modal>
        </>
    );
};

export default AccountTable;
