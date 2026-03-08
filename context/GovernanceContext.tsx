"use client"

import * as React from "react"
import { mockGovernanceDocuments } from "@/data/mock"
import type { GovernanceDocument } from "@/types"

const STORAGE_KEY = "seva_governance_documents"
const OVERRIDES_KEY = "seva_governance_overrides"
const PDF_BLOBS_KEY = "seva_governance_pdf_blobs"
const MAX_PDF_BASE64_SIZE = 2 * 1024 * 1024 // 2MB for localStorage

type LegalReviewOverride = Pick<GovernanceDocument, "lastLegalReviewAt" | "lastLegalReviewBy">

type GovernanceContextValue = {
  documents: GovernanceDocument[]
  addDocument: (doc: GovernanceDocument, pdfBase64?: string) => void
  updateDocument: (id: string, updates: Partial<GovernanceDocument>) => void
  getDocument: (id: string) => GovernanceDocument | null
  /** Blob URL for viewing uploaded PDF (from stored base64 or in-session). */
  getPdfUrl: (docId: string) => string | null
  markLegalReview: (id: string, userId: string) => void
}

const GovernanceContext = React.createContext<GovernanceContextValue | null>(null)

function loadCustomDocuments(): GovernanceDocument[] {
  if (typeof window === "undefined") return []
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as GovernanceDocument[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function loadOverrides(): Record<string, LegalReviewOverride> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(OVERRIDES_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, LegalReviewOverride>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function saveCustomDocuments(docs: GovernanceDocument[]) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(docs))
  } catch {
    // ignore
  }
}

function saveOverrides(overrides: Record<string, LegalReviewOverride>) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(OVERRIDES_KEY, JSON.stringify(overrides))
  } catch {
    // ignore
  }
}

function loadPdfBlobs(): Record<string, string> {
  if (typeof window === "undefined") return {}
  try {
    const raw = window.localStorage.getItem(PDF_BLOBS_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as Record<string, string>
    return parsed && typeof parsed === "object" ? parsed : {}
  } catch {
    return {}
  }
}

function savePdfBlobs(blobs: Record<string, string>) {
  if (typeof window === "undefined") return
  try {
    window.localStorage.setItem(PDF_BLOBS_KEY, JSON.stringify(blobs))
  } catch {
    // ignore
  }
}

function base64ToBlobUrl(base64: string): string {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  const blob = new Blob([bytes], { type: "application/pdf" })
  return URL.createObjectURL(blob)
}

export function GovernanceProvider({ children }: { children: React.ReactNode }) {
  const [customDocuments, setCustomDocuments] = React.useState<GovernanceDocument[]>(loadCustomDocuments)
  const [overrides, setOverrides] = React.useState<Record<string, LegalReviewOverride>>(loadOverrides)
  const [pdfBlobUrls, setPdfBlobUrls] = React.useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {}
    const blobs = loadPdfBlobs()
    const urls: Record<string, string> = {}
    for (const [id, b64] of Object.entries(blobs)) {
      try {
        urls[id] = base64ToBlobUrl(b64)
      } catch {
        // skip invalid
      }
    }
    return urls
  })

  React.useEffect(() => {
    setCustomDocuments(loadCustomDocuments())
    setOverrides(loadOverrides())
    const blobs = loadPdfBlobs()
    setPdfBlobUrls((prev) => {
      const next = { ...prev }
      for (const [id, b64] of Object.entries(blobs)) {
        if (!next[id]) {
          try {
            next[id] = base64ToBlobUrl(b64)
          } catch {
            // skip
          }
        }
      }
      return next
    })
  }, [])

  const documents = React.useMemo(() => {
    const base = [...mockGovernanceDocuments, ...customDocuments]
    return base.map((d) => (overrides[d.id] ? { ...d, ...overrides[d.id] } : d))
  }, [customDocuments, overrides])

  const addDocument = React.useCallback((doc: GovernanceDocument, pdfBase64?: string) => {
    setCustomDocuments((prev) => {
      if (prev.some((d) => d.id === doc.id)) return prev
      const next = [...prev, doc]
      saveCustomDocuments(next)
      return next
    })
    if (pdfBase64 && pdfBase64.length <= MAX_PDF_BASE64_SIZE) {
      try {
        const url = base64ToBlobUrl(pdfBase64)
        setPdfBlobUrls((prev) => ({ ...prev, [doc.id]: url }))
        savePdfBlobs({ ...loadPdfBlobs(), [doc.id]: pdfBase64 })
      } catch {
        // ignore
      }
    }
  }, [])

  const updateDocument = React.useCallback((id: string, updates: Partial<GovernanceDocument>) => {
    setCustomDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === id)
      if (idx === -1) return prev
      const next = prev.slice()
      next[idx] = { ...next[idx], ...updates }
      saveCustomDocuments(next)
      return next
    })
  }, [])

  const getDocument = React.useCallback(
    (id: string) => documents.find((d) => d.id === id) ?? null,
    [documents]
  )

  const getPdfUrl = React.useCallback(
    (docId: string) => pdfBlobUrls[docId] ?? null,
    [pdfBlobUrls]
  )

  const markLegalReview = React.useCallback((id: string, userId: string) => {
    const now = new Date().toISOString()
    const update: LegalReviewOverride = { lastLegalReviewAt: now, lastLegalReviewBy: userId }
    setCustomDocuments((prev) => {
      const idx = prev.findIndex((d) => d.id === id)
      if (idx !== -1) {
        const next = prev.slice()
        next[idx] = { ...next[idx], ...update }
        saveCustomDocuments(next)
        return next
      }
      return prev
    })
    setOverrides((prev) => {
      const next = { ...prev, [id]: update }
      saveOverrides(next)
      return next
    })
  }, [])

  const value: GovernanceContextValue = {
    documents,
    addDocument,
    updateDocument,
    getDocument,
    getPdfUrl,
    markLegalReview,
  }

  return (
    <GovernanceContext.Provider value={value}>{children}</GovernanceContext.Provider>
  )
}

export function useGovernance() {
  const ctx = React.useContext(GovernanceContext)
  if (!ctx) throw new Error("useGovernance must be used within GovernanceProvider")
  return ctx
}
