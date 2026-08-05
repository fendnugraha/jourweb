"use client";
import { LogOut, Menu, MoreHorizontal, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import DarkModeToggle from "../components/DarkModeToggle";
import NavLink from "../components/NavLink";
import { navMenu } from "../constants/NavMenu";
import { AnimatePresence, motion } from "motion/react";

// How many items to show directly in the bottom bar (rest go in "More" drawer)
const BOTTOM_BAR_MAX = 4;

const Navigation = ({ user, logout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
    const pathName = usePathname();
    const userRole = user.role;
    const userPhoto = user?.attendances?.[0]?.photo_url || "/default.png";
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION;

    const filteredMenu = navMenu.mainMenu.filter((item) => item.role.includes(userRole));
    const bottomBarItems = filteredMenu.slice(0, BOTTOM_BAR_MAX);
    const drawerItems = filteredMenu.slice(BOTTOM_BAR_MAX);
    const hasDrawerItems = drawerItems.length > 0;

    return (
        <>
            {/* ============================================================
                DESKTOP SIDEBAR (sm and above) — unchanged
            ============================================================ */}
            <nav
                className={`hidden sm:flex sm:flex-col ${isMenuOpen ? "w-64" : "w-16"} h-screen justify-between bg-white dark:bg-slate-900 border-r border-slate-200/60 dark:border-slate-800/60 transition-all duration-300 ease-in-out p-2 shadow-sm z-30`}
            >
                {/* Header Profile / Logo Toggle */}
                <div>
                    <div className="flex items-center cursor-pointer text-slate-800 dark:text-white w-full rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/30 p-1 mb-6 transition-colors duration-200">
                        {/* Avatar Toggle */}
                        <div
                            className="w-10 h-10 flex items-center justify-center shrink-0 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs cursor-pointer hover:ring-2 hover:ring-blue-500/30 transition-all"
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                        >
                            {userPhoto ? (
                                <Image src={userPhoto} alt="" width={40} height={40} className="w-full h-full object-cover" unoptimized />
                            ) : (
                                <Menu size={20} />
                            )}
                        </div>

                        {/* Title Text */}
                        <div
                            className={`flex flex-1 justify-between items-center transition-all duration-300 origin-left ml-3 ${
                                isMenuOpen ? "opacity-100 scale-100 w-auto" : "opacity-0 scale-90 w-0 pointer-events-none"
                            }`}
                        >
                            <div className="flex flex-col text-left">
                                <h1 className="text-sm font-bold text-slate-800 dark:text-slate-100 text-nowrap">
                                    AgenBRI
                                    <span className="text-orange-500 font-extrabold">Link</span>
                                </h1>
                                <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium whitespace-nowrap">
                                    THREE KOMUNIKA {appVersion}
                                </span>
                            </div>
                            <DarkModeToggle />
                        </div>
                    </div>

                    {/* Middle Menu Links */}
                    <div className="mt-4">
                        <ul className="space-y-1.5">
                            {filteredMenu.map((item, index) => (
                                <li key={index}>
                                    <NavLink href={item.href} active={pathName.startsWith(item.path)}>
                                        <span className="w-10 h-10 flex items-center justify-center shrink-0">
                                            <item.icon
                                                size={18}
                                                className="transition-transform duration-200 group-hover:scale-110"
                                                strokeWidth={pathName.startsWith(item.path) ? 2.5 : 1.8}
                                            />
                                        </span>
                                        <span
                                            className={`text-xs font-semibold tracking-wide ml-3 transition-all duration-300 origin-left ${
                                                isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                                            }`}
                                        >
                                            {item.name}
                                        </span>
                                    </NavLink>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>

                {/* Footer Section - Logout */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                    <button
                        onClick={logout}
                        className="flex items-center cursor-pointer w-full transition-colors duration-200 rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 hover:text-red-600 dark:text-red-400 dark:hover:text-red-300 p-1"
                    >
                        <span className="w-10 h-10 flex items-center justify-center shrink-0">
                            <LogOut size={18} strokeWidth={2.2} />
                        </span>
                        <h1
                            className={`text-left text-xs font-semibold ml-3 transition-all duration-300 origin-left ${
                                isMenuOpen ? "opacity-100 scale-100" : "opacity-0 scale-90 pointer-events-none"
                            }`}
                        >
                            <span className="text-xs text-slate-800 dark:text-slate-100">{user?.name}</span>
                            <span className="text-[10px] font-normal text-slate-500 dark:text-slate-400 block">{user.email}</span>
                        </h1>
                    </button>
                </div>
            </nav>

            {/* ============================================================
                MOBILE BOTTOM NAVIGATION BAR (below sm)
            ============================================================ */}
            <div className="sm:hidden">
                {/* Fixed bottom tab bar */}
                <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800/80 shadow-[0_-4px_24px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.25)] px-2 pb-safe">
                    <div className="flex items-center justify-around">
                        {/* Visible tab items */}
                        {bottomBarItems.map((item) => {
                            const isActive = pathName.startsWith(item.path);
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 flex-1 min-w-0 group"
                                >
                                    {/* Active background pill */}
                                    {isActive && (
                                        <motion.div
                                            layoutId="mobileNavActivePill"
                                            className="absolute inset-x-1 inset-y-1 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60"
                                            transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                        />
                                    )}

                                    {/* Icon */}
                                    <span className="relative z-10">
                                        <item.icon
                                            size={20}
                                            strokeWidth={isActive ? 2.5 : 1.8}
                                            className={`transition-colors duration-200 ${
                                                isActive
                                                    ? "text-indigo-600 dark:text-indigo-400"
                                                    : "text-slate-400 dark:text-slate-500 group-active:text-slate-600"
                                            }`}
                                        />
                                    </span>

                                    {/* Label */}
                                    <span
                                        className={`relative z-10 text-[10px] font-semibold tracking-wide transition-colors duration-200 truncate max-w-full ${
                                            isActive
                                                ? "text-indigo-600 dark:text-indigo-400"
                                                : "text-slate-400 dark:text-slate-500"
                                        }`}
                                    >
                                        {item.name}
                                    </span>
                                </Link>
                            );
                        })}

                        {/* "More" button — opens drawer for overflow items */}
                        {hasDrawerItems && (
                            <button
                                type="button"
                                onClick={() => setIsMobileDrawerOpen(true)}
                                className="relative flex flex-col items-center justify-center gap-0.5 py-2.5 px-3 flex-1 min-w-0 group"
                            >
                                {isMobileDrawerOpen && (
                                    <motion.div
                                        layoutId="mobileNavActivePill"
                                        className="absolute inset-x-1 inset-y-1 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                                <span className="relative z-10">
                                    <MoreHorizontal
                                        size={20}
                                        strokeWidth={isMobileDrawerOpen ? 2.5 : 1.8}
                                        className={`transition-colors duration-200 ${
                                            isMobileDrawerOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                                        }`}
                                    />
                                </span>
                                <span
                                    className={`relative z-10 text-[10px] font-semibold tracking-wide transition-colors duration-200 ${
                                        isMobileDrawerOpen ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                                    }`}
                                >
                                    More
                                </span>
                            </button>
                        )}
                    </div>
                </nav>

                {/* Bottom sheet drawer for overflow items */}
                <AnimatePresence>
                    {isMobileDrawerOpen && (
                        <>
                            {/* Backdrop */}
                            <motion.div
                                key="mobile-drawer-backdrop"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs"
                                onClick={() => setIsMobileDrawerOpen(false)}
                            />

                            {/* Sheet */}
                            <motion.div
                                key="mobile-drawer-sheet"
                                initial={{ y: "100%" }}
                                animate={{ y: 0 }}
                                exit={{ y: "100%" }}
                                transition={{ type: "spring", damping: 28, stiffness: 220 }}
                                className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-slate-900 rounded-t-3xl border-t border-slate-200 dark:border-slate-800 shadow-2xl"
                            >
                                {/* Drag handle */}
                                <div className="flex justify-center pt-3 pb-1">
                                    <div className="w-10 h-1 rounded-full bg-slate-200 dark:bg-slate-700" />
                                </div>

                                {/* Header */}
                                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-100 dark:border-slate-800">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-full overflow-hidden border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
                                            <Image src={userPhoto} alt="" width={36} height={36} className="w-full h-full object-cover" unoptimized />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
                                            <p className="text-[10px] text-slate-400 dark:text-slate-500">{user?.role}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DarkModeToggle />
                                        <button
                                            type="button"
                                            onClick={() => setIsMobileDrawerOpen(false)}
                                            className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>

                                {/* Menu grid */}
                                <div className="px-4 py-4 grid grid-cols-3 gap-3">
                                    {drawerItems.map((item, i) => {
                                        const isActive = pathName.startsWith(item.path);
                                        return (
                                            <motion.div
                                                key={item.href}
                                                initial={{ opacity: 0, y: 12 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                transition={{ delay: i * 0.05, duration: 0.2 }}
                                            >
                                                <Link
                                                    href={item.href}
                                                    onClick={() => setIsMobileDrawerOpen(false)}
                                                    className={`flex flex-col items-center gap-2 p-3.5 rounded-2xl transition-all active:scale-95 ${
                                                        isActive
                                                            ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30"
                                                            : "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                                                    }`}
                                                >
                                                    <item.icon
                                                        size={22}
                                                        strokeWidth={isActive ? 2.5 : 1.8}
                                                        className={isActive ? "text-white" : "text-slate-500 dark:text-slate-400"}
                                                    />
                                                    <span className={`text-[11px] font-semibold text-center leading-tight ${isActive ? "text-white" : ""}`}>
                                                        {item.name}
                                                    </span>
                                                </Link>
                                            </motion.div>
                                        );
                                    })}
                                </div>

                                {/* Footer — logout */}
                                <div className="px-4 pb-8 pt-2 border-t border-slate-100 dark:border-slate-800 space-y-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsMobileDrawerOpen(false);
                                            logout();
                                        }}
                                        className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-950/50 transition-colors active:scale-[0.98]"
                                    >
                                        <LogOut size={16} strokeWidth={2.2} />
                                        <span className="text-sm font-semibold">Keluar</span>
                                    </button>
                                    <p className="text-center text-[10px] text-slate-300 dark:text-slate-700 font-medium pt-1">
                                        AgenBRI<span className="text-orange-400 font-extrabold">Link</span> — THREE KOMUNIKA {appVersion}
                                    </p>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>

                {/* Spacer so page content isn't hidden under the bottom bar */}
                <div className="h-16" />
            </div>
        </>
    );
};

export default Navigation;
