"use client";

import { useRef } from "react";
import { Material } from "@/types";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Edit, Trash2, Calendar, FileText, Layers, Package } from "lucide-react";
import { getMaterialImages } from "@/lib/slideAdapters";
import ImageFlip from "./ImageFlip";

interface MaterialCardProps {
  material: Material;
  index?: number;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  onSelect3D?: (material: Material) => void;
}

export function MaterialCard({
  material,
  index = 0,
  onEdit,
  onDelete,
  onSelect3D,
}: MaterialCardProps) {
  const images = getMaterialImages(material, index);
  const isConservado = material.estado === "Conservado";
  const tiltRef = useRef<HTMLDivElement | null>(null);

  const effect = "repel";
  const tiltLimit = 15;
  const scale = 1.05;

  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = tiltRef.current;
    if (!el) return;
    const { width, height, top, left } = el.getBoundingClientRect();
    const mult = effect === "repel" ? -1 : 1;
    const tiltX = ((e.clientY - top) / height - 0.5) * (tiltLimit * 2) * mult;
    const tiltY = ((e.clientX - left) / width - 0.5) * -(tiltLimit * 2) * mult;
    el.style.transform = `rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(${scale}, ${scale}, ${scale})`;
  };

  const onLeave = () => {
    const el = tiltRef.current;
    if (!el) return;
    el.style.transform = `rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
  };

  return (
    <div style={{ perspective: "900px" }} className="w-full h-full">
      <div
        ref={tiltRef}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        style={{
          transformStyle: "preserve-3d",
          transition: "transform 0.2s ease-out",
          willChange: "transform",
        }}
        className="group relative flex flex-col bg-white dark:bg-surface-900 border border-surface-200 dark:border-teal-500/20 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-md hover:shadow-2xl hover:shadow-teal-500/20 transition-shadow duration-300"
      >
        {/* Header Image with 3D Flip Gallery */}
        <div className="relative h-48 w-full p-2 bg-surface-100 dark:bg-surface-950 overflow-hidden">
          <ImageFlip
            images={images}
            rounded={13}
            fit="cover"
            tilt={false}
          />

          {/* Top Badges */}
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 z-10 pointer-events-none">
            <Badge variant={isConservado ? "success" : "warning"} className="shadow-md">
              {material.estado || "Cadastrado"}
            </Badge>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-teal-950/80 backdrop-blur-md text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-md">
              <Package className="h-3.5 w-3.5" />
              {material.quantidade}
            </span>
          </div>
        </div>

        {/* Card Content */}
        <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-surface-800 dark:text-surface-100">
          <div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors line-clamp-1">
              {material.material}
            </h3>

            <div className="mt-2 space-y-1.5 text-xs text-surface-600 dark:text-surface-300">
              {material.validade && material.validade !== "-" && (
                <div className="flex items-center gap-1.5 text-surface-600 dark:text-surface-300">
                  <Calendar className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Validade: <strong>{material.validade}</strong></span>
                </div>
              )}

              {material.observacoes && material.observacoes !== "-" && (
                <div className="flex items-start gap-1.5 text-surface-500 dark:text-surface-400 mt-2 line-clamp-2">
                  <FileText className="h-3.5 w-3.5 text-surface-400 dark:text-surface-500 shrink-0 mt-0.5" />
                  <span className="italic">{material.observacoes}</span>
                </div>
              )}
            </div>
          </div>

          {/* Actions Footer */}
          <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between gap-2">
            {onSelect3D && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onSelect3D(material)}
                className="text-xs text-teal-600 dark:text-teal-300 border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-950/60 hover:text-teal-700 dark:hover:text-white px-2.5 py-1"
                title="Focar no Carrossel 3D"
              >
                <Layers className="h-3.5 w-3.5 mr-1" />
                Visão 3D
              </Button>
            )}

            <div className="flex items-center gap-2 ml-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(material)}
                className="text-xs border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-200 px-2.5 py-1"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(material)}
                className="text-xs border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-200 px-2.5 py-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
