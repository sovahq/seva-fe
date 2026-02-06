export type PrimaryCurrency = "NGN" | "USD" | "EUR"

export type UserRole = "admin" | "board" | "member"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  password?: string
  organizationId?: string
}

export interface GovernanceDocument {
  id: string
  organizationId: string
  title: string
}

export interface FinancialSummary {
  organizationId: string
  duesCollectedYtd: number
  pendingRetirementsCount: number
}

export interface Member {
  id: string
  organizationId: string
  name: string
  role?: string
}

export interface Event {
  id: string
  organizationId: string
  name: string
  date: string
}

export interface Organization {
  id: string
  name: string
  slug: string
  fiscalYear: number
  presidentialTheme?: string
  presidentName: string
  presidentEmail: string
  primaryCurrency: PrimaryCurrency
}

/** Level of access a position has for a given app module */
export type AccessLevel = "none" | "view" | "manage"

/** App module that can be gated by position (e.g. Membership, Finance). IDs match Resource in permissions. */
export interface AppModule {
  id: string
  label: string
}

/** Board position with optional parent and per-module access */
export interface BoardPosition {
  id: string
  organizationId: string
  name: string
  reportsToId: string | null
  moduleAccess: Record<string, AccessLevel>
}

/** Links a user (by id) or pending invite (by email) to a board position */
export interface BoardPositionAssignment {
  id: string
  organizationId: string
  positionId: string
  userId: string | null
  email: string | null
}
