import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { formatLongDate } from "@/app/utils/format";
import { AlertCircle, Briefcase, Calendar, Loader2 } from "lucide-react";
import { useState } from "react";

/**
 * Helper untuk menghitung tanggal akhir berdasarkan tanggal mulai + jumlah bulan
 */
const calculateEndDateStr = (startDateStr, months) => {
    const start = startDateStr ? new Date(startDateStr) : new Date();
    if (isNaN(start.getTime())) return "";
    const end = new Date(start);
    end.setMonth(end.getMonth() + Number(months));

    const pad = (n) => String(n).padStart(2, "0");
    const year = end.getFullYear();
    const month = pad(end.getMonth() + 1);
    const day = pad(end.getDate());
    return `${year}-${month}-${day}`;
};

const CreateEmployee = ({
    contacts = [],
    notification,
    isModalOpen,
    mutateEmployee,
}) => {
    const [formData, setFormData] = useState({
        contact_id: "",
        hire_date: "",
        id_card_number: "",
        base_salary: "",
        place_of_birth: "",
        birth_date: "",
        gender: "",
        religion: "",
        marital_status: "",
        employment_type: "full_time",
        contract_start: "",
        contract_end: "",
        contract_duration: "",
    });
    const [formError, setFormError] = useState(null);
    const [loading, setLoading] = useState(false);

    // Mode pilihan kontrak: "duration" (durasi cepat) vs "custom" (pilih tanggal spesifik)
    const [contractMode, setContractMode] = useState("duration");
    const [selectedDuration, setSelectedDuration] = useState(null);

    const contactOptions = [
        { value: "", label: "Select a contact" },
        ...contacts.map((contact) => ({
            value: contact.id,
            label: contact.name,
        })),
    ];

    const religionOptions = [
        { value: "", label: "Select a religion" },
        { value: "islam", label: "Islam" },
        { value: "kristen", label: "Kristen" },
        { value: "katolik", label: "Katolik" },
        { value: "hindu", label: "Hindu" },
        { value: "buddha", label: "Buddha" },
    ];

    const maritalStatusOptions = [
        { value: "", label: "Select a marital status" },
        { value: "single", label: "Single" },
        { value: "married", label: "Menikah" },
        { value: "divorced", label: "Cerai" },
        { value: "widowed", label: "Janda/Duda" },
    ];

    const genderOptions = [
        { value: "", label: "Select a gender" },
        { value: "male", label: "Laki-laki" },
        { value: "female", label: "Perempuan" },
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);
        try {
            const response = await axios.post("/api/employees", formData);
            notification(response.data.message || "Employee created successfully.");
            isModalOpen(false); // Menutup modal
            mutateEmployee();
        } catch (error) {
            const errorMsg =
                error?.response?.data?.message ||
                "An error occurred while creating the employee.";
            notification(errorMsg);
            setFormError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {formError && (
                <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{formError}</span>
                </div>
            )}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Contact Selector */}
                <div className="space-y-1">
                    <label
                        htmlFor="emp-contact"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        Nama Kontak
                    </label>
                    <Dropdown
                        id="emp-contact"
                        label="Contact Selector"
                        options={contactOptions}
                        selectedValue={formData.contact_id}
                        onChange={(val) => setFormData({ ...formData, contact_id: val })}
                    />
                </div>
                <div className="space-y-1">
                    <label
                        htmlFor="emp-hire-date"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        Tanggal Masuk
                    </label>
                    <input
                        id="emp-hire-date"
                        type="date"
                        required
                        value={formData.hire_date}
                        onChange={(e) =>
                            setFormData({ ...formData, hire_date: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* ID Card & Salary */}
            <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label
                        htmlFor="emp-id-card"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        No. Kartu ID
                    </label>
                    <input
                        id="emp-id-card"
                        type="text"
                        required
                        value={formData.id_card_number}
                        onChange={(e) =>
                            setFormData({ ...formData, id_card_number: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="space-y-1">
                    <label
                        htmlFor="emp-base-salary"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        Gaji Pokok
                    </label>
                    <input
                        id="emp-base-salary"
                        type="number"
                        required
                        value={formData.base_salary}
                        onChange={(e) =>
                            setFormData({ ...formData, base_salary: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Place & Date of Birth */}
            <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label
                        htmlFor="emp-birth-place"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        Tempat Lahir
                    </label>
                    <input
                        id="emp-birth-place"
                        type="text"
                        required
                        value={formData.place_of_birth}
                        onChange={(e) =>
                            setFormData({ ...formData, place_of_birth: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="space-y-1">
                    <label
                        htmlFor="emp-birth-date"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        Tanggal Lahir
                    </label>
                    <input
                        id="emp-birth-date"
                        type="date"
                        required
                        value={formData.birth_date}
                        onChange={(e) =>
                            setFormData({ ...formData, birth_date: e.target.value })
                        }
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>

            {/* Gender, Religion, Marital Status */}
            <div className="grid sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                    <label
                        htmlFor="emp-gender"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        Gender
                    </label>
                    <Dropdown
                        id="emp-gender"
                        label="Gender Selector"
                        options={genderOptions}
                        selectedValue={formData.gender}
                        onChange={(val) => setFormData({ ...formData, gender: val })}
                    />
                </div>
                <div className="space-y-1">
                    <label
                        htmlFor="emp-religion"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        Agama
                    </label>
                    <Dropdown
                        id="emp-religion"
                        label="Agama Selector"
                        options={religionOptions}
                        selectedValue={formData.religion}
                        onChange={(val) => setFormData({ ...formData, religion: val })}
                    />
                </div>
                <div className="space-y-1">
                    <label
                        htmlFor="emp-marital"
                        className="text-xs font-semibold text-slate-500 dark:text-slate-400"
                    >
                        Status Perkawinan
                    </label>
                    <Dropdown
                        id="emp-marital"
                        label="Marital Status Selector"
                        options={maritalStatusOptions}
                        selectedValue={formData.marital_status}
                        onChange={(val) =>
                            setFormData({ ...formData, marital_status: val })
                        }
                    />
                </div>
            </div>

            {/* Employment Type Toggle */}
            <div className="space-y-2 pt-1">
                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tipe Hubungan Kerja</label>
                <div className="grid grid-cols-2 gap-2">
                    <button
                        type="button"
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                            formData.employment_type === "full_time"
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                        onClick={() =>
                            setFormData({ ...formData, employment_type: "full_time" })
                        }
                    >
                        Full-time
                    </button>
                    <button
                        type="button"
                        className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                            formData.employment_type === "contract"
                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                        }`}
                        onClick={() =>
                            setFormData({ ...formData, employment_type: "contract" })
                        }
                    >
                        Contract
                    </button>
                </div>
            </div>

            {/* Contract Dates (Conditional Render) */}
            {formData.employment_type === "contract" && (
                <div className="space-y-3 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80">
                    {/* Header Mode Kontrak */}
                    <div className="flex items-center justify-between gap-2">
                        <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                            <Briefcase className="w-3.5 h-3.5 text-indigo-500" />
                            <span>Pengaturan Kontrak Kerja</span>
                        </label>
                        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-700 p-0.5 rounded-lg text-[11px]">
                            <button
                                type="button"
                                onClick={() => setContractMode("duration")}
                                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                                    contractMode === "duration"
                                        ? "bg-white text-indigo-600 shadow-xs font-bold dark:bg-slate-800 dark:text-indigo-400"
                                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                            >
                                Pilih Durasi
                            </button>
                            <button
                                type="button"
                                onClick={() => setContractMode("custom")}
                                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                                    contractMode === "custom"
                                        ? "bg-white text-indigo-600 shadow-xs font-bold dark:bg-slate-800 dark:text-indigo-400"
                                        : "text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200"
                                }`}
                            >
                                Tanggal Spesifik
                            </button>
                        </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3">
                        {/* Tanggal Mulai Kontrak */}
                        <div className="space-y-1">
                            <label htmlFor="emp-contract-start" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Tanggal Mulai
                            </label>
                            <input
                                id="emp-contract-start"
                                type="date"
                                required={formData.employment_type === "contract"}
                                value={formData.contract_start}
                                onChange={(e) => {
                                    const newStart = e.target.value;
                                    setFormData((prev) => {
                                        const updated = { ...prev, contract_start: newStart };
                                        if (selectedDuration && contractMode === "duration") {
                                            updated.contract_end = calculateEndDateStr(newStart || prev.hire_date, selectedDuration);
                                        }
                                        return updated;
                                    });
                                }}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Opsi Durasi atau Pilih Tanggal Spesifik */}
                        {contractMode === "duration" ? (
                            <div className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Durasi Kontrak
                                </label>
                                <div className="grid grid-cols-3 gap-1.5">
                                    {[
                                        { label: "3 Bulan", months: 3 },
                                        { label: "6 Bulan", months: 6 },
                                        { label: "1 Tahun", months: 12 },
                                    ].map((opt) => (
                                        <button
                                            key={opt.months}
                                            type="button"
                                            onClick={() => {
                                                setSelectedDuration(opt.months);
                                                const computedEnd = calculateEndDateStr(
                                                    formData.contract_start || formData.hire_date,
                                                    opt.months
                                                );
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    contract_duration: opt.months,
                                                    contract_end: computedEnd,
                                                }));
                                            }}
                                            className={`py-2 px-1.5 rounded-xl border text-xs font-bold transition-all ${
                                                Number(selectedDuration) === opt.months
                                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                            }`}
                                        >
                                            {opt.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                <label htmlFor="emp-contract-end" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Tanggal Selesai
                                </label>
                                <input
                                    id="emp-contract-end"
                                    type="date"
                                    required={formData.employment_type === "contract"}
                                    value={formData.contract_end}
                                    onChange={(e) => setFormData({ ...formData, contract_end: e.target.value })}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        )}
                    </div>

                    {/* Tanggal Selesai Output Info Badge */}
                    {formData.contract_end && (
                        <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Tanggal Selesai Kontrak:</span>
                            </span>
                            <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-100 dark:border-indigo-900/40">
                                {formatLongDate(formData.contract_end)}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Form Actions */}
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
                    {loading ? "Creating..." : "Create Employee"}
                </button>
            </div>
        </form>
    );
};

export default CreateEmployee;
