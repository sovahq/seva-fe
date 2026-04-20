"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  ChevronUp,
  LayoutDashboard,
  Users,
  Calendar,
  Wallet,
  FileText,
  LayoutList,
  Settings,
  User,
  LogOut,
} from "lucide-react"
import { useAuth } from "@/context/AuthContext"
import { useViewAs } from "@/context/ViewAsContext"
import { canAccess, type Resource } from "@/lib/permissions"
import { cn } from "@/lib/utils"
import { ROUTES } from "@/routes/routenames"
import { useAppPaths } from "@/hooks/useAppPaths"
import { SevaLogo } from "@/components/branding"
import { Button } from "@/components/ui/button"

const PRIMARY_ICONS = {
  home: LayoutDashboard,
  members: Users,
  meetings: Calendar,
  finance: Wallet,
} as const

const NESTED_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  governance: FileText,
  board: LayoutList,
  settings: Settings,
}

function primaryNavItems(
  paths: ReturnType<typeof useAppPaths>
): { to: string; label: string; resource: Resource; iconKey: keyof typeof PRIMARY_ICONS }[] {
  return [
    { to: paths.home, label: "Dashboard", resource: "membership", iconKey: "home" },
    { to: paths.members, label: "Member Relations", resource: "membership", iconKey: "members" },
    { to: paths.meetings, label: "Meetings", resource: "projects", iconKey: "meetings" },
    { to: paths.finance, label: "Finance", resource: "financial", iconKey: "finance" },
  ]
}

function nestedNavItems(
  paths: ReturnType<typeof useAppPaths>
): { to: string; label: string; resource?: Resource; iconKey: string }[] {
  return [
    { to: paths.governance, label: "Governance", resource: "governance", iconKey: "governance" },
    { to: paths.board, label: "Board", resource: "governance", iconKey: "board" },
    { to: ROUTES.SETTINGS, label: "Settings", iconKey: "settings" },
  ]
}

function UserMenuPanel({
  currentUser,
  availableUsers,
  switchUser,
  onClose,
  onLogout,
}: {
  currentUser: NonNullable<ReturnType<typeof useAuth>["currentUser"]>
  availableUsers: ReturnType<typeof useAuth>["availableUsers"]
  switchUser: ReturnType<typeof useAuth>["switchUser"]
  onClose: () => void
  onLogout: () => void
}) {
  return (
    <>
      <div className="border-b border-border px-4 py-2 text-xs text-muted-foreground">
        {currentUser.name} · {currentUser.role}
      </div>
      <div className="py-1">
        <Button
          variant="ghost"
          type="button"
          className="w-full justify-start gap-2 rounded-none px-4 py-2 text-sm text-foreground"
          asChild
        >
          <Link href={ROUTES.PROFILE} onClick={onClose}>
            <User className="size-4 shrink-0 stroke-[1.5] text-primary" />
            Profile
          </Link>
        </Button>
        <div className="px-4 py-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
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
                onClose()
              }}
              className="w-full justify-start rounded-none px-4 py-2 text-sm text-foreground"
            >
              {u.name}
            </Button>
          ))}
      </div>
      <div className="border-t border-border pt-1">
        <Button
          variant="ghost"
          type="button"
          onClick={onLogout}
          className="w-full justify-start gap-2 rounded-none px-4 py-2 text-sm text-destructive"
        >
          <LogOut className="size-4 shrink-0 stroke-[1.5]" />
          Log out
        </Button>
      </div>
    </>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const { currentUser, availableUsers, switchUser, logout } = useAuth()
  const { viewAsPosition } = useViewAs()
  const paths = useAppPaths()
  const pathname = usePathname()
  const router = useRouter()
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [moreMenuOpen, setMoreMenuOpen] = useState(false)

  if (!currentUser) return null

  const effectivePosition = viewAsPosition
  const hasAccess = (resource: Resource) =>
    canAccess(currentUser.role, resource, effectivePosition)

  const primaryItems = primaryNavItems(paths)
  const visiblePrimaryItems = primaryItems.filter((item) => {
    if (currentUser.role === "member" && item.to === paths.members) return false
    return hasAccess(item.resource)
  })
  const nestedItems = nestedNavItems(paths).filter((item) => {
    if (currentUser.role === "member" && item.to === ROUTES.SETTINGS) return false
    return item.resource == null || hasAccess(item.resource)
  })
  const moreMenuPaths = nestedItems.map((i) => i.to)
  const isMoreActive = moreMenuPaths.some(
    (p) => pathname === p || pathname.startsWith(p + "/")
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

  function closeUserMenu() {
    setUserMenuOpen(false)
  }

  const viewAsBadge = viewAsPosition ? (
    <span className="rounded-full bg-surface-soft px-2.5 py-1 text-xs font-medium text-primary">
      Viewing as: {viewAsPosition.name}
    </span>
  ) : null

  return (
    <div className="flex min-h-screen flex-col bg-background lg:flex-row">
      {/* Mobile: top bar */}
      <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-border bg-background/85 px-4 backdrop-blur-md sm:px-6 lg:hidden">
        <SevaLogo
          asLink
          to={ROUTES.DASHBOARD}
          size="sm"
          style={{ color: "var(--primary)" }}
          className="min-w-0 shrink transition-opacity hover:opacity-90"
        />
        <div className="flex min-w-0 flex-1 items-center justify-end gap-2">
          {viewAsBadge}
          <div className="relative shrink-0">
            <Button
              variant="outline"
              type="button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="min-w-0 gap-2 border-border font-medium text-foreground/85"
            >
              <span className="max-w-[100px] truncate text-sm sm:max-w-[140px]">{currentUser.name}</span>
            </Button>
            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={closeUserMenu} />
                <div className="absolute right-0 top-full z-20 mt-1 w-56 rounded-2xl border border-border bg-card/95 py-1 shadow-none backdrop-blur-md">
                  <UserMenuPanel
                    currentUser={currentUser}
                    availableUsers={availableUsers}
                    switchUser={switchUser}
                    onClose={closeUserMenu}
                    onLogout={handleLogout}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Desktop: left sidebar */}
      <aside
        className="hidden h-screen w-60 shrink-0 flex-col border-r border-border bg-background lg:sticky lg:top-0 lg:flex"
        aria-label="App sidebar"
      >
        <div className="flex flex-1 flex-col px-3 pb-4 pt-6">
          <div className="mb-8 px-2">
            <SevaLogo
              asLink
              to={ROUTES.DASHBOARD}
              size="sm"
              style={{ color: "var(--primary)" }}
              className="transition-opacity hover:opacity-90"
            />
          </div>

          <nav className="flex flex-1 flex-col gap-0.5" aria-label="Main navigation">
            {visiblePrimaryItems.map((item) => {
              const Icon = PRIMARY_ICONS[item.iconKey]
              const active = isActive(item.to)
              return (
                <Link
                  key={item.to}
                  href={item.to}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                    active
                      ? "bg-surface-soft text-primary"
                      : "text-foreground/80 hover:bg-surface-soft/60 hover:text-primary"
                  )}
                >
                  <Icon
                    className={cn(
                      "size-4 shrink-0 stroke-[1.5]",
                      active ? "text-primary" : "text-icon-muted"
                    )}
                  />
                  {item.label}
                </Link>
              )
            })}

            {nestedItems.length > 0 ? (
              <div className="mt-6 border-t border-border pt-5">
                <p className="mb-2 px-3 text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  More
                </p>
                <div className="flex flex-col gap-0.5">
                  {nestedItems.map((item) => {
                    const Icon = NESTED_ICONS[item.iconKey]
                    const itemActive =
                      pathname === item.to || pathname.startsWith(item.to + "/")
                    return (
                      <Link
                        key={item.to}
                        href={item.to}
                        className={cn(
                          "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                          itemActive
                            ? "bg-surface-soft text-primary"
                            : "text-foreground/80 hover:bg-surface-soft/60 hover:text-primary"
                        )}
                      >
                        {Icon ? (
                          <Icon
                            className={cn(
                              "size-4 shrink-0 stroke-[1.5]",
                              itemActive ? "text-primary" : "text-icon-muted"
                            )}
                          />
                        ) : null}
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </div>
            ) : null}
          </nav>

          <div className="mt-auto space-y-3 border-t border-border pt-4">
            {viewAsPosition ? (
              <div className="px-2">
                <span className="inline-flex rounded-full bg-surface-soft px-2.5 py-1 text-xs font-medium text-primary">
                  Viewing as: {viewAsPosition.name}
                </span>
              </div>
            ) : null}
            <div className="relative px-1">
              <Button
                variant="outline"
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="w-full min-w-0 justify-start gap-2 border-border font-medium text-foreground/85"
              >
                <span className="truncate text-left text-sm">{currentUser.name}</span>
              </Button>
              {userMenuOpen && (
                <>
                  <div className="fixed inset-0 z-10" aria-hidden onClick={closeUserMenu} />
                  <div className="absolute bottom-full left-0 right-0 z-20 mb-2 rounded-2xl border border-border bg-card/95 py-1 shadow-none backdrop-blur-md">
                    <UserMenuPanel
                      currentUser={currentUser}
                      availableUsers={availableUsers}
                      switchUser={switchUser}
                      onClose={closeUserMenu}
                      onLogout={handleLogout}
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        <main className="min-h-0 flex-1 px-4 pb-28 pt-6 sm:px-6 lg:px-10 lg:pb-10 lg:pt-10">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>

      {/* Mobile: bottom navigation */}
      <nav
        className={cn(
          "fixed bottom-4 left-4 right-4 z-40 mx-auto flex max-w-2xl items-center justify-center gap-1 rounded-[1.25rem] border border-border bg-card/90 px-2 py-2.5 shadow-none backdrop-blur-md sm:left-6 sm:right-6 lg:hidden"
        )}
        aria-label="Main navigation"
      >
        {visiblePrimaryItems.map((item) => {
          const Icon = PRIMARY_ICONS[item.iconKey]
          const active = isActive(item.to)
          return (
            <Link
              key={item.to}
              href={item.to}
              className={cn(
                "flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors sm:px-4",
                active ? "bg-surface-soft text-primary" : "text-foreground/75 hover:bg-surface-soft/60 hover:text-primary"
              )}
            >
              <Icon
                className={cn("size-4 shrink-0 stroke-[1.5]", active ? "text-primary" : "text-icon-muted")}
              />
              <span className="hidden min-[380px]:inline">{item.label}</span>
            </Link>
          )
        })}
        {nestedItems.length > 0 ? (
          <div className="relative">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setMoreMenuOpen(!moreMenuOpen)}
              className={cn(
                "rounded-xl px-3 py-2.5 text-sm font-medium transition-colors hover:bg-surface-soft/60 sm:px-4",
                isMoreActive ? "bg-surface-soft text-primary" : "text-foreground/75 hover:text-primary"
              )}
            >
              <span className="hidden min-[380px]:inline">More</span>
              <span className="min-[380px]:hidden">⋯</span>
              <ChevronUp
                className={cn("ml-0.5 size-3.5 shrink-0 stroke-[1.5] transition-transform min-[380px]:ml-1", moreMenuOpen && "rotate-180")}
              />
            </Button>
            {moreMenuOpen && (
              <>
                <div className="fixed inset-0 z-10" aria-hidden onClick={() => setMoreMenuOpen(false)} />
                <div
                  className="absolute bottom-full left-1/2 z-20 mb-3 w-48 max-w-[calc(100vw-2rem)] -translate-x-1/2 rounded-2xl border border-border bg-card py-1 shadow-none backdrop-blur-md"
                  role="menu"
                >
                  {nestedItems.map((item) => {
                    const Icon = NESTED_ICONS[item.iconKey]
                    const itemActive =
                      pathname === item.to || pathname.startsWith(item.to + "/")
                    return (
                      <Link
                        key={item.to}
                        href={item.to}
                        onClick={() => setMoreMenuOpen(false)}
                        role="menuitem"
                        className={cn(
                          "flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors",
                          itemActive ? "bg-surface-soft text-primary" : "text-foreground hover:bg-surface-soft/50"
                        )}
                      >
                        {Icon ? (
                          <Icon
                            className={cn(
                              "size-4 shrink-0 stroke-[1.5]",
                              itemActive ? "text-primary" : "text-icon-muted"
                            )}
                          />
                        ) : null}
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              </>
            )}
          </div>
        ) : null}
      </nav>
    </div>
  )
}
