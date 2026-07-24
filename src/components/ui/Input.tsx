import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-surface-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-10 px-4 rounded-xl border border-surface-200 dark:border-surface-700",
              "bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100",
              "placeholder:text-surface-400 dark:placeholder:text-surface-500",
              "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
              "transition-all duration-200",
              { "pl-10": icon },
              { "border-red-500 focus:ring-red-500": error },
              className
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
export type { InputProps };
