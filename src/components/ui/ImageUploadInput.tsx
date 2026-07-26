"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Link as LinkIcon } from "lucide-react";

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  maxWidth?: number;
  maxHeight?: number;
}

// Compress base64 images so they fit safely within database cell limits (e.g. Google Sheets 50k char limit)
export function compressBase64Image(
  dataUrl: string,
  maxWidth = 350,
  maxHeight = 350,
  quality = 0.75
): Promise<string> {
  return new Promise((resolve) => {
    if (!dataUrl || !dataUrl.startsWith("data:image")) {
      return resolve(dataUrl);
    }

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (width > maxWidth || height > maxHeight) {
        if (width > height) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        } else {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const ctx = canvas.getContext("2d");
      if (!ctx) return resolve(dataUrl);

      ctx.drawImage(img, 0, 0, width, height);

      // Convert to compressed jpeg
      const compressedDataUrl = canvas.toDataURL("image/jpeg", quality);
      resolve(compressedDataUrl);
    };

    img.onerror = () => {
      resolve(dataUrl);
    };

    img.src = dataUrl;
  });
}

export function ImageUploadInput({
  label = "Imagem do Item",
  value,
  onChange,
  placeholder = "Cole a URL da imagem ou escolha um arquivo",
  maxWidth = 350,
  maxHeight = 350,
}: ImageUploadInputProps) {
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("A imagem selecionada é muito grande. Escolha uma imagem de até 10MB.");
      return;
    }

    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const rawBase64 = event.target?.result as string;
      if (rawBase64) {
        try {
          const compressed = await compressBase64Image(rawBase64, maxWidth, maxHeight, 0.75);
          onChange(compressed);
        } catch {
          onChange(rawBase64);
        } finally {
          setIsCompressing(false);
        }
      } else {
        setIsCompressing(false);
      }
    };
    reader.onerror = () => setIsCompressing(false);
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
          <div className="relative h-20 w-28 rounded-xl overflow-hidden shrink-0 border border-surface-300 dark:border-surface-700 bg-surface-200 dark:bg-surface-900 flex items-center justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Pré-visualização"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLElement).style.display = "none";
              }}
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <span className="text-xs font-bold text-surface-900 dark:text-surface-100 block truncate">
              Imagem Selecionada
            </span>
            <span className="text-[10px] text-surface-500 dark:text-surface-400 block truncate font-mono">
              {value.startsWith("data:") ? "Arquivo local otimizado" : value}
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
            onClick={() => !isCompressing && fileInputRef.current?.click()}
            className="border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-teal-500 dark:hover:border-teal-400 rounded-2xl p-4 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-surface-50/50 dark:bg-surface-800/30 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 group"
          >
            <div className="p-2.5 rounded-full bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform">
              <Upload className="h-5 w-5" />
            </div>
            <div className="text-center">
              <span className="font-bold text-xs text-surface-800 dark:text-surface-200 block">
                {isCompressing ? "Processando imagem..." : "Escolher foto do seu computador"}
              </span>
              <span className="text-[10px] text-surface-500 dark:text-surface-400">
                Formatos aceitos: JPG, PNG, WEBP, SVG (otimizado automaticamente)
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
