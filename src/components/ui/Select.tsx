"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";
import { ChevronDown, Check } from "lucide-react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  label?: string;
  className?: string;
}

const Select = ({ options, value, onChange, placeholder = "Selecione...", label, className }: SelectProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<SelectOption | undefined>(
    options.find((opt) => opt.value === value)
  );
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (option: SelectOption) => {
    setSelected(option);
    onChange?.(option.value);
    setIsOpen(false);
  };

  return (
    <div className={cn("w-full", className)} ref={ref}>
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
          {label}
        </label>
      )}
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            "w-full h-10 px-4 rounded-xl border border-surface-200 dark:border-surface-700",
            "bg-white dark:bg-surface-800 text-left",
            "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
            "transition-all duration-200",
            "flex items-center justify-between"
          )}
        >
          <span className={cn(
            selected ? "text-surface-900 dark:text-surface-100" : "text-surface-400"
          )}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-surface-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg overflow-hidden animate-fade-in">
            {options.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => handleSelect(option)}
                className={cn(
                  "w-full px-4 py-2.5 text-left flex items-center justify-between",
                  "hover:bg-surface-50 dark:hover:bg-surface-700 transition-colors",
                  selected?.value === option.value && "bg-teal-50 dark:bg-teal-900/30"
                )}
              >
                <span className="text-sm text-surface-700 dark:text-surface-300">
                  {option.label}
                </span>
                {selected?.value === option.value && (
                  <Check className="h-4 w-4 text-teal-600" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export { Select };
