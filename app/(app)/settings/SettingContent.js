"use client";
import { ContactRound, Package, Scale, UserCog, Warehouse } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import UserTable from "./user/UserTable";
import ContactTable from "./contact/ContactTable";
import AccountTable from "./account/AccountTable";
import ProductTable from "./product/ProductTable";
import MobileNavDrawer from "@/app/components/MobileNavDrawer";
import WarehouseTable from "./warehouse/WarehouseTable";

const menuList = [
  { id: "users", label: "User Management", icon: UserCog },
  { id: "accounts", label: "Account Management", icon: Scale },
  { id: "warehouses", label: "Warehouse Management", icon: Warehouse },
  { id: "products", label: "Product Management", icon: Package },
  { id: "contacts", label: "Contact Management", icon: ContactRound },
];

const SettingContent = () => {
  const [activeSubTab, setActiveSubTab] = useState("users");

  return (
    <div className="space-y-6">
      <MobileNavDrawer
        menuList={menuList}
        activeTab={activeSubTab}
        setActiveTab={setActiveSubTab}
      />
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
