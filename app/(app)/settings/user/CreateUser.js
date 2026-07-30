import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const CreateUser = ({ contacts, warehouses, isModalOpen, notification, mutate }) => {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        confirmPassword: "",
        warehouse: "",
        role: "",
        contact: "",
    });
    const [errors, setErrors] = useState({});
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/users", formData);
            notification(response.data.message);
            mutate();
            isModalOpen(false);
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Name Input */}
            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label htmlFor="name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Nama Lengkap
                    </label>
                    <input
                        id="name"
                        type="text"
                        name="name"
                        required
                        placeholder="Masukkan nama pengguna..."
                        value={formData.name || ""}
                        onChange={handleChange}
                        className={`w-full rounded-xl border ${
                            errors.name ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>
                <div className="space-y-1">
                    <label htmlFor="create-contact" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Contact Relation
                    </label>
                    <Dropdown
                        id="create-contact"
                        label="Select contact"
                        options={[{ value: "", label: "No Contact" }, ...(contacts?.map((c) => ({ value: c.id, label: c.name })) || [])]}
                        selectedValue={formData.contact}
                        onChange={(val) => handleChange({ target: { name: "contact", value: val } })}
                    />
                    {errors.contact && <p className="text-xs text-red-500 mt-1">{errors.contact}</p>}
                </div>
            </div>

            {/* 2. Email Input */}
            <div className="space-y-1">
                <label htmlFor="email" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Alamat Email
                </label>
                <input
                    id="email"
                    type="email"
                    name="email"
                    placeholder="nama@email.com"
                    value={formData.email || ""}
                    onChange={handleChange}
                    className={`w-full rounded-xl border ${
                        errors.email ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                />
                {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
            </div>

            {/* 3. Password & Confirm Password (Grid 2 Kolom) */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Password */}
                <div className="space-y-1">
                    <label htmlFor="password" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Password
                    </label>
                    <input
                        id="password"
                        type="password"
                        name="password"
                        required
                        placeholder="••••••••"
                        value={formData.password || ""}
                        onChange={handleChange}
                        className={`w-full rounded-xl border ${
                            errors.password ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Konfirmasi Password
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        name="confirmPassword"
                        required
                        placeholder="••••••••"
                        value={formData.confirmPassword || ""}
                        onChange={handleChange}
                        className={`w-full rounded-xl border ${
                            errors.confirmPassword ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {errors.confirmPassword && <p className="text-xs text-red-500 mt-1">{errors.confirmPassword}</p>}
                </div>
            </div>

            {/* 4. Gudang & Role (Grid 2 Kolom dengan Custom Dropdown) */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Warehouse Dropdown */}
                <div className="space-y-1">
                    <label htmlFor="create-warehouse" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Gudang / Cabang
                    </label>
                    <Dropdown
                        id="create-warehouse"
                        label="Select warehouse"
                        options={[{ value: "", label: "Select Warehouse" }, ...(warehouses?.map((w) => ({ value: w.id, label: w.name })) || [])]}
                        selectedValue={formData.warehouse}
                        onChange={(val) => handleChange({ target: { name: "warehouse", value: val } })}
                    />
                    {errors.warehouse && <p className="text-xs text-red-500 mt-1">{errors.warehouse}</p>}
                </div>

                {/* Role Dropdown */}
                <div className="space-y-1">
                    <label htmlFor="create-role" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Role
                    </label>
                    <Dropdown
                        id="create-role"
                        label="Select role"
                        options={[
                            { value: "", label: "Select Role" },
                            { value: "Administrator", label: "Administrator" },
                            { value: "Kasir", label: "Kasir" },
                            { value: "Courier", label: "Kurir" },
                        ]}
                        selectedValue={formData.role}
                        onChange={(val) => handleChange({ target: { name: "role", value: val } })}
                    />
                    {errors.role && <p className="text-xs text-red-500 mt-1">{errors.role}</p>}
                </div>
            </div>

            {/* 5. Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3">
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Creating..." : "Create User"}
                </button>
            </div>
        </form>
    );
};

export default CreateUser;
