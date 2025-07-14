import { NextRequest, NextResponse } from "next/server";
// TODO: The API auth functions below need to be refactored.
// They currently cannot be used in middleware because they access the database.
// The validation logic should be moved to the respective API route handlers.

// // This function handles API token authentication for the proxy
// async function handleProxyAuth(request: NextRequest) {
//   const { ALLOWED_TOKENS, AUTH_TOKEN } = await getSettings();
//   const allowedTokens = (ALLOWED_TOKENS || "").split(",").filter(Boolean);
//   const validTokens = [...allowedTokens, AUTH_TOKEN].filter(Boolean);
//
//   const key = request.nextUrl.searchParams.get("key");
//   const xGoogApiKey = request.headers.get("x-goog-api-key");
//
//   if (key && validTokens.includes(key)) {
//     return NextResponse.next();
//   }
//
//   if (xGoogApiKey && validTokens.includes(xGoogApiKey)) {
//     return NextResponse.next();
//   }
//
//   const authHeader = request.headers.get("Authorization");
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     const token = authHeader.substring(7);
//     if (validTokens.includes(token)) {
//       return NextResponse.next();
//     }
//   }
//
//   console.warn(
//     `Forbidden: Invalid API token provided for path: ${request.nextUrl.pathname}`
//   );
//   return new NextResponse("Forbidden: Invalid API token", { status: 403 });
// }
//
// // This function handles API token authentication for OpenAI routes
// async function handleOpenAIAuth(request: NextRequest) {
//   const { ALLOWED_TOKENS, AUTH_TOKEN } = await getSettings();
//   const allowedTokens = (ALLOWED_TOKENS || "").split(",").filter(Boolean);
//   const validTokens = [...allowedTokens, AUTH_TOKEN].filter(Boolean);
//
//   const authHeader = request.headers.get("Authorization");
//   if (authHeader && authHeader.startsWith("Bearer ")) {
//     const token = authHeader.substring(7);
//     if (validTokens.includes(token)) {
//       return NextResponse.next();
//     }
//   }
//
//   console.warn(
//     `Forbidden: Invalid API token provided for path: ${request.nextUrl.pathname}`
//   );
//   return new NextResponse("Forbidden: Invalid API token", { status: 403 });
// }

// This function handles UI authentication via cookies
function handleUiAuth(request: NextRequest) {
  const tokenFromCookie = request.cookies.get("auth_token")?.value;

  // The middleware now only checks for the *presence* of a cookie.
  // The actual validation of the token against the database
  // is done in the page/layout server component itself.
  if (!tokenFromCookie) {
    const url = request.nextUrl.clone();
    url.pathname = "/auth";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`Request received for path: ${pathname}`);

  // Exclude public paths and the auth page itself
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico") ||
    pathname === "/auth"
  ) {
    return NextResponse.next();
  }

  // Route to UI authentication for the admin panel
  if (pathname.startsWith("/admin") || pathname.startsWith("/test")) {
    return handleUiAuth(request);
  }

  // The root path should not be authenticated as an API endpoint.
  // It's a public page, so we can just let it pass.
  if (pathname === "/") {
    // If the user is logged in (has a cookie), redirect them to the admin dashboard.
    const tokenFromCookie = request.cookies.get("auth_token")?.value;
    if (tokenFromCookie) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  // API proxy routes and health checks should not be authenticated here.
  // They are proxied to the backend service which has its own auth.
  if (pathname.startsWith("/gemini") || pathname.startsWith("/v1beta")) {
    // TODO: Refactor this to validate in the route handler
    // return handleProxyAuth(request);
    return NextResponse.next();
  }

  if (pathname.startsWith("/openai")) {
    // TODO: Refactor this to validate in the route handler
    // return handleOpenAIAuth(request);
    return NextResponse.next();
  }

  if (pathname.startsWith("/health")) {
    return NextResponse.next();
  }

  // Route to UI authentication for all other matched routes
  return handleUiAuth(request);
}

export const config = {
  matcher: [
    "/",
    "/admin/:path*",
    "/test/:path*",
    "/api/:path*",
    "/gemini/:path*",
    "/openai/:path*",
    "/v1beta/:path*",
    "/health/:path*",
  ],
};
