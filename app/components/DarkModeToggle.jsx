"use client";

import { useContext } from "react";
import { DarkMode } from "@/app/context/DarkModeContext";
import { MoonIcon, SunIcon } from "lucide-react";

export default function DarkModeToggle() {
    const { darkMode, setDarkMode } = useContext(DarkMode);

    return (
        <span
            onClick={() => setDarkMode(!darkMode)}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 dark:bg-gray-600 text-black dark:text-white"
        >
            {darkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
        </span>
    );
}
