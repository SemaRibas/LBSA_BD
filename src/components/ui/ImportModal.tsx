"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { FileSpreadsheet, Upload, AlertTriangle, CheckCircle2, Copy, FileCheck } from "lucide-react";
import { parseExcelFile } from "@/lib/exportImportUtils";
import { useToast } from "@/contexts/ToastContext";

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  requiredHeaders: { key: string; label: string }[];
  onImportSuccess: (rows: Record<string, any>[]) => Promise<void>;
}

export function ImportModal({
  isOpen,
  onClose,
  title,
  requiredHeaders,
  onImportSuccess,
}: ImportModalProps) {
  const toast = useToast();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedRows, setParsedRows] = useState<Record<string, any>[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [missingHeaders, setMissingHeaders] = useState<string[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const requiredKeys = requiredHeaders.map((h) => h.key);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setValidationError(null);
    setMissingHeaders([]);
    setParsedRows([]);
    setIsParsing(true);

    try {
      const result = await parseExcelFile(file, requiredKeys);

      if (!result.success) {
        setValidationError(result.error || "Formato de planilha inválido.");
        if (result.missingHeaders) {
          setMissingHeaders(result.missingHeaders);
        }
        toast.error("Erro no Cabeçalho", result.error || "Estrutura do arquivo incorreta.");
      } else {
        setParsedRows(result.rows || []);
        toast.success("Arquivo Válido!", `${result.rows?.length || 0} registros encontrados e validados.`);
      }
    } catch (err) {
      console.error("Erro ao ler planilha:", err);
      setValidationError("Ocorreu uma falha ao ler o arquivo Excel.");
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (parsedRows.length === 0) {
      toast.warning("Atenção", "Nenhum registro para importar.");
      return;
    }

    setIsImporting(true);
    try {
      await onImportSuccess(parsedRows);
      toast.success("Importação Concluída!", `${parsedRows.length} novos registros adicionados ao banco de dados.`);
      handleReset();
      onClose();
    } catch (err) {
      console.error("Erro na gravação dos registros:", err);
      toast.error("Erro ao Salvar", "Não foi possível gravar os registros no banco de dados.");
    } finally {
      setIsImporting(false);
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setParsedRows([]);
    setValidationError(null);
    setMissingHeaders([]);
  };

  const copyHeaderTemplate = () => {
    const headerString = requiredKeys.join("\t");
    navigator.clipboard.writeText(headerString);
    setCopiedText(true);
    toast.info("Cabeçalhos Copiados", "Cole na primeira linha da sua planilha Excel.");
    setTimeout(() => setCopiedText(false), 3000);
  };

  return (
    <Modal isOpen={isOpen} onClose={() => { handleReset(); onClose(); }} title={`Importar para ${title}`} className="max-w-2xl">
      <div className="space-y-4 py-1">
        {/* Instructions & Required Headers Card */}
        <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center justify-between font-extrabold gap-2">
            <div className="flex items-center gap-2">
              <FileCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              <span>Regras de Importação de Arquivo Excel (.xlsx, .csv)</span>
            </div>
            <button
              onClick={copyHeaderTemplate}
              className="flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg bg-amber-200/70 dark:bg-amber-900/50 hover:bg-amber-300 font-bold transition-all text-amber-950 dark:text-amber-100 shrink-0"
              title="Copiar linha de cabeçalho exata"
            >
              <Copy className="h-3 w-3" />
              <span>{copiedText ? "Copiado!" : "Copiar Cabeçalho Exato"}</span>
            </button>
          </div>
          <p className="text-[11px] text-amber-800 dark:text-amber-300">
            A primeira linha da planilha <strong>deve conter exatamente os nomes de colunas do banco de dados</strong> listados abaixo:
          </p>

          <div className="flex flex-wrap gap-1.5 pt-1">
            {requiredHeaders.map((h) => {
              const isMissing = missingHeaders.some((mh) => mh.toLowerCase() === h.key.toLowerCase());
              return (
                <span
                  key={h.key}
                  className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${
                    isMissing
                      ? "bg-red-100 text-red-700 border-red-300 dark:bg-red-950/60 dark:text-red-300 dark:border-red-800 animate-pulse"
                      : "bg-white/80 dark:bg-surface-800 text-surface-800 dark:text-surface-200 border-surface-200 dark:border-surface-700"
                  }`}
                >
                  {h.key}
                </span>
              );
            })}
          </div>
        </div>

        {/* File Dropzone */}
        {!selectedFile ? (
          <label className="border-2 border-dashed border-surface-300 dark:border-surface-700 hover:border-teal-500 rounded-3xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer transition-all bg-surface-50/50 dark:bg-surface-800/30 hover:bg-teal-50/30 dark:hover:bg-teal-950/20 group">
            <FileSpreadsheet className="h-10 w-10 text-teal-600 dark:text-teal-400 group-hover:scale-110 transition-transform" />
            <div className="text-center">
              <span className="font-extrabold text-xs text-surface-900 dark:text-surface-100 block">
                Clique para selecionar a planilha Excel (.xlsx, .csv)
              </span>
              <span className="text-[10px] text-surface-500 dark:text-surface-400">
                O arquivo será analisado automaticamente para garantir a integridade dos dados.
              </span>
            </div>
            <input
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileChange}
              className="hidden"
            />
          </label>
        ) : (
          <div className="space-y-3">
            {/* File Selected Badge */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileSpreadsheet className="h-5 w-5 text-teal-600 dark:text-teal-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-xs font-bold text-surface-900 dark:text-surface-100 truncate block">
                    {selectedFile.name}
                  </span>
                  <span className="text-[10px] text-surface-500">
                    {(selectedFile.size / 1024).toFixed(1)} KB
                  </span>
                </div>
              </div>

              <Button variant="ghost" size="sm" onClick={handleReset} className="text-xs text-red-500 hover:text-red-700">
                Trocar Arquivo
              </Button>
            </div>

            {/* Validation Error Banner */}
            {validationError && (
              <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs space-y-1.5 animate-slide-up">
                <div className="flex items-center gap-2 font-bold text-red-800 dark:text-red-200">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-red-600" />
                  <span>Erro de Validação de Cabeçalho</span>
                </div>
                <p className="text-[11px] leading-relaxed">{validationError}</p>
                {missingHeaders.length > 0 && (
                  <div className="pt-1">
                    <span className="text-[10px] font-bold block uppercase text-red-800 dark:text-red-300">
                      Colunas ausentes na primeira linha:
                    </span>
                    <span className="text-[11px] font-mono text-red-900 dark:text-red-200 font-extrabold">
                      {missingHeaders.join(", ")}
                    </span>
                  </div>
                )}
              </div>
            )}

            {/* Valid Data Preview */}
            {!validationError && parsedRows.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/40 space-y-2 animate-slide-up">
                <div className="flex items-center justify-between text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                    <span>Planilha Validada com Sucesso!</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-200/60 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-100 text-[10px]">
                    {parsedRows.length} linhas encontradas
                  </span>
                </div>

                {/* Preview Table First 3 Rows */}
                <div className="overflow-x-auto max-h-36 rounded-xl border border-emerald-200/60 dark:border-emerald-900/30 bg-white dark:bg-surface-900">
                  <table className="w-full text-[10px] text-left">
                    <thead className="bg-emerald-100/60 dark:bg-emerald-950/60 font-bold text-emerald-900 dark:text-emerald-200">
                      <tr>
                        {requiredKeys.slice(0, 5).map((key) => (
                          <th key={key} className="px-2 py-1.5 whitespace-nowrap border-b border-emerald-200/50">
                            {key}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {parsedRows.slice(0, 3).map((row, idx) => (
                        <tr key={idx} className="border-b border-surface-100 dark:border-surface-800 text-surface-700 dark:text-surface-300">
                          {requiredKeys.slice(0, 5).map((key) => (
                            <td key={key} className="px-2 py-1 truncate max-w-[120px]">
                              {row[key] !== undefined ? String(row[key]) : "-"}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-surface-100 dark:border-surface-800">
          <Button variant="ghost" size="sm" onClick={() => { handleReset(); onClose(); }} disabled={isImporting}>
            Cancelar
          </Button>
          <Button
            size="sm"
            onClick={handleConfirmImport}
            disabled={!selectedFile || !!validationError || parsedRows.length === 0}
            isLoading={isImporting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-2"
          >
            <Upload className="h-4 w-4" />
            <span>Confirmar Importação de {parsedRows.length} Linhas</span>
          </Button>
        </div>
      </div>
    </Modal>
  );
}
