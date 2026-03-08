"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useAuth } from "@/context/AuthContext"
import { useViewAs } from "@/context/ViewAsContext"
import { useGovernance } from "@/context/GovernanceContext"
import { canManage } from "@/lib/permissions"
import { sanitizeGovernanceHtml, highlightTextInHtml } from "@/lib/sanitize-html"
import { ROUTES } from "@/routes/routenames"
import { PdfViewer } from "@/components/governance/PdfViewer"
import { ArrowLeft, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"

export default function GovernanceDocumentPage() {
  const params = useParams()
  const id = typeof params.id === "string" ? params.id : ""
  const { currentUser, currentOrganizationId } = useAuth()
  const { viewAsPosition } = useViewAs()
  const { getDocument, getPdfUrl, markLegalReview } = useGovernance()
  const [inDocSearch, setInDocSearch] = useState("")

  const canManageGovernance =
    currentUser && canManage(currentUser.role, "governance", viewAsPosition)
  const doc = useMemo(() => {
    const d = getDocument(id)
    return d && d.organizationId === currentOrganizationId ? d : null
  }, [getDocument, id, currentOrganizationId])

  const pdfUrl = useMemo(() => getPdfUrl(id) ?? doc?.sourcePdfUrl ?? null, [getPdfUrl, id, doc?.sourcePdfUrl])

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

  const safeHtml = doc.contentHtml
    ? sanitizeGovernanceHtml(doc.contentHtml)
    : ""
  const displayHtml =
    safeHtml && inDocSearch.trim()
      ? sanitizeGovernanceHtml(highlightTextInHtml(safeHtml, inDocSearch.trim()))
      : safeHtml
  const lastReviewFormatted =
    doc.lastLegalReviewAt &&
    format(new Date(doc.lastLegalReviewAt), "MMM d, yyyy")

  const showPdf = !!pdfUrl
  const showHtml = !showPdf && !!safeHtml

  return (
    <div className="mx-auto max-w-7xl p-6">
      <Button variant="link" asChild className="mb-4 gap-1.5 p-0">
        <Link href={ROUTES.GOVERNANCE} style={{ color: "var(--primary)" }}>
          <ArrowLeft className="size-4 shrink-0" />
          Back to Governance
        </Link>
      </Button>

      <header className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
              {doc.title}
            </h1>
            {doc.lastLegalReviewAt && lastReviewFormatted && (
              <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
                Last reviewed by Legal Counsel on {lastReviewFormatted}
                {doc.lastLegalReviewBy ? "" : "."}
              </p>
            )}
          </div>
          {canManageGovernance && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => currentUser && markLegalReview(doc.id, currentUser.id)}
            >
              Mark as reviewed
            </Button>
          )}
        </div>
      </header>

      {showPdf && pdfUrl && (
        <>
          <div className="relative mb-4 max-w-md">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
            <Input
              placeholder="Search in this document…"
              value={inDocSearch}
              onChange={(e) => setInDocSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <PdfViewer url={pdfUrl} className="mt-4" searchQuery={inDocSearch} />
        </>
      )}

      {showHtml && (
        <>
          <div className="relative mb-4 max-w-md">
            <Search
              className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
            <Input
              placeholder="Search in this document..."
              value={inDocSearch}
              onChange={(e) => setInDocSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <article
            className="prose max-w-none dark:prose-invert [&_mark]:bg-primary/20 [&_mark]:rounded [&_mark]:px-0.5"
            style={{ color: "var(--foreground)" }}
            dangerouslySetInnerHTML={{ __html: displayHtml }}
          />
        </>
      )}

      {!showPdf && !showHtml && (
        <p style={{ color: "var(--muted-foreground)" }}>
          No content available for this document.
        </p>
      )}
    </div>
  )
}
