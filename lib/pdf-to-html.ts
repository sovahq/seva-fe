/**
 * Extract searchable text from a PDF file (browser only). Uses pdfjs-dist.
 * Use this for list/search; display the PDF itself via PdfViewer instead of converting to HTML.
 */
export async function extractTextFromPdf(file: File): Promise<{ searchableText: string }> {
  const pdfjsLib = await import("pdfjs-dist")
  if (typeof window !== "undefined" && !(pdfjsLib.GlobalWorkerOptions as { workerSrc?: string }).workerSrc) {
    ;(pdfjsLib.GlobalWorkerOptions as { workerSrc: string }).workerSrc =
      "/pdf.worker.min.mjs"
  }

  const data = await file.arrayBuffer()
  const pdf = await pdfjsLib.getDocument({ data }).promise
  const numPages = pdf.numPages
  const pageTexts: string[] = []

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i)
    const textContent = await page.getTextContent()
    const text = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ")
    pageTexts.push(text)
  }

  const fullText = pageTexts.join("\n\n")
  return { searchableText: fullText.replace(/\s+/g, " ").trim() }
}
