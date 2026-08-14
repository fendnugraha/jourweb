import React, { useId } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function TabSwitcher({ buttonList = [], activeTab, setActiveTab, id, children }) {
    const generatedId = useId();
    const layoutId = id || generatedId;

    return (
        <div className="w-full space-y-3">
            {/* 1. Header Tab Switcher */}
            <div
                className="grid gap-1 p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/50"
                style={{
                    gridTemplateColumns: `repeat(${buttonList.length || 1}, minmax(0, 1fr))`,
                }}
            >
                {buttonList.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.value;

                    const handleClick = () => {
                        setActiveTab(tab.value);
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
                                    layoutId={`tab-pill-${layoutId}`}
                                    className="absolute inset-0 bg-indigo-100 dark:bg-slate-700 rounded-xl shadow-xs"
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

            {/* 2. Container Animasi Height & Transisi Content */}
            <motion.div layout transition={{ type: "spring", stiffness: 300, damping: 30 }} className="overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.15 }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
