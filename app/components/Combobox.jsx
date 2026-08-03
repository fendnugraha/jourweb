"use client";

import React, { useState, useRef, useEffect, useDeferredValue, useCallback } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check, X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Combobox({
    id,
    label,
    options = [],
    selectedValue,
    onChange,
    placeholder = "Pilih atau cari...",
    disabled = false,
    ariaLabel,
    ref, // Di React 19, ref diambil langsung sebagai prop biasa (tanpa forwardRef)
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, upwards: false });

    // React 19: useDeferredValue mencegah UI lag saat memfilter list banyak
    const deferredQuery = useDeferredValue(query);

    const containerRef = useRef(null);
    const internalInputRef = useRef(null);
    const inputRef = ref || internalInputRef;
    const listboxRef = useRef(null);

    // React 19 Compiler mengoptimasi ini secara otomatis
    const selectedOption = options.find((opt) => opt.value === selectedValue);

    // Derived State: Tampilkan query saat terbuka, atau label item terpilih saat tertutup (Tanpa useEffect!)
    const displayValue = isOpen ? query : selectedOption ? selectedOption.label : "";

    const filteredOptions = !deferredQuery.trim() ? options : options.filter((opt) => opt.label.toLowerCase().includes(deferredQuery.toLowerCase()));

    // Close dropdown saat klik di luar area
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target) && listboxRef.current && !listboxRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Hitung posisi dropdown (Portal) secara dinamis
    const updateCoords = useCallback(() => {
        if (inputRef.current) {
            const rect = inputRef.current.getBoundingClientRect();
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
    }, [inputRef]);

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
    }, [isOpen, updateCoords]);

    // Auto-scroll item terpilih ke area pandang saat navigasi keyboard
    useEffect(() => {
        if (isOpen && highlightedIndex >= 0 && listboxRef.current) {
            const highlightedEl = listboxRef.current.children[highlightedIndex];
            if (highlightedEl) {
                highlightedEl.scrollIntoView({ block: "nearest" });
            }
        }
    }, [highlightedIndex, isOpen]);

    const handleSelect = (option) => {
        onChange(option.value);
        setQuery(option.label);
        setIsOpen(false);
        setHighlightedIndex(-1);
    };

    const handleInputChange = (e) => {
        setQuery(e.target.value);
        if (!isOpen) setIsOpen(true);
        setHighlightedIndex(0);
    };

    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (["ArrowDown", "ArrowUp", "Enter"].includes(e.key)) {
                setIsOpen(true);
                setQuery(selectedOption ? selectedOption.label : "");
                setHighlightedIndex(0);
                e.preventDefault();
            }
            return;
        }

        switch (e.key) {
            case "Escape":
                setIsOpen(false);
                setHighlightedIndex(-1);
                e.preventDefault();
                break;
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => (filteredOptions.length > 0 ? (prev + 1) % filteredOptions.length : -1));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (filteredOptions.length > 0 ? (prev - 1 + filteredOptions.length) % filteredOptions.length : -1));
                break;
            case "Enter":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < filteredOptions.length) {
                    handleSelect(filteredOptions[highlightedIndex]);
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

            {/* Input Trigger */}
            <div className="relative flex items-center">
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    role="combobox"
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    aria-controls={`${id}-listbox`}
                    aria-labelledby={`${id}-label`}
                    aria-label={ariaLabel}
                    disabled={disabled}
                    value={displayValue}
                    onChange={handleInputChange}
                    onFocus={() => {
                        setQuery(selectedOption ? selectedOption.label : "");
                        setIsOpen(true);
                        setHighlightedIndex(0);
                    }}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-3.5 pr-10 text-sm font-medium text-slate-800 placeholder-slate-400 shadow-xs hover:bg-slate-50/50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder-slate-500 dark:hover:bg-slate-800/50 disabled:bg-slate-100 disabled:text-slate-400 dark:disabled:bg-slate-800/50"
                />

                {/* Right Action Icons */}
                <div className="absolute right-2.5 flex items-center gap-1">
                    {displayValue && !disabled && (
                        <button
                            type="button"
                            onClick={() => {
                                setQuery("");
                                onChange("");
                                inputRef.current?.focus();
                            }}
                            className="rounded-md p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                        >
                            <X className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <ChevronDown
                        onClick={() => {
                            if (!isOpen) {
                                setQuery(selectedOption ? selectedOption.label : "");
                            }
                            setIsOpen(!isOpen);
                        }}
                        className={`h-4 w-4 text-slate-400 transition-transform cursor-pointer ${isOpen ? "rotate-180" : ""}`}
                    />
                </div>
            </div>

            {/* Floating Options Dropdown via React Portal */}
            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.ul
                                ref={listboxRef}
                                role="listbox"
                                id={`${id}-listbox`}
                                aria-labelledby={`${id}-label`}
                                initial={{ opacity: 0, scale: 0.96 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.96 }}
                                transition={{ duration: 0.1 }}
                                style={{
                                    position: "fixed",
                                    top: `${coords.top}px`,
                                    left: `${coords.left}px`,
                                    width: `${coords.width}px`,
                                    transform: coords.upwards ? "translateY(-100%) translateY(-4px)" : "translateY(4px)",
                                    transformOrigin: coords.upwards ? "bottom center" : "top center",
                                }}
                                className="z-9999 max-h-60 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5"
                            >
                                {filteredOptions.length === 0 ? (
                                    <li className="px-3.5 py-2.5 text-xs text-slate-400 dark:text-slate-500 text-center">Opsi tidak ditemukan...</li>
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
                                                onClick={() => handleSelect(option)}
                                                onMouseEnter={() => setHighlightedIndex(idx)}
                                                className={`relative flex cursor-pointer select-none items-center justify-between px-3.5 py-2 text-sm transition-colors ${
                                                    isHighlighted
                                                        ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                                                        : "text-slate-700 dark:text-slate-300"
                                                }`}
                                            >
                                                <span className={`block truncate ${isSelected ? "font-semibold" : "font-normal"}`}>{option.label}</span>
                                                {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />}
                                            </li>
                                        );
                                    })
                                )}
                            </motion.ul>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
}
