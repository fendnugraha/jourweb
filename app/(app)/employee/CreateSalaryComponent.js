import { formatRupiah } from "@/app/utils/format";
import { CheckCircle, Plus, Search } from "lucide-react";
import { useState } from "react";

const CreateSalaryComponents = ({ employees, setProcessData, isModalOpen, notification }) => {
    const [componentName, setComponentName] = useState("");
    const [componentAmount, setComponentAmount] = useState("");
    const [selectedEmployeeIds, setSelectedEmployeeIds] = useState([]);
    const [type, setType] = useState("bonuses");
    const [searchTerm, setSearchTerm] = useState("");

    const handleToggleEmpSelect = (employeeId) => {
        setSelectedEmployeeIds((prev) => {
            if (prev.includes(employeeId)) {
                return prev.filter((id) => id !== employeeId);
            } else {
                return [...prev, employeeId];
            }
        });
    };

    const addComponent = (e) => {
        e.preventDefault();
        if (!componentName || !componentAmount) return;

        const component = {
            name: componentName,
            amount: Number(componentAmount),
        };

        setProcessData((prev) => {
            const updated = prev.map((item) => (selectedEmployeeIds.includes(item.employee_id) ? { ...item, [type]: [...item[type], component] } : item));

            localStorage.setItem("processData", JSON.stringify(updated));
            return updated;
        });

        // reset form
        setComponentName("");
        setComponentAmount("");
        setSelectedEmployeeIds([]);

        notification("Component added successfully!");
    };
    return (
        <form onSubmit={addComponent}>
            <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                        type="button"
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                            type === "bonuses"
                                ? "bg-green-600 border-green-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                        onClick={() => setType("bonuses")}
                    >
                        Tunjangan
                    </button>
                    <button
                        type="button"
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                            type === "deductions"
                                ? "bg-red-600 border-red-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                        onClick={() => setType("deductions")}
                    >
                        Potongan
                    </button>
                </div>
                <div className="grid sm:grid-cols-3 gap-2">
                    <div className="space-y-1 sm:col-span-2">
                        <label htmlFor="tx-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Nama
                        </label>
                        <input
                            id="tx-name"
                            type="text"
                            required
                            value={componentName}
                            onChange={(e) => setComponentName(e.target.value)}
                            placeholder="e.g. Bonus Absensi"
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                        />
                    </div>
                    <div className="space-y-1">
                        <label htmlFor="tx-amount" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Jumlah
                        </label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">Rp</span>
                            <input
                                id="tx-amount"
                                type="number"
                                required
                                value={componentAmount}
                                onChange={(e) => setComponentAmount(e.target.value)}
                                placeholder="50000"
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
                            />
                        </div>
                        {componentAmount && !isNaN(parseFloat(componentAmount)) && (
                            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
                                Preview: Rp {parseFloat(componentAmount).toLocaleString("id-ID")}
                            </p>
                        )}
                    </div>
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
                            setSelectedEmployeeIds(employees.map((emp) => emp.id));
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
                    {employees.map((employee) => (
                        <button
                            type="button"
                            key={employee.id}
                            onClick={() => handleToggleEmpSelect(employee.id)}
                            className={`text-sm ${selectedEmployeeIds.includes(employee.id) ? "text-emerald-700 dark:text-emerald-300" : "text-slate-600 dark:text-slate-400"} gap-2 flex justify-start items-center px-2 py-1.5 border rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700`}
                        >
                            <span>
                                <CheckCircle size={16} className={`${selectedEmployeeIds.includes(employee.id) ? "text-emerald-500" : "text-slate-400"}`} />
                            </span>
                            <div className="flex flex-col items-start">
                                <span className="font-medium">{employee.contact?.name}</span>
                                <span className="text-[10px] text-slate-500 dark:text-slate-400">{formatRupiah(employee.base_salary)}</span>
                            </div>
                        </button>
                    ))}
                </div>
                <h1 className="text-xs text-slate-500 dark:text-slate-400">{selectedEmployeeIds.length} Selected</h1>
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
            </div>
        </form>
    );
};

export default CreateSalaryComponents;
