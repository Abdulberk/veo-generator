import * as React from "react";
import { cn } from "@/app/lib/utils/cn";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
  ({ className, label, checked, onChange, ...props }, ref) => {
    return (
      <label className="flex items-center cursor-pointer">
        <div className="relative">
          <input
            type="checkbox"
            className="sr-only"
            ref={ref}
            checked={checked}
            onChange={onChange}
            {...props}
          />
          <div
            className={cn(
              "block w-14 h-8 rounded-full transition-colors",
              checked ? "bg-purple-600" : "bg-gray-300 dark:bg-gray-700"
            )}
          />
          <div
            className={cn(
              "absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform",
              checked ? "translate-x-6" : "translate-x-0"
            )}
          />
        </div>
        {label && (
          <span className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            {label}
          </span>
        )}
      </label>
    );
  }
);
Switch.displayName = "Switch";

export { Switch };