import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import Notification from "@/app/components/Notification";
import { changeLockStatus } from "@/app/hooks/JournalActionService";
import useWarehouse from "@/app/hooks/useWarehouse";
import useWarehouseZone from "@/app/hooks/useWarehouseZone";
import { Lock, Plus, Search, Unlock, Warehouse, Building2, Clock, MapPin, Wallet, Edit2, ShieldCheck, MoreHorizontal, Compass } from "lucide-react";
import { useState } from "react";
import CreateWarehouse from "./warehouse/CreateWarehouse";
import EditWarehouse from "./warehouse/EditWarehouse";
import AssignAccount from "./warehouse/AssignAccount";
import { useAccounts } from "@/app/hooks/useAccounts";

const WarehouseTable = () => {
    const { warehouses, loading, mutate } = useWarehouse();
    const { accounts } = useAccounts();
    const { zones } = useWarehouseZone();
    const [notification, setNotification] = useState("");
    const [selectedWarehouse, setSelectedWarehouse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalName, setModalName] = useState("create");
    const [modalTitle, setModalTitle] = useState("");

    const statusOptions = [
        { value: "all", label: "All Status" },
        { value: 1, label: "Active" },
        { value: 0, label: "Inactive" },
    ];

    const zoneOptions = [{ value: "all", label: "All Zones" }, ...zones?.map((zone) => ({ value: zone.id, label: zone.zone_name }))];

    const [status, setStatus] = useState("all");
    const [zone, setZone] = useState("all");
    const [searchTerm, setSearchTerm] = useState("");

    const filteredWarehouse = warehouses?.filter((warehouse) => {
        const matchesStatus = status === "all" || warehouse.status === parseInt(status);
        const matchesZone = zone === "all" || warehouse.warehouse_zone_id === parseInt(zone);
        const matchesSearch = warehouse.name.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesZone && matchesSearch;
    });

    const toggleLockStatus = async (id) => {
        try {
            const response = await changeLockStatus(id);
            setNotification(response?.data?.message || "Warehouse lock status updated successfully.");
            await mutate();
        } catch (error) {
            setNotification("Failed to update warehouse lock status.");
        }
    };

    return (
        <>
            <Notification message={notification} onClose={() => setNotification(null)} />
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-4 rounded-xl bg-white border border-slate-100 dark:bg-slate-900 dark:border-slate-800">
                {/* Left Side Filters */}
                <div className="flex-1 grid gap-3 sm:grid-cols-3 max-w-3xl">
                    <div className="relative">
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
                    {/* Status Dropdown */}
                    <div>
                        <Dropdown
                            id="warehouse-status-filter"
                            label="warehouse Status Filter"
                            options={statusOptions}
                            selectedValue={status}
                            onChange={(val) => setStatus(val)}
                            ariaLabel="Filter warehouses by status"
                        />
                    </div>

                    {/* Zone Dropdown */}
                    <div>
                        <Dropdown
                            id="warehouse-zone-filter"
                            label="warehouse Zone Filter"
                            options={zoneOptions}
                            selectedValue={zone}
                            onChange={(val) => setZone(val)}
                            ariaLabel="Filter warehouses by zone"
                        />
                    </div>
                </div>

                {/* Action Button */}
                <div className="flex gap-2 items-center">
                    <Warehouse size={28} strokeWidth={2} />
                    <h1 className="text-xl font-bold">
                        {filteredWarehouse?.length || 0} <span className="text-slate-500 font-semibold">Warehouses</span>
                    </h1>
                    <button
                        type="button"
                        onClick={() => {
                            setModalTitle("Create Warehouse");
                            setModalName("create");
                            setIsModalOpen(true);
                        }}
                        className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-xs hover:bg-indigo-500 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:bg-indigo-600 dark:hover:bg-indigo-500 transition-colors"
                    >
                        <Plus className="h-4 w-4" />
                        <span>New Warehouse</span>
                    </button>
                </div>
            </div>
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-left">
                        <thead>
                            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <Building2 className="w-3.5 h-3.5" />
                                        <span>Warehouse</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span>Jam Buka</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <Compass className="w-3.5 h-3.5" />
                                        <span>Zona</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5">
                                    <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3.5 h-3.5" />
                                        <span>Alamat</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    <div className="flex items-center justify-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                        <span>Akses</span>
                                    </div>
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    Status
                                </th>
                                <th scope="col" className="px-5 py-3.5 text-center">
                                    Aksi
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
                            {filteredWarehouse?.length > 0 ? (
                                filteredWarehouse.map((warehouse) => (
                                    <tr key={warehouse.id} className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150">
                                        {/* 1. Nama & Primary Cash */}
                                        <td className="px-5 py-4">
                                            <div className="font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-1.5">{warehouse.name}</div>
                                            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                                                <Wallet className="w-3 h-3 text-indigo-500 shrink-0" />
                                                <span>
                                                    Kas Utama:{" "}
                                                    <strong className="font-medium text-slate-700 dark:text-slate-300">
                                                        {warehouse.primary_cash?.name || "N/A"}
                                                    </strong>
                                                </span>
                                            </div>
                                        </td>

                                        {/* 2. Opening Time */}
                                        <td className="px-5 py-4 font-medium text-slate-600 dark:text-slate-300">
                                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/50 px-2.5 py-1 border border-slate-200/50 dark:border-slate-700/50">
                                                <Clock className="w-3 h-3 text-slate-400" />
                                                <span>{warehouse.opening_time || "-"}</span>
                                            </div>
                                        </td>

                                        {/* 3. Zone */}
                                        <td className="px-5 py-4">
                                            <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                                                <Compass className="w-3 h-3 text-slate-400" />
                                                {warehouse.zone?.zone_name || "Tanpa Zona"}
                                            </span>
                                        </td>

                                        {/* 4. Address */}
                                        <td className="px-5 py-4 max-w-xs text-slate-600 dark:text-slate-400" title={warehouse.address}>
                                            <div className="flex items-start gap-1.5 truncate">
                                                <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                                                <span className="truncate">{warehouse.address || "-"}</span>
                                            </div>
                                        </td>

                                        {/* 5. Lock / Unlock Toggle Button */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => toggleLockStatus(warehouse.id)}
                                                title={warehouse.is_open === 0 ? "Buka Kunci Warehouse" : "Kunci Warehouse"}
                                                className={`inline-flex items-center justify-center h-8 w-8 rounded-xl transition-all duration-200 cursor-pointer shadow-2xs ${
                                                    warehouse.is_open === 1
                                                        ? "bg-emerald-50 text-emerald-600 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-400 dark:hover:bg-emerald-900/60"
                                                        : "bg-amber-50 text-amber-600 hover:bg-amber-100 dark:bg-amber-950/40 dark:text-amber-400 dark:hover:bg-amber-900/60"
                                                }`}
                                            >
                                                {warehouse.is_open === 0 ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />}
                                            </button>
                                        </td>

                                        {/* 6. Status Badge */}
                                        <td className="px-5 py-4 text-center">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${
                                                    warehouse.status
                                                        ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/50"
                                                        : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/50 dark:border-rose-800/50"
                                                }`}
                                            >
                                                <span
                                                    className={`h-1.5 w-1.5 rounded-full ${warehouse.status ? "bg-emerald-500 animate-pulse" : "bg-rose-500"}`}
                                                />
                                                {warehouse.status ? "Active" : "Inactive"}
                                            </span>
                                        </td>

                                        {/* 7. Action Button */}
                                        <td className="px-5 py-4 text-center">
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setSelectedWarehouse(warehouse);
                                                    setModalName("edit");
                                                    setModalTitle(`Edit Warehouse: ${warehouse.name}`);
                                                    setIsModalOpen(true);
                                                }}
                                                className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-100 dark:text-indigo-400 dark:hover:bg-indigo-900/50 transition-colors cursor-pointer"
                                            >
                                                <Edit2 className="h-3.5 w-3.5" />
                                                <span>Edit</span>
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                /* Empty State jika data kosong */
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                                        <div className="flex flex-col items-center justify-center gap-2">
                                            <Building2 className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                                            <p className="text-xs font-medium">Tidak ada data warehouse ditemukan.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalTitle} maxWidth="max-w-xl">
                {modalName === "create" && (
                    <CreateWarehouse isModalOpen={setIsModalOpen} accounts={accounts} zones={zones} notification={setNotification} mutate={mutate} />
                )}
                {modalName === "edit" && (
                    <EditWarehouse
                        key={selectedWarehouse?.id}
                        warehouse={selectedWarehouse}
                        accounts={accounts}
                        zones={zones}
                        isModalOpen={setIsModalOpen}
                        notification={setNotification}
                        mutate={mutate}
                    />
                )}
                {modalName === "assign-account" && (
                    <AssignAccount
                        warehouse={selectedWarehouse}
                        isModalOpen={setIsModalOpen}
                        accounts={accounts}
                        notification={setNotification}
                        mutate={mutate}
                    />
                )}
            </Modal>
        </>
    );
};

export default WarehouseTable;
