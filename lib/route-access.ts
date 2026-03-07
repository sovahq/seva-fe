import type { BoardPosition, UserRole } from "@/types"
import { canAccess, type Resource } from "@/lib/permissions"
import { ROUTES } from "@/routes/routenames"

/**
 * Route access rules: path prefix -> required resource (or special rule).
 * Order matters: first matching prefix wins. More specific paths should come first.
 */
const ROUTE_ACCESS: { pathPrefix: string; resource: Resource }[] = [
  { pathPrefix: ROUTES.MEETINGS, resource: "projects" },
  { pathPrefix: ROUTES.MEMBERS, resource: "membership" },
  { pathPrefix: ROUTES.FINANCE, resource: "financial" },
  { pathPrefix: ROUTES.GOVERNANCE, resource: "governance" },
  { pathPrefix: ROUTES.BOARD, resource: "governance" },
  { pathPrefix: ROUTES.DASHBOARD, resource: "membership" },
]

/** Settings: only non-member roles can access (admin, board, finance). */
function canAccessSettings(role: UserRole): boolean {
  return role !== "member"
}

/** Members list: membership resource but members role is explicitly denied. */
function canAccessMembers(role: UserRole, hasMembershipAccess: boolean): boolean {
  if (role === "member") return false
  return hasMembershipAccess
}

/**
 * Returns true if the user is allowed to view the given pathname.
 * Uses the same rules as the app shell nav visibility.
 */
export function canAccessRoute(
  pathname: string,
  role: UserRole,
  position: BoardPosition | null
): boolean {
  // Profile and Dues are allowed for all authenticated users
  if (pathname === ROUTES.PROFILE || pathname.startsWith(ROUTES.PROFILE + "/")) {
    return true
  }
  if (pathname === ROUTES.DUES || pathname.startsWith(ROUTES.DUES + "/")) {
    return true
  }

  // Settings: only non-members
  if (pathname === ROUTES.SETTINGS || pathname.startsWith(ROUTES.SETTINGS + "/")) {
    return canAccessSettings(role)
  }

  // Members: membership access but not for member role
  if (pathname === ROUTES.MEMBERS || pathname.startsWith(ROUTES.MEMBERS + "/")) {
    return canAccessMembers(role, canAccess(role, "membership", position))
  }

  // All other app routes: check resource
  for (const { pathPrefix, resource } of ROUTE_ACCESS) {
    if (pathname === pathPrefix || pathname.startsWith(pathPrefix + "/")) {
      return canAccess(role, resource, position)
    }
  }

  // Unknown path (e.g. 404) – allow so Next.js can show 404
  return true
}
