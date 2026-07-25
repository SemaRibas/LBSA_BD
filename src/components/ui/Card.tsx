import { cn } from "@/lib/utils";
import { HTMLAttributes, forwardRef } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "gradient" | "accent";
  hover?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = "default", hover = false, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-2xl p-6 transition-all duration-300",
          {
            "bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 border border-surface-200/80 dark:border-surface-800/80 shadow-card": variant === "default",
            "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-soft": variant === "gradient",
            "bg-gradient-to-br from-peach-100 to-peach-200 dark:from-peach-900 dark:to-peach-800 text-surface-900 dark:text-surface-100": variant === "accent",
          },
          {
            "hover:shadow-card-hover hover:-translate-y-1 cursor-pointer": hover,
          },
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

export { Card };
export type { CardProps };
