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
    });

    const availableAccounts = accounts.filter(
        (item) => [1, 2].includes(Number(item.account_id)) && (item.warehouse_id === null || Number(item.warehouse_id) === Number(warehouse?.id)),
    );

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

    console.log(warehouse);
    return (
        <form onSubmit={handleUpdateWarehouse} className="space-y-4">
            <div className="space-y-1">
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

            <div className="grid sm:grid-cols-2 gap-3">
                {/* Account Dropdown */}
                <div className="space-y-1">
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

            <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                    <label htmlFor="wh-zone" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Zona Wilayah
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
