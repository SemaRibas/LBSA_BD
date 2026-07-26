import { NextRequest, NextResponse } from "next/server";
import { getSheet, addRow, updateRow, deleteRow, generateId } from "@/lib/excel";
import { Material, UserWithoutPassword } from "@/types";

const SHEET_NAME = "Materiais";

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
    const user = getCurrentUser(request);
    const body = await request.json();

    // Bulk array insertion for Excel imports
    if (Array.isArray(body)) {
      const createdItems: Material[] = [];
      for (const item of body) {
        if (!item.material) continue;
        const newItem: Material = {
          id: item.id || generateId(),
          material: String(item.material || "").trim(),
          quantidade: String(item.quantidade || "1").trim(),
          estado: String(item.estado || "Conservado").trim(),
          validade: String(item.validade || "Não consta").trim(),
          observacoes: String(item.observacoes || "").trim(),
          imagemUrl: String(item.imagemUrl || "").trim(),
          createdBy: user?.email || "admin@lbsa.uesb.br",
          creatorName: user?.name || "Administrador",
        };
        await addRow(SHEET_NAME, newItem);
        createdItems.push(newItem);
      }
      return NextResponse.json(createdItems, { status: 201 });
    }

    const { material, quantidade, estado, validade, observacoes, imagemUrl } = body;

    if (!material || !quantidade) {
      return NextResponse.json(
        { error: "Material e quantidade são obrigatórios" },
        { status: 400 }
      );
    }

    const newMaterial: Material = {
      id: generateId(),
      material,
      quantidade,
      estado: estado || "Conservado",
      validade: validade || "Não consta",
      observacoes: observacoes || "",
      imagemUrl: imagemUrl || "",
      createdBy: user?.email || "admin@lbsa.uesb.br",
      creatorName: user?.name || "Administrador",
    };

    await addRow(SHEET_NAME, newMaterial);

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
    const user = getCurrentUser(request);
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const { rows: materiais } = await getSheet<Material>(SHEET_NAME);
    const existing = materiais.find((m) => m.id === id);

    if (!existing) {
      return NextResponse.json(
        { error: "Material não encontrado" },
        { status: 404 }
      );
    }

    if (user && user.role === "pesquisador" && existing.createdBy && existing.createdBy !== user.email) {
      return NextResponse.json(
        { error: "Pesquisador só pode modificar itens cadastrados por ele mesmo." },
        { status: 403 }
      );
    }

    const updated = await updateRow<Material>(SHEET_NAME, id, updates);
    return NextResponse.json(updated);
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
    const user = getCurrentUser(request);
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "ID é obrigatório" },
        { status: 400 }
      );
    }

    const { rows: materiais } = await getSheet<Material>(SHEET_NAME);
    const existing = materiais.find((m) => m.id === id);

    if (!existing) {
      return NextResponse.json(
        { error: "Material não encontrado" },
        { status: 404 }
      );
    }

    if (user && user.role === "pesquisador" && existing.createdBy && existing.createdBy !== user.email) {
      return NextResponse.json(
        { error: "Pesquisador não tem permissão para excluir itens de outros integrantes." },
        { status: 403 }
      );
    }

    const deleted = await deleteRow(SHEET_NAME, id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erro ao deletar material:", error);
    return NextResponse.json(
      { error: "Erro ao deletar material" },
      { status: 500 }
    );
  }
}
