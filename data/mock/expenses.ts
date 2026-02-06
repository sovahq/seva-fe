import type { ExpenseRequisition } from "@/types"

export const mockExpenseRequisitions: ExpenseRequisition[] = [
  {
    id: "req-1",
    organizationId: "org-jci-eko",
    administrativeYear: 2026,
    status: "PENDING_FINANCE_REVIEW",
    title: "Q1 Event Venue Deposit",
    amount: 150000,
    currency: "NGN",
    budgetCategoryId: "cat-events",
    submittedAt: "2026-02-01T10:00:00Z",
    financeNote: null,
    auditLog: [
      { id: "log-1a", requisitionId: "req-1", at: "2026-02-01T10:00:00Z", action: "submitted", actorId: "user-2", note: null },
    ],
  },
  {
    id: "req-2",
    organizationId: "org-jci-eko",
    administrativeYear: 2026,
    status: "PENDING_PRESIDENT_APPROVAL",
    title: "Annual Dues Refund (Member Exit)",
    amount: 25000,
    currency: "NGN",
    budgetCategoryId: "cat-admin",
    submittedAt: "2026-01-28T14:30:00Z",
    financeNote: "Confirmed: This is within the Q1 budget. Member left in good standing.",
    auditLog: [
      { id: "log-2a", requisitionId: "req-2", at: "2026-01-28T14:30:00Z", action: "submitted", actorId: "user-2", note: null },
      { id: "log-2b", requisitionId: "req-2", at: "2026-01-29T09:15:00Z", action: "vetted_by_finance", actorId: "user-2", note: "Confirmed: This is within the Q1 budget. Member left in good standing." },
    ],
  },
  {
    id: "req-3",
    organizationId: "org-jci-eko",
    administrativeYear: 2026,
    status: "APPROVED",
    title: "Training Materials",
    amount: 75000,
    currency: "NGN",
    budgetCategoryId: "cat-training",
    submittedAt: "2026-01-20T11:00:00Z",
    financeNote: "Within training line item.",
    auditLog: [
      { id: "log-3a", requisitionId: "req-3", at: "2026-01-20T11:00:00Z", action: "submitted", actorId: "user-2", note: null },
      { id: "log-3b", requisitionId: "req-3", at: "2026-01-21T10:00:00Z", action: "vetted_by_finance", actorId: "user-2", note: "Within training line item." },
      { id: "log-3c", requisitionId: "req-3", at: "2026-01-22T16:00:00Z", action: "approved_by_president", actorId: "user-1", note: null },
    ],
  },
]
