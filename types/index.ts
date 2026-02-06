export type PrimaryCurrency = "NGN" | "USD" | "EUR"

export type UserRole = "admin" | "board" | "member" | "finance"

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
  /** Email (sensitive: only for authorized board) */
  email?: string
  /** Phone (sensitive: only for authorized board) */
  phone?: string
  /** Professional skills for tagging and search */
  skills?: string[]
  joinDate?: string
  /** Committee or board position IDs/names */
  committeeAssignments?: string[]
}

export interface Event {
  id: string
  organizationId: string
  name: string
  date: string
  type?: "meeting" | "event"
}

/** One attendance record: member attended an event */
export interface AttendanceRecord {
  id: string
  organizationId: string
  eventId: string
  memberId: string
  recordedAt: string
}

/** Member engagement health based on recent attendance */
export type MemberHealthStatus = "active" | "at_risk" | "inactive"

/** Stage in the induction pipeline */
export type InductionStage = "prospect" | "orientation" | "dues_paid" | "inducted"

/** Checklist item key per stage (e.g. "orientation_completed", "dues_received") */
export interface InductionChecklistItem {
  stage: InductionStage
  key: string
  label: string
  required: boolean
}

/** Prospect or new recruit moving through induction */
export interface InductionProspect {
  id: string
  organizationId: string
  name: string
  email: string
  stage: InductionStage
  /** Checklist key -> completed */
  checklistCompleted: Record<string, boolean>
  stageMovedAt: string
  createdAt: string
  /** When inducted, link to new member id */
  memberId?: string
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

/** Status for the joint financial approval workflow */
export type ExpenseRequisitionStatus =
  | "PENDING_FINANCE_REVIEW"
  | "PENDING_PRESIDENT_APPROVAL"
  | "APPROVED"
  | "DISBURSED"
  | "REJECTED"

/** One entry in the audit log for a requisition */
export interface RequisitionAuditEntry {
  id: string
  requisitionId: string
  at: string
  action:
    | "submitted"
    | "vetted_by_finance"
    | "approved_by_president"
    | "returned_to_finance"
    | "flagged_for_clarification"
    | "rejected"
    | "disbursed"
  actorId: string | null
  note: string | null
}

/** Expense or requisition requiring dual authorization (Finance + President) */
export interface ExpenseRequisition {
  id: string
  organizationId: string
  administrativeYear: number
  status: ExpenseRequisitionStatus
  title: string
  amount: number
  currency: PrimaryCurrency
  budgetCategoryId: string | null
  submittedAt: string
  financeNote: string | null
  auditLog: RequisitionAuditEntry[]
}

/** Budget category per committee for an administrative year */
export interface BudgetCategory {
  id: string
  organizationId: string
  administrativeYear: number
  name: string
  allocated: number
  spent: number
  currency: PrimaryCurrency
}

/** Ledger transaction (income or expense) */
export type TransactionType = "income" | "expense"

export interface Transaction {
  id: string
  organizationId: string
  administrativeYear: number
  type: TransactionType
  categoryId: string | null
  description: string
  amount: number
  currency: PrimaryCurrency
  date: string
  receiptAttachmentUrl: string | null
  createdBy: string | null
  createdAt: string
}

/** Dues status for a member */
export type DuesStatus = "paid" | "partial" | "owed"

export interface MemberDuesEntry {
  id: string
  organizationId: string
  administrativeYear: number
  memberId: string
  memberName: string
  status: DuesStatus
  amountOwed: number
  amountPaid: number
  currency: PrimaryCurrency
  paymentHistory: { at: string; amount: number; note: string | null }[]
}
