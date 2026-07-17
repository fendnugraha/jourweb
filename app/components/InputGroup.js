import { Search } from "lucide-react";

const InputGroup = ({ icon = Search, type = "text", maxWidth = "w-full", className, ...props }) => {
    return (
        <div className={`flex items-center gap-2 ${maxWidth} bg-slate-300 dark:bg-slate-700 rounded-full px-3 py-2`}>
            {icon}
            <input
                type={type}
                className="w-full outline-none disabled:cursor-not-allowed disabled:text-slate-400"
                placeholder={props.placeholder}
                value={props.value}
                onChange={props.onChange}
                // disabled={selectedWarehouse}
            />
        </div>
    );
};

export default InputGroup;
