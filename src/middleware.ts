import { type NextRequest } from "next/server";

import { updateSession } from "@/lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Run on all routes except static files and images.
     * This ensures Supabase auth cookies are always refreshed.
     */
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|images/|placeholder-product.svg|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
