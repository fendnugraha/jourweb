/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Modal({
    isOpen,
    onClose,
    title,
    modalTitle,
    children,
    maxWidth = "max-w-lg",
    fullscreenOnMobile = true,
}) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);
    const [mounted, setMounted] = useState(false);

    // Dukung prop 'title' maupun 'modalTitle' agar fleksibel
    const displayTitle = title || modalTitle;

    // Memastikan Portal hanya berjalan di Client Side (Aman untuk Next.js SSR)
    useEffect(() => {
        setMounted(true);
    }, []);

    // Store previous focus dan atur focus secara aman
    useEffect(() => {
        if (isOpen && mounted) {
            previousFocusRef.current = document.activeElement;

            const timer = setTimeout(() => {
                if (modalRef.current) {
                    const focusable = modalRef.current.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
                    );
                    if (focusable.length > 0) {
                        // preventScroll mencegah layar melompat/flicker saat elemen difokuskan
                        focusable[0].focus({ preventScroll: true });
                    } else {
                        modalRef.current.focus({ preventScroll: true });
                    }
                }
            }, 50);

            // Mencegah layout shift pada scrollbar
            const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
            document.body.style.overflow = "hidden";
            if (scrollbarWidth > 0) {
                document.body.style.paddingRight = `${scrollbarWidth}px`;
            }

            return () => {
                clearTimeout(timer);
                document.body.style.overflow = "";
                document.body.style.paddingRight = "";
            };
        } else if (!isOpen && mounted) {
            document.body.style.overflow = "";
            document.body.style.paddingRight = "";
            if (previousFocusRef.current) {
                previousFocusRef.current.focus({ preventScroll: true });
            }
        }
    }, [isOpen, mounted]);

    // Keyboard trap
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            onClose();
            return;
        }

        if (e.key === "Tab") {
            if (!modalRef.current) return;
            const focusableElements = modalRef.current.querySelectorAll(
                'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
            );
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    };

    if (!mounted) return null;

    return createPortal(
        <AnimatePresence>
            {isOpen && (
                <div
                    className={`fixed inset-0 z-9999 flex justify-center ${
                        fullscreenOnMobile
                            ? "items-stretch sm:items-center p-0 sm:p-6"
                            : "items-end sm:items-center p-0 sm:p-6"
                    }`}
                >
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs dark:bg-slate-950/85"
                        aria-hidden="true"
                    />

                    {/* Modal Content Box */}
                    <motion.div
                        ref={modalRef}
                        initial={{ opacity: 0, y: 20, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.98 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        onKeyDown={handleKeyDown}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        tabIndex={-1}
                        className={`relative w-full ${maxWidth} bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden focus:outline-hidden z-10 ${
                            fullscreenOnMobile
                                ? "h-dvh sm:h-auto sm:max-h-[85vh] rounded-none sm:rounded-2xl border-0 sm:border border-slate-100 dark:border-slate-800"
                                : "max-h-[90dvh] sm:max-h-[85vh] rounded-t-2xl sm:rounded-2xl border border-slate-100 dark:border-slate-800"
                        }`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5 sm:px-6 sm:py-4 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 rounded-t-none sm:rounded-t-2xl">
                            <h2
                                id="modal-title"
                                className="text-base sm:text-lg font-bold tracking-tight text-slate-900 dark:text-slate-50 truncate mr-2"
                            >
                                {displayTitle}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close modal"
                                className="rounded-xl p-1.5 sm:p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer shrink-0"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body Scrollable */}
                        <div className="flex-1 overflow-y-auto p-4 sm:p-6 overscroll-contain no-scrollbar">
                            {children}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>,
        document.body,
    );
}
