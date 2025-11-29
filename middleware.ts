import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const session = req.cookies.get("session")?.value;

  const url = req.nextUrl.clone();
  const path = url.pathname;

  // Public routes (tidak butuh login)
  const publicRoutes = ["/login", "/register", "/kode-otp", "/otp-expired"];

  // Jika user sudah login & buka /login atau /register → redirect ke dashboard
  if (session && (path === "/login" || path === "/register")) {
    url.pathname = "/dashboard/home";
    return NextResponse.redirect(url);
  }

  // Jika buka dashboard tapi tidak ada session → redirect login
  if (path.startsWith("/dashboard") && !session) {
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

// Tentukan route mana yang dipantau middleware
export const config = {
  matcher: [
    "/dashboard/:path*", 
    "/login", 
    "/register"
  ],
};
