import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { canAccessRoute } from "@/lib/route-access"
import { AUTH_COOKIE_NAME, parseAuthCookie } from "@/lib/auth-cookie"
import { ROUTES } from "@/routes/routenames"

const APP_PATH_PREFIXES = [
  ROUTES.DASHBOARD,
  ROUTES.MEMBERS,
  ROUTES.MEETINGS,
  ROUTES.FINANCE,
  ROUTES.GOVERNANCE,
  ROUTES.BOARD,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
]

function isAppPath(pathname: string): boolean {
  return APP_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(prefix + "/")
  )
}

export function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  if (pathname === ROUTES.UNAUTHORIZED) {
    return NextResponse.next()
  }

  if (!isAppPath(pathname)) {
    return NextResponse.next()
  }

  const cookieValue = request.cookies.get(AUTH_COOKIE_NAME)?.value
  const auth = parseAuthCookie(cookieValue)

  if (!auth) {
    const loginUrl = new URL(ROUTES.LOGIN, request.url)
    loginUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(loginUrl)
  }

  const allowed = canAccessRoute(pathname, auth.role, null)
  if (!allowed) {
    return NextResponse.redirect(new URL(ROUTES.UNAUTHORIZED, request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
