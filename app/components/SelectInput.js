const SelectInput = ({ disabled = false, className = "", options = [], value, onChange, placeholder = "Pilih salah satu", ...props }) => (
    <select
        disabled={disabled}
        value={value}
        onChange={onChange}
        className={`form-select ${className}`}
        {...props}
    >
        <option value="">{placeholder}</option>
        {options.map((option) => (
            <option key={option.value} value={option.value}>
                {option.label}
            </option>
        ))}
    </select>
);

export default SelectInput;
