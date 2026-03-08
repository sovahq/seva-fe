import type { GovernanceDocument } from "@/types"

const sampleConstitutionHtml = `
<h1>Constitution 2024</h1>
<h2>Article 1 – Name and Object</h2>
<p>The organisation shall be known as the Local Organisation (LO). Its object is to provide a forum for members and to advance the aims of the parent body.</p>
<h2>Article 2 – Membership</h2>
<p>Membership is open to persons who subscribe to the object of the LO and who have paid the prescribed dues. The Board may admit or remove members in accordance with the by-laws.</p>
<h2>Article 3 – Governance</h2>
<p>The affairs of the LO shall be managed by a Board elected in accordance with the by-laws. The Board shall meet at least quarterly and keep minutes of its decisions.</p>
<h2>Article 4 – Amendments</h2>
<p>This constitution may be amended by a two-thirds majority of members present and voting at a general meeting, provided that notice of the proposed amendment has been given at least fourteen days in advance.</p>
`.trim()

const sampleConstitutionSearchableText = `Constitution 2024 Article 1 Name and Object The organisation shall be known as the Local Organisation (LO). Its object is to provide a forum for members and to advance the aims of the parent body. Article 2 Membership Membership is open to persons who subscribe to the object of the LO and who have paid the prescribed dues. The Board may admit or remove members in accordance with the by-laws. Article 3 Governance The affairs of the LO shall be managed by a Board elected in accordance with the by-laws. The Board shall meet at least quarterly and keep minutes of its decisions. Article 4 Amendments This constitution may be amended by a two-thirds majority of members present and voting at a general meeting, provided that notice of the proposed amendment has been given at least fourteen days in advance.`

export const mockGovernanceDocuments: GovernanceDocument[] = [
  {
    id: "doc-1",
    organizationId: "org-jci-eko",
    title: "Constitution 2024",
    type: "constitution",
    contentHtml: sampleConstitutionHtml,
    searchableText: sampleConstitutionSearchableText,
    lastLegalReviewAt: "2024-06-15T00:00:00.000Z",
    lastLegalReviewBy: "pos-legal",
  },
  { id: "doc-2", organizationId: "org-jci-eko", title: "By-laws", type: "bylaws" },
  { id: "doc-3", organizationId: "org-demo", title: "Code of conduct", type: "policy" },
]
