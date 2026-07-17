"use client";

import React, { useEffect, useRef } from "react";
import { AlertTriangle, Trash2 } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export default function ConfirmDialog({ isOpen, onClose, onConfirm, title, description, confirmLabel = "Delete", cancelLabel = "Cancel" }) {
    const containerRef = useRef(null);
    const previousFocusRef = useRef(null);

    useEffect(() => {
        if (isOpen) {
            previousFocusRef.current = document.activeElement;
            const timer = setTimeout(() => {
                // Focus the cancel button first (safest option to prevent accidental keyboard deletes)
                if (containerRef.current) {
                    const cancelButton = containerRef.current.querySelector('[data-type="cancel"]');
                    if (cancelButton) {
                        cancelButton.focus();
                    } else {
                        containerRef.current.focus();
                    }
                }
            }, 100);

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

    const handleKeyDown = (e) => {
        if (e.key === "Escape") {
            onClose();
            return;
        }

        if (e.key === "Tab") {
            if (!containerRef.current) return;
            const buttons = containerRef.current.querySelectorAll("button");
            if (buttons.length < 2) return;

            const firstBtn = buttons[0];
            const lastBtn = buttons[buttons.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstBtn) {
                    lastBtn.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === lastBtn) {
                    firstBtn.focus();
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

                    {/* Confirm Dialog Content */}
                    <motion.div
                        ref={containerRef}
                        initial={{ scale: 0.95, opacity: 0, y: 15 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.95, opacity: 0, y: 15 }}
                        transition={{ type: "spring", damping: 25, stiffness: 350 }}
                        onKeyDown={handleKeyDown}
                        role="alertdialog"
                        aria-modal="true"
                        aria-labelledby="confirm-title"
                        aria-describedby="confirm-desc"
                        tabIndex={-1}
                        className="relative w-full max-w-md overflow-hidden rounded-xl bg-white p-6 shadow-xl border border-slate-100 focus:outline-hidden dark:bg-slate-900 dark:border-slate-800"
                    >
                        <div className="flex items-start gap-4">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400">
                                <AlertTriangle className="h-5 w-5" aria-hidden="true" />
                            </div>

                            <div className="flex-1">
                                <h2 id="confirm-title" className="text-base font-semibold tracking-tight text-slate-900 dark:text-slate-50">
                                    {title}
                                </h2>
                                <p id="confirm-desc" className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                                    {description}
                                </p>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                            <button
                                type="button"
                                data-type="cancel"
                                onClick={onClose}
                                className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-indigo-500 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700/80"
                            >
                                {cancelLabel}
                            </button>
                            <button
                                type="button"
                                data-type="confirm"
                                onClick={() => {
                                    onConfirm();
                                    onClose();
                                }}
                                className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-red-500 dark:bg-red-600 dark:hover:bg-red-700"
                            >
                                <Trash2 className="h-4 w-4" aria-hidden="true" />
                                {confirmLabel}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
