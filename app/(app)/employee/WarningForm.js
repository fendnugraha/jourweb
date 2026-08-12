import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { DateTimeNow, todayDate } from "@/app/utils/format";
import { AlertCircle } from "lucide-react";
import { useState } from "react";

const WarningForm = ({ isModalOpen, notification, employee, mutate }) => {
    const { today } = DateTimeNow();
    const [loading, setLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [formData, setFormData] = useState({
        issued_date: today,
        employee_id: employee?.id,
        level: "",
        reason: "",
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/employee-warnings", formData);
            notification(response.data.message);
            isModalOpen(false);
            mutate();
            setFormData({ issued_date: today, employee_id: employee?.id, level: "", reason: "" });
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
            setFormError(error.response?.data?.message || "Something went wrong.");
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const levelOptions = [
        { value: "", label: "-- Pilih Level --" },
        { value: "SP1", label: "Peringatan 1 (SP1)" },
        { value: "SP2", label: "Peringatan 2 (SP2)" },
        { value: "SP3", label: "Peringatan 3 (SP3)" },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                </div>
            )}

            {/* Date input */}
            <div className="space-y-1">
                <label htmlFor="tx-date" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Date Registered
                </label>
                <input
                    id="tx-date"
                    type="datetime-local"
                    required
                    value={formData.issued_date}
                    onChange={(e) => setFormData({ ...formData, issued_date: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                />
            </div>

            <div className="space-y-1">
                <label id="tx-level-label" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Level
                </label>
                <Dropdown
                    id="tx-level"
                    label="Account Selector"
                    options={levelOptions}
                    selectedValue={formData.level}
                    onChange={(val) => {
                        setFormData({ ...formData, level: val });
                    }}
                />
            </div>

            <div className="space-y-1">
                <label htmlFor="tx-reason" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Alasan
                </label>
                <input
                    id="tx-reason"
                    type="text"
                    required
                    value={formData.reason}
                    placeholder="Alasan diberikan surat peringatan"
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
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
                <button
                    type="submit"
                    className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
                    disabled={loading}
                >
                    {loading ? "Adding..." : "Add Entry"}
                </button>
            </div>
        </form>
    );
};

export default WarningForm;
