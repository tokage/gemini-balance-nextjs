import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Protect the /admin route
  if (pathname.startsWith("/admin")) {
    const tokenFromCookie = request.cookies.get("auth_token")?.value;

    // If the cookie is not present, redirect to the login page.
    // The actual validation of the token happens in the /admin layout.
    if (!tokenFromCookie) {
      const url = request.nextUrl.clone();
      url.pathname = "/"; // Redirect to the root login page
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api/ (API routes, which have their own auth)
     * - health (health check)
     */
    "/((?!_next/static|_next/image|favicon.ico|api|health|gemini|openai|v1beta).*)",
  ],
};
