import type { FinancialSummary } from "@/types"

export const mockFinancialSummaries: FinancialSummary[] = [
  {
    organizationId: "org-jci-eko",
    duesCollectedYtd: 1250000,
    pendingRetirementsCount: 2,
  },
  {
    organizationId: "org-demo",
    duesCollectedYtd: 500000,
    pendingRetirementsCount: 0,
  },
]
