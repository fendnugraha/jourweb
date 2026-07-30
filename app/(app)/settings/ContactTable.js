import Modal from "@/app/components/Modal";
import Notification from "@/app/components/Notification";
import useContacts from "@/app/hooks/useContacts";
import { User, Phone, MapPin, Mail, Edit2, Search, Contact2, Plus } from "lucide-react";
import { useState } from "react";
import CreateContact from "./contact/CreateContact";
import EditContact from "./contact/EditContact";
const ContactTable = () => {
    const { contacts, loading, mutate } = useContacts();
    const [notification, setNotification] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedContact, setSelectedContact] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalName, setModalName] = useState("create");
    const [modalTitle, setModalTitle] = useState("");

    const filteredContacts = contacts.filter((contact) => contact.name.toLowerCase().includes(searchTerm.toLowerCase()) || contact.phone?.includes(searchTerm));

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
                    <Contact2 size={28} strokeWidth={2} />
                    <h1 className="text-xl font-bold">
                        {filteredContacts?.length || 0} <span className="text-slate-500 font-semibold">Contacts</span>
                    </h1>
                    <button
                        type="button"
                        onClick={() => {
                            setModalTitle("Create Contact");
                            setModalName("create");
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Contact</span>
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
                                        <User className="w-3.5 h-3.5" />
                                        <span>Name & Email</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <Phone className="w-3.5 h-3.5" />
                                        <span>Phone</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Address</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                            {filteredContacts?.length > 0 ? (
                                filteredContacts.map((contact) => (
                                    <tr key={contact.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150">
                                        {/* 1. Nama & Email */}
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-100">{contact.name}</div>
                                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                                                <span>{contact.email || "-"}</span>
                                            </div>
                                        </td>

                                        {/* 2. Phone */}
                                        <td className="px-5 py-4">
                                            {contact.phone ? (
                                                <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 border border-slate-200/50 dark:border-slate-700/50 font-mono text-slate-700 dark:text-slate-300">
                                                    <Phone className="w-3 h-3 text-indigo-500 shrink-0" />
                                                    <span>{contact.phone}</span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-400 dark:text-slate-600 italic">-</span>
                                            )}
                                        </td>

                                        {/* 3. Address */}
                                        <td className="px-5 py-4 max-w-xs text-slate-600 dark:text-slate-400" title={contact.address}>
                                            <div className="flex items-start gap-1.5">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                <span className="wrap-break-word line-clamp-2">{contact.address || "-"}</span>
                                            </div>
                                        </td>

                                        {/* 4. Action Button */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedContact(contact);
                                                    setModalTitle(`Edit Kontak: ${contact.name}`);
                                                    setModalName("edit");
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
                                            <User className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                            <p className="text-xs font-medium">Tidak ada data kontak ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} maxWidth="max-w-md">
                {modalName === "create" && <CreateContact isModalOpen={setIsModalOpen} notification={setNotification} mutate={mutate} />}
                {modalName === "edit" && (
                    <EditContact
                        key={selectedContact?.id}
                        contact={selectedContact}
                        isModalOpen={setIsModalOpen}
                        notification={setNotification}
                        mutate={mutate}
                    />
                )}
            </Modal>
        </>
    );
};

export default ContactTable;
