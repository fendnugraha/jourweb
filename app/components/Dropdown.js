/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, Search } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Dropdown({ id, label, options = [], selectedValue, onChange, ariaLabel, ...props }) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [coords, setCoords] = useState({
        top: 0,
        left: 0,
        width: 0,
        upwards: false,
    });
    const [search, setSearch] = useState("");

    const containerRef = useRef(null);
    const triggerRef = useRef(null);
    const listboxRef = useRef(null);
    const searchInputRef = useRef(null);

    const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0];

    // 1. Filter opsi berdasarkan input pencarian
    const filteredOptions = useMemo(() => {
        if (!search.trim()) return options;
        return options.filter((opt) => opt.label.toLowerCase().includes(search.toLowerCase()));
    }, [options, search]);

    // Reset highlight index ketika hasil pencarian berubah
    useEffect(() => {
        setHighlightedIndex(filteredOptions.length > 0 ? 0 : -1);
    }, [filteredOptions]);

    // 2. Handling Click Outside yang kompatibel dengan React Portal
    useEffect(() => {
        function handleClickOutside(e) {
            const isClickInsideContainer = containerRef.current?.contains(e.target);
            const isClickInsideListbox = listboxRef.current?.contains(e.target);

            if (!isClickInsideContainer && !isClickInsideListbox) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // 3. Hitung posisi dropdown portal
    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            const upwards = spaceBelow < 240 && spaceAbove > spaceBelow;

            setCoords({
                top: upwards ? rect.top : rect.bottom,
                left: rect.left,
                width: rect.width,
                upwards,
            });
        }
    };

    useEffect(() => {
        if (isOpen) {
            updateCoords();
            window.addEventListener("scroll", updateCoords, true);
            window.addEventListener("resize", updateCoords);

            // Auto focus ke input pencarian saat menu terbuka
            setTimeout(() => {
                searchInputRef.current?.focus();
            }, 50);

            return () => {
                window.removeEventListener("scroll", updateCoords, true);
                window.removeEventListener("resize", updateCoords);
            };
        } else {
            setSearch(""); // Reset kata kunci cari saat tertutup
        }
    }, [isOpen]);

    const toggleOpen = () => {
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);
        if (nextOpen) {
            const idx = filteredOptions.findIndex((opt) => opt.value === selectedValue);
            setHighlightedIndex(idx >= 0 ? idx : 0);
        } else {
            setHighlightedIndex(-1);
        }
    };

    // 4. Keyboard Navigation untuk Button dan Menu
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (["ArrowDown", "ArrowUp", " ", "Enter"].includes(e.key)) {
                e.preventDefault();
                setIsOpen(true);
            }
            return;
        }

        switch (e.key) {
            case "Escape":
                e.preventDefault();
                setIsOpen(false);
                triggerRef.current?.focus();
                break;
            case "ArrowDown":
                e.preventDefault();
                if (filteredOptions.length > 0) {
                    setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
                }
                break;
            case "ArrowUp":
                e.preventDefault();
                if (filteredOptions.length > 0) {
                    setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
                }
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    onChange(filteredOptions[highlightedIndex].value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                }
                break;
            case "Tab":
                setIsOpen(false);
                break;
        }
    };

    return (
        <div ref={containerRef} className="relative w-full">
            <span id={`${id}-label`} className="sr-only">
                {label}
            </span>
            <button
                ref={triggerRef}
                id={id}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={isOpen}
                aria-labelledby={`${id}-label`}
                aria-label={ariaLabel}
                onKeyDown={handleKeyDown}
                onClick={toggleOpen}
                disabled={props.disabled}
                hidden={props.hidden}
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 disabled:dark:bg-slate-800"
            >
                <span className="truncate">{selectedOption?.label || "Pilih..."}</span>
                <ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.div
                                ref={listboxRef}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                style={{
                                    position: "fixed",
                                    top: `${coords.top}px`,
                                    left: `${coords.left}px`,
                                    minWidth: `${coords.width}px`, // Minimal selebar button trigger
                                    width: "max-content", // Lebar otomatis mengikuti teks terpanjang
                                    maxWidth: "calc(100vw - 32px)", // Mencegah dropdown mentok keluar layar HP
                                    transform: coords.upwards ? "translateY(-100%) translateY(-4px)" : "translateY(4px)",
                                    transformOrigin: coords.upwards ? "bottom center" : "top center",
                                }}
                                className="z-9999 overflow-hidden rounded-xl border border-slate-100 bg-white shadow-lg ring-1 ring-black/5 dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5"
                                onKeyDown={handleKeyDown}
                            >
                                {/* Input Cari */}
                                <div className="sticky top-0 z-10 border-b border-slate-100 bg-white p-2 dark:border-slate-800 dark:bg-slate-900">
                                    <div className="relative flex items-center">
                                        <Search className="absolute left-2.5 h-3.5 w-3.5 text-slate-400" />
                                        <input
                                            ref={searchInputRef}
                                            type="text"
                                            placeholder="Cari..."
                                            value={search}
                                            onChange={(e) => setSearch(e.target.value)}
                                            onKeyDown={(e) => {
                                                // Mencegah spasi di input memicu event toggle pada button
                                                if (e.key === " ") e.stopPropagation();
                                            }}
                                            className="w-full rounded-lg bg-slate-50 py-1.5 pl-8 pr-3 text-xs text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:ring-1 focus:ring-indigo-500 dark:bg-slate-800 dark:text-slate-200"
                                        />
                                    </div>
                                </div>

                                {/* Daftar Opsi */}
                                <ul role="listbox" id={`${id}-listbox`} aria-labelledby={`${id}-label`} className="max-h-52 overflow-auto py-1">
                                    {filteredOptions.length === 0 ? (
                                        <li className="px-3.5 py-2.5 text-center text-xs text-slate-400">Tidak ada hasil ditemukan</li>
                                    ) : (
                                        filteredOptions.map((option, idx) => {
                                            const isSelected = option.value === selectedValue;
                                            const isHighlighted = idx === highlightedIndex;

                                            return (
                                                <li
                                                    key={option.value}
                                                    role="option"
                                                    id={`${id}-opt-${idx}`}
                                                    aria-selected={isSelected}
                                                    onClick={() => {
                                                        onChange(option.value);
                                                        setIsOpen(false);
                                                        triggerRef.current?.focus();
                                                    }}
                                                    onMouseEnter={() => setHighlightedIndex(idx)}
                                                    className={`relative flex cursor-pointer select-none items-center justify-between px-3.5 py-2 text-sm transition-colors ${
                                                        isHighlighted
                                                            ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                                                            : "text-slate-700 dark:text-slate-300"
                                                    }`}
                                                >
                                                    <span className={`block whitespace-nowrap ${isSelected ? "font-semibold" : "font-normal"}`}>
                                                        {option.label}
                                                    </span>
                                                    {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />}
                                                </li>
                                            );
                                        })
                                    )}
                                </ul>
                            </motion.div>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
}
