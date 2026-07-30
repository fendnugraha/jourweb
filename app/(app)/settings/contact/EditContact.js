"use client";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const EditContact = ({ isModalOpen, notification, mutate, contact }) => {
    const [loading, setLoading] = useState(false);
    const [updateContactData, setUpdateContactData] = useState({
        name: contact?.name,
        phone: contact?.phone,
        address: contact?.address,
        description: contact?.description,
    });

    const handleUpdateContact = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/contacts/${contact.id}`, updateContactData);
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
        <form onSubmit={handleUpdateContact} className="space-y-4">
            {/* 1. Grid Row: Name & Phone Number */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* Name Input */}
                <div className="space-y-1">
                    <label htmlFor="update-contact-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Nama Kontak
                    </label>
                    <input
                        id="update-contact-name"
                        type="text"
                        required
                        autoComplete="off"
                        placeholder="Masukkan nama lengkap..."
                        value={updateContactData.name || ""}
                        onChange={(e) => setUpdateContactData({ ...updateContactData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>

                {/* Phone Number Input */}
                <div className="space-y-1">
                    <label htmlFor="update-contact-phone" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        No. Telepon / WhatsApp
                    </label>
                    <input
                        id="update-contact-phone"
                        type="text"
                        autoComplete="off"
                        placeholder="Ex: 081234567890"
                        value={updateContactData.phone || ""}
                        onChange={(e) => setUpdateContactData({ ...updateContactData, phone: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors font-mono"
                    />
                </div>
            </div>

            {/* 3. Address Textarea */}
            <div className="space-y-1">
                <label htmlFor="update-contact-address" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Alamat Lengkap
                </label>
                <textarea
                    id="update-contact-address"
                    rows={2}
                    autoComplete="off"
                    placeholder="Masukkan alamat jalan, kota, dll..."
                    value={updateContactData.address || ""}
                    onChange={(e) => setUpdateContactData({ ...updateContactData, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
                />
            </div>

            {/* 5. Form Actions */}
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
                    {loading ? "Updating..." : "Update Contact"}
                </button>
            </div>
        </form>
    );
};

export default EditContact;
