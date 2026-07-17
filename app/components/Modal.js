"use client";

import React, { useEffect, useRef } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function Modal({ isOpen, onClose, title, children, maxWidth = "max-w-lg" }) {
    const modalRef = useRef(null);
    const previousFocusRef = useRef(null);

    // Store previous focus and focus the modal container or its first interactive element on open
    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;

            // Delay slightly to allow animation to complete, then focus
            const timer = setTimeout(() => {
                if (modalRef.current) {
                    const focusable = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
                    if (focusable.length > 0) {
                        focusable[0].focus();
                    } else {
                        modalRef.current.focus();
                    }
                }
            }, 100);

            // Disable scrolling on background
            document.body.style.overflow = "hidden";

            return () => {
                clearTimeout(timer);
            };
        } else {
            document.body.style.overflow = "";
            if (previousFocusRef.current) {
                previousFocusRef.current.focus();
            }
        }
    }, [isOpen]);

    // Trap focus within the modal (WCAG Requirement)
    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            onClose();
            return;
        }

        if (e.key === "Tab") {
            if (!modalRef.current) return;
            const focusableElements = modalRef.current.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                // Shift + Tab
                if (document.activeElement === firstElement) {
                    lastElement.focus();
                    e.preventDefault();
                }
            } else {
                // Tab
                if (document.activeElement === lastElement) {
                    firstElement.focus();
                    e.preventDefault();
                }
            }
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity dark:bg-slate-950/85"
                        aria-hidden="true"
                    />

                    {/* Modal Content */}
                    <motion.div
                        ref={modalRef}
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        onKeyDown={handleKeyDown}
                        role="dialog"
                        aria-modal="true"
                        aria-labelledby="modal-title"
                        tabIndex={-1}
                        className={`relative w-full ${maxWidth} overflow-hidden rounded-xl bg-white p-6 shadow-xl border border-slate-100 focus:outline-hidden dark:bg-slate-900 dark:border-slate-800`}
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4 dark:border-slate-800">
                            <h2 id="modal-title" className="text-lg font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                                {title}
                            </h2>
                            <button
                                type="button"
                                onClick={onClose}
                                aria-label="Close modal"
                                className="rounded-xl p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 transition-colors dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Body */}
                        <div className={`${maxWidth} overflow-y-auto pr-1`}>{children}</div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
