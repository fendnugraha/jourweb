import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import useUsers from "@/app/hooks/useUser";
import { AlertCircle, Building2, Contact2, Pencil, Phone, Plus, RectangleEllipsis, Search, Trash2, User } from "lucide-react";
import { useState } from "react";
import EditUser from "./EditUser";
import useContacts from "@/app/hooks/useContacts";
import useWarehouse from "@/app/hooks/useWarehouse";
import Notification from "@/app/components/Notification";
import CreateUser from "./CreateUser";
import UpdateUserPassword from "./UpdateUserPassword";

const UserTable = () => {
    const [searchTerm, setSearchTerm] = useState("");
    const [status, setStatus] = useState(1);
    const { users, loading, mutate } = useUsers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [notification, setNotification] = useState("");
    const [modalName, setModalName] = useState("create");
    const [modalTitle, setModalTitle] = useState("");
    const { warehouses, isLoading: isWarehousesLoading } = useWarehouse();
    const { contacts } = useContacts();

    const filteredUsers = users?.filter((user) => {
        const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = status === "all" || user.is_active === status;
        return matchesSearch && matchesStatus;
    });

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: 1, label: "Active" },
        { value: 0, label: "Inactive" },
    ];

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
                    {/* Status Dropdown */}
                    <div>
                        <Dropdown
                            id="user-status-filter"
                            label="User Status Filter"
                            options={statusOptions}
                            selectedValue={status}
                            onChange={(val) => setStatus(val)}
                            ariaLabel="Filter users by status"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex items-center gap-3 self-start sm:self-center">
                    <div className="flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs font-bold shrink-0">
                        <User className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        <span>{users?.length || 0}</span>
                        <span className="text-indigo-500/80 font-medium">Users</span>
                    </div>
                    <button
                        type="button"
                        onClick={() => {
                            setModalTitle("Create User");
                            setModalName("create");
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New User</span>
                    </button>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                                <th scope="col" className="px-6 py-4">
                                    User Details
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Role & Hak Akses
                                </th>
                                <th scope="col" className="px-6 py-4">
                                    Cabang / Warehouse
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Status
                                </th>
                                <th scope="col" className="px-6 py-4 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                            {filteredUsers?.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center space-y-2">
                                            <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-700 stroke-[1.5]" />
                                            <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">Tidak ada penggunan ditemukan</p>
                                            <p className="text-[11px] text-slate-400">Coba ubah kata kunci pencarian Anda</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers?.map((user) => {
                                    // Menentukan warna badge berdasarkan Role
                                    const getRoleBadgeColor = (roleName) => {
                                        switch (roleName?.toLowerCase()) {
                                            case "super admin":
                                            case "administrator":
                                                return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800/50";
                                            case "kasir":
                                                return "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/40 dark:text-indigo-300 dark:border-indigo-800/50";
                                            case "courier":
                                            case "kurir":
                                                return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/50";
                                            default:
                                                return "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700";
                                        }
                                    };

                                    // Mengambil inisial nama untuk Avatar Placeholder
                                    const getInitials = (name) => {
                                        if (!name) return "U";
                                        return name
                                            .split(" ")
                                            .map((n) => n[0])
                                            .slice(0, 2)
                                            .join("")
                                            .toUpperCase();
                                    };

                                    return (
                                        <tr key={user.id} className="group hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors">
                                            {/* 1. User Name, Avatar & Email */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center gap-3">
                                                    {/* Avatar Icon / Initial */}
                                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-50 font-bold text-xs text-indigo-600 border border-indigo-100 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-900/50">
                                                        {getInitials(user.name)}
                                                    </div>

                                                    <div className="space-y-0.5">
                                                        <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs">{user.name}</div>
                                                        <div className="text-[11px] text-slate-400 font-mono">{user.email}</div>
                                                        {user.contact?.phone && (
                                                            <div className="text-[10px] text-slate-400 flex gap-1">
                                                                <Phone className="h-3 w-3" /> {user.contact?.phone} <Contact2 className="h-3 w-3" />{" "}
                                                                {user.contact?.name || "-"}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>

                                            {/* 2. Role Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span
                                                    className={`inline-flex items-center rounded-lg border px-2.5 py-1 text-[11px] font-semibold ${getRoleBadgeColor(
                                                        user.role,
                                                    )}`}
                                                >
                                                    {user.role}
                                                </span>
                                            </td>

                                            {/* 3. Warehouse / Branch Location */}
                                            <td className="px-6 py-4 whitespace-nowrap text-slate-600 dark:text-slate-300">
                                                <div className="flex items-center gap-1.5 text-xs font-medium">
                                                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                                    <span>{user.warehouse?.name || "Semua Cabang (Global)"}</span>
                                                </div>
                                            </td>

                                            {/* 4. Status Dot Badge */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <span
                                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold border ${
                                                        user.is_active === 1 || user.is_active === true
                                                            ? "bg-emerald-50 text-emerald-700 border-emerald-200/80 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/50"
                                                            : "bg-slate-100 text-slate-500 border-slate-200 dark:bg-slate-800/80 dark:text-slate-400 dark:border-slate-700"
                                                    }`}
                                                >
                                                    <span
                                                        className={`h-1.5 w-1.5 rounded-full ${
                                                            user.is_active === 1 || user.is_active === true ? "bg-emerald-500 animate-pulse" : "bg-slate-400"
                                                        }`}
                                                    />
                                                    {user.is_active === 1 || user.is_active === true ? "Aktif" : "Nonaktif"}
                                                </span>
                                            </td>

                                            {/* 5. Action Buttons */}
                                            <td className="px-6 py-4 whitespace-nowrap text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setModalName("edit");
                                                            setModalTitle("Edit User");
                                                            setSelectedUser(user);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-all cursor-pointer"
                                                        title="Edit User"
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setModalName("update-password");
                                                            setModalTitle("Update Password");
                                                            setSelectedUser(user);
                                                            setIsModalOpen(true);
                                                        }}
                                                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/50 dark:hover:text-indigo-400 transition-all cursor-pointer"
                                                        title="Update Password"
                                                    >
                                                        <RectangleEllipsis className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        type="button"
                                                        onClick={() => onDeleteUser?.(user.id)}
                                                        className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/50 dark:hover:text-rose-400 transition-all cursor-pointer"
                                                        title="Hapus User"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} maxWidth="max-w-xl">
                {modalName === "create" && (
                    <CreateUser warehouses={warehouses} isModalOpen={setIsModalOpen} contacts={contacts} notification={setNotification} mutate={mutate} />
                )}
                {modalName === "edit" && (
                    <EditUser
                        key={selectedUser?.id}
                        user={selectedUser}
                        contacts={contacts}
                        warehouses={warehouses}
                        isModalOpen={setIsModalOpen}
                        notification={setNotification}
                        mutate={mutate}
                    />
                )}
                {modalName === "update-password" && (
                    <UpdateUserPassword isModalOpen={setIsModalOpen} user={selectedUser} notification={setNotification} mutate={mutate} />
                )}
            </Modal>
        </>
    );
};

export default UserTable;
