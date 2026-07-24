import { NextRequest, NextResponse } from "next/server";
import { getSheet } from "@/lib/excel";
import { User } from "@/types";

const SHEET_NAME = "Usuarios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email e senha sao obrigatorios" },
        { status: 400 }
      );
    }

    const { rows: users } = await getSheet<User>(SHEET_NAME);
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      return NextResponse.json(
        { error: "Email ou senha invalidos" },
        { status: 401 }
      );
    }

    // Retornar sem a senha
    const { password: _, ...userWithoutPassword } = user;
    
    // Criar response com cookie
    const response = NextResponse.json(userWithoutPassword);
    
    // Cookie basico (em producao usar JWT)
    response.cookies.set("lbsa_user", JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 dias
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
