// middleware.ts

import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getServerClient } from "./lib/supabase"

export async function middleware(request: NextRequest) {
  const response = NextResponse.next()
  const { pathname } = request.nextUrl

  // Get access token from cookies (set manually during login)
  const accessToken = request.cookies.get("sb-access-token")?.value

  if (!accessToken) {
    // Allow unauthenticated access to /login, /signup, and /forums/new
    if (["/login", "/signup", "/forums/new"].includes(pathname)) {
      return response
    }

    // Block access to protected /forums routes
    if (pathname.startsWith("/forums")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }

    return response
  }

  // Use your server-side Supabase client
  const supabase = getServerClient()

  // Get the user using the token from cookie
  const { data: { user }, error } = await supabase.auth.getUser(accessToken)

  // If token is invalid or user doesn't exist, treat as logged out
  if (error || !user) {
    if (pathname.startsWith("/forums")) {
      return NextResponse.redirect(new URL("/login", request.url))
    }
    return response
  }

  // If authenticated user visits login or signup, redirect to homepage
  if (pathname === "/login" || pathname === "/signup") {
    return NextResponse.redirect(new URL("/", request.url))
  }

  return response
}

export const config = {
  matcher: ["/login", "/signup", "/forums/new", "/forums/:path*"],
}
