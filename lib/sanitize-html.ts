import DOMPurify from "isomorphic-dompurify"

const ALLOWED_TAGS = [
  "p",
  "h1",
  "h2",
  "h3",
  "h4",
  "ul",
  "ol",
  "li",
  "strong",
  "em",
  "a",
  "br",
  "mark",
]

/**
 * Sanitize HTML for governance document content. Only allows safe tags and href for links.
 */
export function sanitizeGovernanceHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR: ["href"],
  ADD_ATTR: ["target"], // allow target="_blank" for external links if needed
})
}

/**
 * Wrap every occurrence of `query` in text portions of `html` with <mark>.
 * Does not match inside tag names or attributes. Escapes regex special chars in query.
 */
export function highlightTextInHtml(html: string, query: string): string {
  const q = query.trim()
  if (!q) return html
  const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  const re = new RegExp(`(<[^>]+>)|(${escaped})`, "gi")
  return html.replace(re, (_, tag, text) => (tag != null ? tag : text != null ? `<mark>${text}</mark>` : ""))
}
