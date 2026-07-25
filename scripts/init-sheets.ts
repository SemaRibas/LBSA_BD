import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import * as dotenv from "dotenv";

// Carregar variaveis de ambiente
dotenv.config({ path: ".env.local" });

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_ID || "";
const CLIENT_EMAIL = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || "";
const PRIVATE_KEY = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n") || "";

async function initSheets() {
  console.log("Inicializando Google Sheets...\n");

  if (!SPREADSHEET_ID || !CLIENT_EMAIL || !PRIVATE_KEY) {
    console.error("Erro: Variaveis de ambiente nao configuradas!");
    console.log("\nConfigure o arquivo .env.local com:");
    console.log("  GOOGLE_SHEETS_ID=seu_id");
    console.log("  GOOGLE_SERVICE_ACCOUNT_EMAIL=seu_email");
    console.log("  GOOGLE_PRIVATE_KEY=sua_chave");
    process.exit(1);
  }

  const serviceAccountAuth = new JWT({
    email: CLIENT_EMAIL,
    key: PRIVATE_KEY,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const doc = new GoogleSpreadsheet(SPREADSHEET_ID, serviceAccountAuth);

  try {
    await doc.loadInfo();
    console.log("Conectado a planilha:", doc.title);

    // Criar aba Usuarios
    let usersSheet = doc.sheetsByTitle["Usuarios"];
    if (!usersSheet) {
      usersSheet = await doc.addSheet({
        title: "Usuarios",
        headerValues: ["id", "name", "email", "password", "role", "createdAt"],
      });
      console.log("Aba 'Usuarios' criada");
    } else {
      console.log("Aba 'Usuarios' ja existe");
    }

    // Criar aba Materiais
    let materialsSheet = doc.sheetsByTitle["Materiais"];
    if (!materialsSheet) {
      materialsSheet = await doc.addSheet({
        title: "Materiais",
        headerValues: ["id", "material", "quantidade", "estado", "validade", "observacoes", "imagemUrl"],
      });
      console.log("Aba 'Materiais' criada");
    } else {
      console.log("Aba 'Materiais' ja existe");
    }

    // Criar aba Colecoes
    let collectionsSheet = doc.sheetsByTitle["Colecoes"];
    if (!collectionsSheet) {
      collectionsSheet = await doc.addSheet({
        title: "Colecoes",
        headerValues: [
          "id", "numeroTombo", "identificacaoBasica", "clado", "filo", 
          "subfilo", "classe", "determinador", "numeroExemplares", 
          "localidade", "coletor", "dataColeta", "fonte", 
          "condicaoFrasco", "observacoes", "estagiarioResponsavel", 
          "status", "condicaoRecipiente", "imagemUrl"
        ],
      });
      console.log("Aba 'Colecoes' criada");
    } else {
      console.log("Aba 'Colecoes' ja existe");
    }

    console.log("\nPlanilha inicializada com sucesso!");
    console.log("\nProximo passo: Insira o usuario admin na aba 'Usuarios':");
    console.log("  Email: admin@lbsa.ufsc.br");
    console.log("  Senha: admin123");

  } catch (error) {
    console.error("Erro ao inicializar planilha:", error);
    process.exit(1);
  }
}

initSheets();
