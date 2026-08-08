import Dropdown from "@/app/components/Dropdown";
import Modal from "@/app/components/Modal";
import Notification from "@/app/components/Notification";
import { changeLockStatus } from "@/app/hooks/JournalActionService";
import useWarehouse from "@/app/hooks/useWarehouse";
import useWarehouseZone from "@/app/hooks/useWarehouseZone";
import {
  Lock,
  Plus,
  Search,
  Unlock,
  Warehouse,
  Building2,
  Clock,
  MapPin,
  Wallet,
  Edit2,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { useState } from "react";
import { useAccounts } from "@/app/hooks/useAccounts";
import EditWarehouse from "./EditWarehouse";
import AssignAccount from "./AssignAccount";
import CreateWarehouse from "./CreateWarehouse";
import { calculateContractTillEnd, formatRupiah } from "@/app/utils/format";

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

  const zoneOptions = [
    { value: "all", label: "All Zones" },
    ...zones?.map((zone) => ({ value: zone.id, label: zone.zone_name })),
  ];

  const [status, setStatus] = useState(1);
  const [zone, setZone] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredWarehouse = warehouses?.filter((warehouse) => {
    const matchesStatus =
      status === "all" || warehouse.status === parseInt(status);
    const matchesZone =
      zone === "all" || warehouse.warehouse_zone_id === parseInt(zone);
    const matchesSearch = warehouse.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesStatus && matchesZone && matchesSearch;
  });

  const toggleLockStatus = async (id) => {
    try {
      const response = await changeLockStatus(id);
      setNotification(
        response?.data?.message ||
          "Warehouse lock status updated successfully.",
      );
      await mutate();
    } catch (error) {
      setNotification("Failed to update warehouse lock status.");
    }
  };

  return (
    <>
      <Notification
        message={notification}
        onClose={() => setNotification(null)}
      />
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
        <div className="flex items-center gap-3 self-start sm:self-center">
          <div className="flex items-center gap-2 bg-indigo-50/80 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 px-3.5 py-2 rounded-xl border border-indigo-100 dark:border-indigo-900/50 text-xs font-bold shrink-0">
            <Warehouse className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span>{filteredWarehouse?.length || 0}</span>
            <span className="text-indigo-500/80 font-medium">Warehouses</span>
          </div>
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

      <div className="w-full overflow-hidden rounded-2xl border border-slate-200/70 bg-white/80 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80 shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            {/* Header Minimalis */}
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/40 text-[10px] font-semibold tracking-wider text-slate-400 dark:border-slate-800/60 dark:bg-slate-950/30 uppercase">
                <th scope="col" className="py-3 px-4 font-medium">
                  Cabang / Warehouse
                </th>
                <th scope="col" className="py-3 px-4 font-medium">
                  Status Kepemilikan
                </th>
                <th scope="col" className="py-3 px-4 font-medium">
                  Jam Buka & Zona
                </th>
                <th scope="col" className="py-3 px-4 font-medium">
                  Alamat
                </th>
                <th scope="col" className="py-3 px-4 text-center font-medium">
                  Akses Operasional
                </th>
                <th scope="col" className="py-3 px-4 text-center font-medium">
                  Status
                </th>
                <th scope="col" className="py-3 px-4 text-right font-medium">
                  Aksi
                </th>
              </tr>
            </thead>

            {/* Body Tabel */}
            <tbody className="divide-y divide-slate-100/80 text-xs dark:divide-slate-800/50">
              {filteredWarehouse?.length > 0 ? (
                filteredWarehouse.map((wh) => {
                  const isLeased = wh.ownership_status === "leased";

                  return (
                    <tr
                      key={wh.id}
                      className="group transition-colors duration-150 hover:bg-slate-50/80 dark:hover:bg-slate-800/30"
                    >
                      {/* 1. Nama Cabang & Kas */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            <Building2 className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-slate-900 dark:text-slate-100 text-[13px] tracking-tight">
                              {wh.name}
                            </div>
                            <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                              <Wallet className="h-3 w-3 text-indigo-500" />
                              <span>
                                Kas:{" "}
                                <span className="font-medium text-slate-700 dark:text-slate-300">
                                  {wh.primary_cash?.name || "-"}
                                </span>
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* 2. Status Kepemilikan (Clean SaaS Badges) */}
                      <td className="py-3.5 px-4 align-middle">
                        {isLeased ? (
                          <div className="inline-flex flex-col gap-0.5">
                            <div className="inline-flex items-center gap-1.5 self-start rounded-full bg-indigo-50 dark:bg-indigo-950/50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-600 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                              <Calendar className="h-3 w-3 text-indigo-500" />
                              <span>
                                Sewa{" "}
                                {wh.lease?.lease_type === "yearly"
                                  ? "Tahunan"
                                  : "Bulanan"}
                              </span>
                            </div>
                            <div className="pl-1 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              Sisa:{" "}
                              <span className="font-bold text-slate-700 dark:text-slate-200">
                                {calculateContractTillEnd(
                                  wh.lease?.lease_end_date,
                                ) || "-"}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-0.5 text-[11px] font-medium text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-800/40">
                            <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                            <span>Milik Sendiri</span>
                          </div>
                        )}
                      </td>

                      {/* 3. Operasional & Zona */}
                      <td className="py-3.5 px-4 align-middle">
                        <div className="space-y-0.5">
                          <div className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-700 dark:text-slate-200">
                            <Clock className="h-3 w-3 text-slate-400" />
                            <span>{wh.opening_time || "-"}</span>
                          </div>
                          <div className="text-[10px] text-slate-400 dark:text-slate-500">
                            Zona:{" "}
                            <span className="text-slate-600 dark:text-slate-400 font-medium">
                              {wh.zone?.zone_name || "Tanpa Zona"}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* 4. Alamat */}
                      <td
                        className="py-3.5 px-4 align-middle max-w-50"
                        title={wh.address}
                      >
                        <div className="flex items-start gap-1 text-slate-500 dark:text-slate-400">
                          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                          <span className="truncate text-[11px] leading-snug">
                            {wh.address || "-"}
                          </span>
                        </div>
                      </td>

                      {/* 5. Akses / Kunci Status Toggle */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <button
                          type="button"
                          onClick={() => toggleLockStatus(wh.id)}
                          className={`inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1 text-[11px] font-medium transition-all duration-150 cursor-pointer border ${
                            wh.is_open === 1
                              ? "bg-slate-50 border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:bg-emerald-950/30 dark:border-emerald-800/50 dark:text-emerald-300"
                              : "bg-amber-50/60 border-amber-200 text-amber-700 hover:bg-amber-100 dark:bg-amber-950/30 dark:border-amber-800/50 dark:text-amber-300"
                          }`}
                        >
                          {wh.is_open === 1 ? (
                            <>
                              <Unlock className="h-3 w-3 text-emerald-500" />
                              <span>Terbuka</span>
                            </>
                          ) : (
                            <>
                              <Lock className="h-3 w-3 text-amber-500" />
                              <span>Terkunci</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* 6. Status Keaktifan Badge */}
                      <td className="py-3.5 px-4 align-middle text-center">
                        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-slate-600 dark:text-slate-300">
                          <span
                            className={`h-2 w-2 rounded-full ${
                              wh.status
                                ? "bg-emerald-500 ring-4 ring-emerald-500/20"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          {wh.status ? "Aktif" : "Non-Aktif"}
                        </span>
                      </td>

                      {/* 7. Action Button Ghost Style */}
                      <td className="py-3.5 px-4 align-middle text-right">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedWarehouse(wh);
                            setModalName("edit");
                            setModalTitle(`Edit Cabang: ${wh.name}`);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200/80 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-50 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 dark:hover:text-indigo-400 transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="h-3 w-3" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Building2 className="h-8 w-8 text-slate-300 dark:text-slate-600 stroke-[1.25]" />
                      <span className="text-xs font-medium">
                        Belum ada data cabang / warehouse
                      </span>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
        maxWidth="max-w-xl"
      >
        {modalName === "create" && (
          <CreateWarehouse
            isModalOpen={setIsModalOpen}
            accounts={accounts}
            zones={zones}
            notification={setNotification}
            mutate={mutate}
          />
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
