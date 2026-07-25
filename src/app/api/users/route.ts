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

// PUT /api/users - Update a user's role (Admin only)
export async function PUT(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("lbsa_user");
    if (!userCookie) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const currentUser: UserWithoutPassword = JSON.parse(userCookie.value);
    if (currentUser.role !== "admin") {
      return NextResponse.json(
        { error: "Apenas Administradores podem alterar funções de usuários." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId, role } = body;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "ID do usuário e função são obrigatórios." },
        { status: 400 }
      );
    }

    const validRoles: UserRole[] = ["admin", "pesquisador", "monitor"];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: "Função inválida." },
        { status: 400 }
      );
    }

    const updated = await updateRow<User>(SHEET_NAME, userId, { role });
    if (!updated) {
      return NextResponse.json(
        { error: "Usuário não encontrado." },
        { status: 404 }
      );
    }

    const { password: _, ...updatedWithoutPassword } = updated;
    return NextResponse.json(updatedWithoutPassword);
  } catch (error) {
    console.error("Erro ao atualizar função do usuário:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar função do usuário" },
      { status: 500 }
    );
  }
}
