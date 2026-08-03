"use client";
import { LogOut, Menu, X } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import DarkModeToggle from "../components/DarkModeToggle";
import NavLink from "../components/NavLink";
import { navMenu } from "../constants/NavMenu";

const Navigation = ({ user, logout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const pathName = usePathname();
    const userRole = user.role;
    const userPhoto = user?.attendances?.[0]?.photo_url || "/default.png";
    const appVersion = process.env.NEXT_PUBLIC_APP_VERSION || process.env.APP_VERSION;

    return (
        <>
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
                            {navMenu.mainMenu
                                .filter((item) => item.role.includes(userRole))
                                .map((item, index) => (
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
        </>
    );
};

export default Navigation;
