import { NextRequest, NextResponse } from "next/server";
import { SESSION_COOKIE, verifySessionToken } from "./lib/session";

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // The login page itself must stay public.
  if (pathname === "/owner/login") return NextResponse.next();

  const token = req.cookies.get(SESSION_COOKIE)?.value;
  const valid = await verifySessionToken(token);
  if (valid) return NextResponse.next();

  // Protected API → 401 JSON. Protected page → redirect to login.
  if (pathname.startsWith("/api/admin")) {
    return NextResponse.json({ error: "Not authorised" }, { status: 401 });
  }
  const url = req.nextUrl.clone();
  url.pathname = "/owner/login";
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ["/owner/:path*", "/api/admin/:path*"],
};
