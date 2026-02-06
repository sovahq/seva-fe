import type { MemberDuesEntry } from "@/types"

export const mockMemberDues: MemberDuesEntry[] = [
  { id: "dues-1", organizationId: "org-jci-eko", administrativeYear: 2026, memberId: "m-1", memberName: "Jane Doe", status: "paid", amountOwed: 25000, amountPaid: 25000, currency: "NGN", paymentHistory: [{ at: "2026-01-10T10:00:00Z", amount: 25000, note: "Full payment" }] },
  { id: "dues-2", organizationId: "org-jci-eko", administrativeYear: 2026, memberId: "m-2", memberName: "John Smith", status: "paid", amountOwed: 25000, amountPaid: 25000, currency: "NGN", paymentHistory: [{ at: "2026-01-12T14:00:00Z", amount: 25000, note: null }] },
  { id: "dues-3", organizationId: "org-jci-eko", administrativeYear: 2026, memberId: "m-3", memberName: "Adeola Okonkwo", status: "partial", amountOwed: 25000, amountPaid: 15000, currency: "NGN", paymentHistory: [{ at: "2026-02-01T09:00:00Z", amount: 15000, note: "First instalment" }] },
]
