import { getDoc } from "../src/lib/excel";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

async function fixHeaders() {
  console.log("Corrigindo cabeçalhos do Google Sheets...");
  const doc = await getDoc();

  // Corrigir Materiais
  const matSheet = doc.sheetsByTitle["Materiais"];
  if (matSheet) {
    console.log("Definindo cabeçalhos corretos para Materiais...");
    await matSheet.setHeaderRow(["id", "material", "quantidade", "estado", "validade", "observacoes", "imagemUrl"]);
    console.log("Cabeçalhos de Materiais corrigidos!");
  }

  // Corrigir Colecoes
  const colSheet = doc.sheetsByTitle["Colecoes"];
  if (colSheet) {
    console.log("Definindo cabeçalhos corretos para Colecoes...");
    await colSheet.setHeaderRow([
      "id", "numeroTombo", "identificacaoBasica", "clado", "filo", 
      "subfilo", "classe", "determinador", "numeroExemplares", 
      "localidade", "coletor", "dataColeta", "fonte", 
      "condicaoFrasco", "observacoes", "estagiarioResponsavel", 
      "status", "condicaoRecipiente", "imagemUrl"
    ]);
    console.log("Cabeçalhos de Colecoes corrigidos!");
  }

  console.log("Sincronização de cabeçalhos concluída!");
}

fixHeaders().catch(console.error);
