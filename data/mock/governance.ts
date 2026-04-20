import type { GovernanceDocument } from "@/types"

/** Sample listings without bundled PDFs — GLC uploads real PDFs for production use. */
export const mockGovernanceDocuments: GovernanceDocument[] = [
  {
    id: "doc-1",
    organizationId: "org-jci-eko",
    title: "Constitution 2024",
    type: "constitution",
  },
  { id: "doc-2", organizationId: "org-jci-eko", title: "By-laws", type: "bylaws" },
  { id: "doc-3", organizationId: "org-demo", title: "Code of conduct", type: "policy" },
]
