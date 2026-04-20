"use client"

import * as React from "react"
import { ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"

type PdfViewerProps = {
  url: string
  className?: string
}

export function PdfViewer({ url, className }: PdfViewerProps) {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)

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
        for (let i = 1; i <= n; i++) {
          if (cancelled) return
          const page = await pdf.getPage(i)
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
          wrapper.appendChild(label)
          wrapper.appendChild(canvas)
          container.appendChild(wrapper)
        }
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
      <div className="mb-4 flex flex-wrap items-center justify-end gap-2">
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
      <div ref={containerRef} className="flex flex-col items-center" />
    </div>
  )
}
