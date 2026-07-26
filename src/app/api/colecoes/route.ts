import { NextRequest, NextResponse } from "next/server";
import { getSheet, addRow, updateRow, deleteRow, generateId } from "@/lib/excel";
import { Colecao, UserWithoutPassword } from "@/types";

const SHEET_NAME = "Colecoes";

function getCurrentUser(request: NextRequest): UserWithoutPassword | null {
  try {
    const userCookie = request.cookies.get("lbsa_user");
    if (!userCookie) return null;
    return JSON.parse(userCookie.value);
  } catch {
    return null;
  }
}

export async function GET() {
  try {
    const { rows: colecoes } = await getSheet<Colecao>(SHEET_NAME);
    return NextResponse.json(colecoes);
  } catch (error) {
    console.error("Erro ao buscar coleções:", error);
    return NextResponse.json(
      { error: "Erro ao buscar coleções" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getCurrentUser(request);
    const body = await request.json();

    // Bulk array insertion for Excel imports
    if (Array.isArray(body)) {
      const createdItems: Colecao[] = [];
      for (const item of body) {
        if (!item.numeroTombo) continue;
        const newItem: Colecao = {
          id: item.id || generateId(),
          numeroTombo: String(item.numeroTombo || "").trim(),
          identificacaoBasica: String(item.identificacaoBasica || "").trim(),
          clado: String(item.clado || "").trim(),
          filo: String(item.filo || "").trim(),
          subfilo: String(item.subfilo || "").trim(),
          classe: String(item.classe || "").trim(),
          determinador: String(item.determinador || "").trim(),
          numeroExemplares: String(item.numeroExemplares || "").trim(),
          localidade: String(item.localidade || "").trim(),
          coletor: String(item.coletor || "").trim(),
          dataColeta: String(item.dataColeta || "").trim(),
          fonte: String(item.fonte || "").trim(),
          condicaoFrasco: String(item.condicaoFrasco || "RAZOAVEL").trim(),
          observacoes: String(item.observacoes || "").trim(),
          estagiarioResponsavel: String(item.estagiarioResponsavel || "").trim(),
          status: String(item.status || "TRANSPARENTE").trim(),
          condicaoRecipiente: String(item.condicaoRecipiente || "FAVORAVEL").trim(),
          imagemUrl: String(item.imagemUrl || "").trim(),
          createdBy: user?.email || "admin@lbsa.uesb.br",
          creatorName: user?.name || "Administrador",
        };
        await addRow(SHEET_NAME, newItem);
        createdItems.push(newItem);
      }
      return NextResponse.json(createdItems, { status: 201 });
    }

    const {
      numeroTombo,
      identificacaoBasica,
      clado,
      filo,
      subfilo,
      classe,
      determinador,
      numeroExemplares,
      localidade,
      coletor,
      dataColeta,
      fonte,
      condicaoFrasco,
      observacoes,
      estagiarioResponsavel,
      status,
      condicaoRecipiente,
      imagemUrl,
    } = body;

    if (!numeroTombo) {
      return NextResponse.json(
        { error: "Número de tombo é obrigatório" },
        { status: 400 }
      );
    }

    const newColecao: Colecao = {
      id: generateId(),
      numeroTombo,
      identificacaoBasica: identificacaoBasica || "",
      clado: clado || "",
      filo: filo || "",
      subfilo: subfilo || "",
      classe: classe || "",
      determinador: determinador || "",
      numeroExemplares: numeroExemplares || "",
      localidade: localidade || "",
      coletor: coletor || "",
      dataColeta: dataColeta || "",
      fonte: fonte || "",
      condicaoFrasco: condicaoFrasco || "RAZOAVEL",
      observacoes: observacoes || "",
      estagiarioResponsavel: estagiarioResponsavel || "",
      status: status || "TRANSPARENTE",
      condicaoRecipiente: condicaoRecipiente || "FAVORAVEL",
      imagemUrl: imagemUrl || "",
      createdBy: user?.email || "admin@lbsa.uesb.br",
      creatorName: user?.name || "Administrador",
    };

    await addRow(SHEET_NAME, newColecao);

    return NextResponse.json(newColecao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar coleção:", error);
    return NextResponse.json(
      { error: "Erro ao criar coleção" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = getCurrentUser(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const { rows: colecoes } = await getSheet<Colecao>(SHEET_NAME);
    const existing = colecoes.find((c) => c.id === id);

    if (!existing) {
      return NextResponse.json(
        { error: "Coleção não encontrada" },
        { status: 404 }
      );
    }

    if (user && user.role === "pesquisador" && existing.createdBy && existing.createdBy !== user.email) {
      return NextResponse.json(
        { error: "Pesquisador só pode modificar coleções cadastradas por ele mesmo." },
        { status: 403 }
      );
    }

    const updated = await updateRow<Colecao>(SHEET_NAME, id, updates);
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erro ao atualizar coleção:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar coleção" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const { rows: colecoes } = await getSheet<Colecao>(SHEET_NAME);
    const existing = colecoes.find((c) => c.id === id);

    if (!existing) {
      return NextResponse.json(
        { error: "Coleção não encontrada" },
        { status: 404 }
      );
    }

    if (user && user.role === "pesquisador" && existing.createdBy && existing.createdBy !== user.email) {
      return NextResponse.json(
        { error: "Pesquisador não tem permissão para excluir coleções de outros integrantes." },
        { status: 403 }
      );
    }

    const deleted = await deleteRow(SHEET_NAME, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar coleção:", error);
    return NextResponse.json(
      { error: "Erro ao deletar coleção" },
      { status: 500 }
    );
  }
}
