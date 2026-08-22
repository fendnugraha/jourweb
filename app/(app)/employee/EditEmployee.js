import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { formatNumber } from "@/app/utils/format";
import { AlertCircle, Camera, Loader2, Trash2, User } from "lucide-react";
import { useState } from "react";
import WarningForm from "./WarningForm";
import Image from "next/image";

// Helper fungsi untuk format initial state
const formatFormData = (employee) => ({
    contact_id: employee?.contact_id || "",
    hire_date: employee?.hire_date || "",
    id_card_number: employee?.id_card_number || "",
    base_salary: employee?.base_salary || "",
    place_of_birth: employee?.place_of_birth || "",
    birth_date: employee?.birth_date || "",
    gender: employee?.gender || "",
    religion: employee?.religion || "",
    status: employee?.status || "",
    marital_status: employee?.marital_status || "",
    employment_type: employee?.employment_type || "full_time",
    contract_start: employee?.contract_start || "",
    contract_end: employee?.contract_end || "",
});

const EditEmployee = ({ employee, contacts = [], isModalOpen, notification, mutate }) => {
    const [formData, setFormData] = useState(() => formatFormData(employee));
    const [formDataComponent, setFormDataComponent] = useState({
        employee_id: employee.id,
        name: "",
        type: "allowance",
        amount: "",
    });
    const [formError, setFormError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("personal");

    // Foto profil diambil dari relasi contact
    const profilePhoto = employee?.contact?.contact_photo_url || employee?.contact?.photo;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);
        try {
            const response = await axios.put(`/api/employees/${employee.id}`, formData);
            notification(response.data.message || "Employee updated successfully.");
            isModalOpen(false);
            mutate();
        } catch (error) {
            const errorMsg = error?.response?.data?.message || "An error occurred while updating the employee.";
            notification(errorMsg);
            setFormError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitComponent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setFormError(null);
        try {
            const response = await axios.post(`/api/salary-components`, formDataComponent);
            notification(response.data.message || "Component added successfully.");
            setFormDataComponent({
                employee_id: employee.id,
                type: "allowance",
                name: "",
                amount: "",
            });
            await mutate();
        } catch (error) {
            const errorMsg = error?.response?.data?.message || "An error occurred while adding the component.";
            notification(errorMsg);
            setFormError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteComponent = async (componentId) => {
        try {
            await axios.delete(`/api/salary-components/${componentId}`);
            notification("Component deleted successfully.");
            await mutate();
        } catch (error) {
            const errorMsg = error?.response?.data?.message || "An error occurred while deleting the component.";
            notification(errorMsg);
        }
    };

    const contactOptions = [
        { value: "", label: "Select a contact" },
        ...contacts.map((contact) => ({
            value: contact.id,
            label: contact.name,
        })),
    ];

    const religionOptions = [
        { value: "", label: "Select a religion" },
        { value: "Islam", label: "Islam" },
        { value: "Kristen_Protestan", label: "Kristen Protestan" },
        { value: "Katolik", label: "Katolik" },
        { value: "Hindu", label: "Hindu" },
        { value: "Buddha", label: "Buddha" },
        { value: "Konghucu", label: "Konghucu" },
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

    const componenttypeOptions = [
        { value: "allowance", label: "Tunjangan" },
        { value: "deduction", label: "Potongan" },
    ];

    const statusOptions = [
        { value: "", label: "Select a status" },
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "resigned", label: "Resigned" },
        { value: "terminated", label: "Terminated" },
    ];

    return (
        <div className="space-y-4">
            <div className="mb-2">
                <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-slate-100 dark:bg-slate-800">
                    <button
                        type="button"
                        onClick={() => setActiveTab("personal")}
                        className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            activeTab === "personal"
                                ? "bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-indigo-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-300"
                        }`}
                    >
                        Personal
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("component")}
                        className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            activeTab === "component"
                                ? "bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-emerald-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-300"
                        }`}
                    >
                        Tunjangan & Potongan
                    </button>
                    <button
                        type="button"
                        onClick={() => setActiveTab("warning")}
                        className={`py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                            activeTab === "warning"
                                ? "bg-white text-red-600 shadow-sm dark:bg-slate-700 dark:text-red-400"
                                : "text-slate-500 dark:text-slate-400 hover:text-slate-800 hover:dark:text-slate-300"
                        }`}
                    >
                        Beri Peringatan
                    </button>
                </div>
            </div>

            {activeTab === "personal" && (
                <form onSubmit={handleSubmit} className="space-y-4">
                    {formError && (
                        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <span>{formError}</span>
                        </div>
                    )}

                    {/* Section Header: Foto Profil + Nama + ID Card */}
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-100 dark:bg-slate-800/50 dark:border-slate-800">
                        {/* Foto Profil Di Samping */}
                        <div className="relative group shrink-0">
                            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-slate-200 dark:bg-slate-700 border-2 border-indigo-500/20 shadow-md flex items-center justify-center">
                                {profilePhoto ? (
                                    <Image
                                        src={profilePhoto}
                                        alt={employee?.contact?.name || "Profile"}
                                        className="w-full h-full object-cover"
                                        width={96}
                                        height={96}
                                        unoptimized
                                    />
                                ) : (
                                    <User className="w-10 h-10 text-slate-400 dark:text-slate-500" />
                                )}
                            </div>
                            <div className="absolute -bottom-1 -right-1 p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
                                <Camera className="w-3.5 h-3.5" />
                            </div>
                        </div>

                        {/* Nama & Input No. ID Card */}
                        <div className="flex-1 min-w-0 space-y-2">
                            <div>
                                <h4 className="text-base font-bold text-slate-800 dark:text-slate-100 truncate">{employee?.contact?.name || "Karyawan"}</h4>
                                <p className="text-[11px] text-slate-400 dark:text-slate-500">Foto disesuaikan dari data Kontak</p>
                            </div>

                            <div className="space-y-1">
                                <label htmlFor="emp-id-card" className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    No. Kartu ID
                                </label>
                                <input
                                    id="emp-id-card"
                                    type="text"
                                    value={formData.id_card_number}
                                    onChange={(e) => setFormData({ ...formData, id_card_number: e.target.value })}
                                    placeholder="Masukkan ID Card / KTP"
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3 py-1.5 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Input Lainnya */}
                    <div className="grid sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label htmlFor="emp-contact" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Nama Kontak
                            </label>
                            <Dropdown
                                id="emp-contact"
                                label="Pemilih Kontak"
                                options={contactOptions}
                                selectedValue={formData.contact_id}
                                onChange={(val) => setFormData({ ...formData, contact_id: val })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="emp-hire-date" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Tanggal Bergabung
                            </label>
                            <input
                                id="emp-hire-date"
                                type="date"
                                required
                                value={formData.hire_date}
                                onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    {/* Gaji Pokok */}
                    <div className="space-y-1">
                        <label htmlFor="emp-base-salary" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                            Gaji Pokok
                        </label>
                        <input
                            id="emp-base-salary"
                            type="number"
                            required
                            value={formData.base_salary}
                            onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>

                    {/* Place & Date of Birth */}
                    <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label htmlFor="emp-birth-place" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Tempat lahir
                            </label>
                            <input
                                id="emp-birth-place"
                                type="text"
                                value={formData.place_of_birth}
                                onChange={(e) => setFormData({ ...formData, place_of_birth: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="emp-birth-date" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Tanggal Lahir
                            </label>
                            <input
                                id="emp-birth-date"
                                type="date"
                                value={formData.birth_date}
                                onChange={(e) => setFormData({ ...formData, birth_date: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="emp-status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Status
                            </label>
                            <Dropdown
                                id="emp-status"
                                label="Status Selector"
                                options={statusOptions}
                                selectedValue={formData.status}
                                onChange={(val) => setFormData({ ...formData, status: val })}
                            />
                        </div>
                    </div>

                    {/* Gender, Religion, Marital Status */}
                    <div className="grid sm:grid-cols-3 gap-3">
                        <div className="space-y-1">
                            <label htmlFor="emp-gender" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
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
                            <label htmlFor="emp-religion" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Agama
                            </label>
                            <Dropdown
                                id="emp-religion"
                                label="Religion Selector"
                                options={religionOptions}
                                selectedValue={formData.religion}
                                onChange={(val) => setFormData({ ...formData, religion: val })}
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="emp-marital" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Status Pernikahan
                            </label>
                            <Dropdown
                                id="emp-marital"
                                label="Marital Status Selector"
                                options={maritalStatusOptions}
                                selectedValue={formData.marital_status}
                                onChange={(val) => setFormData({ ...formData, marital_status: val })}
                            />
                        </div>
                    </div>

                    {/* Employment Type Toggle */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                        <button
                            type="button"
                            className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                                formData.employment_type === "full_time"
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                                    : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                            }`}
                            onClick={() => setFormData({ ...formData, employment_type: "full_time" })}
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
                            onClick={() => setFormData({ ...formData, employment_type: "contract" })}
                        >
                            Contract
                        </button>
                    </div>

                    {/* Contract Dates (Conditional Render) */}
                    {formData.employment_type === "contract" && (
                        <div className="grid sm:grid-cols-2 gap-3 pt-1">
                            <div className="space-y-1">
                                <label htmlFor="emp-contract-start" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    Start Date
                                </label>
                                <input
                                    id="emp-contract-start"
                                    type="date"
                                    required={formData.employment_type === "contract"}
                                    value={formData.contract_start}
                                    onChange={(e) => setFormData({ ...formData, contract_start: e.target.value })}
                                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-1">
                                <label htmlFor="emp-contract-end" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                    End Date
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
                            {loading ? "Updating..." : "Update Entry"}
                        </button>
                    </div>
                </form>
            )}

            {activeTab === "component" && (
                <>
                    <form onSubmit={handleSubmitComponent}>
                        <div className="flex gap-2">
                            <input
                                id="emp-component-name"
                                type="text"
                                required
                                value={formDataComponent.name}
                                placeholder="Name (Ex: Tunjangan Jabatan)"
                                onChange={(e) =>
                                    setFormDataComponent({
                                        ...formDataComponent,
                                        name: e.target.value,
                                    })
                                }
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <input
                                id="emp-component-amount"
                                type="number"
                                required
                                value={formDataComponent.amount}
                                placeholder="Rp."
                                onChange={(e) =>
                                    setFormDataComponent({
                                        ...formDataComponent,
                                        amount: parseFloat(e.target.value) || 0,
                                    })
                                }
                                className="w-1/3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            <Dropdown
                                id="emp-component-type"
                                label="Component Type"
                                options={componenttypeOptions}
                                selectedValue={formDataComponent.type}
                                onChange={(val) => setFormDataComponent({ ...formDataComponent, type: val })}
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors disabled:opacity-50"
                            >
                                {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                                {loading ? "Adding..." : "Add"}
                            </button>
                        </div>
                    </form>
                    <div className="mt-2 border rounded-xl border-slate-300 dark:border-slate-700">
                        <table className="min-w-full divide-y divide-slate-300 dark:divide-slate-700">
                            <thead>
                                <tr>
                                    <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-left">Component Name</th>
                                    <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">Amount</th>
                                    <th className="p-4 text-xs font-medium text-slate-500 dark:text-slate-400 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {employee.salary_components?.map((component) => (
                                    <tr
                                        key={component.id}
                                        className="hover:bg-slate-100 dark:hover:bg-slate-800 border-b border-slate-200 dark:border-slate-700"
                                    >
                                        <td className="px-4 py-2 text-sm text-slate-700 dark:text-slate-300">{component.name}</td>
                                        <td className={`px-4 py-2 text-sm ${component.type === "deduction" ? "text-red-500" : "text-green-500"} text-right`}>
                                            {formatNumber(component.amount)}
                                        </td>
                                        <td className="px-4 py-2 text-center">
                                            <button
                                                onClick={() => handleDeleteComponent(component.id)}
                                                className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {activeTab === "warning" && <WarningForm isModalOpen={isModalOpen} notification={notification} employee={employee} mutate={mutate} />}
        </div>
    );
};

export default EditEmployee;
