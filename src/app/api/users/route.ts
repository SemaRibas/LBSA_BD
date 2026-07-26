import { NextRequest, NextResponse } from "next/server";
import { getSheet, updateRow } from "@/lib/excel";
import { User, UserWithoutPassword, UserRole } from "@/types";

const SHEET_NAME = "Usuarios";

// GET /api/users - List all users (without passwords)
export async function GET() {
  try {
    const { rows: users } = await getSheet<User>(SHEET_NAME);
    const usersWithoutPassword: UserWithoutPassword[] = users.map((user) => {
      const { password: _, ...rest } = user;
      // Default to pesquisador if role is unknown or legacy
      if (!rest.role || (rest.role as string) === "estagiario") {
        rest.role = "pesquisador";
      }
      return rest;
    });

    return NextResponse.json(usersWithoutPassword);
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 }
    );
  }
}

// PUT /api/users - Update a user's role or avatar image
export async function PUT(request: NextRequest) {
  try {
    let currentUser: UserWithoutPassword | null = null;
    const userCookie = request.cookies.get("lbsa_user");
    if (userCookie) {
      try {
        currentUser = JSON.parse(userCookie.value);
      } catch {}
    }

    const body = await request.json();
    const { userId, role, imagemUrl, requesterId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório." },
        { status: 400 }
      );
    }

    const activeUserId = currentUser?.id || requesterId;
    const isSelf = activeUserId === userId;
    const isAdmin = currentUser?.role === "admin" || !currentUser;

    if (!isSelf && !isAdmin) {
      return NextResponse.json(
        { error: "Sem permissão para alterar este perfil." },
        { status: 403 }
      );
    }

    const updateData: Partial<User> = {};

    if (role !== undefined) {
      if (!isAdmin) {
        return NextResponse.json(
          { error: "Apenas Administradores podem alterar funções de usuários." },
          { status: 403 }
        );
      }
      const validRoles: UserRole[] = ["admin", "pesquisador", "monitor"];
      if (!validRoles.includes(role)) {
        return NextResponse.json(
          { error: "Função inválida." },
          { status: 400 }
        );
      }
      updateData.role = role;
    }

    if (imagemUrl !== undefined) {
      updateData.imagemUrl = imagemUrl;
    }

    const updated = await updateRow<User>(SHEET_NAME, userId, updateData);
    if (!updated) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const { password: _, ...updatedWithoutPassword } = updated;
    return NextResponse.json(updatedWithoutPassword);
  } catch (error) {
    console.error("Erro ao atualizar usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar usuário" },
      { status: 500 }
    );
  }
}
