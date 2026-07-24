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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
      onClick={(e) => e.target === overlayRef.current && onClose()}
    >
      <div
        className={cn(
          "bg-white dark:bg-surface-900 rounded-2xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-hidden",
          "animate-slide-up",
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-surface-200 dark:border-surface-700">
          <h2 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
          >
            <X className="h-5 w-5 text-surface-500" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

export { Modal };
