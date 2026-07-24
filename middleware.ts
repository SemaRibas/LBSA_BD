import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/login", "/register"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userCookie = request.cookies.get("lbsa_user");

  // Allow API routes, static files, etc.
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/favicon") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Logged-in user trying to access login/register -> redirect to dashboard
  if (userCookie && publicRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // Public routes (login/register) for non-authenticated users -> allow
  if (publicRoutes.includes(pathname)) {
    return NextResponse.next();
  }

  // All other routes require auth
  if (!userCookie) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
