import type { BudgetCategory } from "@/types"

export const mockBudgetCategories: BudgetCategory[] = [
  { id: "cat-events", organizationId: "org-jci-eko", administrativeYear: 2026, name: "Events", allocated: 500000, spent: 120000, currency: "NGN" },
  { id: "cat-training", organizationId: "org-jci-eko", administrativeYear: 2026, name: "Training", allocated: 200000, spent: 75000, currency: "NGN" },
  { id: "cat-admin", organizationId: "org-jci-eko", administrativeYear: 2026, name: "Admin & Operations", allocated: 300000, spent: 45000, currency: "NGN" },
  { id: "cat-marketing", organizationId: "org-jci-eko", administrativeYear: 2026, name: "Marketing", allocated: 150000, spent: 0, currency: "NGN" },
]
