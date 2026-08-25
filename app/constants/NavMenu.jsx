import { LayoutDashboardIcon, ArrowLeftRightIcon, DollarSignIcon, ChartAreaIcon, CogIcon, Truck, IdCardLanyardIcon, UserCheck } from "lucide-react";

export const navMenu = {
    mainMenu: [
        {
            name: "Dashboard",
            path: "/dashboard",
            href: "/dashboard",
            icon: LayoutDashboardIcon,
            role: ["Administrator", "Super Admin", "Cashier", "Co-Cashier"],
        },
        {
            name: "Transaction",
            path: "/transaction",
            href: "/transaction",
            icon: ArrowLeftRightIcon,
            role: ["Administrator", "Super Admin", "Cashier", "Co-Cashier"],
        },
        {
            name: "Finance",
            path: "/finance",
            href: "/finance",
            icon: DollarSignIcon,
            role: ["Administrator", "Super Admin"],
        },
        {
            name: "Delivery",
            path: "/delivery",
            href: "/delivery",
            icon: Truck,
            role: ["Administrator", "Super Admin", "Courier"],
        },
        {
            name: "Summary",
            path: "/summary",
            href: "/summary",
            icon: ChartAreaIcon,
            role: ["Administrator", "Super Admin"],
        },
        {
            name: "Employee",
            path: "/employee",
            href: "/employee",
            icon: IdCardLanyardIcon,
            role: ["Administrator", "Cashier", "Co-Cashier", "Super Admin"],
        },
        {
            name: "My Profile",
            path: "/settings/myprofile",
            href: "/settings/myprofile",
            icon: UserCheck,
            role: ["Administrator", "Courier", "Cashier", "Co-Cashier", "Super Admin"],
        },
        {
            name: "Settings",
            path: "/settings",
            href: "/settings",
            icon: CogIcon,
            role: ["Administrator", "Super Admin"],
        },
        // { name: "Profile", path: "/settings/profile", href: "/settings/profile", icon: UserCircle, role: ["Administrator", "Super Admin", "Cashier", "Co-Cashier"] },
    ],
    settings: [
        {
            name: "Settings",
            path: "/settings",
            href: "/settings",
            icon: CogIcon,
            role: ["Administrator", "Super Admin"],
        },
    ],
};
