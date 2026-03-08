"use client"

import * as React from "react"
import { mockGovernanceDocuments } from "@/data/mock"
import type { GovernanceDocument } from "@/types"

const STORAGE_KEY = "seva_governance_documents"
const OVERRIDES_KEY = "seva_governance_overrides"

type LegalReviewOverride = Pick<GovernanceDocument, "lastLegalReviewAt" | "lastLegalReviewBy">

type GovernanceContextValue = {
  /** All documents: mock + custom (from uploads / localStorage). */
  documents: GovernanceDocument[]
  addDocument: (doc: GovernanceDocument) => void
  updateDocument: (id: string, updates: Partial<GovernanceDocument>) => void
  getDocument: (id: string) => GovernanceDocument | null
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

export function GovernanceProvider({ children }: { children: React.ReactNode }) {
  const [customDocuments, setCustomDocuments] = React.useState<GovernanceDocument[]>(loadCustomDocuments)
  const [overrides, setOverrides] = React.useState<Record<string, LegalReviewOverride>>(loadOverrides)

  React.useEffect(() => {
    setCustomDocuments(loadCustomDocuments())
    setOverrides(loadOverrides())
  }, [])

  const documents = React.useMemo(() => {
    const base = [...mockGovernanceDocuments, ...customDocuments]
    return base.map((d) => (overrides[d.id] ? { ...d, ...overrides[d.id] } : d))
  }, [customDocuments, overrides])

  const addDocument = React.useCallback((doc: GovernanceDocument) => {
    setCustomDocuments((prev) => {
      if (prev.some((d) => d.id === doc.id)) return prev
      const next = [...prev, doc]
      saveCustomDocuments(next)
      return next
    })
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
