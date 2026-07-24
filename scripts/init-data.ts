import * as XLSX from "xlsx";
import path from "path";
import fs from "fs";

const DATA_DIR = path.join(process.cwd(), "data");

// Garantir que o diretorio data existe
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Criar arquivo de usuarios
const usersWb = XLSX.utils.book_new();
const usersWs = XLSX.utils.json_to_sheet([
  {
    id: "admin001",
    name: "Administrador",
    email: "admin@lbsa.ufsc.br",
    password: "admin123",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
]);
XLSX.utils.book_append_sheet(usersWb, usersWs, "Usuarios");
XLSX.writeFile(usersWb, path.join(DATA_DIR, "users.xlsx"));

// Criar arquivo de materiais
const materiaisWb = XLSX.utils.book_new();
const materiaisWs = XLSX.utils.json_to_sheet([
  { id: "m1", material: "Alcool Etilico", quantidade: "5CX", estado: "Não consta", validade: "Não consta", observacoes: "" },
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
]);
XLSX.utils.book_append_sheet(materiaisWb, materiaisWs, "Materiais");
XLSX.writeFile(materiaisWb, path.join(DATA_DIR, "materiais.xlsx"));

// Criar arquivo de colecoes
const colecoesWb = XLSX.utils.book_new();
const colecoesWs = XLSX.utils.json_to_sheet([
  { id: "c1", numeroTombo: "LBSA00001", identificacaoBasica: "Hemiptera", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira, Cimbira, Odontico, Cristo, Pirambu, Theomar e Porteira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "CRITICO", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "LIQUIDO_TURVO", condicaoRecipiente: "FAVORAVEL" },
  { id: "c2", numeroTombo: "LBSA00002", identificacaoBasica: "Dermaptera", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira, Cimbira, Odontico, Cristo, Pirambu, Theomar e Porteira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "RAZOAVEL", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "TRANSPARENTE", condicaoRecipiente: "FAVORAVEL" },
  { id: "c3", numeroTombo: "LBSA00003", identificacaoBasica: "Nao identificado", clado: "-", filo: "-", subfilo: "-", classe: "-", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira, Cimbira, Odontico, Cristo, Pirambu, Theomar e Porteira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "CRITICO", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "LIQUIDO_TURVO", condicaoRecipiente: "FAVORAVEL" },
  { id: "c4", numeroTombo: "LBSA00004", identificacaoBasica: "Diversos", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira, Cimbira, Odontico, Cristo, Pirambu, Theomar e Porteira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "RAZOAVEL", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "TRANSPARENTE", condicaoRecipiente: "FAVORAVEL" },
  { id: "c5", numeroTombo: "LBSA00005", identificacaoBasica: "Isopoda", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Malacostraca", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira, Cimbira, Odontico, Cristo, Pirambu, Theomar e Porteira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "CRITICO", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "LIQUIDO_TURVO", condicaoRecipiente: "FAVORAVEL" },
  { id: "c6", numeroTombo: "LBSA00006", identificacaoBasica: "Nao identificado", clado: "-", filo: "-", subfilo: "-", classe: "-", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira, Cimbira, Odontico, Cristo, Pirambu, Theomar e Porteira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "RAZOAVEL", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "TRANSPARENTE", condicaoRecipiente: "FAVORAVEL" },
  { id: "c7", numeroTombo: "LBSA00007", identificacaoBasica: "Coleoptera", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "varios", localidade: "Criciuma, Madeira, Cimbira, Odontico, Cristo, Pirambu, Theomar e Porteira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "RAZOAVEL", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "TRANSPARENTE", condicaoRecipiente: "FAVORAVEL" },
  { id: "c8", numeroTombo: "LBSA00008", identificacaoBasica: "Coleoptera", clado: "-", filo: "Arthropoda", subfilo: "-", classe: "Insecta", determinador: "-", numeroExemplares: "4", localidade: "Criciuma, Madeira, Cimbira, Odontico, Cristo, Pirambu, Theomar e Porteira", coletor: "Gabriela", dataColeta: "01/12/2008", fonte: "-", condicaoFrasco: "RAZOAVEL", observacoes: "-", estagiarioResponsavel: "Bianca dos Santos Silva", status: "TRANSPARENTE", condicaoRecipiente: "FAVORAVEL" },
]);
XLSX.utils.book_append_sheet(colecoesWb, colecoesWs, "Colecoes");
XLSX.writeFile(colecoesWb, path.join(DATA_DIR, "colecoes.xlsx"));

console.log("Arquivos Excel criados com sucesso em:", DATA_DIR);
