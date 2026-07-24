import { NextRequest, NextResponse } from "next/server";
import { getSheet, setSheetData, generateId } from "@/lib/excel";
import { User } from "@/types";

const SHEET_NAME = "Usuarios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha sao obrigatorios" },
        { status: 400 }
      );
    }

    // Verificar se o email ja existe
    const { rows: users } = await getSheet<User>(SHEET_NAME);
    const existingUser = users.find((u) => u.email === email);

    if (existingUser) {
      return NextResponse.json(
        { error: "Email ja cadastrado" },
        { status: 409 }
      );
    }

    // Criar novo usuario
    const newUser: User = {
      id: generateId(),
      name,
      email,
      password, // Em producao, usar bcrypt
      role: "pesquisador",
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    await setSheetData(SHEET_NAME, users);

    // Retornar sem a senha
    const { password: _, ...userWithoutPassword } = newUser;
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
