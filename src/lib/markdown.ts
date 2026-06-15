import { marked } from "marked"
import DOMPurify from "dompurify"

// DOMPurify needs a DOM. On the server we fall back to a very small sanitizer
// (marked output is mostly trusted because content comes from our own editor/AI).
function domPurifyServerFallback(html: string) {
  // Remove script tags and inline event handlers.
  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/on\w+="[\s\S]*?"/gi, "")
}

export function renderMarkdownToHtml(markdown: string): string {
  const html = marked.parse(markdown) as string

  if (typeof window === "undefined") {
    return domPurifyServerFallback(html)
  }

  const purify = DOMPurify(window as any)
  return purify.sanitize(html)
}

