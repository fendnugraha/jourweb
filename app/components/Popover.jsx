import { Popover, PopoverButton, PopoverPanel } from "@headlessui/react";

const PopoverMenu = ({ children, title, anchor = "bottom", ...props }) => {
    return (
        <Popover>
            {/* <PopoverButton className="block text-sm/6 font-semibold text-dark/50 focus:outline-none data-active:text-white data-focus:outline data-focus:outline-white data-hover:text-white"> */}
            <PopoverButton className={`block text-sm/6 font-semibold focus:outline-none data-focus:outline data-focus:outline-white ${props.className}`}>
                {title}
            </PopoverButton>
            <PopoverPanel
                transition
                anchor={anchor}
                className="divide-y divide-black/5 backdrop-blur-sm rounded-xl bg-slate-600/10 dark:divide-white/5 dark:bg-white/40 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:--spacing(5)] data-closed:-translate-y-1 data-closed:opacity-0"
                // className="divide-y divide-white/5 rounded-xl bg-white/5 text-sm/6 transition duration-200 ease-in-out [--anchor-gap:--spacing(5)] data-closed:-translate-y-1 data-closed:opacity-0"
            >
                {children}
            </PopoverPanel>
        </Popover>
    );
};

export default PopoverMenu;
