import React from "react";
import { motion } from "motion/react";

export default function TabSwitcher({ buttonList, activeTab, setActiveTab }) {
    return (
        <div className="grid grid-cols-2 gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50">
            {buttonList.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.value;

                const handleClick = () => {
                    // 1. Ubah state active tab
                    setActiveTab(tab.value);

                    // 2. Jalankan fungsi kustom jika ada di list
                    if (tab.onClick) {
                        tab.onClick(tab.value);
                    }
                };

                return (
                    <button
                        key={tab.value}
                        type="button"
                        onClick={handleClick}
                        className={`relative inline-flex items-center justify-center gap-2 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer select-none ${
                            isActive
                                ? "text-indigo-600 dark:text-indigo-300"
                                : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                        }`}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="tab-active-pill"
                                className="absolute inset-0 bg-white dark:bg-slate-700 rounded-xl shadow-xs"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}

                        <span className="relative z-10 flex items-center gap-1.5">
                            {Icon && <Icon className="w-3.5 h-3.5" />}
                            {tab.label}
                        </span>
                    </button>
                );
            })}
        </div>
    );
}
