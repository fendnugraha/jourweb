const Input = ({ disabled = false, className = "", ...props }) => (
    <input
        disabled={disabled}
        className={`form-control ${className}`}
        {...props}
    />
);

export default Input;
