import type { Organization } from "@/types"

export const mockOrganizations: Organization[] = [
  {
    id: "org-jci-eko",
    name: "JCI Eko",
    slug: "jci-eko",
    fiscalYear: 2026,
    presidentName: "President User",
    presidentEmail: "president@jcieko.org",
    primaryCurrency: "NGN",
  },
  {
    id: "org-demo",
    name: "Demo Org",
    slug: "demo",
    fiscalYear: 2026,
    presidentName: "Demo Member",
    presidentEmail: "demo@seva.org",
    primaryCurrency: "NGN",
  },
]
