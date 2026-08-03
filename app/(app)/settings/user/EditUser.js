import Dropdown from "@/app/components/Dropdown";
import { useAuth } from "@/app/utils/auth";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const EditUser = ({ isModalOpen, contacts, warehouses, notification, user, mutate }) => {
    const { user: currentUser } = useAuth({ middleware: "auth" });
    const userRole = currentUser?.role?.role || user.role;
    const [loading, setLoading] = useState(false);
    const [updateUserData, setUpdateUserData] = useState({
        name: user?.name,
        email: user?.email,
        warehouse: user?.role?.warehouse_id || user?.warehouse_id,
        role: user?.role?.role || user?.role,
        contact: user?.contact_id,
    });
    const id = user?.id;

    // Konversi warehouses
    const warehouseOptions =
        warehouses?.map((w) => ({
            value: w.id,
            label: w.name,
        })) || [];

    // Konversi contacts
    const contactOptions =
        contacts?.map((c) => ({
            value: c.id,
            label: c.name,
        })) || [];

    // Opsi Role (termasuk kondisi Super Admin)
    const roleOptions = [
        { value: "Administrator", label: "Administrator" },
        { value: "Cashier", label: "Kasir" },
        { value: "Co-Cashier", label: "Co Kasir" },
        { value: "Courier", label: "Kurir" },
        ...(userRole === "Super Admin" ? [{ value: "Super Admin", label: "Super Admin" }] : []),
    ];

    const handleUpdateUser = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.put(`/api/users/${id}`, updateUserData);
            notification(response.data.message);
            isModalOpen(false);
            mutate();
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleUpdateUser} className="space-y-4">
            {/* 1. Input Nama Lengkap */}
            <div className="space-y-1">
                <label htmlFor="user-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Nama
                </label>
                <input
                    id="user-name"
                    type="text"
                    required
                    value={updateUserData.name || ""}
                    onChange={(e) => setUpdateUserData({ ...updateUserData, name: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* 2. Input Email */}
            <div className="space-y-1">
                <label htmlFor="user-email" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Email
                </label>
                <input
                    id="user-email"
                    type="email"
                    required
                    value={updateUserData.email || ""}
                    onChange={(e) => setUpdateUserData({ ...updateUserData, email: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            {/* 3. Dropdown Warehouse & Role (Grid 2 Kolom) */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Warehouse Dropdown */}
                <div className="space-y-1">
                    <label htmlFor="user-warehouse" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Warehouse
                    </label>
                    <Dropdown
                        id="user-warehouse"
                        label="Warehouse Selector"
                        options={warehouseOptions}
                        selectedValue={updateUserData.warehouse}
                        onChange={(val) => setUpdateUserData({ ...updateUserData, warehouse: val })}
                    />
                </div>

                {/* Role Dropdown */}
                <div className="space-y-1">
                    <label htmlFor="user-role" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Role
                    </label>
                    <Dropdown
                        id="user-role"
                        label="Role Selector"
                        options={roleOptions}
                        selectedValue={updateUserData.role}
                        onChange={(val) => setUpdateUserData({ ...updateUserData, role: val })}
                    />
                </div>
            </div>

            {/* 4. Contact Dropdown */}
            <div className="space-y-1">
                <label htmlFor="user-contact" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Contact
                </label>
                <Dropdown
                    id="user-contact"
                    label="Contact Selector"
                    options={contactOptions}
                    selectedValue={updateUserData.contact}
                    onChange={(val) => setUpdateUserData({ ...updateUserData, contact: val })}
                />
            </div>

            {/* 5. Form Actions */}
            <div className="flex justify-end gap-2 pt-3">
                <button
                    type="button"
                    onClick={() => isModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Updating..." : "Update"}
                </button>
            </div>
        </form>
    );
};

export default EditUser;
