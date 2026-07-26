import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const userCookie = request.cookies.get("lbsa_user");

    if (!userCookie) {
      return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
    }

    const user = JSON.parse(userCookie.value);
    return NextResponse.json({ user, authenticated: true }, { status: 200 });
  } catch {
    return NextResponse.json({ user: null, authenticated: false }, { status: 200 });
  }
}
