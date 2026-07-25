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
  
  if (!sheet) {
    sheet = await doc.addSheet({ title: sheetName });
  }

  await sheet.loadHeaderRow().catch(() => {});
  
  const rawRows = await sheet.getRows();
  
  const data = rawRows.map((row: any) => {
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
    
    return obj;
  }) as T[];
  
  return { sheet, rows: data };
}

async function addRow<T extends Record<string, any>>(sheetName: string, item: T): Promise<T> {
  const doc = await getDoc();
  let sheet = doc.sheetsByTitle[sheetName];
  
  if (!sheet) {
    sheet = await doc.addSheet({
      title: sheetName,
      headerValues: Object.keys(item).filter((k) => !k.startsWith("_")),
    });
  }

  const cleanData: Record<string, any> = {};
  Object.keys(item).forEach((key) => {
    if (!key.startsWith("_") && item[key] !== undefined) {
      cleanData[key] = item[key];
    }
  });

  await sheet.addRow(cleanData);
  return item;
}

async function updateRow<T extends Record<string, any>>(
  sheetName: string,
  id: string,
  updates: Partial<T>
): Promise<T | null> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) return null;

  const rawRows = await sheet.getRows();
  const targetRow = rawRows.find((r: any) => {
    const rId = typeof r.get === "function" ? r.get("id") : r.id;
    return rId === id;
  });

  if (!targetRow) return null;

  Object.keys(updates).forEach((key) => {
    if (!key.startsWith("_") && key !== "id") {
      const val = (updates as any)[key];
      if (typeof targetRow.set === "function") {
        targetRow.set(key, val ?? "");
      } else {
        (targetRow as any)[key] = val ?? "";
      }
    }
  });

  await targetRow.save();
  
  const updatedObj = typeof targetRow.toObject === "function" ? targetRow.toObject() : {};
  return updatedObj as T;
}

async function deleteRow(sheetName: string, id: string): Promise<boolean> {
  const doc = await getDoc();
  const sheet = doc.sheetsByTitle[sheetName];
  if (!sheet) return false;

  const rawRows = await sheet.getRows();
  const targetRow = rawRows.find((r: any) => {
    const rId = typeof r.get === "function" ? r.get("id") : r.id;
    return rId === id;
  });

  if (!targetRow) return false;

  await targetRow.delete();
  return true;
}

async function setSheetData<T extends Record<string, any>>(
  sheetName: string, 
  data: T[]
): Promise<void> {
  const doc = await getDoc();
  
  let sheet = doc.sheetsByTitle[sheetName];
  
  if (!sheet) {
    if (data.length > 0) {
      sheet = await doc.addSheet({ 
        title: sheetName,
        headerValues: Object.keys(data[0]).filter(k => !k.startsWith("_"))
      });
    } else {
      sheet = await doc.addSheet({ title: sheetName });
    }
  }
  
  const existingRows = await sheet.getRows();
  if (existingRows.length > 0) {
    await sheet.clearRows({ start: 0, end: existingRows.length });
  }
  
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

export { getDoc, getSheet, addRow, updateRow, deleteRow, setSheetData, generateId };
