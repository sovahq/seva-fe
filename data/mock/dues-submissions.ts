import type { DuesSubmission } from "@/types"

/** Initial dues submissions (pending and confirmed). More can be added at runtime. */
export const mockDuesSubmissions: DuesSubmission[] = [
  {
    id: "sub-1",
    organizationId: "org-jci-eko",
    administrativeYear: 2026,
    memberId: "m-3",
    memberName: "Adeola Okonkwo",
    amount: 25000,
    currency: "NGN",
    receiptUrl: null,
    status: "pending_confirmation",
    submittedAt: "2026-03-01T10:00:00Z",
    confirmedAt: null,
    confirmedBy: null,
  },
]
