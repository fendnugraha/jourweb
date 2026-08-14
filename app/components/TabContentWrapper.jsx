import { motion, AnimatePresence } from "motion/react";

export function TabContentWrapper({ activeKey, children }) {
    return (
        <motion.div
            layout // 👈 Menganimasikan perubahan height container secara halus
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="overflow-hidden"
        >
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeKey}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                >
                    {children}
                </motion.div>
            </AnimatePresence>
        </motion.div>
    );
}
