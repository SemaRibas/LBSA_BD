import { addRow, getSheet } from "../src/lib/excel";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const INITIAL_MATERIAIS = [
  { id: "m1", material: "Alcool Etilico", quantidade: "5CX", estado: "Não consta", validade: "12/2026", observacoes: "" },
  { id: "m2", material: "Facao", quantidade: "3UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m3", material: "Ancinho Rastelo", quantidade: "4UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m4", material: "Pa", quantidade: "5UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m5", material: "Lanterna", quantidade: "2UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m6", material: "Podao", quantidade: "1UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m7", material: "Matriz de encaixe (madeira)", quantidade: "2UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m8", material: "Alavanca de Ferro", quantidade: "1UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m9", material: "Microtubo PCR", quantidade: "2UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m10", material: "Alicate", quantidade: "2UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m11", material: "Tubo de observacao trinocular", quantidade: "1UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m12", material: "Pipeta", quantidade: "1CX", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m13", material: "Microscopio", quantidade: "6UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m14", material: "Rede entomologica", quantidade: "7UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m15", material: "Trena fita 50m", quantidade: "1UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m16", material: "Impressora", quantidade: "1UN", estado: "Conservado", validade: "Não consta", observacoes: "" },
  { id: "m17", material: "Computador", quantidade: "6UN", estado: "Conservado", validade: "Não consta", observacoes: "3 computadores em uso no laboratorio e 3 sem uso" },
];

const INITIAL_COLECOES = [
  { id: "c1", numeroTombo: "LBSA00001", identificacaoBasica: "Hemiptera", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "CRITICO", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "LIQUIDO_TURVO", condicaoRecipiente: "FAVORAVEL" },
  { id: "c2", numeroTombo: "LBSA00002", identificacaoBasica: "Dermaptera", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "RAZOAVEL", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "TRANSPARENTE", condicaoRecipiente: "FAVORAVEL" },
  { id: "c3", numeroTombo: "LBSA00003", identificacaoBasica: "Nao identificado", clado: "-", filo: "-", subfilo: "-", classe: "-", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "CRITICO", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "LIQUIDO_TURVO", condicaoRecipiente: "FAVORAVEL" },
  { id: "c4", numeroTombo: "LBSA00004", identificacaoBasica: "Diversos", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "RAZOAVEL", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "TRANSPARENTE", condicaoRecipiente: "FAVORAVEL" },
  { id: "c5", numeroTombo: "LBSA00005", identificacaoBasica: "Isopoda", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Malacostraca", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "CRITICO", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "LIQUIDO_TURVO", condicaoRecipiente: "FAVORAVEL" },
  { id: "c6", numeroTombo: "LBSA00006", identificacaoBasica: "Coleoptera", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "4", localidade: "Criciuma, Madeira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "RAZOAVEL", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "TRANSPARENTE", condicaoRecipiente: "FAVORAVEL" },
];

async function seed() {
  console.log("Sincronizando itens com Google Sheets...");
  
  const currentMat = await getSheet<any>("Materiais");
  if (currentMat.rows.length === 0) {
    console.log("Inserindo materiais iniciais na planilha...");
    for (const m of INITIAL_MATERIAIS) {
      await addRow("Materiais", m);
    }
    console.log("Materiais inseridos com sucesso!");
  } else {
    console.log(`Materiais ja existem na planilha (${currentMat.rows.length} itens).`);
  }

  const currentCol = await getSheet<any>("Colecoes");
  if (currentCol.rows.length === 0) {
    console.log("Inserindo colecoes iniciais na planilha...");
    for (const c of INITIAL_COLECOES) {
      await addRow("Colecoes", c);
    }
    console.log("Colecoes inseridas com sucesso!");
  } else {
    console.log(`Colecoes ja existem na planilha (${currentCol.rows.length} itens).`);
  }

  console.log("Sincronização concluída com sucesso!");
}

seed().catch(console.error);
