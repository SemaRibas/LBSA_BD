"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Material, Colecao } from "@/types";
import { Skeleton } from "./Skeleton";

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (item: T) => React.ReactNode;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  onRowClick?: (item: T) => void;
  className?: string;
}

export function Table<T extends { id: string }>({
  data,
  columns,
  isLoading = false,
  onRowClick,
  className,
}: TableProps<T>) {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: "asc" | "desc";
  } | null>(null);

  const handleSort = (key: string) => {
    setSortConfig((current) => ({
      key,
      direction: current?.key === key && current.direction === "asc" ? "desc" : "asc",
    }));
  };

  const sortedData = [...data].sort((a, b) => {
    if (!sortConfig) return 0;
    const aValue = a[sortConfig.key as keyof T];
    const bValue = b[sortConfig.key as keyof T];
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  if (isLoading) {
    return (
      <div className={cn("overflow-x-auto", className)}>
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-200 dark:border-surface-700">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className="text-left py-3 px-4 text-sm font-semibold text-surface-600 dark:text-surface-300"
                >
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {[...Array(5)].map((_, i) => (
              <tr key={i} className="border-b border-surface-100 dark:border-surface-800">
                {columns.map((col) => (
                  <td key={col.key as string} className="py-3 px-4">
                    <Skeleton className="h-4 w-full" />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full min-w-[600px]">
        <thead>
          <tr className="border-b border-surface-200 dark:border-surface-700">
            {columns.map((col) => (
              <th
                key={col.key as string}
                className={cn(
                  "text-left py-3 px-4 text-sm font-semibold text-surface-600 dark:text-surface-300",
                  col.sortable && "cursor-pointer hover:text-teal-600 select-none"
                )}
                onClick={() => col.sortable && handleSort(col.key as string)}
              >
                <div className="flex items-center gap-1">
                  {col.label}
                  {col.sortable && sortConfig?.key === col.key && (
                    sortConfig.direction === "asc" ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )
                  )}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedData.map((item) => (
            <tr
              key={item.id}
              className={cn(
                "border-b border-surface-100 dark:border-surface-800 transition-colors",
                "hover:bg-surface-50 dark:hover:bg-surface-800/50",
                onRowClick && "cursor-pointer"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((col) => (
                <td
                  key={col.key as string}
                  className="py-3 px-4 text-sm text-surface-700 dark:text-surface-300"
                >
                  {col.render
                    ? col.render(item)
                    : (item[col.key as keyof T] as React.ReactNode)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
