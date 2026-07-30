import axios from "@/app/utils/axios";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const UpdateUserPassword = ({ isModalOpen, user, notification, mutate }) => {
    const id = user?.id;

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [updatePassword, setUpdatePassword] = useState({
        oldPassword: "",
        password: "",
        confirmPassword: "",
    });

    const handleUpdatePassword = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await axios.put(`/api/users/${id}/update-password`, updatePassword);
            notification(response.data.message);
            isModalOpen(false);
            mutate();
        } catch (error) {
            setErrors(error.response?.data?.errors || ["Something went wrong."]);
            notification(error.response?.data?.message || "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <form onSubmit={handleUpdatePassword} className="space-y-4">
            {/* 1. Header Information User */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 font-semibold text-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
                <div>
                    <p className="text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Mengubah Password Untuk</p>
                    <h3 className="text-xs font-semibold text-slate-800 dark:text-slate-100">{user?.name || "User Selected"}</h3>
                </div>
            </div>

            {/* 2. Old Password */}
            <div className="space-y-1">
                <label htmlFor="oldPassword" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Password Lama
                </label>
                <input
                    id="oldPassword"
                    type="password"
                    required
                    placeholder="••••••••"
                    value={updatePassword.oldPassword || ""}
                    onChange={(e) => setUpdatePassword({ ...updatePassword, oldPassword: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                />
            </div>

            {/* 3. New Password & Confirm Password (Grid 2 Kolom) */}
            <div className="grid sm:grid-cols-2 gap-3">
                {/* New Password */}
                <div className="space-y-1">
                    <label htmlFor="newPassword" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Password Baru
                    </label>
                    <input
                        id="newPassword"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={updatePassword.password || ""}
                        onChange={(e) => setUpdatePassword({ ...updatePassword, password: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>

                {/* Confirm Password */}
                <div className="space-y-1">
                    <label htmlFor="confirmPassword" className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        Konfirmasi Password Baru
                    </label>
                    <input
                        id="confirmPassword"
                        type="password"
                        required
                        placeholder="••••••••"
                        value={updatePassword.confirmPassword || ""}
                        onChange={(e) => setUpdatePassword({ ...updatePassword, confirmPassword: e.target.value })}
                        className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3.5 py-2 text-sm text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                </div>
            </div>

            {/* 4. Form Actions */}
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
                    {loading ? "Updating..." : "Update Password"}
                </button>
            </div>
        </form>
    );
};

export default UpdateUserPassword;
