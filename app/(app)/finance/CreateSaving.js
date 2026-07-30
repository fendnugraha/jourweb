import Dropdown from "@/app/components/Dropdown";
import useEmployee from "@/app/hooks/useEmployee";
import axios from "@/app/utils/axios";
import { DateTimeNow, formatRupiah } from "@/app/utils/format";
import { AlertCircle, CheckCircle, Search } from "lucide-react";
import { useState } from "react";

const CreateSaving = ({ accounts, notification, mutate, setModalTitle, onClose }) => {
    const { today } = DateTimeNow();
    const [formData, setFormData] = useState({
        date_issued: today,
        amount: "",
        debt_id: "",
        type: "Saving",
    });
    const { employees, isLoading, mutate: mutateEmployees } = useEmployee();
    const [formError, setFormError] = useState("");
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);

    const handleToggleEmpSelect = (employeeId) => {
        setSelectedEmployeeIds((prev) => {
            if (prev.includes(employeeId)) {
                return prev.filter((id) => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const accountOptions = [
        { value: "", label: "Pilih Rekening" },
        ...accounts
            .filter((account) => account.warehouse_id === 1)
            .map((account) => ({
                value: account.id,
                label: account.name,
            })),
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/store-saving-multiple", {
                ...formData,
                contact_ids: selectedEmployeeIds,
            });
            notification(response.data.message);
            onClose();
            mutate();
            setSelectedEmployeeIds([]);
        } catch (error) {
            console.log(error);
            setFormError(error.response?.data?.errors || ["Something went wrong."]);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

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
                    value={formData.date_issued}
                    onChange={(e) => setFormData({ ...formData, date_issued: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                />
            </div>

            <div className="space-y-1">
                <label id="tx-debt_id-label" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Rekening
                </label>
                <Dropdown
                    id="tx-debt_id"
                    label="Account Selector"
                    options={accountOptions}
                    selectedValue={formData.debt_id}
                    onChange={(val) => {
                        setFormData({ ...formData, debt_id: val });
                    }}
                />
            </div>

            {/* Amount and Date input rows */}
            <div className="space-y-1">
                <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Amount (Rp IDR)
                </label>
                <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                    <input
                        id="tx-amount"
                        type="number"
                        required
                        value={formData.amount}
                        onChange={(e) => {
                            setFormData({
                                ...formData,
                                amount: e.target.value,
                            });
                        }}
                        placeholder="50000"
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                    />
                </div>
                {formData.amount && !isNaN(parseFloat(formData.amount)) && (
                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                        Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
                    </p>
                )}
            </div>

            <div className="grid grid-cols-4 gap-2">
                <div className="relative sm:col-span-2">
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
                <button
                    type="button"
                    onClick={() => {
                        setSelectedEmployeeIds(employees.map((emp) => emp.contact_id));
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                >
                    <span>Select All</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        setSelectedEmployeeIds([]);
                    }}
                    className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-1 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                >
                    <span>Deselect All</span>
                </button>
            </div>
            <div className="mt-4 space-y-2 flex flex-col max-h-50 overflow-y-auto">
                {employees
                    .filter((employee) => employee.status === "active")
                    .map((employee) => (
                        <button
                            type="button"
                            key={employee.contact_id}
                            onClick={() => handleToggleEmpSelect(employee.contact_id)}
                            className={`text-sm ${selectedEmployeeIds.includes(employee.contact_id) ? "text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400"} gap-2 flex justify-start items-center px-2 py-1.5 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700`}
                        >
                            <span>
                                <CheckCircle
                                    size={16}
                                    className={`${selectedEmployeeIds.includes(employee.contact_id) ? "text-emerald-500" : "text-slate-400"}`}
                                />
                            </span>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{employee.contact?.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">
                                    {formatRupiah(employee.contact?.employee_receivables_sum?.total)}
                                </span>
                            </div>
                        </button>
                    ))}
            </div>
            <h1 className="text-xs text-slate-500 dark:text-slate-400">{selectedEmployeeIds.length} Selected</h1>

            {/* Form Actions */}
            <div className="flex justify-end gap-2 pt-2">
                <button
                    type="button"
                    onClick={() => onClose(false)}
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

export default CreateSaving;
