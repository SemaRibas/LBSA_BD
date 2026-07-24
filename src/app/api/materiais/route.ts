import { NextRequest, NextResponse } from "next/server";
import { getSheet, setSheetData, generateId } from "@/lib/excel";
import { Material } from "@/types";

const SHEET_NAME = "Materiais";

export async function GET() {
  try {
    const { rows: materiais } = await getSheet<Material>(SHEET_NAME);
    return NextResponse.json(materiais);
  } catch (error) {
    console.error("Erro ao buscar materiais:", error);
    return NextResponse.json(
      { error: "Erro ao buscar materiais" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { material, quantidade, estado, validade, observacoes } = body;

    if (!material || !quantidade) {
      return NextResponse.json(
        { error: "Material e quantidade sao obrigatorios" },
        { status: 400 }
      );
    }

    const { rows: materiais } = await getSheet<Material>(SHEET_NAME);

    const newMaterial: Material = {
      id: generateId(),
      material,
      quantidade,
      estado: estado || "Conservado",
      validade: validade || "Não consta",
      observacoes: observacoes || "",
    };

    materiais.push(newMaterial);
    await setSheetData(SHEET_NAME, materiais);

    return NextResponse.json(newMaterial, { status: 201 });
  } catch (error) {
    console.error("Erro ao criar material:", error);
    return NextResponse.json(
      { error: "Erro ao criar material" },
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

    const { rows: materiais } = await getSheet<Material>(SHEET_NAME);
    const index = materiais.findIndex((m) => m.id === id);

    if (index === -1) {
      return NextResponse.json(
        { error: "Material nao encontrado" },
        { status: 404 }
      );
    }

    materiais[index] = { ...materiais[index], ...updates };
    await setSheetData(SHEET_NAME, materiais);

    return NextResponse.json(materiais[index]);
  } catch (error) {
    console.error("Erro ao atualizar material:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar material" },
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

    const { rows: materiais } = await getSheet<Material>(SHEET_NAME);
    const filtered = materiais.filter((m) => m.id !== id);

    if (filtered.length === materiais.length) {
      return NextResponse.json(
        { error: "Material nao encontrado" },
        { status: 404 }
      );
    }

    await setSheetData(SHEET_NAME, filtered);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar material:", error);
    return NextResponse.json(
      { error: "Erro ao deletar material" },
      { status: 500 }
    );
  }
}
