"use client"

import { useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useGovernance } from "@/context/GovernanceContext"
import { ROUTES } from "@/routes/routenames"
import { PdfViewer } from "@/components/governance/PdfViewer"
import { ArrowLeft, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GovernanceDocumentPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  const { currentOrganizationId } = useAuth()
  const { getDocument, getPdfUrl } = useGovernance()

  const doc = useMemo(() => {
    const d = getDocument(id)
    return d && d.organizationId === currentOrganizationId ? d : null
  }, [getDocument, id, currentOrganizationId])

  const pdfUrl = useMemo(
    () => getPdfUrl(id) ?? doc?.sourcePdfUrl ?? null,
    [getPdfUrl, id, doc?.sourcePdfUrl]
  )

  if (!doc) {
    return (
      <div className="mx-auto max-w-7xl p-6">
        <p style={{ color: "var(--muted-foreground)" }}>Document not found.</p>
        <Button variant="link" asChild className="mt-2 gap-1.5 p-0">
          <Link href={ROUTES.GOVERNANCE}>
            <ArrowLeft className="size-4 shrink-0" />
            Back to Governance
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Button variant="link" asChild className="mb-4 gap-1.5 p-0">
        <Link href={ROUTES.GOVERNANCE} style={{ color: "var(--primary)" }}>
          <ArrowLeft className="size-4 shrink-0" />
          Back to Governance
        </Link>
      </Button>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
          {doc.title}
        </h1>
        {pdfUrl && (
          <Button variant="outline" size="sm" className="gap-1.5" asChild>
            <a href={pdfUrl} download={`${doc.title.replace(/[/\\?%*:|"<>]/g, "-")}.pdf`}>
              <Download className="size-4" />
              Download PDF
            </a>
          </Button>
        )}
      </header>

      {pdfUrl ? (
        <PdfViewer url={pdfUrl} className="mt-2" />
      ) : (
        <p className="rounded-lg border p-6 text-sm" style={{ borderColor: "var(--border)", color: "var(--muted-foreground)" }}>
          No PDF is attached to this document yet. Ask General Legal Counsel to upload the file from the Governance list page.
        </p>
      )}
    </div>
  )
}
