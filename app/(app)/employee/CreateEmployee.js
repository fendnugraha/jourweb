import Dropdown from "@/app/components/Dropdown";
import axios from "@/app/utils/axios";
import { AlertCircle, Loader2 } from "lucide-react";
import { useState } from "react";

const CreateEmployee = ({
  contacts = [],
  notification,
  isModalOpen,
  mutateEmployee,
}) => {
  const [formData, setFormData] = useState({
    contact_id: "",
    hire_date: "",
    id_card_number: "",
    base_salary: "",
    place_of_birth: "",
    birth_date: "",
    gender: "",
    religion: "",
    marital_status: "",
    employment_type: "full_time",
    contract_start: "",
    contract_end: "",
    contract_duration: "",
  });
  const [formError, setFormError] = useState(null);
  const [loading, setLoading] = useState(false);

  const contactOptions = [
    { value: "", label: "Select a contact" },
    ...contacts.map((contact) => ({
      value: contact.id,
      label: contact.name,
    })),
  ];

  const religionOptions = [
    { value: "", label: "Select a religion" },
    { value: "islam", label: "Islam" },
    { value: "kristen", label: "Kristen" },
    { value: "katolik", label: "Katolik" },
    { value: "hindu", label: "Hindu" },
    { value: "buddha", label: "Buddha" },
  ];

  const maritalStatusOptions = [
    { value: "", label: "Select a marital status" },
    { value: "single", label: "Single" },
    { value: "married", label: "Menikah" },
    { value: "divorced", label: "Cerai" },
    { value: "widowed", label: "Janda/Duda" },
  ];

  const genderOptions = [
    { value: "", label: "Select a gender" },
    { value: "male", label: "Laki-laki" },
    { value: "female", label: "Perempuan" },
  ];

  const contractDurationOptions = [
    { value: "", label: "Select a contract duration" },
    { value: 3, label: "3 Bulan" },
    { value: 6, label: "6 Bulan" },
    { value: 12, label: "1 Tahun" },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFormError(null);
    try {
      const response = await axios.post("/api/employees", formData);
      notification(response.data.message || "Employee created successfully.");
      isModalOpen(false); // Menutup modal
      mutateEmployee();
    } catch (error) {
      const errorMsg =
        error?.response?.data?.message ||
        "An error occurred while creating the employee.";
      notification(errorMsg);
      setFormError(errorMsg);
    } finally {
      setLoading(false);
    }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {formError && (
        <div className="p-3 bg-rose-50 text-rose-700 text-xs rounded-xl flex items-center gap-2 dark:bg-rose-950/30 dark:text-rose-300 border border-rose-200 dark:border-rose-900">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      <div className="grid sm:grid-cols-2 gap-3">
        {/* Contact Selector */}
        <div className="space-y-1">
          <label
            htmlFor="emp-contact"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Nama Kontak
          </label>
          <Dropdown
            id="emp-contact"
            label="Contact Selector"
            options={contactOptions}
            selectedValue={formData.contact_id}
            onChange={(val) => setFormData({ ...formData, contact_id: val })}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="emp-hire-date"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Tanggal Masuk
          </label>
          <input
            id="emp-hire-date"
            type="date"
            required
            value={formData.hire_date}
            onChange={(e) =>
              setFormData({ ...formData, hire_date: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>
      {/* ID Card & Salary */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor="emp-id-card"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            No. Kartu ID
          </label>
          <input
            id="emp-id-card"
            type="text"
            required
            value={formData.id_card_number}
            onChange={(e) =>
              setFormData({ ...formData, id_card_number: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="emp-base-salary"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Gaji Pokok
          </label>
          <input
            id="emp-base-salary"
            type="number"
            required
            value={formData.base_salary}
            onChange={(e) =>
              setFormData({ ...formData, base_salary: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Place & Date of Birth */}
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1">
          <label
            htmlFor="emp-birth-place"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Tempat Lahir
          </label>
          <input
            id="emp-birth-place"
            type="text"
            required
            value={formData.place_of_birth}
            onChange={(e) =>
              setFormData({ ...formData, place_of_birth: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="emp-birth-date"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Tanggal Lahir
          </label>
          <input
            id="emp-birth-date"
            type="date"
            required
            value={formData.birth_date}
            onChange={(e) =>
              setFormData({ ...formData, birth_date: e.target.value })
            }
            className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>
      </div>

      {/* Gender, Religion, Marital Status */}
      <div className="grid sm:grid-cols-3 gap-3">
        <div className="space-y-1">
          <label
            htmlFor="emp-gender"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Gender
          </label>
          <Dropdown
            id="emp-gender"
            label="Gender Selector"
            options={genderOptions}
            selectedValue={formData.gender}
            onChange={(val) => setFormData({ ...formData, gender: val })}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="emp-religion"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Agama
          </label>
          <Dropdown
            id="emp-religion"
            label="Agama Selector"
            options={religionOptions}
            selectedValue={formData.religion}
            onChange={(val) => setFormData({ ...formData, religion: val })}
          />
        </div>
        <div className="space-y-1">
          <label
            htmlFor="emp-marital"
            className="text-xs font-semibold text-slate-500 dark:text-slate-400"
          >
            Status Perkawinan
          </label>
          <Dropdown
            id="emp-marital"
            label="Marital Status Selector"
            options={maritalStatusOptions}
            selectedValue={formData.marital_status}
            onChange={(val) =>
              setFormData({ ...formData, marital_status: val })
            }
          />
        </div>
      </div>

      {/* Employment Type Toggle */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
            formData.employment_type === "full_time"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
          onClick={() =>
            setFormData({ ...formData, employment_type: "full_time" })
          }
        >
          Full-time
        </button>
        <button
          type="button"
          className={`py-2 rounded-xl border text-xs font-semibold transition-all ${
            formData.employment_type === "contract"
              ? "bg-indigo-600 border-indigo-600 text-white shadow-xs"
              : "bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
          }`}
          onClick={() =>
            setFormData({ ...formData, employment_type: "contract" })
          }
        >
          Contract
        </button>
      </div>

      {/* Contract Dates (Conditional Render) */}
      {formData.employment_type === "contract" && (
        <div className="grid sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1">
            <label
              htmlFor="emp-contract-duration"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              Lama Kontrak
            </label>
            <Dropdown
              id="emp-contract-duration"
              label="Contract Duration Selector"
              options={contractDurationOptions}
              selectedValue={formData.contract_duration}
              onChange={(val) =>
                setFormData({ ...formData, contract_duration: val })
              }
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="emp-contract-start"
              className="text-xs font-semibold text-slate-500 dark:text-slate-400"
            >
              Tanggal Mulai
            </label>
            <input
              id="emp-contract-start"
              type="date"
              required={formData.employment_type === "contract"}
              value={formData.contract_start}
              onChange={(e) =>
                setFormData({ ...formData, contract_start: e.target.value })
              }
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white px-3.5 py-2 text-sm text-slate-800 dark:bg-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Form Actions */}
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
          {loading ? "Updating..." : "Update Entry"}
        </button>
      </div>
    </form>
  );
};

export default CreateEmployee;
