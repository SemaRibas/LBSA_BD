import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface ColumnDefinition {
  header: string;
  key: string;
}

// Format date to Brazilian format
function formatDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const y = date.getFullYear();
  const hh = String(date.getHours()).padStart(2, "0");
  const mm = String(date.getMinutes()).padStart(2, "0");
  return `${d}/${m}/${y} às ${hh}:${mm}`;
}

/**
 * Exports array of data objects to formatted Excel (.xlsx) file
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  columns: ColumnDefinition[],
  filename: string,
  sheetName: string = "Dados"
) {
  if (!data || data.length === 0) return;

  // Map rows to display headers
  const formattedRows = data.map((item) => {
    const row: Record<string, any> = {};
    columns.forEach((col) => {
      row[col.header] = item[col.key] !== undefined && item[col.key] !== null ? item[col.key] : "";
    });
    return row;
  });

  const worksheet = XLSX.utils.json_to_sheet(formattedRows);

  // Auto column width calculation
  const colWidths = columns.map((col) => {
    let maxLen = col.header.length;
    formattedRows.forEach((row) => {
      const valStr = String(row[col.header] || "");
      if (valStr.length > maxLen) maxLen = Math.min(40, valStr.length);
    });
    return { wch: maxLen + 3 };
  });
  worksheet["!cols"] = colWidths;

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Exports data to a customized, styled PDF document with logo, header, date, page numbers and footer
 */
export function exportToPDF<T extends Record<string, any>>(
  title: string,
  columns: ColumnDefinition[],
  data: T[],
  filename: string
) {
  const doc = new jsPDF({
    orientation: columns.length > 6 ? "landscape" : "portrait",
    unit: "mm",
    format: "a4",
  });

  const nowStr = formatDate(new Date());
  const primaryColor: [number, number, number] = [13, 148, 136]; // Teal #0d9488

  // Header Banner & Branding
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, doc.internal.pageSize.width, 24, "F");

  // Logo / Title in Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(255, 255, 255);
  doc.text("LBSA - Laboratório de Sistemática Animal", 14, 12);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(230, 255, 250);
  doc.text(title.toUpperCase(), 14, 18);

  // Export Date on Top Right
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text(`Data de Exportação: ${nowStr}`, doc.internal.pageSize.width - 14, 14, { align: "right" });

  // Prepare table data
  const head = [columns.map((col) => col.header)];
  const body = data.map((item) =>
    columns.map((col) => {
      const val = item[col.key];
      return val !== undefined && val !== null ? String(val) : "-";
    })
  );

  autoTable(doc, {
    head: head,
    body: body,
    startY: 30,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9,
      halign: "left",
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [245, 247, 250],
    },
    margin: { top: 30, bottom: 20, left: 14, right: 14 },
    didDrawPage: (dataArg) => {
      const pageCount = doc.internal.getNumberOfPages();
      const pageHeight = doc.internal.pageSize.height;
      const pageWidth = doc.internal.pageSize.width;

      // Footer line
      doc.setDrawColor(226, 232, 240);
      doc.setLineWidth(0.5);
      doc.line(14, pageHeight - 12, pageWidth - 14, pageHeight - 12);

      // University Footer Text
      doc.setFont("helvetica", "normal");
      doc.setFontSize(7.5);
      doc.setTextColor(100, 116, 139);
      doc.text(
        "Universidade Estadual do Sudoeste da Bahia - UESB | Laboratório de Sistemática Animal (LBSA)",
        14,
        pageHeight - 7
      );

      // Page Number Footer Right
      doc.text(
        `Página ${dataArg.pageNumber} de ${pageCount}`,
        pageWidth - 14,
        pageHeight - 7,
        { align: "right" }
      );
    },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Validates and parses an Excel file (.xlsx, .xls, .csv)
 */
export async function parseExcelFile<T extends Record<string, any>>(
  file: File,
  requiredHeaders: string[]
): Promise<{
  success: boolean;
  rows?: T[];
  foundHeaders?: string[];
  missingHeaders?: string[];
  error?: string;
}> {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        const workbook = XLSX.read(buffer, { type: "array" });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          return resolve({ success: false, error: "Arquivo Excel sem planilhas válidas." });
        }

        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        // Parse sheet to array of arrays to inspect raw header row
        const rawMatrix: any[][] = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        if (!rawMatrix || rawMatrix.length === 0) {
          return resolve({ success: false, error: "A planilha está completamente vazia." });
        }

        // Header row
        const foundHeaders = (rawMatrix[0] || []).map((h: any) => String(h || "").trim());

        // Check required headers
        const missingHeaders = requiredHeaders.filter(
          (req) => !foundHeaders.some((fh) => fh.toLowerCase() === req.toLowerCase())
        );

        if (missingHeaders.length > 0) {
          return resolve({
            success: false,
            foundHeaders,
            missingHeaders,
            error: `Estrutura incorreta! Faltam as seguintes colunas obrigatórias no cabeçalho: ${missingHeaders.join(", ")}`,
          });
        }

        // Convert sheet to objects
        const rawObjects: T[] = XLSX.utils.sheet_to_json(worksheet);

        // Filter valid non-empty rows
        const validRows = rawObjects.filter((row) => {
          return Object.values(row).some((val) => val !== null && val !== undefined && String(val).trim() !== "");
        });

        resolve({
          success: true,
          rows: validRows,
          foundHeaders,
        });
      } catch (err) {
        console.error("Erro ao analisar arquivo Excel:", err);
        resolve({
          success: false,
          error: "Não foi possível ler o arquivo Excel. Verifique se o arquivo está corrompido.",
        });
      }
    };

    reader.onerror = () => {
      resolve({ success: false, error: "Erro ao ler o arquivo selecionado." });
    };

    reader.readAsArrayBuffer(file);
  });
}
