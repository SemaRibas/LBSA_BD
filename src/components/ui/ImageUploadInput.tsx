"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Link as LinkIcon } from "lucide-react";
import { Button } from "./Button";

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function ImageUploadInput({
  label = "Imagem do Item",
  value,
  onChange,
  placeholder = "Cole a URL da imagem ou escolha um arquivo",
}: ImageUploadInputProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("A imagem selecionada é muito grande. Escolha uma imagem de até 5MB.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64Str = event.target?.result as string;
      if (base64Str) {
        onChange(base64Str);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <label className="block text-xs font-semibold text-surface-700 dark:text-surface-300">
          {label}
        </label>
      )}

      {/* If Image is present (Preview State) */}
      {value ? (
        <div className="relative group rounded-2xl overflow-hidden border border-surface-200 dark:border-surface-700 bg-surface-100 dark:bg-surface-950 p-2 flex items-center gap-3">
          <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0 border border-surface-300 dark:border-surface-700 bg-surface-200 dark:bg-surface-900">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Pré-visualização"
              className="w-full h-full object-cover"
              onError={(e) => {
                // If broken link
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <span className="text-xs font-bold text-surface-900 dark:text-surface-100 block truncate">
              Imagem Carregada
            </span>
            <span className="text-[10px] text-surface-500 dark:text-surface-400 block truncate font-mono">
              {value.startsWith("data:") ? "Arquivo local carregado" : value}
            </span>
            <div className="flex items-center gap-2 pt-1">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-[11px] text-teal-600 dark:text-teal-400 font-semibold hover:underline"
              >
                Trocar imagem
              </button>
              <span className="text-surface-300">•</span>
              <button
                type="button"
                onClick={handleRemove}
                className="text-[11px] text-red-500 font-semibold hover:underline"
              >
                Remover
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemove}
            className="p-1.5 rounded-full bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-300 hover:text-red-600 transition-colors mr-1"
            title="Remover imagem"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        /* Empty State: File Picker & URL Option */
        <div className="space-y-2">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-surface-50/50 dark:bg-surface-800/30 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 group"
          >
            <div className="p-2.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <span className="font-bold text-xs text-surface-800 dark:text-surface-200 block">
                Escolher imagem do seu computador
              </span>
              <span className="text-[10px] text-surface-500 dark:text-surface-400">
                Formatos aceitos: JPG, PNG, WEBP, SVG (máx 5MB)
              </span>
            </div>
          </div>

          {/* Toggle URL input */}
          <div className="flex items-center justify-between text-[11px]">
            <button
              type="button"
              onClick={() => setShowUrlInput(!showUrlInput)}
              className="text-surface-500 dark:text-surface-400 hover:text-teal-600 dark:hover:text-teal-300 flex items-center gap-1 font-medium"
            >
              <LinkIcon className="h-3 w-3" />
              <span>{showUrlInput ? "Ocultar URL da imagem" : "Ou inserir por URL da Web"}</span>
            </button>
          </div>

          {showUrlInput && (
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="w-full px-3 py-2 rounded-xl text-xs bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-100 focus:outline-none focus:ring-2 focus:ring-teal-500"
            />
          )}
        </div>
      )}

      {/* Hidden Native File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
