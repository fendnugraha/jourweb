import axios from "@/app/utils/axios";
import { useEffect, useState } from "react";

export default function EditDeposit({
  journal,
  mutate,
  isModalOpen,
  notification,
}) {
  const [formData, setFormData] = useState({
    price: "",
    cost: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState([]);

  useEffect(() => {
    setFormData({
      price: journal.amount + journal.fee_amount || "",
      cost: journal.amount || "",
      description: journal.description || "",
    });
  }, [journal]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await axios.put(`/api/journals/${journal.id}`, {
        debt_id: journal.debt_id,
        cred_id: journal.cred_id,
        amount: formData.cost,
        fee_amount: formData.price - formData.cost,
        description: formData.description,
      });
      notification(response.data.message);
      mutate();
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
    <form onSubmit={handleSubmit}>
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <label
            htmlFor="tx-price"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Harga Jual (Rp IDR)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">
              Rp
            </span>
            <input
              id="tx-price"
              type="number"
              required
              value={formData.price}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  price: e.target.value,
                });
              }}
              placeholder="50000"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {formData.price && !isNaN(parseFloat(formData.price)) && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
              Preview: Rp {parseFloat(formData.price).toLocaleString("id-ID")}
            </p>
          )}
        </div>

        <div className="space-y-1">
          <label
            htmlFor="tx-cost"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Harga Modal (IDR)
          </label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-xs">
              Rp
            </span>
            <input
              id="tx-cost"
              type="number"
              required
              value={formData.cost}
              onChange={(e) => {
                setFormData({
                  ...formData,
                  cost: e.target.value,
                });
              }}
              placeholder="50000"
              className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 pl-9 pr-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
            />
          </div>
          {formData.cost && !isNaN(parseFloat(formData.cost)) && (
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono mt-1 font-semibold">
              Preview: Rp {parseFloat(formData.cost).toLocaleString("id-ID")}
            </p>
          )}
        </div>
      </div>
      <div className="space-y-1">
        <label
          htmlFor="tx-description"
          className="text-xs font-semibold text-slate-500 dark:text-slate-400"
        >
          Deskripsi
        </label>
        <input
          id="tx-description"
          type="text"
          required
          value={formData.description}
          onChange={(e) => {
            setFormData({
              ...formData,
              description: e.target.value,
            });
          }}
          placeholder="Transfer to ..."
          className="w-full rounded-xl border border-slate-300 dark:border-slate-600 bg-white py-2 px-3.5 text-sm text-slate-800 font-mono focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-850 dark:bg-slate-800 dark:text-slate-100"
        />
      </div>
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
          {loading ? "Mengupdate data..." : "Update Deposit"}
        </button>
      </div>
    </form>
  );
}
