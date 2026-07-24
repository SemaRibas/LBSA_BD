import { NextRequest, NextResponse } from "next/server";
import { getSheet, setSheetData, generateId } from "@/lib/excel";
import { Colecao } from "@/types";

const SHEET_NAME = "Colecoes";

export async function GET() {
  try {
    const { rows: colecoes } = await getSheet<Colecao>(SHEET_NAME);
    return NextResponse.json(colecoes);
  } catch (error) {
    console.error("Erro ao buscar colecoes:", error);
    return NextResponse.json(
      { error: "Erro ao buscar colecoes" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
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
    } = body;

    if (!numeroTombo) {
      return NextResponse.json(
        { error: "Numero de tombo e obrigatorio" },
        { status: 400 }
      );
    }

    const { rows: colecoes } = await getSheet<Colecao>(SHEET_NAME);

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
    };

    colecoes.push(newColecao);
    await setSheetData(SHEET_NAME, colecoes);

    return NextResponse.json(newColecao, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar colecao:", error);
    return NextResponse.json(
      { error: "Erro ao criar colecao" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID e obrigatorio" },
        { status: 400 }
      );
    }

    const { rows: colecoes } = await getSheet<Colecao>(SHEET_NAME);
    const index = colecoes.findIndex((c) => c.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Colecao nao encontrada" },
        { status: 404 }
      );
    }

    colecoes[index] = { ...colecoes[index], ...updates };
    await setSheetData(SHEET_NAME, colecoes);

    return NextResponse.json(colecoes[index]);
  } catch (error) {
    console.error("Erro ao atualizar colecao:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar colecao" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID e obrigatorio" },
        { status: 400 }
      );
    }

    const { rows: colecoes } = await getSheet<Colecao>(SHEET_NAME);
    const filtered = colecoes.filter((c) => c.id !== id);

    if (filtered.length === colecoes.length) {
      return NextResponse.json(
        { error: "Colecao nao encontrada" },
        { status: 404 }
      );
    }

    await setSheetData(SHEET_NAME, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar colecao:", error);
    return NextResponse.json(
      { error: "Erro ao deletar colecao" },
      { status: 500 }
    );
  }
}
