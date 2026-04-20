"use client"

import { useMemo, useState, useCallback } from "react"
import Link from "next/link"
import { useAuth } from "@/context/AuthContext"
import { useViewAs } from "@/context/ViewAsContext"
import { useGovernance } from "@/context/GovernanceContext"
import { canManage } from "@/lib/permissions"
import { ROUTES } from "@/routes/routenames"
import { ChevronRight, FileText, Search, Upload } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { GovernanceDocument, GovernanceDocumentType } from "@/types"

function documentTypeLabel(type?: GovernanceDocumentType): string {
  switch (type) {
    case "constitution":
      return "Constitution"
    case "bylaws":
      return "By-laws"
    case "policy":
      return "Policy"
    case "other":
      return "Document"
    default:
      return "Document"
  }
}

async function fileToBase64(file: File): Promise<string | undefined> {
  const ab = await file.arrayBuffer()
  if (ab.byteLength > (2 * 1024 * 1024 * 3) / 4) return undefined
  const bytes = new Uint8Array(ab)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return typeof btoa !== "undefined" ? btoa(binary) : undefined
}

export default function GovernancePage() {
  const { currentUser, currentOrganizationId } = useAuth()
  const { viewAsPosition } = useViewAs()
  const { documents: allDocuments, addDocument } = useGovernance()
  const [search, setSearch] = useState("")
  const [uploadOpen, setUploadOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [pendingFile, setPendingFile] = useState<File | null>(null)
  const [fileInputKey, setFileInputKey] = useState(0)

  const canManageGovernance =
    currentUser && canManage(currentUser.role, "governance", viewAsPosition)

  const orgDocuments = useMemo(
    () => allDocuments.filter((d) => d.organizationId === currentOrganizationId),
    [allDocuments, currentOrganizationId]
  )

  const documents = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return orgDocuments
    return orgDocuments.filter((d) => d.title.toLowerCase().includes(q))
  }, [orgDocuments, search])

  const resetUploadForm = useCallback(() => {
    setTitle("")
    setPendingFile(null)
    setFileInputKey((k) => k + 1)
    setUploadError(null)
    setUploading(false)
  }, [])

  function handleUploadOpenChange(open: boolean) {
    setUploadOpen(open)
    if (!open) resetUploadForm()
  }

  async function handleAddDocument(e: React.FormEvent) {
    e.preventDefault()
    const file = pendingFile
    if (!file || !currentOrganizationId) {
      setUploadError("Choose a PDF file.")
      return
    }
    const trimmedTitle = title.trim()
    if (!trimmedTitle) {
      setUploadError("Enter a document title.")
      return
    }
    setUploadError(null)
    setUploading(true)
    try {
      const pdfBase64 = await fileToBase64(file)
      const docId = `doc-upload-${Date.now()}`
      const doc: GovernanceDocument = {
        id: docId,
        organizationId: currentOrganizationId,
        title: trimmedTitle,
        type: "other" as GovernanceDocumentType,
      }
      addDocument(doc, pdfBase64)
      resetUploadForm()
      if (!pdfBase64) {
        setUploadError("File is too large to save locally (max ~1.5 MB). Try a smaller PDF.")
        return
      }
      setUploadOpen(false)
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : "Upload failed.")
    } finally {
      setUploading(false)
    }
  }

  const isSearchMiss = search.trim().length > 0 && documents.length === 0
  const isEmptyOrg = orgDocuments.length === 0 && !search.trim()

  return (
    <div className="mx-auto max-w-7xl p-6">
      <h1 className="text-2xl font-semibold" style={{ color: "var(--primary)" }}>
        Governance
      </h1>
      <p className="mt-1" style={{ color: "var(--muted-foreground)" }}>
        Official documents for members to read and download.
      </p>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-3">
          <div className="relative max-w-md min-w-[200px] flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2"
              style={{ color: "var(--muted-foreground)" }}
            />
            <Input
              placeholder="Search by title…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {orgDocuments.length > 0 && (
            <span className="text-sm tabular-nums" style={{ color: "var(--muted-foreground)" }}>
              {documents.length === orgDocuments.length
                ? `${orgDocuments.length} document${orgDocuments.length === 1 ? "" : "s"}`
                : `${documents.length} of ${orgDocuments.length}`}
            </span>
          )}
        </div>
        {canManageGovernance && (
          <Button type="button" className="gap-2 shrink-0" onClick={() => setUploadOpen(true)}>
            <Upload className="size-4" />
            Add document
          </Button>
        )}
      </div>

      <div className="mt-8">
        {documents.length > 0 ? (
          <ul className="grid list-none gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {documents.map((doc) => (
              <li key={doc.id}>
                <Link
                  href={`${ROUTES.GOVERNANCE}/${doc.id}`}
                  className="group block h-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 rounded-2xl"
                >
                  <Card
                    size="sm"
                    className={cn(
                      "h-full gap-0 py-0 border transition-all duration-200",
                      "hover:shadow-md hover:ring-primary/15",
                      "group-hover:border-primary/20"
                    )}
                    style={{ borderColor: "var(--border)" }}
                  >
                    <div className="flex h-full flex-col gap-3 px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div
                          className="flex size-11 shrink-0 items-center justify-center rounded-xl transition-colors group-hover:bg-primary/10"
                          style={{ backgroundColor: "var(--muted)" }}
                        >
                          <FileText
                            className="size-5 transition-colors group-hover:text-[var(--primary)]"
                            style={{ color: "var(--muted-foreground)" }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p
                            className="line-clamp-2 font-semibold leading-snug transition-colors group-hover:text-[var(--primary)]"
                            style={{ color: "var(--foreground)" }}
                          >
                            {doc.title}
                          </p>
                          <Badge variant="secondary" className="mt-2 text-xs font-normal">
                            {documentTypeLabel(doc.type)}
                          </Badge>
                        </div>
                        <ChevronRight
                          className="size-5 shrink-0 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100"
                          style={{ color: "var(--primary)" }}
                          aria-hidden
                        />
                      </div>
                      <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                        View or download PDF
                      </p>
                    </div>
                  </Card>
                </Link>
              </li>
            ))}
          </ul>
        ) : isSearchMiss ? (
          <div
            className="rounded-2xl border border-dashed bg-muted/30 px-6 py-12 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <Search className="mx-auto size-10 opacity-40" style={{ color: "var(--muted-foreground)" }} />
            <p className="mt-3 font-medium" style={{ color: "var(--foreground)" }}>
              No matches
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--muted-foreground)" }}>
              Try a different search term or clear the filter.
            </p>
            <Button type="button" variant="link" className="mt-2 h-auto p-0 text-sm" onClick={() => setSearch("")}>
              Clear search
            </Button>
          </div>
        ) : isEmptyOrg ? (
          <div
            className="rounded-2xl border border-dashed p-10 text-center"
            style={{ borderColor: "var(--border)" }}
          >
            <div
              className="mx-auto mb-4 flex size-14 items-center justify-center rounded-2xl shadow-sm"
              style={{
                background: "linear-gradient(145deg, var(--muted) 0%, color-mix(in oklch, var(--primary) 12%, transparent) 100%)",
              }}
            >
              <FileText className="size-7" style={{ color: "var(--primary)" }} />
            </div>
            <p className="text-lg font-semibold" style={{ color: "var(--primary)" }}>
              No documents yet
            </p>
            <p className="mx-auto mt-2 max-w-sm text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
              When documents are added, they will appear here for everyone in your organisation.
            </p>
            {canManageGovernance && (
              <Button type="button" className="mt-6 gap-2" onClick={() => setUploadOpen(true)}>
                <Upload className="size-4" />
                Add document
              </Button>
            )}
          </div>
        ) : null}
      </div>

      {canManageGovernance && (
        <AlertDialog open={uploadOpen} onOpenChange={handleUploadOpenChange}>
          <AlertDialogContent className="max-w-lg sm:max-w-lg">
            <form id="gov-upload-form" onSubmit={handleAddDocument}>
              <AlertDialogHeader>
                <AlertDialogTitle>Add document</AlertDialogTitle>
                <AlertDialogDescription>
                  Enter a title and choose a PDF. Members can open it from this list.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="grid gap-4 py-2">
                <div className="space-y-2">
                  <Label htmlFor="gov-doc-title">Title</Label>
                  <Input
                    id="gov-doc-title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Constitution 2024"
                    disabled={uploading}
                    maxLength={200}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gov-doc-file">PDF file</Label>
                  <Input
                    id="gov-doc-file"
                    key={fileInputKey}
                    type="file"
                    accept=".pdf,application/pdf"
                    disabled={uploading}
                    className="cursor-pointer"
                    onChange={(e) => setPendingFile(e.target.files?.[0] ?? null)}
                  />
                </div>
                {uploadError && (
                  <p className="text-sm text-red-600 dark:text-red-400">{uploadError}</p>
                )}
                <p className="text-xs" style={{ color: "var(--muted-foreground)" }}>
                  PDFs under ~1.5 MB are saved in this browser for next visit; larger files can be viewed until you leave
                  the page.
                </p>
              </div>
              <AlertDialogFooter>
                <AlertDialogCancel type="button" disabled={uploading}>
                  Cancel
                </AlertDialogCancel>
                <Button type="submit" disabled={uploading}>
                  {uploading ? "Uploading…" : "Upload"}
                </Button>
              </AlertDialogFooter>
            </form>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  )
}
