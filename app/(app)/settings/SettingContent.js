"use client";
import { ContactRound, Package, Scale, UserCog, Warehouse } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import UserTable from "./UserTable";
import ContactTable from "./ContactTable";
import AccountTable from "./AccountTable";
import WarehouseTable from "./WarehouseTable";
import ProductTable from "./ProductTable";

const SettingContent = () => {
    const [activeSubTab, setActiveSubTab] = useState("users");

    return (
        <div className="space-y-6">
            <div className="border-b border-slate-200 dark:border-slate-800 flex gap-6 pb-px pt-4 px-4">
                {/* Sub-Tab Buttons */}
                {[
                    { id: "users", label: "User Management", icon: UserCog },
                    { id: "accounts", label: "Account Management", icon: Scale },
                    { id: "warehouses", label: "Warehouse Management", icon: Warehouse },
                    { id: "products", label: "Product Management", icon: Package },
                    { id: "contacts", label: "Contact Management", icon: ContactRound },
                ].map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveSubTab(tab.id)}
                        className={`pb-3 text-sm font-bold relative transition-colors ${
                            activeSubTab === tab.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                        }`}
                    >
                        <span className="flex items-center gap-1.5">
                            <tab.icon className="h-4 w-4" />
                            {tab.label}
                        </span>
                        {activeSubTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400" />}
                    </button>
                ))}
            </div>
            <AnimatePresence mode="wait">
                {activeSubTab === "users" && (
                    <motion.div
                        key="users"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <UserTable />
                    </motion.div>
                )}

                {activeSubTab === "contacts" && (
                    <motion.div
                        key="contacts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <ContactTable />
                    </motion.div>
                )}

                {activeSubTab === "accounts" && (
                    <motion.div
                        key="accounts"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <AccountTable />
                    </motion.div>
                )}

                {activeSubTab === "warehouses" && (
                    <motion.div
                        key="warehouses"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <WarehouseTable />
                    </motion.div>
                )}

                {activeSubTab === "products" && (
                    <motion.div
                        key="products"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                        className="space-y-6"
                    >
                        <ProductTable />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default SettingContent;
