import Dropdown from "@/app/components/Dropdown";
import useContacts from "@/app/hooks/useContacts";
import useUsers from "@/app/hooks/useUser";
import useWarehouse from "@/app/hooks/useWarehouse";
import axios from "@/app/utils/axios";
import { todayDate } from "@/app/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

export default function CreateAttendanceManually({ isModalOpen, mutate, notification }) {
    const [formData, setFormData] = useState({
        user_id: "",
        contact_id: "",
        date: todayDate(),
        time_in: "",
        warehouse_id: "",
        approval_status: "",
    });
    const [formError, setFormError] = useState("");

    const { warehouses } = useWarehouse();
    const [loading, setLoading] = useState(true);
    const { contacts } = useContacts();
    const { users } = useUsers();

    const warehouseOptions = [
        { value: "", label: "Select Warehouse" },
        ...warehouses
            .filter((w) => w.status === 1)
            .map((warehouse) => ({
                value: warehouse.id,
                label: warehouse.name,
            })),
    ];

    const contactOptions = [
        { value: "", label: "Select Contact" },
        ...contacts.map((contact) => ({
            value: contact.id,
            label: contact.name,
        })),
    ];

    const userOptions = [
        { value: "", label: "Select User" },
        ...users.map((user) => ({
            value: user.id,
            label: user.email,
        })),
    ];

    const approvalStatusOptions = [
        { value: "", label: "Select Approval Status" },
        { value: "Pending", label: "Pending" },
        { value: "Approved", label: "Approved" },
        { value: "Good", label: "Good" },
        { value: "Late", label: "Late" },
        { value: "Overtime", label: "Overtime" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/create-attendance-manually", formData);
            notification(response.data.message);
            mutate();
        } catch (error) {
            console.log(error);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
            setFormData({
                user_id: "",
                contact_id: "",
                date: todayDate(),
                time_in: "",
                warehouse_id: "",
                approval_status: "",
            });
            isModalOpen(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* Alert Error dengan Motion */}
            {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 overflow-hidden">
                    <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                    <span>{formError}</span>
                </div>
            )}
            <div className="space-y-1">
                <label htmlFor="date_issued" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Tanggal
                </label>
                <input
                    id="date_issued"
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="user" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    User ID / Email
                </label>
                <Dropdown
                    id="user"
                    label="User Selector"
                    options={userOptions}
                    selectedValue={formData.user_id}
                    onChange={(val) => setFormData({ ...formData, user_id: val })}
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="contact" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Contact ID
                </label>
                <Dropdown
                    id="contact"
                    label="Contact Selector"
                    options={contactOptions}
                    selectedValue={formData.contact_id}
                    onChange={(val) => setFormData({ ...formData, contact_id: val })}
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="warehouse" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Warehouse ID
                </label>
                <Dropdown
                    id="warehouse"
                    label="Warehouse Selector"
                    options={warehouseOptions}
                    selectedValue={formData.warehouse_id}
                    onChange={(val) => setFormData({ ...formData, warehouse_id: val })}
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="approval_status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Approval Status
                </label>
                <Dropdown
                    id="approval_status"
                    label="Approval Status Selector"
                    options={approvalStatusOptions}
                    selectedValue={formData.approval_status}
                    onChange={(val) => setFormData({ ...formData, approval_status: val })}
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="time_in" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Jam Masuk
                </label>
                <input
                    id="time_in"
                    type="time"
                    value={formData.time_in || ""}
                    onChange={(e) => setFormData({ ...formData, time_in: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
            </div>

            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => isModalOpen(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                    Cancel
                </button>
                <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                    Tambahkan
                </button>
            </div>
        </form>
    );
}
