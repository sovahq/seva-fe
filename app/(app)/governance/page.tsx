"use client"

import { useMemo, useState, useRef } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useViewAs } from "@/context/ViewAsContext"
import { useGovernance } from "@/context/GovernanceContext"
import { canAccess, canManage } from "@/lib/permissions"
import { extractTextFromPdf } from "@/lib/pdf-to-html"
import { ROUTES } from "@/routes/routenames"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { GovernanceDocument, GovernanceDocumentType } from "@/types"

export default function GovernancePage() {
  const { currentUser, currentOrganizationId } = useAuth()
  const { viewAsPosition } = useViewAs()
  const { documents: allDocuments, addDocument } = useGovernance()
  const [search, setSearch] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canManageGovernance =
    currentUser && canManage(currentUser.role, "governance", viewAsPosition)
  const canAccessGovernance =
    currentUser && canAccess(currentUser.role, "governance", viewAsPosition)

  const orgDocuments = useMemo(
    () => allDocuments.filter((d) => d.organizationId === currentOrganizationId),
    [allDocuments, currentOrganizationId]
  )

  const pendingLegalReview = useMemo(() => {
    const oneYearAgo = new Date()
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)
    return orgDocuments.filter((d) => {
      if (!d.lastLegalReviewAt) return true
      return new Date(d.lastLegalReviewAt) < oneYearAgo
    })
  }, [orgDocuments])

  const documents = useMemo(() => {
    const list = orgDocuments
    const q = search.trim().toLowerCase()
    if (!q) return list
    return list.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.searchableText?.toLowerCase().includes(q) ?? false)
    )
  }, [orgDocuments, search])

  async function handlePdfUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !currentOrganizationId) return
    setUploadError(null)
    setUploading(true)
    try {
      const { searchableText } = await extractTextFromPdf(file)
      const title = file.name.replace(/\.pdf$/i, "") || "Untitled document"
      const docId = `doc-upload-${Date.now()}`
      let pdfBase64: string | undefined
      const ab = await file.arrayBuffer()
      // ~1.5MB so base64 fits in localStorage (2M chars)
      if (ab.byteLength <= (2 * 1024 * 1024 * 3) / 4) {
        const bytes = new Uint8Array(ab)
        let binary = ""
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
        pdfBase64 = typeof btoa !== "undefined" ? btoa(binary) : undefined
      }
      const doc: GovernanceDocument = {
        id: docId,
        organizationId: currentOrganizationId,
        title,
        type: "constitution" as GovernanceDocumentType,
        searchableText,
      }
      addDocument(doc, pdfBase64)
      if (fileInputRef.current) fileInputRef.current.value = ""
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Failed to parse PDF")
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Governance
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        Documents and policies.
      </p>

      {canManageGovernance && (
        <div className="mt-6">
          <label className="block text-sm font-medium" style={{ color: "var(--primary)" }}>
            Upload constitution (PDF)
          </label>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Input
              ref={fileInputRef}
              type="file"
              accept=".pdf,application/pdf"
              onChange={handlePdfUpload}
              disabled={uploading}
              className="max-w-xs cursor-pointer"
            />
            {uploading && (
              <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
                Parsing PDF…
              </span>
            )}
          </div>
          {uploadError && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{uploadError}</p>
          )}
          <p className="mt-1 text-xs" style={{ color: "var(--muted-foreground)" }}>
            The PDF is shown as-is. PDFs under ~1.5 MB are saved for the next visit; larger files are viewable this session only.
          </p>
        </div>
      )}

      {canAccessGovernance && orgDocuments.length > 0 && (
        <section className="mt-6 rounded-lg border p-4" style={{ borderColor: "var(--border)" }}>
          <h2 className="text-lg font-medium" style={{ color: "var(--primary)" }}>
            Legal review
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
            Constitution, bylaws, and key policies. Last reviewed dates for General Legal Counsel.
          </p>
          {pendingLegalReview.length > 0 && (
            <div className="mt-3">
              <h3 className="text-sm font-medium" style={{ color: "var(--primary)" }}>
                Pending legal review
              </h3>
              <ul className="mt-1 list-none space-y-1">
                {pendingLegalReview.map((d) => (
                  <li key={d.id}>
                    <Link
                      href={`${ROUTES.GOVERNANCE}/${d.id}`}
                      className="text-sm font-medium underline-offset-2 hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      {d.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {pendingLegalReview.length === 0 && orgDocuments.length > 0 && (
            <p className="mt-2 text-sm" style={{ color: "var(--muted-foreground)" }}>
              All listed documents have been reviewed in the last 12 months.
            </p>
          )}
        </section>
      )}

      <div className="relative mt-6 max-w-md">
        <Search
          className="absolute left-3 top-1/2 size-4 -translate-y-1/2"
          style={{ color: "var(--muted-foreground)" }}
        />
        <Input
          placeholder="Search by title or content..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <ul className="mt-4 list-none space-y-2">
        {documents.length === 0 ? (
          <li style={{ color: "var(--muted-foreground)" }}>
            {search.trim() ? "No documents match your search." : "No documents yet."}
          </li>
        ) : (
          documents.map((doc) => (
            <li key={doc.id}>
              <Link
                href={`${ROUTES.GOVERNANCE}/${doc.id}`}
                className="font-medium underline-offset-2 hover:underline"
                style={{ color: "var(--primary)" }}
              >
                {doc.title}
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  )
}
