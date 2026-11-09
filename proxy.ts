import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";

/** Fast redirect for visitors with no session cookie. The real check against the database happens in the workspace layouts and in every action. */
export function proxy(request: NextRequest) {
  // Server Actions are POSTs: they authorize themselves and return a readable "session expired" message.
  if (request.cookies.has(SESSION_COOKIE) || request.method !== "GET") return NextResponse.next();
  const login = new URL("/connexion", request.url);
  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/dashboard")) login.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(login);
}

export const config = { matcher: ["/dashboard/:path*", "/admin/:path*"] };
