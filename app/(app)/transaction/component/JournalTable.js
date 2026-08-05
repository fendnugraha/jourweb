import DropdownMenu from "@/app/components/DropdownMenu";
import Modal from "@/app/components/Modal";
import { formatDateTime, formatNumber, formatRupiah } from "@/app/utils/format";
import {
  FileText,
  Tag,
  CreditCard,
  Coins,
  MoreHorizontal,
  Calendar,
  ArrowRightLeft,
  FileWarning,
  AlertCircle,
  Ellipsis,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";
import EditMutationJournal from "./EditMutationJournal";
import EditTxJournal from "./EditTxJournal";
import EditDeposit from "../deposit/EditDeposit";

const JournalTable = ({
  filteredTransactions,
  setTxToDelete,
  warehouseCashId,
  warehouseId,
  userRole,
  hqAccounts,
  hqAccountIds,
  isJournalLoading,
  isJournalValidating,
  whAccounts,
  mutate,
  mutateBalance,
  notification,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [typeTransaction, setTypeTransaction] = useState("");

  return (
    <div className="relative rounded-2xl border border-slate-200/80 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
      {/* BACKGROUND REVALIDATING INDICATOR */}
      {isJournalValidating && !isJournalLoading && (
        <div className="absolute top-3 right-5 z-10 flex items-center gap-1.5 rounded-full bg-indigo-50/90 dark:bg-indigo-950/80 px-2.5 py-1 text-[10px] font-medium text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 backdrop-blur-xs">
          <RefreshCw className="h-3 w-3 animate-spin text-indigo-500" />
          <span>Syncing...</span>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:border-slate-800 dark:bg-slate-950/25">
              <th scope="col" className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Transaction Details</span>
                </div>
              </th>
              <th scope="col" className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <Tag className="w-3.5 h-3.5" />
                  <span>Category</span>
                </div>
              </th>
              <th scope="col" className="px-5 py-3.5">
                <div className="flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Settle Channel</span>
                </div>
              </th>
              <th scope="col" className="px-5 py-3.5 text-right">
                <div className="flex items-center justify-end gap-1.5">
                  <Coins className="w-3.5 h-3.5" />
                  <span>Cash Amount</span>
                </div>
              </th>
              <th scope="col" className="px-5 py-3.5 text-center">
                <div className="flex items-center justify-center gap-1.5">
                  <MoreHorizontal className="w-3.5 h-3.5" />
                  <span>Actions</span>
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs dark:divide-slate-800/60">
            {/* 1. STATE LOADING (SKELETON ROWS) */}
            {isJournalLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {/* Column 1: Description & Date */}
                  <td className="px-5 py-4 space-y-2">
                    <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-1/3" />
                  </td>
                  {/* Column 2: Category */}
                  <td className="px-5 py-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-24" />
                  </td>
                  {/* Column 3: Settle Channel */}
                  <td className="px-5 py-4">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-32" />
                  </td>
                  {/* Column 4: Amount */}
                  <td className="px-5 py-4 text-right space-y-1">
                    <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded-lg w-24 ml-auto" />
                    <div className="h-3 bg-slate-100 dark:bg-slate-800/60 rounded-md w-12 ml-auto" />
                  </td>
                  {/* Column 5: Action */}
                  <td className="px-5 py-4 text-center">
                    <div className="h-6 w-6 bg-slate-200 dark:bg-slate-800 rounded-lg mx-auto" />
                  </td>
                </tr>
              ))
            ) : filteredTransactions.length === 0 ? (
              /* 2. STATE EMPTY (DATA KOSONG) */
              <tr>
                <td
                  colSpan={5}
                  className="px-6 py-12 text-center text-slate-400 dark:text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <AlertCircle className="h-8 w-8 text-slate-300 dark:text-slate-600 stroke-[1.5]" />
                    <p className="font-semibold text-xs text-slate-600 dark:text-slate-400">
                      No matching transactions found
                    </p>
                    <p className="text-[11px] text-slate-400 dark:text-slate-500">
                      Try adjusting your filters or search query
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              /* 3. STATE HAS DATA (DAFTAR TRANSAKSI) */
              filteredTransactions.map((tx) => {
                const accountToCheck = Number(warehouseCashId);
                const isInflow = Number(tx.debt_id) === accountToCheck;

                return (
                  <tr
                    key={tx.id}
                    className="group hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors duration-150"
                  >
                    {/* 1. Description & Date */}
                    <td className="px-5 py-4 max-w-xs md:max-w-md">
                      <div className="space-y-1">
                        <span className="font-semibold text-slate-800 dark:text-slate-100 block wrap-break-word">
                          {tx.description}
                        </span>
                        <div className="inline-flex items-center gap-1.5 rounded-md bg-slate-50 dark:bg-slate-800/50 px-2 py-0.5 border border-slate-200/50 dark:border-slate-700/50 text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                          <Calendar className="h-3 w-3 text-slate-400 shrink-0" />
                          <span>{formatDateTime(tx.date_issued)}</span>
                        </div>
                      </div>
                    </td>

                    {/* 2. Category */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100/80 dark:bg-slate-800/60 px-2.5 py-1 text-[11px] font-medium text-slate-700 dark:text-slate-300 border border-slate-200/50 dark:border-slate-700/50">
                        <Tag className="h-3 w-3 text-slate-400 shrink-0" />
                        <span>{tx.trx_type || "Uncategorized"}</span>
                      </span>
                    </td>

                    {/* 3. Settlement Channel */}
                    <td className="px-5 py-4 whitespace-nowrap">
                      {tx.trx_type === "Mutasi Kas" ? (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                          <ArrowRightLeft className="h-3 w-3 shrink-0" />
                          <span>
                            {tx.cred?.group}
                            {tx.cred?.warehouse?.id !== warehouseId && (
                              <span className="text-slate-500 dark:text-slate-400 font-normal">
                                {" "}
                                (
                                {tx.cred?.warehouse?.name.replace(
                                  /^konter\s*/i,
                                  "",
                                )}
                                )
                              </span>
                            )}
                            {" → "}
                            {tx.debt?.group}
                            {tx.debt?.warehouse?.id !== warehouseId && (
                              <span className="text-slate-500 dark:text-slate-400 font-normal">
                                {" "}
                                (
                                {tx.debt?.warehouse?.name.replace(
                                  /^konter\s*/i,
                                  "",
                                )}
                                )
                              </span>
                            )}
                          </span>
                          {tx.debt?.group !== tx.cred?.group && (
                            <FileWarning className="h-3.5 w-3.5 animate-bounce text-amber-500 ml-0.5 shrink-0" />
                          )}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-50/70 dark:bg-indigo-950/40 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50">
                          <CreditCard className="h-3 w-3 shrink-0" />
                          <span>
                            {tx.cred_id === warehouseCashId
                              ? tx.debt?.group || "Cash"
                              : tx.cred?.group || "Cash"}
                          </span>
                        </span>
                      )}
                    </td>

                    {/* 4. Amount & Fee */}
                    <td className="px-5 py-4 text-right whitespace-nowrap font-mono">
                      <div className="font-semibold text-slate-800 dark:text-slate-100">
                        <span
                          className={`text-sm font-bold px-2 py-1 rounded-lg inline-block border ${
                            !isInflow
                              ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100/30"
                              : "text-red-600 dark:text-red-400 bg-red-50/70 dark:bg-red-950/30 border-red-100/30"
                          }`}
                        >
                          {!isInflow ? "+" : "-"} {formatNumber(tx.amount)}
                        </span>
                      </div>
                      {!tx.fee_amount || tx.fee_amount === 0 ? null : (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                          Fee: {formatNumber(tx.fee_amount)}
                        </div>
                      )}
                    </td>

                    {/* 5. Action Dropdown Menu */}
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center">
                        <DropdownMenu
                          title={
                            <div className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                              <Ellipsis className="h-4 w-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" />
                            </div>
                          }
                          position="auto"
                          items={[
                            ["Deposit"].includes(tx.trx_type) && {
                              type: "button",
                              label: "Edit Deposit",
                              onClick: () => {
                                setSelectedJournal(tx);
                                setModalTitle("Edit Deposit");
                                setTypeTransaction("edit-deposit");
                                setIsModalOpen(true);
                              },
                            },
                            ["Transfer Uang", "Tarik Tunai"].includes(
                              tx.trx_type,
                            ) && {
                              type: "button",
                              label: "Edit Transaksi",
                              onClick: () => {
                                setSelectedJournal(tx);
                                setModalTitle("Edit Transaksi");
                                setTypeTransaction("edit-transaksi");
                                setIsModalOpen(true);
                              },
                            },
                            ["Mutasi Kas"].includes(tx.trx_type) &&
                              !hqAccountIds.includes(tx.cred_id) && {
                                type: "button",
                                label: "Edit Mutasi",
                                onClick: () => {
                                  setSelectedJournal(tx);
                                  setModalTitle("Edit Mutasi");
                                  setTypeTransaction("edit-mutasi-kas");
                                  setIsModalOpen(true);
                                },
                              },
                            {
                              type: "button",
                              attributes: {
                                disabled:
                                  [
                                    "Voucher & SP",
                                    "Accessories",
                                    null,
                                  ].includes(tx.trx_type) ||
                                  (!["Administrator", "Super Admin"].includes(
                                    userRole,
                                  ) &&
                                    hqAccountIds.includes(tx.cred_id)),
                              },
                              label: "Hapus Transaksi",
                              onClick: () => {
                                setTxToDelete(tx.id);
                              },
                            },
                          ].filter(Boolean)}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalTitle}
      >
        {typeTransaction === "edit-mutasi-kas" && (
          <EditMutationJournal
            journal={selectedJournal}
            mutate={mutate}
            mutateBalance={mutateBalance}
            notification={notification}
            isModalOpen={setIsModalOpen}
            whAccounts={whAccounts}
            hqAccounts={hqAccounts}
            userRole={userRole}
          />
        )}

        {typeTransaction === "edit-transaksi" && (
          <EditTxJournal
            journal={selectedJournal}
            mutate={mutate}
            whAccounts={whAccounts}
            mutateBalance={mutateBalance}
            notification={notification}
            isModalOpen={setIsModalOpen}
          />
        )}

        {typeTransaction === "edit-deposit" && (
          <EditDeposit
            journal={selectedJournal}
            mutate={mutate}
            notification={notification}
            isModalOpen={setIsModalOpen}
          />
        )}
      </Modal>
    </div>
  );
};
export default JournalTable;
