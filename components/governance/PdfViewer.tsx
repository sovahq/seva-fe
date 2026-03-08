"use client"

import * as React from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

type PdfViewerProps = {
  url: string
  className?: string
  /** When set, viewer finds pages containing this text and scrolls to the first match. */
  searchQuery?: string
}

export function PdfViewer({ url, className, searchQuery }: PdfViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [numPages, setNumPages] = React.useState<number>(0)
  const [pageTexts, setPageTexts] = React.useState<string[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPageTexts([])

    async function load() {
      try {
        const pdfjsLib = await import("pdfjs-dist")
        if (typeof window !== "undefined" && !(pdfjsLib.GlobalWorkerOptions as { workerSrc?: string }).workerSrc) {
          ;(pdfjsLib.GlobalWorkerOptions as { workerSrc: string }).workerSrc = "/pdf.worker.min.mjs"
        }
        const pdf = await pdfjsLib.getDocument({ url }).promise
        if (cancelled) return
        const n = pdf.numPages
        setNumPages(n)

        const container = containerRef.current
        if (!container) return

        container.innerHTML = ""
        const scale = 1.5
        const texts: string[] = []
        for (let i = 1; i <= n; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          const viewport = page.getViewport({ scale })
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) {
            texts.push("")
            continue
          }
          canvas.height = viewport.height
          canvas.width = viewport.width
          const renderContext = { canvasContext: ctx, viewport, canvas }
          const task = page.render(renderContext)
          await (task.promise ?? task)
          const textContent = await page.getTextContent()
          const pageText = textContent.items
            .map((item) => ("str" in item ? item.str : ""))
            .join(" ")
          texts.push(pageText)
          const wrapper = document.createElement("div")
          wrapper.className = "mb-4 flex flex-col items-center pdf-page-wrapper"
          wrapper.setAttribute("data-page-index", String(i))
          const label = document.createElement("p")
          label.className = "mb-1 text-xs"
          label.style.color = "var(--muted-foreground)"
          label.textContent = `Page ${i} of ${n}`
          wrapper.appendChild(label)
          wrapper.appendChild(canvas)
          container.appendChild(wrapper)
        }
        if (!cancelled) setPageTexts(texts)
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Failed to load PDF")
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [url])

  // When search query changes, scroll to first page that contains the text
  React.useEffect(() => {
    const q = searchQuery?.trim().toLowerCase()
    if (!q || !containerRef.current || pageTexts.length === 0) return
    const firstMatch = pageTexts.findIndex((text) => text.toLowerCase().includes(q))
    if (firstMatch === -1) return
    const pageNum = firstMatch + 1
    const el = containerRef.current.querySelector(`[data-page-index="${pageNum}"]`)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [searchQuery, pageTexts])

  if (error) {
    return (
      <div className={className}>
        <p className="text-sm" style={{ color: "var(--destructive)" }}>{error}</p>
        <Button variant="outline" size="sm" className="mt-2 gap-1.5" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            Open PDF in new tab
          </a>
        </Button>
      </div>
    )
  }

  const searchStatus = React.useMemo(() => {
    const q = searchQuery?.trim()
    if (!q || pageTexts.length === 0) return null
    const matchingPages = pageTexts
      .map((text, i) => (text.toLowerCase().includes(q.toLowerCase()) ? i + 1 : 0))
      .filter(Boolean)
    if (matchingPages.length === 0) return { type: "none" as const, query: q }
    return { type: "found" as const, query: q, pages: matchingPages }
  }, [searchQuery, pageTexts])

  return (
    <div className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
        {searchStatus?.type === "found" && (
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            Found on page {searchStatus.pages.length === 1 ? searchStatus.pages[0] : `${searchStatus.pages[0]} and ${searchStatus.pages.length - 1} more`}
          </span>
        )}
        {searchStatus?.type === "none" && searchStatus.query && (
          <span className="text-sm" style={{ color: "var(--muted-foreground)" }}>
            No matches for &quot;{searchStatus.query}&quot;
          </span>
        )}
        <Button variant="outline" size="sm" className="gap-1.5" asChild>
          <a href={url} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="size-4" />
            Open in new tab
          </a>
        </Button>
      </div>
      {loading && (
        <p className="py-8 text-center text-sm" style={{ color: "var(--muted-foreground)" }}>
          Loading PDF…
        </p>
      )}
      {/* Container always mounted so effect can append canvases when ref is available */}
      <div ref={containerRef} className="flex flex-col items-center" />
    </div>
  )
}
