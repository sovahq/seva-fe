"use client"

import * as React from "react"
import { ExternalLink, Search, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type PdfViewerProps = {
  url: string
  className?: string
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
}

export function PdfViewer({ url, className }: PdfViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const searchInputRef = React.useRef<HTMLInputElement>(null)
  const matchElementsRef = React.useRef<HTMLElement[]>([])
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [pageTexts, setPageTexts] = React.useState<string[]>([])
  const [matchPages, setMatchPages] = React.useState<number[]>([])
  const [activeMatchIndex, setActiveMatchIndex] = React.useState(0)
  const [activePage, setActivePage] = React.useState<number | null>(null)
  const [totalMatches, setTotalMatches] = React.useState(0)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    setPageTexts([])
    setMatchPages([])
    setActiveMatchIndex(0)
    setActivePage(null)
    setTotalMatches(0)
    matchElementsRef.current = []

    async function load() {
      try {
        const pdfjsLib = await import("pdfjs-dist")
        if (typeof window !== "undefined" && !(pdfjsLib.GlobalWorkerOptions as { workerSrc?: string }).workerSrc) {
          ;(pdfjsLib.GlobalWorkerOptions as { workerSrc: string }).workerSrc = "/pdf.worker.min.mjs"
        }
        const pdf = await pdfjsLib.getDocument({ url }).promise
        if (cancelled) return
        const n = pdf.numPages

        const container = containerRef.current
        if (!container) return

        container.innerHTML = ""
        const scale = 1.5
        const extractedTexts: string[] = []
        for (let i = 1; i <= n; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
          const textContent = await page.getTextContent()
          const text = textContent.items
            .map((item) =>
              "str" in item ? String(item.str) : ""
            )
            .join(" ")
          extractedTexts.push(text)
          const viewport = page.getViewport({ scale })
          const canvas = document.createElement("canvas")
          const ctx = canvas.getContext("2d")
          if (!ctx) continue
          canvas.height = viewport.height
          canvas.width = viewport.width
          const renderContext = { canvasContext: ctx, viewport, canvas }
          const task = page.render(renderContext)
          await (task.promise ?? task)
          const wrapper = document.createElement("div")
          wrapper.className = "mb-4 flex flex-col items-center pdf-page-wrapper"
          wrapper.setAttribute("data-page-index", String(i))
          const label = document.createElement("p")
          label.className = "mb-1 text-xs"
          label.style.color = "var(--muted-foreground)"
          label.textContent = `Page ${i} of ${n}`
          const pageCanvasWrap = document.createElement("div")
          pageCanvasWrap.className = "relative"
          const textLayer = document.createElement("div")
          textLayer.className = "absolute inset-0 pointer-events-none pdf-text-layer"
          for (const item of textContent.items) {
            if (!("str" in item)) continue
            const raw = String(item.str ?? "")
            if (!raw.trim()) continue
            const transform = (pdfjsLib as { Util: { transform: (a: number[], b: number[]) => number[] } }).Util.transform(
              viewport.transform,
              item.transform as number[]
            )
            const span = document.createElement("span")
            span.className = "absolute whitespace-pre pdf-text-item"
            span.setAttribute("data-pdf-text", raw)
            span.innerHTML = escapeHtml(raw)
            span.style.left = `${transform[4]}px`
            span.style.top = `${transform[5]}px`
            span.style.fontSize = `${Math.max(10, Math.hypot(transform[2], transform[3]))}px`
            span.style.fontFamily = "sans-serif"
            span.style.color = "transparent"
            span.style.transform = "translateY(-100%)"
            textLayer.appendChild(span)
          }
          pageCanvasWrap.appendChild(canvas)
          pageCanvasWrap.appendChild(textLayer)
          wrapper.appendChild(label)
          wrapper.appendChild(pageCanvasWrap)
          container.appendChild(wrapper)
        }
        if (!cancelled) setPageTexts(extractedTexts)
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

  React.useEffect(() => {
    const query = searchQuery.trim().toLowerCase()
    if (!query) {
      setMatchPages([])
      setActiveMatchIndex(0)
      setActivePage(null)
      setTotalMatches(0)
      return
    }
    const matches: number[] = []
    pageTexts.forEach((pageText, i) => {
      if (pageText.toLowerCase().includes(query)) matches.push(i + 1)
    })
    setMatchPages(matches)
    setActiveMatchIndex(0)
    setActivePage(matches[0] ?? null)
  }, [searchQuery, pageTexts])

  React.useEffect(() => {
    if (!activePage || !containerRef.current) return
    const el = containerRef.current.querySelector<HTMLDivElement>(
      `[data-page-index="${activePage}"]`
    )
    if (!el) return
    el.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [activePage])

  React.useEffect(() => {
    if (!containerRef.current) return
    const wrappers = containerRef.current.querySelectorAll<HTMLDivElement>(
      ".pdf-page-wrapper"
    )
    wrappers.forEach((wrapper) => {
      const pageIndex = Number(wrapper.getAttribute("data-page-index"))
      if (activePage && pageIndex === activePage) {
        wrapper.classList.add("rounded-xl", "ring-2", "ring-primary/40")
      } else {
        wrapper.classList.remove("rounded-xl", "ring-2", "ring-primary/40")
      }
    })
  }, [activePage, pageTexts])

  React.useEffect(() => {
    if (!containerRef.current) return
    const textItems = containerRef.current.querySelectorAll<HTMLElement>(".pdf-text-item")
    const trimmed = searchQuery.trim()
    const regex = trimmed ? new RegExp(escapeRegExp(trimmed), "gi") : null
    const nextMatchElements: HTMLElement[] = []

    textItems.forEach((item) => {
      const source = item.getAttribute("data-pdf-text") ?? ""
      if (!regex || !source.trim()) {
        item.innerHTML = escapeHtml(source)
        return
      }
      let localCount = 0
      const html = escapeHtml(source).replace(regex, (matched) => {
        localCount += 1
        return `<mark class="pdf-mark rounded bg-yellow-300/85 px-0.5">${matched}</mark>`
      })
      item.innerHTML = html
      if (localCount > 0) {
        nextMatchElements.push(
          ...Array.from(item.querySelectorAll<HTMLElement>(".pdf-mark"))
        )
      }
    })

    matchElementsRef.current = nextMatchElements
    setTotalMatches(nextMatchElements.length)
    if (!trimmed || nextMatchElements.length === 0) {
      setActiveMatchIndex(0)
      return
    }
    setActiveMatchIndex((prev) =>
      prev >= 0 && prev < nextMatchElements.length ? prev : 0
    )
  }, [searchQuery, pageTexts])

  React.useEffect(() => {
    const matches = matchElementsRef.current
    matches.forEach((el) => el.classList.remove("ring-1", "ring-primary/60", "bg-primary/25"))
    if (matches.length === 0) return
    const idx = ((activeMatchIndex % matches.length) + matches.length) % matches.length
    const active = matches[idx]
    active.classList.add("ring-1", "ring-primary/60", "bg-primary/25")
    const pageWrapper = active.closest<HTMLElement>(".pdf-page-wrapper")
    const pageIndex = pageWrapper?.getAttribute("data-page-index")
    if (pageIndex) {
      setActivePage(Number(pageIndex))
    }
    active.scrollIntoView({ behavior: "smooth", block: "center" })
  }, [activeMatchIndex, totalMatches])

  React.useEffect(() => {
    function handleGlobalFind(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "f") {
        e.preventDefault()
        searchInputRef.current?.focus()
        searchInputRef.current?.select()
      }
    }
    window.addEventListener("keydown", handleGlobalFind)
    return () => window.removeEventListener("keydown", handleGlobalFind)
  }, [])

  function goToRelativeMatch(direction: 1 | -1) {
    if (totalMatches === 0) return
    const nextIndex =
      (activeMatchIndex + direction + totalMatches) % totalMatches
    setActiveMatchIndex(nextIndex)
  }

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

  return (
    <div className={className}>
      <div className="sticky top-0 z-20 mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border border-border bg-background/95 px-2 py-2 backdrop-blur-sm">
        <div className="flex min-w-[240px] flex-1 items-center gap-2">
          <Search className="size-4 shrink-0 text-muted-foreground" />
          <Input
            ref={searchInputRef}
            type="search"
            placeholder="Search in PDF…"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                goToRelativeMatch(e.shiftKey ? -1 : 1)
              }
            }}
            className="h-8"
          />
          <span className="min-w-20 text-xs text-muted-foreground">
            {searchQuery.trim()
              ? `${totalMatches === 0 ? 0 : activeMatchIndex + 1}/${totalMatches}`
              : "0/0"}
          </span>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => goToRelativeMatch(-1)}
            disabled={totalMatches === 0}
            aria-label="Previous match"
          >
            <ChevronUp className="size-4" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon-xs"
            onClick={() => goToRelativeMatch(1)}
            disabled={totalMatches === 0}
            aria-label="Next match"
          >
            <ChevronDown className="size-4" />
          </Button>
        </div>
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
      <div
        ref={containerRef}
        className="flex flex-col items-center"
      />
    </div>
  )
}
