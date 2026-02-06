import type { UserRole } from "@/types"

export type Resource = "governance" | "membership" | "financial" | "projects"

const ROLE_ACCESS: Record<UserRole, Resource[]> = {
  admin: ["governance", "membership", "financial", "projects"],
  board: ["governance", "membership", "financial", "projects"],
  member: ["membership", "projects"],
}

export function canAccess(role: UserRole, resource: Resource): boolean {
  return ROLE_ACCESS[role]?.includes(resource) ?? false
}
