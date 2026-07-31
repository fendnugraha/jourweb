"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { motion, AnimatePresence } from "motion/react";

const DropdownMenu = ({ title = "Opsi", className = "", items = [], ariaLabel = "Menu Opsi" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, right: 0, upwards: false });
    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    // Close menu saat klik di luar atau tekan Esc
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target) && !e.target.closest(`[data-dropdown-portal="true"]`)) {
                setIsOpen(false);
            }
        }

        function handleKeyDown(e) {
            if (e.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        }

        document.addEventListener("mousedown", handleClickOutside);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    // Hitung posisi koordinat layar
    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;

            // Jika ruang di bawah < 200px dan ruang atas lebih luas, buka ke atas
            const upwards = spaceBelow < 200 && spaceAbove > spaceBelow;

            setCoords({
                top: upwards ? rect.top : rect.bottom,
                right: window.innerWidth - rect.right, // Menggunakan Right alignment untuk tabel
                upwards,
            });
        }
    };

    // Re-calculate saat Scroll/Resize
    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener("scroll", updateCoords, true);
            window.addEventListener("resize", updateCoords);
            return () => {
                window.removeEventListener("scroll", updateCoords, true);
                window.removeEventListener("resize", updateCoords);
            };
        }
    }, [isOpen]);

    const toggleOpen = () => {
        if (!isOpen) {
            updateCoords();
        }
        setIsOpen((prev) => !prev);
    };

    return (
        <div ref={containerRef} className="relative inline-block">
            {/* Trigger Button */}
            <button
                ref={triggerRef}
                type="button"
                aria-haspopup="menu"
                aria-expanded={isOpen}
                aria-label={ariaLabel}
                onClick={toggleOpen}
                className={className || "focus:outline-none cursor-pointer"}
            >
                {title}
            </button>

            {/* Menu via Portal */}
            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                data-dropdown-portal="true"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                style={{
                                    position: "fixed",
                                    top: `${coords.top}px`,
                                    right: `${coords.right}px`, // Sejajar dengan sisi kanan tombol
                                    transform: coords.upwards ? "translateY(-100%) translateY(-4px)" : "translateY(4px)",
                                    transformOrigin: coords.upwards ? "bottom right" : "top right",
                                }}
                                className="z-9999 min-w-44 max-h-60 overflow-y-auto rounded-xl border border-slate-100 bg-white p-1.5 shadow-xl ring-1 ring-black/5 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5"
                            >
                                <div className="flex flex-col gap-0.5">
                                    {items.map((item, index) => {
                                        // Sembunyikan item jika hidden: true
                                        if (item.attributes?.hidden) return null;

                                        const isDisabled = item.attributes?.disabled;
                                        const itemClasses = `flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-xs font-medium transition-colors ${
                                            isDisabled
                                                ? "opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600"
                                                : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer"
                                        }`;

                                        return (
                                            <div key={index}>
                                                {item.type === "link" ? (
                                                    <Link
                                                        href={isDisabled ? "#" : item.href || "#"}
                                                        onClick={() => {
                                                            if (!isDisabled) setIsOpen(false);
                                                        }}
                                                        className={itemClasses}
                                                    >
                                                        {item.icon && <span className="shrink-0 text-slate-400 dark:text-slate-500">{item.icon}</span>}
                                                        <span className="truncate">{item.label}</span>
                                                    </Link>
                                                ) : (
                                                    <button
                                                        type="button"
                                                        {...item.attributes}
                                                        disabled={isDisabled}
                                                        onClick={(e) => {
                                                            if (!isDisabled) {
                                                                item.onClick?.(e);
                                                                setIsOpen(false);
                                                            }
                                                        }}
                                                        className={itemClasses}
                                                    >
                                                        {item.icon && <span className="shrink-0 text-slate-400 dark:text-slate-500">{item.icon}</span>}
                                                        <span className="truncate">{item.label}</span>
                                                    </button>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
};

export default DropdownMenu;
