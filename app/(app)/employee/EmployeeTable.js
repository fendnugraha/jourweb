import Modal from "@/app/components/Modal";
import {
  User,
  UserCheck,
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Briefcase,
  ShieldCheck,
  Edit2,
  Mars,
  Venus,
} from "lucide-react";
import EditEmployee from "./EditEmployee";
import {
  calculateContractTillEnd,
  calculateWorkDuration,
  formatRupiah,
} from "@/app/utils/format";
import { useState } from "react";

const EmployeeTable = ({
  contacts,
  notification,
  mutate,
  filteredEmployee,
  selectedEmployee,
  setSelectedEmployeeId,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("Edit Employee");

  return (
    <div className="space-y-6">
      {/* Table Container */}
      <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-slate-200/70 bg-slate-50/70 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/40">
                <th scope="col" className="px-5 py-3.5">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" />
                    <span>Nama Karyawan</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Gender</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <DollarSign className="w-3.5 h-3.5" />
                    <span>Gaji Pokok</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>Tunjangan</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    <TrendingDown className="w-3.5 h-3.5" />
                    <span>Potongan</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Hire Date</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5" />
                    <span>Tipe</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Status</span>
                  </div>
                </th>
                <th scope="col" className="px-5 py-3.5 text-center">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
              {filteredEmployee?.length > 0 ? (
                filteredEmployee.map((employee) => {
                  const name = employee.contact?.name || "N/A";
                  const initial = name.charAt(0).toUpperCase();
                  const allowance =
                    employee.salary_components
                      ?.filter((c) => c.type === "allowance")
                      .reduce(
                        (total, component) => total + Number(component.amount),
                        0,
                      ) || 0;
                  const deduction =
                    employee.salary_components
                      ?.filter((c) => c.type === "deduction")
                      .reduce(
                        (total, component) => total + Number(component.amount),
                        0,
                      ) || 0;

                  return (
                    <tr
                      key={employee.id}
                      className="group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors duration-150"
                    >
                      {/* 1. Nama Karyawan & Avatar */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs shadow-xs shrink-0">
                            {initial}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800 dark:text-slate-100 text-xs">
                              {name}
                            </div>
                            {employee.contact?.phone && (
                              <div className="text-[10px] text-slate-400 font-normal">
                                {employee.contact.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* 2. Gender Badge */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          title={
                            employee.gender === "male"
                              ? "Laki-laki"
                              : "Perempuan"
                          }
                          className={`inline-flex items-center justify-center h-7 w-7 rounded-lg transition-colors border ${
                            employee.gender === "male"
                              ? "bg-sky-50 text-sky-600 border-sky-100 dark:bg-sky-950/40 dark:text-sky-400 dark:border-sky-900/50"
                              : "bg-rose-50 text-rose-600 border-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-900/50"
                          }`}
                        >
                          {employee.gender === "male" ? (
                            <Mars className="h-3.5 w-3.5" />
                          ) : (
                            <Venus className="h-3.5 w-3.5" />
                          )}
                        </span>
                      </td>

                      {/* 3. Base Salary */}
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-slate-800 dark:text-slate-200 text-xs">
                        {formatRupiah(employee.base_salary)}
                      </td>

                      {/* 4. Tunjangan (Allowance) */}
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-xs">
                        {allowance > 0 ? (
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {formatRupiah(allowance)}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">
                            Rp 0
                          </span>
                        )}
                      </td>

                      {/* 5. Potongan (Deduction) */}
                      <td className="px-5 py-3.5 text-right font-mono font-semibold text-xs">
                        {deduction > 0 ? (
                          <span className="text-rose-500 dark:text-rose-400">
                            {formatRupiah(deduction)}
                          </span>
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600">
                            Rp 0
                          </span>
                        )}
                      </td>

                      {/* 6. Hire Date & Duration */}
                      <td className="px-5 py-3.5 text-center">
                        <div className="font-medium text-slate-700 dark:text-slate-300 text-xs">
                          {employee.hire_date || "-"}
                        </div>
                        {employee.status === "active" && employee.hire_date && (
                          <div className="mt-0.5 inline-block text-[10px] text-slate-400 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-1.5 py-0.5 rounded font-mono">
                            {calculateWorkDuration(employee.hire_date)}
                          </div>
                        )}
                      </td>

                      {/* 7. Employment Type */}
                      <td className="px-5 py-3.5 text-center">
                        <span className="inline-flex items-center rounded-lg bg-slate-100 dark:bg-slate-800 px-2.5 py-1 text-[11px] font-medium text-slate-600 dark:text-slate-300 capitalize border border-slate-200/60 dark:border-slate-700/60">
                          {employee.employment_type === "full_time"
                            ? "Full Time"
                            : calculateContractTillEnd(employee.contract_end)}
                        </span>
                      </td>

                      {/* 8. Status Badge */}
                      <td className="px-5 py-3.5 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold capitalize ${
                            employee.status === "active"
                              ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-200/60 dark:border-emerald-800/60"
                              : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60"
                          }`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full ${
                              employee.status === "active"
                                ? "bg-emerald-500 animate-pulse"
                                : "bg-rose-500"
                            }`}
                          />
                          {employee.status}
                        </span>
                      </td>

                      {/* 9. Action Button */}
                      <td className="px-5 py-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedEmployeeId(employee.id);
                            setModalTitle(`Edit Employee: ${name}`);
                            setIsModalOpen(true);
                          }}
                          className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200/60 dark:border-indigo-800/60 bg-indigo-50/50 dark:bg-indigo-950/30 px-3 py-1.5 text-xs font-semibold text-indigo-600 hover:bg-indigo-600 hover:text-white dark:text-indigo-400 dark:hover:bg-indigo-600 dark:hover:text-white transition-all cursor-pointer shadow-2xs"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          <span>Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                /* Empty State jika data kosong */
                <tr>
                  <td
                    colSpan={9}
                    className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <User className="w-8 h-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                      <p className="text-xs font-medium">
                        Tidak ada data karyawan ditemukan.
                      </p>
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
        maxWidth="max-w-2xl"
      >
        {modalTitle === "Add Employee" ? (
          <h1>Add Employee</h1>
        ) : (
          <EditEmployee
            key={selectedEmployee?.id}
            employee={selectedEmployee}
            contacts={contacts}
            isModalOpen={setIsModalOpen}
            notification={notification}
            mutate={mutate}
          />
        )}
      </Modal>
    </div>
  );
};

export default EmployeeTable;
