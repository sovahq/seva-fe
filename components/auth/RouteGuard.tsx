"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useViewAs } from "@/context/ViewAsContext"
import { canAccessRoute } from "@/lib/route-access"
import { ROUTES } from "@/routes/routenames"
import { Button } from "@/components/ui/button"
import { ShieldX } from "lucide-react"

function UnauthorizedView() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-12">
      <div
        className="flex size-14 items-center justify-center rounded-full"
        style={{ backgroundColor: "var(--muted)" }}
      >
        <ShieldX className="size-7" style={{ color: "var(--muted-foreground)" }} />
      </div>
      <h1 className="mt-4 text-xl font-semibold" style={{ color: "var(--primary)" }}>
        You are not authorized to view this page
      </h1>
      <p className="mt-2 max-w-sm text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
        Your account does not have permission to access this section. If you believe this is an error, contact your
        organisation administrator.
      </p>
      <Button asChild className="mt-6">
        <Link href={ROUTES.DASHBOARD}>Back to dashboard</Link>
      </Button>
    </div>
  )
}

export function RouteGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { currentUser } = useAuth()
  const { viewAsPosition } = useViewAs()

  if (!currentUser) {
    return <>{children}</>
  }

  const allowed = canAccessRoute(pathname ?? "", currentUser.role, viewAsPosition)

  if (!allowed) {
    return <UnauthorizedView />
  }

  return <>{children}</>
}
