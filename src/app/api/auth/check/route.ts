import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("lbsa_user");

    if (!userCookie) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ user });
  } catch {
    return NextResponse.json({ user: null }, { status: 401 });
  }
}
