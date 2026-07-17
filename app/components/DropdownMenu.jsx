import { Menu, MenuButton, MenuItem, MenuItems } from "@headlessui/react";
import Link from "next/link";

const DropdownMenu = ({ title = "Opsi", position = "bottom start", className, items = [] }) => {
    return (
        <Menu as={"div"}>
            <MenuButton className={`${className}`}>{title}</MenuButton>
            <MenuItems anchor={position} className="bg-white dark:bg-slate-600 min-w-32 border border-slate-200 rounded-lg dark:border-slate-600 mt-1 shadow">
                {items.map((item, index) => (
                    <MenuItem className="p-2" key={index}>
                        {item.type === "link" ? (
                            <Link href={item.href} className="flex items-center gap-1 text-sm data-focus:bg-slate-100 dark:data-focus:bg-slate-800">
                                {item.icon}
                                {item.label}
                            </Link>
                        ) : (
                            <button
                                className="flex items-center gap-1 text-sm w-full data-focus:bg-slate-100 dark:data-focus:bg-slate-800"
                                type="button"
                                {...item.attributes}
                                onClick={item.onClick}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        )}
                    </MenuItem>
                ))}
            </MenuItems>
        </Menu>
    );
};

export default DropdownMenu;
