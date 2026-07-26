"use client";

import { useRef } from "react";
import { Material, UserWithoutPassword } from "@/types";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Edit, Trash2, Calendar, FileText, Layers, Package, User, PackageOpen } from "lucide-react";
import ImageFlip from "./ImageFlip";

interface MaterialCardProps {
  material: Material;
  index?: number;
  currentUser?: UserWithoutPassword | null;
  onEdit: (material: Material) => void;
  onDelete: (material: Material) => void;
  onSelect3D?: (material: Material) => void;
}

export function MaterialCard({
  material,
  currentUser,
  onEdit,
  onDelete,
  onSelect3D,
}: MaterialCardProps) {
  const isConservado = material.estado === "Conservado";
  const tiltRef = useRef<HTMLDivElement | null>(null);

  const canEdit = !currentUser || currentUser.role === "admin" || currentUser.role === "monitor" || !material.createdBy || material.createdBy === currentUser.email;
  const canDelete = !currentUser || currentUser.role === "admin" || currentUser.role === "monitor" || (material.createdBy && material.createdBy === currentUser.email);

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

  const hasImage = Boolean(material.imagemUrl && material.imagemUrl.trim() !== "");

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
        {/* Header Image or Default PackageOpen Icon Header */}
        <div className="relative h-48 w-full p-2 bg-gradient-to-br from-amber-500/10 via-surface-100 to-teal-500/10 dark:from-amber-950/40 dark:via-surface-950 dark:to-teal-950/40 overflow-hidden flex flex-col items-center justify-center">
          {hasImage ? (
            <ImageFlip
              images={[{ image: { src: material.imagemUrl, alt: material.material } }]}
              rounded={13}
              fit="cover"
              tilt={false}
            />
          ) : (
            <div className="flex flex-col items-center justify-center gap-2 text-amber-600/80 dark:text-amber-400/70 py-4 transition-transform group-hover:scale-110">
              <div className="p-3.5 rounded-2xl bg-amber-100/60 dark:bg-amber-900/30 border border-amber-300/40 dark:border-amber-700/40 shadow-inner">
                <PackageOpen className="h-12 w-12 text-amber-600 dark:text-amber-400" />
              </div>
              <span className="text-[11px] font-bold tracking-wider uppercase text-amber-700 dark:text-amber-300">
                Inventário / Material
              </span>
            </div>
          )}

          {/* Top Badges */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10 pointer-events-none">
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

              {material.creatorName && (
                <div className="flex items-center gap-1 text-[11px] text-surface-400 dark:text-surface-500 pt-1">
                  <User className="h-3 w-3" />
                  <span>Cadastrado por: {material.creatorName}</span>
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
              {canEdit && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(material)}
                  className="text-xs border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-200 px-2.5 py-1"
                >
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Editar
                </Button>
              )}
              {canDelete ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(material)}
                  className="text-xs border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-200 px-2.5 py-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
