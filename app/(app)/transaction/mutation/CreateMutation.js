/* eslint-disable react-hooks/set-state-in-effect */
import Dropdown from "@/app/components/Dropdown";
import TabSwitcher from "@/app/components/TabSwitcher";
import axios from "@/app/utils/axios";
import { DateTimeNow } from "@/app/utils/format";
import { AlertCircle, Landmark, Warehouse } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const CreateMutation = ({
  accounts = [],
  mutate,
  mutateBalance,
  isModalOpen,
  warehouseId,
  notification,
  warehouses = [],
  userRole,
}) => {
  const [newType, setNewType] = useState("self");

  const availableWarehouses = useMemo(
    () =>
      warehouses.filter(
        (w) => Number(w.id) !== Number(warehouseId) && w.status === 1,
      ),
    [warehouses, warehouseId],
  );

  const [selectedDestinationWarehouseId, setSelectedDestinationWarehouseId] =
    useState(() => availableWarehouses[0]?.id || 1);

  // Sync selected destination if current selection is not in available warehouses
  const effectiveDestinationId = useMemo(() => {
    if (
      availableWarehouses.length > 0 &&
      !availableWarehouses.some(
        (w) => Number(w.id) === Number(selectedDestinationWarehouseId),
      )
    ) {
      return availableWarehouses[0].id;
    }
    return selectedDestinationWarehouseId;
  }, [availableWarehouses, selectedDestinationWarehouseId]);

  const { today } = DateTimeNow();
  const [formError, setFormError] = useState("");
  const [formData, setFormData] = useState({
    date_issued: today,
    debt_id: "",
    cred_id: "",
    is_confirmed: true,
    amount: "",
    fee_amount: 0,
    trx_type: "Mutasi Kas",
    description: "",
  });
  const [loading, setLoading] = useState(false);

  // Tab switch handler
  const handleTypeChange = (val) => {
    setNewType(val);
    setFormData((prev) => ({
      ...prev,
      debt_id: "",
    }));
  };

  // Options for Credit (Source Account)
  const credOptions = [
    { value: "", label: "Select Account" },
    ...accounts
      .filter((account) => Number(account.warehouse_id) === Number(warehouseId))
      .map((account) => ({ value: account.id, label: account.group })),
  ];

  // Options for Debit (Destination Account)
  const debtOptions = [
    { value: "", label: "Select Account" },
    ...accounts
      .filter((account) => {
        const targetWarehouseId =
          newType === "self" ? warehouseId : effectiveDestinationId;

        return (
          Number(account.warehouse_id) === Number(targetWarehouseId) &&
          Number(account.id) !== Number(formData.cred_id)
        );
      })
      .map((account) => ({
        value: account.id,
        label:
          account.group +
          (newType === "self" ? "" : " (" + account.warehouse?.code + ")"),
      })),
  ];

  // Options for Destination Warehouse
  const warehouseOptions = [
    { value: "", label: "Select Warehouse" },
    ...availableWarehouses.map((warehouse) => ({
      value: warehouse.id,
      label: warehouse.name,
    })),
  ];

  const handleAddMutationSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!formData.cred_id) {
      setFormError("Silakan pilih Rekening Asal (Dari).");
      return;
    }
    if (!formData.debt_id) {
      setFormError("Silakan pilih Akun/Cabang Tujuan.");
      return;
    }
    if (Number(formData.cred_id) === Number(formData.debt_id)) {
      setFormError("Rekening Asal dan Rekening Tujuan tidak boleh sama.");
      return;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setFormError("Jumlah mutasi harus lebih besar dari 0.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post("/api/create-mutation", formData);
      const successMessage =
        response.data?.message || "Mutasi kas berhasil disimpan";
      if (typeof notification === "function") {
        notification(successMessage);
      }
      setFormData({
        date_issued: today,
        debt_id: "",
        cred_id: "",
        is_confirmed: true,
        amount: "",
        fee_amount: 0,
        trx_type: "Mutasi Kas",
        description: "",
      });
      if (typeof mutate === "function") mutate();
      if (typeof mutateBalance === "function") mutateBalance();
      setFormError("");
      if (typeof isModalOpen === "function") {
        isModalOpen(false);
      }
    } catch (error) {
      setFormError(
        error.response?.data?.message ||
          "Terjadi kesalahan saat menyimpan data.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Auto-match matching account group in target warehouse when creating inter-branch mutation
  useEffect(() => {
    if (
      newType !== "other" ||
      !formData.cred_id ||
      !accounts?.length ||
      !effectiveDestinationId
    )
      return;

    const selectedCred = accounts.find(
      (acc) => Number(acc.id) === Number(formData.cred_id),
    );

    if (!selectedCred) return;

    const matchingDebt = accounts.find(
      (acc) =>
        acc.group === selectedCred.group &&
        Number(acc.warehouse_id) === Number(effectiveDestinationId),
    );

    if (matchingDebt) {
      setFormData((prev) => ({
        ...prev,
        debt_id: matchingDebt.id,
      }));
    }
  }, [formData.cred_id, accounts, effectiveDestinationId, newType]);

  return (
    <>
      <div className="mb-2">
        <span className="block text-xs font-medium text-slate-500 dark:text-slate-400">
          Mutasi Ke
        </span>
        <TabSwitcher
          buttonList={[
            {
              icon: Warehouse,
              value: "self",
              label: "Akun Sendiri",
            },
            { icon: Landmark, value: "other", label: "Cabang Lain / Pusat" },
          ]}
          activeTab={newType}
          setActiveTab={handleTypeChange}
        />
      </div>
      <form onSubmit={handleAddMutationSubmit} className="space-y-4">
        {formError && (
          <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{formError}</span>
          </div>
        )}

        {/* Date input */}
        <div className="space-y-1" hidden>
          <label
            htmlFor="tx-date"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Date Registered
          </label>
          <input
            id="tx-date"
            type="datetime-local"
            required
            value={formData.date_issued}
            onChange={(e) =>
              setFormData({ ...formData, date_issued: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
          />
        </div>

        <div className="space-y-1">
          <label
            htmlFor="tx-destination-warehouse"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Cabang Tujuan Mutasi
          </label>
          <Dropdown
            id="tx-destination-warehouse"
            label="Warehouse Selector"
            options={warehouseOptions}
            selectedValue={selectedDestinationWarehouseId}
            onChange={(val) => {
              setSelectedDestinationWarehouseId(val);
            }}
            disabled={
              !["Administrator", "Super Admin"].includes(userRole) ||
              newType === "self"
            }
          />
        </div>

        {/* Category drop down */}
        <div className="grid sm:grid-cols-2 gap-2">
          <div className="space-y-1">
            <label
              htmlFor="tx-cred-account"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              Rekening Asal (Dari)
            </label>
            <Dropdown
              id="tx-cred-account"
              label="Transaction Category Selector"
              options={credOptions}
              selectedValue={formData.cred_id}
              onChange={(val) => {
                setFormData({ ...formData, cred_id: val });
              }}
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="tx-debt-account"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              Ke {newType === "self" ? "Akun" : "Cabang Lain / Pusat"}
            </label>
            <Dropdown
              id="tx-debt-account"
              label="Transaction Category Selector"
              options={debtOptions}
              selectedValue={formData.debt_id}
              onChange={(val) => {
                setFormData({ ...formData, debt_id: val });
              }}
              disabled={!formData.cred_id}
            />
          </div>
        </div>

        {/* Amount and Date input rows */}
        <div className="space-y-1">
          <label
            htmlFor="tx-amount"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Jumlah (Rp IDR)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">
              Rp
            </span>
            <input
              id="tx-amount"
              type="number"
              required
              value={formData.amount}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  amount: e.target.value,
                });
              }}
              placeholder="50000"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
              disabled={!formData.cred_id || !formData.debt_id}
            />
          </div>
          {formData.amount && !isNaN(parseFloat(formData.amount)) && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
              Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        {/* Description input */}
        <div className="space-y-1">
          <label
            htmlFor="tx-desc"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Keterangan / Memo
          </label>
          <input
            id="tx-desc"
            type="text"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="e.g. Kelebihan Saldo"
            className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100 disabled:bg-slate-200 dark:disabled:bg-slate-600"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() =>
              typeof isModalOpen === "function" && isModalOpen(false)
            }
            className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Batal
          </button>
          <button
            type="submit"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
            disabled={loading}
          >
            {loading ? "Menyimpan data..." : "Tambah Mutasi"}
          </button>
        </div>
      </form>
    </>
  );
};

export default CreateMutation;
