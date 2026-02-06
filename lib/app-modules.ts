import type { AppModule } from "@/types"
import type { Resource } from "@/lib/permissions"

/**
 * Default app modules used for the permissions matrix.
 * Add or remove modules here to change what positions can be granted access to.
 */
export const APP_MODULES: AppModule[] = [
  { id: "governance", label: "Governance" },
  { id: "membership", label: "Membership" },
  { id: "financial", label: "Finance" },
  { id: "projects", label: "Projects" },
]

export function getModuleIds(): Resource[] {
  return APP_MODULES.map((m) => m.id as Resource)
}
