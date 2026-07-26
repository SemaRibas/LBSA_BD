"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileText, FileSpreadsheet, Download, CheckCircle2 } from "lucide-react";
import { exportToPDF, exportToExcel, ColumnDefinition } from "@/lib/exportImportUtils";
import { useToast } from "@/contexts/ToastContext";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  data: Record<string, any>[];
  columns: ColumnDefinition[];
  defaultFilename: string;
}

export function ExportModal({
  isOpen,
  onClose,
  title,
  data,
  columns,
  defaultFilename,
}: ExportModalProps) {
  const toast = useToast();
  const [format, setFormat] = useState<"pdf" | "excel">("pdf");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!data || data.length === 0) {
      toast.warning("Sem dados", "Não há registros disponíveis para exportar.");
      return;
    }

    setIsExporting(true);

    try {
      if (format === "pdf") {
        exportToPDF(title, columns, data, defaultFilename);
        toast.success("PDF Gerado!", `Arquivo ${defaultFilename}.pdf baixado com sucesso.`);
      } else {
        exportToExcel(data, columns, defaultFilename, title);
        toast.success("Excel Gerado!", `Arquivo ${defaultFilename}.xlsx baixado com sucesso.`);
      }
      onClose();
    } catch (err) {
      console.error("Erro na exportação:", err);
      toast.error("Erro na Exportação", "Ocorreu uma falha ao gerar o arquivo.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Exportar Relatório">
      <div className="space-y-5 py-2">
        <p className="text-xs sm:text-sm text-surface-600 dark:text-surface-400">
          Escolha o formato desejado para exportar os <strong>{data.length}</strong> registros selecionados do sistema LBSA:
        </p>

        {/* Format Selection Buttons */}
        <div className="grid grid-cols-2 gap-3">
          {/* PDF Option */}
          <div
            onClick={() => setFormat("pdf")}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center relative ${
              format === "pdf"
                ? "border-red-500 bg-red-50/60 dark:bg-red-950/30 text-red-700 dark:text-red-300 shadow-md"
                : "border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50 text-surface-600 dark:text-surface-400 hover:border-surface-300"
            }`}
          >
            {format === "pdf" && (
              <CheckCircle2 className="h-4 w-4 text-red-500 absolute top-2 right-2" />
            )}
            <FileText className="h-8 w-8 text-red-500" />
            <div>
              <span className="font-extrabold text-xs block">Relatório PDF</span>
              <span className="text-[10px] text-surface-500 dark:text-surface-400">
                Personalizado, com marca UESB, data e numeração de página.
              </span>
            </div>
          </div>

          {/* Excel Option */}
          <div
            onClick={() => setFormat("excel")}
            className={`cursor-pointer p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 text-center relative ${
              format === "excel"
                ? "border-emerald-500 bg-emerald-50/60 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 shadow-md"
                : "border-surface-200 dark:border-surface-700 bg-surface-50/50 dark:bg-surface-800/50 text-surface-600 dark:text-surface-400 hover:border-surface-300"
            }`}
          >
            {format === "excel" && (
              <CheckCircle2 className="h-4 w-4 text-emerald-500 absolute top-2 right-2" />
            )}
            <FileSpreadsheet className="h-8 w-8 text-emerald-500" />
            <div>
              <span className="font-extrabold text-xs block">Planilha Excel (.xlsx)</span>
              <span className="text-[10px] text-surface-500 dark:text-surface-400">
                Formatado com colunas ajustadas para análise de dados.
              </span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100 dark:border-surface-800">
          <Button variant="ghost" size="sm" onClick={onClose} disabled={isExporting}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleExport}
            isLoading={isExporting}
            className="bg-teal-600 hover:bg-teal-700 text-white gap-2"
          >
            <Download className="h-4 w-4" />
            <span>Exportar em {format.toUpperCase()}</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
