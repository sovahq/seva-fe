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
