import * as React from "react";
import { Eye, EyeOff } from "lucide-react"; 

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputClassName?: string;
  hasError?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, inputClassName, hasError, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    const isPassword = type === "password";

    return (
      <div className="relative w-full">
        <input
          type={isPassword ? (showPassword ? "text" : "password") : type}
          className={`${inputClassName || ""} ${
            hasError
              ? "border-red-500 focus:ring-red-500 dark:border-red-500"
              : ""
          } ${className || ""} pr-10`}  
          ref={ref}
          {...props}
        />

        {isPassword && (
          <button
            type="button"
            className="absolute inset-y-0 right-2 flex items-center text-gray-500"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <EyeOff size={18} />
            ) : (
              <Eye size={18} />
            )}
          </button>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
