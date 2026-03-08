"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { SevaLogo } from "@/components/branding"
import { ROUTES } from "@/routes/routenames"

const HIDE_HEADER_PATHS = [ROUTES.ONBOARDING, ROUTES.LOGIN, ROUTES.UNAUTHORIZED] as const
const APP_ROUTE_PREFIXES = [
  ROUTES.DASHBOARD,
  ROUTES.DUES,
  ROUTES.GOVERNANCE,
  ROUTES.MEMBERS,
  ROUTES.MEETINGS,
  ROUTES.FINANCE,
  ROUTES.BOARD,
  ROUTES.SETTINGS,
  ROUTES.PROFILE,
] as const

export function SiteHeader() {
  const pathname = usePathname()
  if (HIDE_HEADER_PATHS.some((p) => pathname === p)) return null
  if (APP_ROUTE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/")))
    return null

  return (
    <header
      className="sticky top-0 z-50 w-full border-b border-[var(--border)] bg-[var(--card)]"
      style={{ borderColor: "var(--border)" }}
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center px-4 sm:px-6 lg:px-8">
        <SevaLogo
          asLink
          to="/"
          size="sm"
          className="transition-opacity hover:opacity-90"
          style={{ color: "var(--primary)" }}
        />
        <nav className="ml-8 flex gap-6" aria-label="Main">
          <Link
            href="/"
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              color: pathname === "/" ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            Home
          </Link>
          <Link
            href={ROUTES.ONBOARDING}
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              color:
                pathname === ROUTES.ONBOARDING ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            Get started
          </Link>
          <Link
            href={ROUTES.LOGIN}
            className="text-sm font-medium transition-opacity hover:opacity-80"
            style={{
              color:
                pathname === ROUTES.LOGIN ? "var(--primary)" : "var(--muted-foreground)",
            }}
          >
            Log in
          </Link>
        </nav>
      </div>
    </header>
  )
}
