import { useState } from "react";
import { ArrowUpDown, Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function MobileNavDrawer({ menuList = [], activeTab, setActiveTab }) {
    const [isOpen, setIsOpen] = useState(false);

    const ActiveIcon = activeTab?.icon || ArrowUpDown;
    const activeTabObj = menuList.find((item) => item.id === activeTab);
    const activeLabel = activeTabObj?.label || "Pilih Menu";

    return (
        <>
            <div className="w-full">
                {/* 1. MOBILE TRIGGER BUTTON (< 640px) */}
                <div className="sm:hidden px-1">
                    <button
                        type="button"
                        onClick={() => setIsOpen(true)}
                        className="w-full flex items-center justify-between p-3 bg-indigo-50/60 dark:bg-indigo-800/50 border border-indigo-100 dark:border-indigo-900/50 rounded-2xl active:scale-[0.98] transition-transform"
                    >
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs">
                                <ActiveIcon className="h-4 w-4" />
                            </div>
                            <div className="text-left">
                                <span className="block text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                                    Menu Aktif
                                </span>
                                <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{activeLabel}</span>
                            </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-indigo-100 dark:border-indigo-900 shadow-2xs">
                            <Menu size={16} />
                        </span>
                    </button>

                    {/* BOTTOM SHEET DRAWER (MOBILE ONLY) */}
                    <AnimatePresence>
                        {isOpen && (
                            <>
                                {/* Backdrop Dark overlay */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={() => setIsOpen(false)}
                                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50"
                                />

                                {/* Sheet Content */}
                                <motion.div
                                    initial={{ y: "100%" }}
                                    animate={{ y: 0 }}
                                    exit={{ y: "100%" }}
                                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                                    className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 rounded-t-3xl p-5 z-50 border-t border-slate-200 dark:border-slate-800 shadow-2xl space-y-4"
                                >
                                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
                                        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">Pilih Sub Menu</h3>
                                        <button onClick={() => setIsOpen(false)} className="text-xs font-bold text-slate-400 hover:text-slate-600 p-1">
                                            Tutup ✕
                                        </button>
                                    </div>

                                    <div className="grid gap-2">
                                        {menuList.map((tab) => {
                                            const Icon = tab.icon;
                                            const isActive = activeTab === tab.id;
                                            return (
                                                <button
                                                    key={tab.id}
                                                    onClick={() => {
                                                        setActiveTab(tab.id);
                                                        setIsOpen(false);
                                                    }}
                                                    className={`flex items-center gap-3 p-3 rounded-xl font-medium text-sm transition-all text-left ${
                                                        isActive
                                                            ? "bg-indigo-600 text-white font-bold shadow-md"
                                                            : "bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    <Icon className="h-4 w-4 shrink-0" />
                                                    <span>{tab.label}</span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </motion.div>
                            </>
                        )}
                    </AnimatePresence>
                </div>

                {/* 2. DESKTOP / TABLET TAB BAR (>= 640px) */}
                <div className="hidden sm:block border-b border-slate-200/80 dark:border-slate-800">
                    <div className="flex gap-6 px-4">
                        {menuList.map((tab) => {
                            const isActive = activeTab === tab.id;
                            const Icon = tab.icon;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`relative py-3 text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer select-none ${
                                        isActive
                                            ? "text-indigo-600 dark:text-indigo-400 font-bold"
                                            : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                                    }`}
                                >
                                    <span className="flex items-center gap-2">
                                        <Icon className="h-4 w-4 shrink-0" />
                                        {tab.label}
                                    </span>
                                    {isActive && (
                                        <motion.div
                                            layoutId="activeTabIndicator"
                                            className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400 rounded-full"
                                            transition={{ type: "spring", stiffness: 380, damping: 30 }}
                                        />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
