export type UserRole = "admin" | "pesquisador" | "monitor";

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  createdAt: string;
  imagemUrl?: string;
}

export interface UserWithoutPassword extends Omit<User, "password"> {}

export interface Material {
  id: string;
  material: string;
  quantidade: string;
  estado: "Conservado" | "Não consta" | "Danificado" | "Bom";
  validade: string;
  observacoes: string;
  imagemUrl?: string;
  createdBy?: string;
  creatorName?: string;
}

export interface Colecao {
  id: string;
  numeroTombo: string;
  identificacaoBasica: string;
  clado: string;
  filo: string;
  subfilo: string;
  classe: string;
  determinador: string;
  numeroExemplares: string;
  localidade: string;
  coletor: string;
  dataColeta: string;
  fonte: string;
  condicaoFrasco: "CRITICO" | "RAZOAVEL" | "BOM";
  observacoes: string;
  estagiarioResponsavel: string;
  status: "LIQUIDO_TURVO" | "TRANSPARENTE" | "SECO";
  condicaoRecipiente: "FAVORAVEL" | "DESFAVORAVEL" | "REGULAR";
  imagemUrl?: string;
  createdBy?: string;
  creatorName?: string;
}

export interface DashboardMetrics {
  totalMateriais: number;
  totalColecoes: number;
  materiaisConservados: number;
  colecoesAtivas: number;
}
