const Button = ({ children, buttonType = "primary", className = "", ...props }) => {
    const buttonTypes = {
        primary: "bg-indigo-600 dark:bg-indigo-600 hover:bg-indigo-500 dark:hover:bg-indigo-500 text-white shadow-xs",
        secondary: "bg-slate-500 hover:bg-slate-400 dark:bg-slate-600 dark:hover:bg-slate-500 text-white shadow-xs",
        danger: "bg-red-600 hover:bg-red-500 text-white shadow-xs",
        info: "bg-sky-500 hover:bg-sky-400 text-white shadow-xs",
        warning: "bg-amber-500 hover:bg-amber-400 text-white shadow-xs",
        success: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs",
        dark: "bg-slate-800 hover:bg-slate-700 text-white shadow-xs",
    };
    return (
        <button
            {...props}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 ease-in-out hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 ${buttonTypes[buttonType]} ${className}`}
        >
            {children}
        </button>
    );
};

export default Button;
