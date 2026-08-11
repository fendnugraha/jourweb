import { motion } from "motion/react";

export default function SubTabSwitcher({ subMenuTabs, activeSubTab, setActiveSubTab }) {
    return (
        <>
            {/* 1. TAMPILAN MOBILE: Dropdown Select (Tampil hanya di HP) */}
            <div className="sm:hidden w-full">
                <select
                    value={activeSubTab}
                    onChange={(e) => {
                        const selectedId = e.target.value;
                        const targetTab = subMenuTabs.find((t) => t.id === selectedId);
                        setActiveSubTab(selectedId);
                        if (targetTab?.onClick) targetTab.onClick(targetTab.value);
                    }}
                    className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 shadow-xs focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                >
                    {subMenuTabs.map((tab) => (
                        <option key={tab.id} value={tab.id}>
                            {tab.label}
                        </option>
                    ))}
                </select>
            </div>

            {/* 2. TAMPILAN DESKTOP: Tab Bar Animasi (Tampil di sm: ke atas) */}
            <div className="hidden sm:inline-flex p-1 bg-slate-200/80 dark:bg-slate-800/80 rounded-2xl gap-1 border border-slate-200/60 dark:border-slate-700/50 shadow-2xs">
                {subMenuTabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeSubTab === tab.id;

                    const handleClick = () => {
                        setActiveSubTab(tab.id);
                        if (tab.onClick) tab.onClick(tab.value);
                    };

                    return (
                        <button
                            key={tab.id}
                            onClick={handleClick}
                            className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer select-none ${
                                isActive
                                    ? "text-indigo-600 dark:text-indigo-400 font-bold"
                                    : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                            }`}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeSubTabIndicator"
                                    className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs"
                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                            )}
                            {Icon && (
                                <Icon
                                    className={`h-3.5 w-3.5 z-10 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
                                />
                            )}
                            <span className="z-10">{tab.label}</span>
                        </button>
                    );
                })}
            </div>
        </>
    );
}
