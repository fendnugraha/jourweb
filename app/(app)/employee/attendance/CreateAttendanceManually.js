import useContacts from "@/app/hooks/useContacts";
import useUsers from "@/app/hooks/useUser";
import useWarehouse from "@/app/hooks/useWarehouse";
import { todayDate } from "@/app/utils/format";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

export default function CreateAttendanceManually({ isModalOpen, mutate }) {
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
            });
            isModalOpen(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Alert Error dengan Motion */}
            <AnimatePresence>
                {formError && (
                    <motion.div
                        initial={{ opacity: 0, height: 0, y: -6 }}
                        animate={{ opacity: 1, height: "auto", y: 0 }}
                        exit={{ opacity: 0, height: 0 }}
                        className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900/40 overflow-hidden"
                    >
                        <AlertCircle className="h-4 w-4 shrink-0 text-rose-500" />
                        <span>{formError}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </form>
    );
}
