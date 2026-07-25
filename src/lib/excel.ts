import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";

// Configuracao do Google Sheets
const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || "";
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

// Service account credentials
const serviceAccountAuth = new JWT({
  email: CLIENT_EMAIL,
  key: PRIVATE_KEY,
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

// Cache do documento
let doc: GoogleSpreadsheet | null = null;

async function getDoc(): Promise<GoogleSpreadsheet> {
  if (!doc) {
    doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);
    await doc.loadInfo();
  }
  return doc;
}

async function getSheet<T>(sheetName: string): Promise<{ sheet: any; rows: T[] }> {
  const doc = await getDoc();
  
  let sheet = doc.sheetsByTitle[sheetName];
  
  // Criar planilha se nao existir
  if (!sheet) {
    sheet = await doc.addSheet({ title: sheetName });
  }

  await sheet.loadHeaderRow().catch(() => {});
  
  const rows = await sheet.getRows();
  
  // Mapear dados
  const data = rows.map((row: any) => {
    const rawObj = typeof row.toObject === "function" ? row.toObject() : {};
    const obj: any = { ...rawObj };
    
    if (sheet.headerValues) {
      sheet.headerValues.forEach((header: string) => {
        if (obj[header] === undefined) {
          const val = typeof row.get === "function" ? row.get(header) : row[header];
          if (val !== undefined) {
            obj[header] = val;
          }
        }
      });
    }
    
    obj._rowNumber = row.rowNumber ? row.rowNumber - 2 : undefined;
    return obj;
  }) as T[];
  
  return { sheet, rows: data };
}

async function setSheetData<T extends Record<string, any>>(
  sheetName: string, 
  data: T[]
): Promise<void> {
  const doc = await getDoc();
  
  let sheet = doc.sheetsByTitle[sheetName];
  
  if (!sheet) {
    // Criar planilha com headers
    if (data.length > 0) {
      sheet = await doc.addSheet({ 
        title: sheetName,
        headerValues: Object.keys(data[0]).filter(k => !k.startsWith("_"))
      });
    } else {
      sheet = await doc.addSheet({ title: sheetName });
    }
  }
  
  // Limpar dados existentes (manter header)
  const existingRows = await sheet.getRows();
  if (existingRows.length > 0) {
    await sheet.clearRows({ start: 0, end: existingRows.length });
  }
  
  // Adicionar novos dados
  if (data.length > 0) {
    const cleanData = data.map(item => {
      const clean: Record<string, any> = {};
      Object.keys(item).forEach(key => {
        if (!key.startsWith("_")) {
          clean[key] = item[key];
        }
      });
      return clean;
    });
    await sheet.addRows(cleanData);
  }
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export { getDoc, getSheet, setSheetData, generateId };
