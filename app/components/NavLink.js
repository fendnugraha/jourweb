import Link from "next/link";

const NavLink = ({ active = false, children, isOpen, ...props }) => (
    <Link
        {...props}
        className={`flex items-center relative group w-full transition-all duration-200 rounded-xl ${
            active
                ? "bg-blue-50/70 text-blue-600 dark:bg-slate-800/80 dark:text-sky-400 font-semibold"
                : "text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/40"
        }`}
    >
        {active && (
            <span className="absolute left-0 top-[20%] bottom-[20%] w-1 bg-blue-600 dark:bg-sky-400 rounded-r-md" />
        )}
        {children}
    </Link>
);

export default NavLink;
