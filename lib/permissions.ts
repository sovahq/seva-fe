import type { AccessLevel, BoardPosition, UserRole } from "@/types"

export type Resource = "governance" | "membership" | "financial" | "projects"

const ROLE_ACCESS: Record<UserRole, Resource[]> = {
  admin: ["governance", "membership", "financial", "projects"],
  board: ["governance", "membership", "financial", "projects"],
  member: ["membership", "projects"],
  finance: ["governance", "membership", "financial", "projects"],
}

/** President (admin) always has full access regardless of position. */
export function getAccessLevel(
  role: UserRole,
  resource: Resource,
  position: BoardPosition | null
): AccessLevel {
  if (role === "admin") return "manage"
  if (role === "finance" && resource === "financial") return "manage"
  if (!position) {
    const hasAccess = ROLE_ACCESS[role]?.includes(resource) ?? false
    return hasAccess ? "view" : "none"
  }
  const level = position.moduleAccess[resource]
  return level === "view" || level === "manage" ? level : "none"
}

/** True if the user can at least view the resource (view or manage). */
export function canAccess(
  role: UserRole,
  resource: Resource,
  position?: BoardPosition | null
): boolean {
  const level = getAccessLevel(role, resource, position ?? null)
  return level === "view" || level === "manage"
}

/** True if the user can manage (create, edit, delete) the resource. */
export function canManage(
  role: UserRole,
  resource: Resource,
  position?: BoardPosition | null
): boolean {
  return getAccessLevel(role, resource, position ?? null) === "manage"
}
