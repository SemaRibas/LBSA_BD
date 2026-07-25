"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode } from "react";
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastType = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
  description?: string;
  duration?: number;
}

interface ToastContextType {
  toast: {
    success: (message: string, description?: string, duration?: number) => void;
    error: (message: string, description?: string, duration?: number) => void;
    warning: (message: string, description?: string, duration?: number) => void;
    info: (message: string, description?: string, duration?: number) => void;
  };
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, description?: string, duration = 4000) => {
      const id = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      const newToast: ToastItem = { id, type, message, description, duration };
      
      setToasts((prev) => [...prev.slice(-4), newToast]); // Manter no máximo 5 toasts ativos

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast]
  );

  const toast = {
    success: (msg: string, desc?: string, dur?: number) => addToast("success", msg, desc, dur),
    error: (msg: string, desc?: string, dur?: number) => addToast("error", msg, desc, dur),
    warning: (msg: string, desc?: string, dur?: number) => addToast("warning", msg, desc, dur),
    info: (msg: string, desc?: string, dur?: number) => addToast("info", msg, desc, dur),
  };

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      
      {/* Toast Container */}
      <div className="fixed top-5 right-5 z-[100] flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => removeToast(item.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const icons = {
    success: <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="h-5 w-5 text-rose-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-0.5" />,
    info: <Info className="h-5 w-5 text-teal-500 shrink-0 mt-0.5" />,
  };

  const borderStyles = {
    success: "border-emerald-500/30 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-100",
    error: "border-rose-500/30 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-100",
    warning: "border-amber-500/30 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-100",
    info: "border-teal-500/30 bg-teal-50/90 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100",
  };

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border backdrop-blur-md shadow-lg transition-all duration-300 animate-toast-in ${borderStyles[item.type]}`}
    >
      {icons[item.type]}
      <div className="flex-1 pr-2">
        <h4 className="text-sm font-semibold leading-snug">{item.message}</h4>
        {item.description && (
          <p className="text-xs opacity-80 mt-1 leading-relaxed">{item.description}</p>
        )}
      </div>
      <button
        onClick={onClose}
        className="p-1 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast deve ser usado dentro de um ToastProvider");
  }
  return context.toast;
}
