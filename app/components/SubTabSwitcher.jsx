import { AnimatePresence, motion } from "motion/react";

export default function SubTabSwitcher({
  subMenuTabs,
  activeSubTab,
  setActiveSubTab,
}) {
  return (
    <div className="p-1 bg-slate-200 dark:bg-slate-800 rounded-2xl inline-flex gap-1 border border-slate-200/60 dark:border-slate-700/50 shadow-2xs">
      {subMenuTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeSubTab === tab.id;

        const handleClick = () => {
          // 1. Ubah state active tab
          setActiveSubTab(tab.id);

          // 2. Jalankan fungsi kustom jika ada di list
          if (tab.onClick) {
            tab.onClick(tab.value);
          }
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
            {/* Animasi Background Pill Meluncur */}
            {isActive && (
              <motion.div
                layoutId="activeSubTabIndicator"
                className="absolute inset-0 bg-white dark:bg-slate-900 rounded-xl shadow-xs"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}

            {/* Icon & Text (z-10 supaya di atas background animasi) */}
            <tab.icon
              className={`h-3.5 w-3.5 z-10 transition-colors ${isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400"}`}
            />
            <span className="z-10">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}
