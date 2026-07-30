import { useState } from "react";
import { Loader2 } from "lucide-react";
import axios from "@/app/utils/axios";

const CreateContact = ({ isModalOpen, notification, mutate }) => {
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        phone: "",
        address: "",
    });

    const handleCreateContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.post("/api/contacts", formData);
            notification(response.data.message);
            isModalOpen(false);
            mutate();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleCreateContact} className="space-y-4">
            {/* 1. Grid Row: Name & Phone Number */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Name Input */}
                <div className="space-y-1">
                    <label htmlFor="contact-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Nama Kontak
                    </label>
                    <input
                        id="contact-name"
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Masukkan nama lengkap..."
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full rounded-xl border ${
                            errors.name ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Phone Number Input */}
                <div className="space-y-1">
                    <label htmlFor="contact-phone" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        No. Telepon / WhatsApp
                    </label>
                    <input
                        id="contact-phone"
                        type="text"
                        autoComplete="off"
                        placeholder="Ex: 081234567890"
                        value={formData.phone_number || ""}
                        onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                        className={`w-full rounded-xl border ${
                            errors.phone_number ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                        } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono`}
                    />
                    {errors.phone_number && <p className="text-xs text-red-500 mt-1">{errors.phone_number}</p>}
                </div>
            </div>

            {/* 2. Address Textarea */}
            <div className="space-y-1">
                <label htmlFor="contact-address" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Alamat Lengkap
                </label>
                <textarea
                    id="contact-address"
                    rows={2}
                    autoComplete="off"
                    placeholder="Masukkan alamat jalan, kota, dll..."
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className={`w-full rounded-xl border ${
                        errors.address ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none`}
                />
                {errors.address && <p className="text-xs text-red-500 mt-1">{errors.address}</p>}
            </div>

            {/* 3. Description Textarea */}
            <div className="space-y-1">
                <label htmlFor="contact-desc" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Keterangan / Catatan <span className="text-slate-400 font-normal">(Optional)</span>
                </label>
                <textarea
                    id="contact-desc"
                    rows={2}
                    autoComplete="off"
                    placeholder="Catatan tambahan mengenai kontak ini..."
                    value={formData.description || ""}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className={`w-full rounded-xl border ${
                        errors.description ? "border-red-500" : "border-slate-300 dark:border-slate-700"
                    } bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none`}
                />
                {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
            </div>

            {/* 4. Form Actions */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                    type="button"
                    onClick={() => isModalOpen?.(false)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    {loading ? "Creating..." : "Create Contact"}
                </button>
            </div>
        </form>
    );
};

export default CreateContact;
