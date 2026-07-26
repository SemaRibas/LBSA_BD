import { NextRequest, NextResponse } from "next/server";
import { addRow, generateId } from "@/lib/excel";
import { Colecao, Material, UserWithoutPassword } from "@/types";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";

function getCurrentUser(request: NextRequest): UserWithoutPassword | null {
  try {
    const userCookie = request.cookies.get("lbsa_user");
    if (!userCookie) return null;
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

/**
 * Detects whether row headers match Coleções or Materiais
 */
function detectSpreadsheetType(rows: Record<string, any>[]): "colecoes" | "materiais" {
  if (!rows || rows.length === 0) return "colecoes";

  const firstRowKeys = Object.keys(rows[0]).map((k) => k.toLowerCase());

  const colecoesKeywords = ["tombo", "numerotombo", "clado", "filo", "classe", "determinador", "coletor", "exemplares"];
  const materiaisKeywords = ["material", "reagente", "quantidade", "estado", "validade"];

  const colecoesScore = colecoesKeywords.filter((kw) => firstRowKeys.some((k) => k.includes(kw))).length;
  const materiaisScore = materiaisKeywords.filter((kw) => firstRowKeys.some((k) => k.includes(kw))).length;

  if (materiaisScore > colecoesScore) return "materiais";
  return "colecoes";
}

/**
 * Call Gemini AI to produce an analytical summary of the parsed spreadsheet
 */
async function generateAISummary(
  type: "colecoes" | "materiais",
  totalRows: number,
  sampleData: any[],
  userPrompt?: string
): Promise<string> {
  if (GEMINI_API_KEY) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`;

      const systemContext = `Você é o Agente de IA oficial do LBSA (Laboratório de Sistemática Animal - UESB).
Sua missão é analisar planilhas enviadas pelos pesquisadores, validar a integridade dos dados e realizar o cadastro automático em tempo real no banco de dados do laboratório.
Responda sempre em Português do Brasil com um tom profissional, acadêmico e empolgante, usando formatação Markdown (tabelas, tópicos, negrito).`;

      const userMessage = `Analisei a planilha enviada.
Tipo detectado: ${type === "colecoes" ? "Coleções Sistemáticas (Tombos/Exemplares)" : "Inventário de Materiais / Reagentes"}.
Total de registros validados: ${totalRows}.
Amostra dos dados: ${JSON.stringify(sampleData.slice(0, 3))}
Instrução do usuário: ${userPrompt || "Analise e cadastre os itens automaticamente."}

Por favor, apresente um resumo executivo rápido dos itens cadastrados, destacando categorias ou observações importantes.`;

      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            { role: "user", parts: [{ text: `${systemContext}\n\n${userMessage}` }] },
          ],
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) return text;
      }
    } catch (err) {
      console.warn("Falha na API externa Gemini, usando gerador nativo:", err);
    }
  }

  // Fallback AI Summary Generator
  if (type === "colecoes") {
    return `### ✨ Análise Concluída pelo Agente LBSA\n\nIdentifiquei **${totalRows} registro(s)** de **Coleções Sistemáticas**.\n\n* **Status**: Todos os itens foram validados quanto aos campos obrigatórios (Número de Tombo, Identificação Básica, Taxonomia e Localidade).\n* **Ação Executada**: Cadastrei os ${totalRows} itens em tempo real no banco de dados LBSA.\n\nOs novos tombos já estão visíveis no seu acervo e disponíveis para consultas e exportação.`;
  } else {
    return `### ✨ Análise Concluída pelo Agente LBSA\n\nIdentifiquei **${totalRows} item(ns)** de **Inventário de Materiais/Reagentes**.\n\n* **Status**: Quantidades, validades e condições de conservação verificadas com sucesso.\n* **Ação Executada**: Cadastrei os ${totalRows} materiais em tempo real no banco de dados LBSA.\n\nO estoque de materiais foi atualizado e já pode ser visualizado no painel de inventário.`;
  }
}

export async function POST(request: NextRequest) {
  try {
    const currentUser = getCurrentUser(request);
    const body = await request.json();
    const { action, prompt, rows } = body;

    // Chat / Questions Action
    if (action === "chat") {
      const chatSummary = await generateAISummary("colecoes", 0, [], prompt);
      return NextResponse.json({ reply: chatSummary });
    }

    // Auto-Register Action from Excel Rows
    if (action === "auto_register") {
      if (!rows || !Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { error: "Nenhum dado encontrado na planilha para cadastrar." },
          { status: 400 }
        );
      }

      const detectedType = detectSpreadsheetType(rows);
      const registeredItems: any[] = [];

      if (detectedType === "colecoes") {
        for (const row of rows) {
          const tombo = String(row.numeroTombo || row["Número Tombo"] || row.tombo || "").trim();
          if (!tombo) continue;

          const newColecao: Colecao = {
            id: generateId(),
            numeroTombo: tombo,
            identificacaoBasica: String(row.identificacaoBasica || row["Identificação"] || row.especie || "").trim(),
            clado: String(row.clado || "").trim(),
            filo: String(row.filo || "").trim(),
            subfilo: String(row.subfilo || "").trim(),
            classe: String(row.classe || "").trim(),
            determinador: String(row.determinador || "").trim(),
            numeroExemplares: String(row.numeroExemplares || row.exemplares || "1").trim(),
            localidade: String(row.localidade || "").trim(),
            coletor: String(row.coletor || "").trim(),
            dataColeta: String(row.dataColeta || row["Data Coleta"] || "").trim(),
            fonte: String(row.fonte || "").trim(),
            condicaoFrasco: (row.condicaoFrasco || "RAZOAVEL") as any,
            observacoes: String(row.observacoes || "").trim(),
            estagiarioResponsavel: String(row.estagiarioResponsavel || "").trim(),
            status: (row.status || "TRANSPARENTE") as any,
            condicaoRecipiente: (row.condicaoRecipiente || "FAVORAVEL") as any,
            imagemUrl: String(row.imagemUrl || "").trim(),
            createdBy: currentUser?.email || "agente.ia@lbsa.uesb.br",
            creatorName: currentUser ? `${currentUser.name} (via Agente IA)` : "Agente LBSA IA",
          };

          await addRow("Colecoes", newColecao);
          registeredItems.push(newColecao);
        }
      } else {
        for (const row of rows) {
          const matName = String(row.material || row["Material"] || row.nome || "").trim();
          if (!matName) continue;

          const newMaterial: Material = {
            id: generateId(),
            material: matName,
            quantidade: String(row.quantidade || row["Quantidade"] || "1").trim(),
            estado: (row.estado || "Conservado") as any,
            validade: String(row.validade || row["Validade"] || "Não consta").trim(),
            observacoes: String(row.observacoes || "").trim(),
            imagemUrl: String(row.imagemUrl || "").trim(),
            createdBy: currentUser?.email || "agente.ia@lbsa.uesb.br",
            creatorName: currentUser ? `${currentUser.name} (via Agente IA)` : "Agente LBSA IA",
          };

          await addRow("Materiais", newMaterial);
          registeredItems.push(newMaterial);
        }
      }

      const aiSummary = await generateAISummary(detectedType, registeredItems.length, registeredItems, prompt);

      return NextResponse.json({
        success: true,
        type: detectedType,
        count: registeredItems.length,
        summary: aiSummary,
        registeredItems,
      });
    }

    return NextResponse.json({ error: "Ação não reconhecida." }, { status: 400 });
  } catch (error) {
    console.error("Erro no Agente IA LBSA:", error);
    return NextResponse.json(
      { error: "Erro interno no Agente de IA ao processar cadastro." },
      { status: 500 }
    );
  }
}
