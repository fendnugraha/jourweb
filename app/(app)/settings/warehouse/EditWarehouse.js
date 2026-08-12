import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const EditWarehouse = ({ warehouse, zones, accounts, mutate, notification, isModalOpen }) => {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: warehouse?.name || "",
        address: warehouse?.address || "",
        chart_of_account_id: warehouse?.primary_cash?.id || "",
        contact_id: warehouse?.contact_id || "",
        warehouse_zone_id: warehouse?.warehouse_zone_id || "",
        opening_time: warehouse?.opening_time || "",
        status: warehouse?.status || 0,
        ownership_status: warehouse?.ownership_status || "",
        lease_start_date: warehouse?.lease?.lease_start_date || "",
        lease_end_date: warehouse?.lease?.lease_end_date || "",
        rent_cost: warehouse?.lease?.rent_cost || "",
        lease_type: warehouse?.lease?.lease_type || "",
    });

    const availableAccounts = accounts.filter(
        (item) => [1, 2].includes(Number(item.account_id)) && (item.warehouse_id === null || Number(item.warehouse_id) === Number(warehouse?.id)),
    );

    const leaseOptions = [
        { value: "", label: "--- Pilih Tipe ---" },
        { value: "monthly", label: "Bulanan" },
        { value: "yearly", label: "Tahunan" },
    ];

    const handleUpdateWarehouse = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/warehouse/${warehouse.id}`, formData);
            notification(response.data.message);
            mutate();
            isModalOpen(false);
        } catch (error) {
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleUpdateWarehouse} className="space-y-4">
            <div className="grid sm:grid-cols-4 gap-3">
                <div className="space-y-1 sm:col-span-3">
                    <label htmlFor="wh-name" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Nama Warehouse / Cabang
                    </label>
                    <input
                        id="wh-name"
                        type="text"
                        required
                        placeholder="Masukkan nama cabang..."
                        value={formData.name || ""}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>
                <div className="space-y-1">
                    <label htmlFor="wh-zone" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Zona
                    </label>
                    <Dropdown
                        id="wh-zone"
                        label="Pilih Zona"
                        options={
                            zones?.map((zone) => ({
                                value: zone.id,
                                label: zone.zone_name,
                            })) || []
                        }
                        selectedValue={formData.warehouse_zone_id}
                        onChange={(val) => setFormData({ ...formData, warehouse_zone_id: val })}
                    />
                </div>
            </div>

            <div className="grid sm:grid-cols-4 gap-3">
                {/* Account Dropdown */}
                <div className="space-y-1 sm:col-span-2">
                    <label htmlFor="wh-account" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Akun Akuntansi
                    </label>
                    <Dropdown
                        id="wh-account"
                        label="Select Account"
                        options={[
                            { value: "", label: "Pilih Akun" },
                            ...(availableAccounts
                                ?.filter((account) => account.account_id === 1)
                                .map((account) => ({
                                    value: account.id,
                                    label: account.name,
                                })) || []),
                        ]}
                        selectedValue={formData.chart_of_account_id}
                        onChange={(val) => setFormData({ ...formData, chart_of_account_id: val })}
                    />
                </div>

                {/* Kasir / Employee Dropdown */}
                <div className="space-y-1">
                    <label htmlFor="wh-status" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Status
                    </label>
                    <Dropdown
                        id="wh-status"
                        label="Pilih Status"
                        options={[
                            { value: 1, label: "Aktif" },
                            { value: 0, label: "Tidak Aktif" },
                        ]}
                        selectedValue={formData.status}
                        onChange={(val) => setFormData({ ...formData, status: val })}
                    />
                </div>

                <div className="space-y-1">
                    <label htmlFor="wh-opening" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Waktu Buka
                    </label>
                    <input
                        id="wh-opening"
                        type="time"
                        value={formData.opening_time || ""}
                        onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>
            </div>

            <div className="space-y-1">
                <label htmlFor="wh-address" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Alamat Lengkap
                </label>
                <textarea
                    id="wh-address"
                    rows={3}
                    placeholder="Masukkan alamat gudang/cabang..."
                    value={formData.address || ""}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors resize-none"
                />
            </div>

            <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                    type="button"
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        formData.ownership_status === "owned"
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => setFormData({ ...formData, ownership_status: "owned" })}
                >
                    Milik Sendiri
                </button>
                <button
                    type="button"
                    className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
                        formData.ownership_status === "leased"
                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
                            : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                    onClick={() => setFormData({ ...formData, ownership_status: "leased" })}
                >
                    Sewa
                </button>
            </div>

            {formData.ownership_status === "leased" && (
                <div className="p-4 border border-indigo-300 bg-indigo-200/50 dark:border-indigo-600/30 dark:bg-indigo-800/30 rounded-2xl">
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label htmlFor="wh-lease-type" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Periode Sewa
                            </label>
                            <Dropdown
                                id="wh-lease-type"
                                label="Pilih Periode Sewa"
                                options={leaseOptions}
                                selectedValue={formData.lease_type}
                                onChange={(val) => setFormData({ ...formData, lease_type: val })}
                            />
                        </div>

                        <div className="space-y-1">
                            <label htmlFor="wh-rent-cost" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Biaya Sewa
                            </label>
                            <input
                                id="wh-rent-cost"
                                type="number"
                                required
                                value={formData.rent_cost}
                                onChange={(e) => setFormData({ ...formData, rent_cost: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                            <label htmlFor="emp-lease-start" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Tanggal Mulai Sewa
                            </label>
                            <input
                                id="emp-lease-start"
                                type="date"
                                required={formData.ownership_status === "leased" && formData.lease_type === "yearly"}
                                value={formData.lease_start_date}
                                onChange={(e) => setFormData({ ...formData, lease_start_date: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div className="space-y-1">
                            <label htmlFor="emp-lease-end" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                                Tanggal Akhir Sewa
                            </label>
                            <input
                                id="emp-lease-end"
                                type="date"
                                required={formData.ownership_status === "leased" && formData.lease_start_date && formData.lease_type === "yearly"}
                                value={formData.lease_end_date}
                                onChange={(e) => setFormData({ ...formData, lease_end_date: e.target.value })}
                                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>
                </div>
            )}

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
                    {loading ? "Updating..." : "Update Warehouse"}
                </button>
            </div>
        </form>
    );
};

export default EditWarehouse;
