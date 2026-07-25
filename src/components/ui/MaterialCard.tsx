"use client";

import { Material } from "@/types";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Edit, Trash2, Calendar, FileText, Layers, Package } from "lucide-react";
import { getMaterialImage } from "@/lib/slideAdapters";

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
  const imgSrc = getMaterialImage(material, index);
  const isConservado = material.estado === "Conservado";

  return (
    <div className="group relative flex flex-col bg-surface-900/90 dark:bg-surface-900 border border-teal-500/20 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1.5">
      {/* Header Image with Gradient Overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-950">
        <img
          src={imgSrc}
          alt={material.material}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-surface-900 via-surface-900/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2">
          <Badge variant={isConservado ? "success" : "warning"}>
            {material.estado || "Cadastrado"}
          </Badge>
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-teal-950/80 backdrop-blur-md text-teal-300 border border-teal-500/30 shadow-md">
            <Package className="h-3.5 w-3.5" />
            {material.quantidade}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-surface-100">
        <div>
          <h3 className="text-xl font-bold text-white group-hover:text-teal-300 transition-colors line-clamp-1">
            {material.material}
          </h3>

          <div className="mt-2 space-y-1.5 text-xs text-surface-300">
            {material.validade && material.validade !== "-" && (
              <div className="flex items-center gap-1.5 text-surface-300">
                <Calendar className="h-3.5 w-3.5 text-teal-400 shrink-0" />
                <span>Validade: <strong>{material.validade}</strong></span>
              </div>
            )}

            {material.observacoes && material.observacoes !== "-" && (
              <div className="flex items-start gap-1.5 text-surface-400 mt-2 line-clamp-2">
                <FileText className="h-3.5 w-3.5 text-surface-500 shrink-0 mt-0.5" />
                <span className="italic">{material.observacoes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-surface-800 flex items-center justify-between gap-2">
          {onSelect3D && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect3D(material)}
              className="text-xs text-teal-300 border-teal-500/30 hover:bg-teal-950/60 hover:text-white px-2.5 py-1"
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
              className="text-xs border-surface-700 hover:bg-surface-800 text-surface-200 px-2.5 py-1"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(material)}
              className="text-xs border-red-500/30 text-red-400 hover:bg-red-950/50 hover:text-red-200 px-2.5 py-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
