import { useState, useEffect } from "react";
import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";

export default function EditTxJournal({
  journal,
  mutate,
  mutateBalance,
  isModalOpen,
  whAccounts,
  userRole,
  notification,
}) {
  const [formData, setFormData] = useState({
    date_issued: "",
    debt_id: "",
    cred_id: "",
    amount: "",
    fee_amount: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  // Update formData when journalById changes
  useEffect(() => {
    if (journal?.debt_id || journal?.cred_id) {
      setFormData({
        date_issued: journal?.date_issued || "",
        debt_id: journal?.debt_id || "",
        cred_id: journal?.cred_id || "",
        amount: journal?.amount || "",
        fee_amount: journal?.fee_amount || 0,
        description: journal?.description || "",
      });
    }
  }, [journal]);

  const accountOptions = [
    { value: "", label: "Pilih Akun" },
    ...whAccounts.map((account) => ({
      value: account.id,
      label: account.name,
    })),
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(
        `/api/journals/${journal?.id}`,
        formData,
      );
      notification(response.data.message);
      mutate();
      mutateBalance();
      isModalOpen(false);
    } catch (error) {
      notification(error.response?.data?.message || "Something went wrong.");
      setErrors(error.response?.data?.errors || ["Something went wrong."]);
      console.log(error);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-1">
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
          id="tx-category-label"
          className="text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          Akun
        </label>
        <Dropdown
          id="tx-category"
          label="Transaction Category Selector"
          options={accountOptions}
          selectedValue={
            journal.trx_type === "Tarik Tunai"
              ? formData.debt_id
              : formData.cred_id
          }
          onChange={(val) => {
            setFormData({
              ...formData,
              [journal.trx_type === "Tarik Tunai" ? "debt_id" : "cred_id"]: val,
            });
          }}
        />
      </div>
      {/* Amount and Date input rows */}
      <div className="grid sm:grid-cols-3 gap-2">
        <div className="space-y-1 sm:col-span-2">
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
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {formData.amount && !isNaN(parseFloat(formData.amount)) && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
              Preview: Rp {parseFloat(formData.amount).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="tx-fee_amount"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Fee (IDR)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">
              Rp
            </span>
            <input
              id="tx-fee_amount"
              type="number"
              required
              value={formData.fee_amount}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  fee_amount: e.target.value,
                });
              }}
              placeholder="50000"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {formData.fee_amount && !isNaN(parseFloat(formData.fee_amount)) && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
              Preview: Rp{" "}
              {parseFloat(formData.fee_amount).toLocaleString("id-ID")}
            </p>
          )}
        </div>
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
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white px-3.5 py-2 text-sm text-slate-800 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-2 pt-2">
        <button
          type="button"
          onClick={() => isModalOpen(false)}
          className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
        >
          Batal
        </button>
        <button
          type="submit"
          className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors"
          disabled={loading}
        >
          {loading ? "Mengupdate data..." : "Update Mutasi"}
        </button>
      </div>
    </form>
  );
}
