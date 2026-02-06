"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { canAccess, type Resource } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/routes/routenames"
import { useAppPaths } from "@/hooks/useAppPaths"
import { SevaLogo } from "@/components/branding"
import { Button } from "@/components/ui/button"

function navItemsFor(
  paths: ReturnType<typeof useAppPaths>
): { to: string; label: string; resource: Resource }[] {
  return [
    { to: paths.home, label: "Dashboard", resource: "membership" },
    { to: paths.governance, label: "Governance", resource: "governance" },
    { to: paths.members, label: "Members", resource: "membership" },
    { to: paths.events, label: "Events", resource: "projects" },
    { to: paths.finance, label: "Finance", resource: "financial" },
  ]
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const {
    currentUser,
    availableUsers,
    switchUser,
    logout,
  } = useAuth()
  const paths = useAppPaths()
  const pathname = usePathname()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  if (!currentUser) return null

  const navItems = navItemsFor(paths)
  const visibleNavItems = navItems.filter((item) =>
    canAccess(currentUser.role, item.resource)
  )

  function handleLogout() {
    logout()
    router.replace(ROUTES.LOGIN)
    setUserMenuOpen(false)
  }

  function isActive(path: string) {
    if (path === paths.home) return pathname === path || pathname === path + "/"
    return pathname.startsWith(path)
  }

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header
        className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between border-b bg-card/80 px-4 backdrop-blur-sm"
        style={{ borderColor: "rgba(0,45,91,0.1)" }}
      >
        <SevaLogo
          asLink
          to={ROUTES.DASHBOARD}
          size="sm"
          style={{ color: "var(--primary)" }}
          className="transition-opacity hover:opacity-90"
        />
        <div className="flex items-center gap-2">
          <div className="relative">
            <Button
              variant="outline"
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="min-w-0 gap-2 font-medium"
              style={{
                borderColor: "rgba(0,45,91,0.2)",
                color: "rgba(0,45,91,0.8)",
              }}
            >
              <span className="max-w-[120px] truncate text-sm">{currentUser.name}</span>
            </Button>
            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  aria-hidden
                  onClick={() => setUserMenuOpen(false)}
                />
                <div
                  className="absolute right-0 top-full z-20 mt-1 w-56 rounded-xl border py-1 shadow-lg backdrop-blur-md"
                  style={{
                    borderColor: "rgba(0,45,91,0.1)",
                    backgroundColor: "rgba(255,255,255,0.95)",
                  }}
                >
                  <div
                    className="border-b px-4 py-2 text-xs"
                    style={{ borderColor: "rgba(0,45,91,0.1)", color: "var(--muted-foreground)" }}
                  >
                    {currentUser.name} · {currentUser.role}
                  </div>
                  <div className="py-1">
                    <div
                      className="px-4 py-1 text-xs font-medium uppercase tracking-wider"
                      style={{ color: "var(--muted-foreground)" }}
                    >
                      Switch user
                    </div>
                    {availableUsers
                      .filter((u) => u.id !== currentUser.id)
                      .map((u) => (
                        <Button
                          key={u.id}
                          variant="ghost"
                          type="button"
                          onClick={() => {
                            switchUser(u)
                            setUserMenuOpen(false)
                          }}
                          className="w-full justify-start rounded-none px-4 py-2 text-sm"
                          style={{ color: "rgba(0,45,91,0.9)" }}
                        >
                          {u.name}
                        </Button>
                      ))}
                  </div>
                  <div
                    className="border-t pt-1"
                    style={{ borderColor: "rgba(0,45,91,0.1)" }}
                  >
                    <Button
                      variant="ghost"
                      type="button"
                      onClick={handleLogout}
                      className="w-full justify-start rounded-none px-4 py-2 text-sm"
                      style={{ color: "var(--destructive)" }}
                    >
                      Log out
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="min-h-0 flex-1 px-4 pb-28 pt-6">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>

      <nav
        className={cn(
          "fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-2xl items-center justify-center gap-1 rounded-2xl px-2 py-2.5",
          "border shadow-xl backdrop-blur-xl",
          "ring-1 ring-white/60 ring-inset"
        )}
        style={{
          borderColor: "rgba(0,45,91,0.2)",
          backgroundColor: "rgba(255,255,255,0.85)",
          boxShadow: "0 20px 25px -5px rgba(0,45,91,0.08)",
        }}
        aria-label="Main navigation"
      >
        {visibleNavItems.map((item) => (
          <Link
            key={item.to}
            href={item.to}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              isActive(item.to)
                ? "bg-primary/15"
                : "hover:bg-primary/10"
            )}
            style={{
              color: isActive(item.to) ? "var(--primary)" : "rgba(0,45,91,0.8)",
            }}
          >
            {item.label}
          </Link>
        ))}
        {canAccess(currentUser.role, "membership") && (
          <Link
            href={ROUTES.ONBOARDING}
            className={cn(
              "rounded-xl px-4 py-2.5 text-sm font-medium transition-colors",
              pathname === ROUTES.ONBOARDING && "bg-primary/15"
            )}
            style={{
              color: pathname === ROUTES.ONBOARDING ? "var(--primary)" : "rgba(0,45,91,0.8)",
            }}
          >
            Onboarding
          </Link>
        )}
      </nav>
    </div>
  )
}
