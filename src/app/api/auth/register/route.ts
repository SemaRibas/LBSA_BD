import { NextRequest, NextResponse } from "next/server";
import { addRow, getSheet, generateId } from "@/lib/excel";
import { User } from "@/types";

const SHEET_NAME = "Usuarios";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, e-mail e senha são obrigatórios." },
        { status: 400 }
      );
    }

    const cleanName = String(name).trim();
    const cleanEmail = String(email).trim().toLowerCase();
    const cleanPassword = String(password).trim();

    if (cleanPassword.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    // Check if email already exists in sheet (case-insensitive & trimmed)
    const { rows: users } = await getSheet<User>(SHEET_NAME);
    const existingUser = users.find(
      (u) => String(u.email || "").trim().toLowerCase() === cleanEmail
    );

    if (existingUser) {
      return NextResponse.json(
        { error: "E-mail já cadastrado no sistema." },
        { status: 409 }
      );
    }

    // Create new user record
    const newUser: User = {
      id: generateId(),
      name: cleanName,
      email: cleanEmail,
      password: cleanPassword,
      role: "pesquisador",
      createdAt: new Date().toISOString(),
      imagemUrl: "",
    };

    // Add row atomically to Google Sheets
    await addRow(SHEET_NAME, newUser);

    // Return user object without password
    const { password: _, ...userWithoutPassword } = newUser;
    const response = NextResponse.json(userWithoutPassword, { status: 201 });

    // Set session cookie automatically upon registration
    response.cookies.set("lbsa_user", JSON.stringify(userWithoutPassword), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Erro no registro:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor ao cadastrar." },
      { status: 500 }
    );
  }
}
