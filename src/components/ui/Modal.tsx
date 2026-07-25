"use client";

import { cn } from "@/lib/utils";
import { useEffect, useRef } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ isOpen, onClose, title, children, className }: ModalProps) => {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 xs:p-4 bg-black/60 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={cn(
          "bg-white dark:bg-surface-900 rounded-2xl sm:rounded-3xl shadow-2xl max-w-lg w-full max-h-[92vh] overflow-hidden flex flex-col border border-surface-200 dark:border-surface-800",
          "animate-slide-up",
          className
        )}
      >
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-surface-200 dark:border-surface-700 shrink-0">
          <h2 className="text-base sm:text-lg font-bold text-surface-900 dark:text-surface-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2.5 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-500 hover:text-surface-900 dark:hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(92vh-120px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal };
