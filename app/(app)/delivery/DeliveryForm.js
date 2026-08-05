import Dropdown from "@/app/components/Dropdown";
import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";

export default function DeliveryForm({
  warehouses,
  employees,
  isModalOpen,
  notification,
  mutate,
}) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    destination_id: "",
    amount: "",
    courier_id: "",
    description: "",
    trx_type: "Mutasi Kas",
    type: "delivery",
  });

  const warehouseOptions = warehouses.map((warehouse) => ({
    value: warehouse.id,
    label: warehouse.name,
  }));

  const employeeOptions = [
    { value: "", label: "Pilih Kurir" },
    ...(employees
      .filter((emp) => emp.contact?.user?.role === "Courier")
      .map((employee) => ({
        value: employee.id,
        label: employee.contact?.name,
      })) || []),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/api/create-delivery", formData);

      notification(response.data.message);

      setFormData({
        destination_id: "",
        amount: "",
        courier_id: "",
        description: "",
        type: "delivery",
      });

      mutate();
      isModalOpen(false);
    } catch (e) {
      console.error(e);
      notification(
        e.response.data.message ||
          "Terjadi kesalahan saat menyimpan transaksi.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-1">
        <label
          htmlFor="emp-contact"
          className="text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          Cabang Tujuan
        </label>
        <Dropdown
          id="emp-contact"
          label="Contact Selector"
          options={warehouseOptions}
          selectedValue={formData.destination_id}
          onChange={(val) => setFormData({ ...formData, destination_id: val })}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="tx-amount"
          className="text-xs font-semibold text-slate-600 dark:text-slate-300"
        >
          Amount (Rp IDR)
        </label>
        <div className="relative">
          <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 font-mono text-xs select-none">
            Rp
          </span>
          <input
            id="tx-amount"
            type="number"
            required
            value={formData.amount}
            onChange={(e) =>
              setFormData({ ...formData, amount: e.target.value })
            }
            placeholder="10.000.000"
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 py-2 pl-10 pr-3.5 text-sm text-slate-800 dark:text-slate-100 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
          />
        </div>
        <AnimatePresence>
          {formData.amount && !isNaN(parseFloat(formData.amount)) && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-semibold"
            >
              Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
            formData.type === "delivery"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
          onClick={() => setFormData({ ...formData, type: "delivery" })}
        >
          Di Kirim
        </button>
        <button
          type="button"
          className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
            formData.type === "pick_up"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
          onClick={() => setFormData({ ...formData, type: "pick_up" })}
        >
          Di Ambil
        </button>
      </div>

      <div className="space-y-1" hidden={formData.type === "pick_up"}>
        <label
          htmlFor="emp-courier"
          className="text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          Nama Pengantar / Kurir
        </label>
        <Dropdown
          id="emp-courier"
          label="Employee Selector"
          options={employeeOptions}
          selectedValue={formData.courier_id}
          onChange={(val) => setFormData({ ...formData, courier_id: val })}
        />
      </div>

      <div className="space-y-1">
        <label
          htmlFor="tx-desc"
          className="text-xs font-semibold text-slate-600 dark:text-slate-300"
        >
          Description / Memo
        </label>
        <input
          id="tx-desc"
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          placeholder="Minta Recehan / Setor / dll..."
          className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500"
        />
      </div>

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
          {loading ? "Membuat Pengiriman..." : "Rilis Pengiriman"}
        </button>
      </div>
    </form>
  );
}
