import type { Transaction } from "@/types"

export const mockTransactions: Transaction[] = [
  { id: "tx-1", organizationId: "org-jci-eko", administrativeYear: 2026, type: "income", categoryId: null, description: "Q1 Dues collection", amount: 450000, currency: "NGN", date: "2026-01-15", receiptAttachmentUrl: null, createdBy: "user-2", createdAt: "2026-01-15T10:00:00Z" },
  { id: "tx-2", organizationId: "org-jci-eko", administrativeYear: 2026, type: "expense", categoryId: "cat-events", description: "Venue booking (Jan event)", amount: 120000, currency: "NGN", date: "2026-01-22", receiptAttachmentUrl: null, createdBy: "user-2", createdAt: "2026-01-22T14:00:00Z" },
  { id: "tx-3", organizationId: "org-jci-eko", administrativeYear: 2026, type: "income", categoryId: null, description: "Member payment (Adeola)", amount: 15000, currency: "NGN", date: "2026-02-01", receiptAttachmentUrl: null, createdBy: "user-2", createdAt: "2026-02-01T09:00:00Z" },
]
