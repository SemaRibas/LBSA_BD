import { cn } from "@/lib/utils";

interface BadgeProps {
  variant?: "default" | "success" | "warning" | "danger" | "info";
  children: React.ReactNode;
  className?: string;
}

const Badge = ({ variant = "default", children, className }: BadgeProps) => {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
        {
          "bg-surface-100 text-surface-700 dark:bg-surface-800 dark:text-surface-300": variant === "default",
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300": variant === "success",
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300": variant === "warning",
          "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300": variant === "danger",
          "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300": variant === "info",
        },
        className
      )}
    >
      {children}
    </span>
  );
};

export { Badge };
