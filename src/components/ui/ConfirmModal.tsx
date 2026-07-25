"use client";

import { useEffect, useRef } from "react";
import { AlertTriangle, Trash2, HelpCircle, X } from "lucide-react";
import { Button } from "./Button";

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "danger",
  isLoading = false,
}: ConfirmModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  const icons = {
    danger: <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />,
    warning: <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />,
    primary: <HelpCircle className="h-6 w-6 text-teal-600 dark:text-teal-400" />,
  };

  const iconBg = {
    danger: "bg-red-100 dark:bg-red-950/50 border-red-200 dark:border-red-900/50",
    warning: "bg-amber-100 dark:bg-amber-950/50 border-amber-200 dark:border-amber-900/50",
    primary: "bg-teal-100 dark:bg-teal-950/50 border-teal-200 dark:border-teal-900/50",
  };

  const buttonVariant = variant === "danger" ? "danger" : "primary";

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && !isLoading && onClose()}
    >
      <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-800 shadow-2xl max-w-md w-full p-6 animate-slide-up relative">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className={`p-3.5 rounded-2xl border mb-4 shadow-sm ${iconBg[variant]}`}>
            {icons[variant]}
          </div>

          <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100 mb-2">
            {title}
          </h3>

          {description && (
            <p className="text-sm text-surface-600 dark:text-surface-400 mb-6 leading-relaxed">
              {description}
            </p>
          )}

          <div className="flex items-center justify-end gap-3 w-full mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              {cancelText}
            </Button>
            <Button
              type="button"
              variant={buttonVariant}
              onClick={onConfirm}
              isLoading={isLoading}
              className="flex-1"
            >
              {confirmText}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
