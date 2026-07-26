import { NextRequest, NextResponse } from "next/server";
import { getSheet } from "@/lib/excel";
import { User, UserWithoutPassword } from "@/types";

const SHEET_NAME = "Usuarios";

const DEFAULT_ADMIN: UserWithoutPassword = {
  id: "admin-default",
  name: "Administrador LBSA",
  email: "admin@lbsa.uesb.br",
  role: "admin",
  createdAt: new Date().toISOString(),
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "E-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    // Default admin login fallback
    if (cleanEmail === "admin@lbsa.uesb.br" && cleanPassword === "admin123") {
      const response = NextResponse.json(DEFAULT_ADMIN);
      response.cookies.set("lbsa_user", JSON.stringify(DEFAULT_ADMIN), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
        path: "/",
      });
      return response;
    }

    const { rows: users } = await getSheet<User>(SHEET_NAME);

    // Robust case-insensitive and trimmed comparison
    const user = users.find((u) => {
      const uEmail = String(u.email || "").trim().toLowerCase();
      const uPass = String(u.password || "").trim();
      return uEmail === cleanEmail && uPass === cleanPassword;
    });

    if (!user) {
      return NextResponse.json(
        { error: "E-mail ou senha inválidos. Verifique suas credenciais." },
        { status: 401 }
      );
    }

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;

    const response = NextResponse.json(userWithoutPassword);
    response.cookies.set("lbsa_user", JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro no login:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao autenticar." },
      { status: 500 }
    );
  }
}
