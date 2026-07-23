"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ChevronDown, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Dropdown({ id, label, options, selectedValue, onChange, ariaLabel, ...props }) {
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(-1);
    const [openUpwards, setOpenUpwards] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, upwards: false });
    const containerRef = useRef(null);
    const triggerRef = useRef(null);

    const selectedOption = options.find((opt) => opt.value === selectedValue) || options[0];

    // Close dropdown on click outside
    useEffect(() => {
        function handleClickOutside(e) {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Determine open direction and coordinates based on viewport space
    const updateCoords = () => {
        if (triggerRef.current) {
            const rect = triggerRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            // If there is less than 240px below the trigger, and more space above, open upwards.
            const upwards = spaceBelow < 240 && spaceAbove > spaceBelow;
            setOpenUpwards(upwards);

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
            // Handle scrolling/resizing dynamically
            window.addEventListener("scroll", updateCoords, true);
            window.addEventListener("resize", updateCoords);
            return () => {
                window.removeEventListener("scroll", updateCoords, true);
                window.removeEventListener("resize", updateCoords);
            };
        }
    }, [isOpen]);

    const toggleOpen = () => {
        const nextOpen = !isOpen;
        setIsOpen(nextOpen);
        if (nextOpen) {
            const idx = options.findIndex((opt) => opt.value === selectedValue);
            setHighlightedIndex(idx >= 0 ? idx : 0);
        } else {
            setHighlightedIndex(-1);
        }
    };

    // Handle all keyboard accessibility
    const handleKeyDown = (e) => {
        if (!isOpen) {
            if (e.key === "ArrowDown" || e.key === "ArrowUp" || e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setIsOpen(true);
                const idx = options.findIndex((opt) => opt.value === selectedValue);
                setHighlightedIndex(idx >= 0 ? idx : 0);
            }
            return;
        }

        switch (e.key) {
            case "Escape":
                setIsOpen(false);
                setHighlightedIndex(-1);
                triggerRef.current?.focus();
                e.preventDefault();
                break;
            case "ArrowDown":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev + 1) % options.length);
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightedIndex((prev) => (prev - 1 + options.length) % options.length);
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (highlightedIndex >= 0 && highlightedIndex < options.length) {
                    onChange(options[highlightedIndex].value);
                    setIsOpen(false);
                    triggerRef.current?.focus();
                }
                break;
            case "Home":
                e.preventDefault();
                setHighlightedIndex(0);
                break;
            case "End":
                e.preventDefault();
                setHighlightedIndex(options.length - 1);
                break;
            case "Tab":
                // Close menu silently and let standard tab navigation proceed
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
                className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-left text-sm font-medium text-slate-700 shadow-xs hover:bg-slate-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80"
            >
                <span className="truncate">{selectedOption?.label}</span>
                <ChevronDown className={`ml-2 h-4 w-4 shrink-0 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {typeof document !== "undefined" &&
                createPortal(
                    <AnimatePresence>
                        {isOpen && (
                            <motion.ul
                                role="listbox"
                                id={`${id}-listbox`}
                                aria-labelledby={`${id}-label`}
                                tabIndex={-1}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                transition={{ duration: 0.1 }}
                                style={{
                                    position: "fixed",
                                    top: `${coords.top}px`,
                                    left: `${coords.left}px`,
                                    width: `${coords.width}px`,
                                    transform: coords.upwards ? "translateY(-100%) translateY(-4px)" : "translateY(4px)",
                                    transformOrigin: coords.upwards ? "bottom center" : "top center",
                                }}
                                className="z-9999 overflow-auto rounded-xl border border-slate-100 bg-white py-1 shadow-lg ring-1 ring-black/5 focus:outline-hidden dark:border-slate-800 dark:bg-slate-900 dark:ring-white/5 max-h-60"
                            >
                                {options.map((option, idx) => {
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
                                            className={`relative flex cursor-default select-none items-center justify-between px-3.5 py-2 text-sm transition-colors ${
                                                isHighlighted
                                                    ? "bg-indigo-50 text-indigo-900 dark:bg-indigo-950/40 dark:text-indigo-300"
                                                    : "text-slate-700 dark:text-slate-300"
                                            }`}
                                        >
                                            <span className={`block truncate ${isSelected ? "font-semibold" : "font-normal"}`}>{option.label}</span>
                                            {isSelected && <Check className="h-4 w-4 text-indigo-600 dark:text-indigo-400" aria-hidden="true" />}
                                        </li>
                                    );
                                })}
                            </motion.ul>
                        )}
                    </AnimatePresence>,
                    document.body,
                )}
        </div>
    );
}
