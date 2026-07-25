"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import { ChevronDown, ChevronUp, Layers } from "lucide-react";
import { Material, Colecao } from "@/types";
import { Skeleton } from "./Skeleton";
import { ColecaoCard } from "./ColecaoCard";
import { MaterialCard } from "./MaterialCard";

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

function isColecao(item: any): item is Colecao {
  return typeof item === "object" && item !== null && ("numeroTombo" in item || "identificacaoBasica" in item);
}

function isMaterial(item: any): item is Material {
  return typeof item === "object" && item !== null && ("material" in item || "quantidade" in item);
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
      <div className={cn("grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-4", className)}>
        {[...Array(8)].map((_, i) => (
          <div key={i} className="bg-surface-900 border border-surface-800 rounded-2xl p-4 space-y-3">
            <Skeleton className="h-44 w-full rounded-xl" />
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  if (!sortedData || sortedData.length === 0) {
    return (
      <div className={cn("p-12 text-center text-surface-400 font-medium", className)}>
        Nenhum item encontrado.
      </div>
    );
  }

  return (
    <div className={cn("space-y-4 p-4", className)}>
      {/* Sort Bar */}
      {columns.some((c) => c.sortable) && (
        <div className="flex items-center gap-2 pb-2 border-b border-surface-200 dark:border-surface-800 text-xs font-semibold text-surface-500">
          <span>Ordenar por:</span>
          <div className="flex flex-wrap gap-1.5">
            {columns
              .filter((col) => col.sortable)
              .map((col) => {
                const isSorted = sortConfig?.key === col.key;
                return (
                  <button
                    key={col.key as string}
                    type="button"
                    onClick={() => handleSort(col.key as string)}
                    className={cn(
                      "flex items-center gap-1 px-2.5 py-1 rounded-full border transition-all",
                      isSorted
                        ? "bg-teal-600/20 text-teal-400 border-teal-500/40"
                        : "bg-surface-800/50 text-surface-400 border-surface-700 hover:text-white"
                    )}
                  >
                    {col.label}
                    {isSorted && (
                      sortConfig?.direction === "asc" ? (
                        <ChevronUp className="h-3 w-3" />
                      ) : (
                        <ChevronDown className="h-3 w-3" />
                      )
                    )}
                  </button>
                );
              })}
          </div>
        </div>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {sortedData.map((item, idx) => {
          if (isColecao(item)) {
            return (
              <ColecaoCard
                key={item.id}
                colecao={item}
                index={idx}
                onEdit={(c) => onRowClick?.(c as unknown as T)}
                onDelete={(c) => onRowClick?.(c as unknown as T)}
              />
            );
          }

          if (isMaterial(item)) {
            return (
              <MaterialCard
                key={item.id}
                material={item}
                index={idx}
                onEdit={(m) => onRowClick?.(m as unknown as T)}
                onDelete={(m) => onRowClick?.(m as unknown as T)}
              />
            );
          }

          {/* Generic Item Card fallback matching Smooth3DSlideshow card theme */}
          const titleCol = columns[0];
          const titleVal = titleCol?.render
            ? titleCol.render(item)
            : String(item[titleCol?.key as keyof T] || `Item #${idx + 1}`);

          return (
            <div
              key={item.id}
              onClick={() => onRowClick?.(item)}
              className={cn(
                "group relative flex flex-col bg-surface-900 border border-teal-500/20 hover:border-teal-500/50 rounded-2xl p-5 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5",
                onRowClick && "cursor-pointer"
              )}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-teal-950/80 text-teal-300 border border-teal-500/30">
                  Item #{idx + 1}
                </span>
              </div>

              <h4 className="text-lg font-bold text-white group-hover:text-teal-300 transition-colors mb-3">
                {titleVal}
              </h4>

              <div className="space-y-2 text-xs text-surface-300 flex-1">
                {columns.slice(1).map((col) => {
                  const val = col.render
                    ? col.render(item)
                    : (item[col.key as keyof T] as React.ReactNode);
                  if (val === undefined || val === null || val === "") return null;

                  return (
                    <div key={col.key as string} className="flex justify-between items-center py-1 border-b border-surface-800/50">
                      <span className="text-surface-400 font-medium">{col.label}:</span>
                      <span className="font-semibold text-surface-200">{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
