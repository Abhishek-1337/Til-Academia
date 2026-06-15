"use client"

import { useState } from "react"
import type { Til } from "@/lib/store"
import { renderMarkdownToHtml } from "@/lib/markdown"

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

      <div className="mt-1 rounded-xl bg-gray-50 p-4 dark:bg-gray-900">
        <div
          className="prose prose-sm max-w-none dark:prose-invert prose-p:leading-relaxed [&_pre]:overflow-x-auto"
          dangerouslySetInnerHTML={{
            __html: renderMarkdownToHtml(til.formatted),
          }}
        />
      </div>
    </div>
  )
}

