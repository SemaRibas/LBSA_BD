"use client";

import { Colecao } from "@/types";
import { Badge } from "./Badge";
import { Button } from "./Button";
import { Edit, Trash2, MapPin, Tag, Box, Layers } from "lucide-react";
import { getColecaoImage } from "@/lib/slideAdapters";

interface ColecaoCardProps {
  colecao: Colecao;
  index?: number;
  onEdit: (colecao: Colecao) => void;
  onDelete: (colecao: Colecao) => void;
  onSelect3D?: (colecao: Colecao) => void;
}

export function ColecaoCard({
  colecao,
  index = 0,
  onEdit,
  onDelete,
  onSelect3D,
}: ColecaoCardProps) {
  const imgSrc = getColecaoImage(colecao, index);
  const taxoList = [colecao.filo, colecao.classe, colecao.subfilo]
    .filter((t) => t && t !== "-")
    .join(" > ");

  const isTransparente = colecao.status === "TRANSPARENTE";

  return (
    <div className="group relative flex flex-col bg-white dark:bg-surface-900 border border-surface-200 dark:border-teal-500/20 hover:border-teal-500/50 rounded-2xl overflow-hidden shadow-md hover:shadow-xl hover:shadow-teal-500/10 transition-all duration-300 hover:-translate-y-1.5">
      {/* Header Image with Gradient Overlays */}
      <div className="relative h-48 w-full overflow-hidden bg-surface-100 dark:bg-surface-950">
        <img
          src={imgSrc}
          alt={`${colecao.numeroTombo} - ${colecao.identificacaoBasica}`}
          className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white via-white/40 to-transparent dark:from-surface-900 dark:via-surface-900/40 dark:to-transparent" />
        
        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-white/90 dark:bg-surface-950/80 backdrop-blur-md text-teal-700 dark:text-teal-300 border border-teal-500/30 shadow-md">
            {colecao.numeroTombo}
          </span>
          <div className="flex items-center gap-1.5">
            <Badge variant={isTransparente ? "success" : "warning"}>
              {colecao.status || "Ativo"}
            </Badge>
          </div>
        </div>

        {/* Exemplares Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 bg-white/90 dark:bg-teal-950/80 backdrop-blur-md text-teal-700 dark:text-teal-300 px-2.5 py-1 rounded-lg border border-teal-500/30 text-xs font-semibold z-10">
          <Box className="h-3.5 w-3.5" />
          <span>{colecao.numeroExemplares || "1"} ex.</span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4 text-surface-800 dark:text-surface-100">
        <div>
          <h3 className="text-xl font-bold text-surface-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-300 transition-colors line-clamp-1">
            {colecao.identificacaoBasica || colecao.numeroTombo}
          </h3>

          {taxoList ? (
            <div className="mt-1.5 flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 font-medium truncate">
              <Tag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{taxoList}</span>
            </div>
          ) : (
            <p className="mt-1 text-xs text-surface-400 italic">Taxonomia não especificada</p>
          )}

          <div className="mt-3 space-y-1.5 text-xs text-surface-600 dark:text-surface-300">
            {colecao.localidade && (
              <div className="flex items-center gap-1.5 truncate">
                <MapPin className="h-3.5 w-3.5 text-surface-400 shrink-0" />
                <span className="truncate">{colecao.localidade}</span>
              </div>
            )}
            <div className="flex items-center justify-between text-surface-500 dark:text-surface-400 pt-1">
              <span>Frasco: <strong className="text-surface-700 dark:text-surface-200">{colecao.condicaoFrasco || "RAZOAVEL"}</strong></span>
              {colecao.determinador && (
                <span>Det: <strong className="text-surface-700 dark:text-surface-200">{colecao.determinador}</strong></span>
              )}
            </div>
          </div>
        </div>

        {/* Actions Footer */}
        <div className="pt-3 border-t border-surface-100 dark:border-surface-800 flex items-center justify-between gap-2">
          {onSelect3D && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onSelect3D(colecao)}
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
              onClick={() => onEdit(colecao)}
              className="text-xs border-surface-200 dark:border-surface-700 hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-200 px-2.5 py-1"
            >
              <Edit className="h-3.5 w-3.5 mr-1" />
              Editar
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDelete(colecao)}
              className="text-xs border-red-500/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 hover:text-red-700 dark:hover:text-red-200 px-2.5 py-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
