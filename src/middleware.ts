import { type NextRequest, NextResponse } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  // Only run Supabase auth middleware on /admin routes.
  // Storefront pages don't need auth and should never fail due to Supabase issues.
  const isAdminRoute = request.nextUrl.pathname.startsWith("/admin");

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  try {
    return await updateSession(request);
  } catch {
    // If Supabase is unreachable, redirect admin to login with an error hint
    if (request.nextUrl.pathname !== "/admin/login") {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = "/admin/login";
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Only run middleware on admin routes and API routes that need auth.
     * Storefront pages are fully static/ISR and don't need middleware.
     */
    "/admin/:path*",
    "/api/checkout/:path*",
  ],
};
