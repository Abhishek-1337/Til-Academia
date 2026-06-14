"use client"

import { useState } from "react"
import type { Til } from "@/lib/store"

interface TilCardProps {
  til: Til
  onDelete: (id: string) => void
}

export default function TilCard({ til, onDelete }: TilCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [showRaw, setShowRaw] = useState(false)

  const date = new Date(til.createdAt).toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })

  const handleDelete = () => {
    if (!window.confirm("Delete this TIL?")) return
    setDeleting(true)
    onDelete(til.id)
  }

  if (deleting) return null

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div className="mb-3 flex items-start justify-between gap-4">
        <time className="shrink-0 text-xs text-gray-500 dark:text-gray-400">
          {date}
        </time>
        <div className="flex gap-2">
          <button
            onClick={() => setShowRaw(!showRaw)}
            className="text-xs text-gray-400 underline hover:text-gray-600 dark:hover:text-gray-300"
          >
            {showRaw ? "Hide raw" : "Show raw"}
          </button>
          <button
            onClick={handleDelete}
            className="text-xs text-red-400 underline hover:text-red-600"
          >
            Delete
          </button>
        </div>
      </div>

      {showRaw && (
        <pre className="mb-3 rounded bg-gray-100 p-3 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
          {til.raw}
        </pre>
      )}

      <div
        className="prose prose-sm max-w-none dark:prose-invert [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:bg-gray-100 [&_pre]:p-3 [&_pre]:text-sm dark:[&_pre]:bg-gray-800 [&_code]:rounded [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-sm [&_code]:font-mono dark:[&_code]:bg-gray-800"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(til.formatted) }}
      />
    </div>
  )
}

function renderMarkdown(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")

  html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_, lang, code) => {
    const langClass = lang ? ` class="language-${lang}"` : ""
    return `<pre${langClass}><code>${code.trim()}</code></pre>`
  })

  html = html.replace(
    /`([^`]+)`/g,
    '<code class="bg-gray-100 dark:bg-gray-800 rounded px-1 py-0.5 text-sm font-mono">$1</code>'
  )

  html = html.replace(/^### (.+)$/gm, "<h3 class='text-base font-semibold mt-4 mb-2'>$1</h3>")
  html = html.replace(/^## (.+)$/gm, "<h2 class='text-lg font-semibold mt-5 mb-2'>$1</h2>")
  html = html.replace(/^\*\*(.+?)\*\*$/gm, "<strong>$1</strong>")
  html = html.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")

  html = html.replace(/^- (.+)$/gm, "<li class='ml-4 list-disc'>$1</li>")

  html = html.replace(/\n\n/g, "</p><p class='mb-2 leading-relaxed'>")
  html = "<p class='mb-2 leading-relaxed'>" + html + "</p>"

  return html
}
