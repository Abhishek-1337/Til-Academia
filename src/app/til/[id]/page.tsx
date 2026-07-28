"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { getTil } from "@/lib/store"
import { renderMarkdownToHtml } from "@/lib/markdown"
import type { Til } from "@/lib/store"

export default function TilPage() {
  const { id } = useParams<{ id: string }>()
  const [til, setTil] = useState<Til | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    setError(false)
    getTil(id)
      .then(setTil)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">Loading...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white dark:bg-gray-900">
        <p className="text-gray-500 dark:text-gray-400">TIL not found</p>
        <Link href="/" className="text-sm text-blue-500 underline hover:text-blue-700">
          Back to home
        </Link>
      </div>
    )
  }

  if (!til) return null

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100">
            &larr; Today I Learned
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-12">
        <article className="px-0 sm:px-4">
          <header className="mb-8">
            {til.title && (
              <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                {til.title}
              </h1>
            )}
            {til.topic && (
              <span className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                {til.topic.name}
              </span>
            )}
            <time className="text-sm text-gray-500 dark:text-gray-400">
              {new Date(til.createdAt).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </time>
            {til.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {til.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </header>
          <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-p:leading-relaxed [&_pre]:overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: renderMarkdownToHtml(til.formatted),
              }}
            />
          </div>
          {til.raw && (
            <details className="mt-12">
              <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                Show raw input
              </summary>
              <pre className="mt-2 rounded-lg bg-gray-100 p-4 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                {til.raw}
              </pre>
            </details>
          )}
        </article>
      </main>
    </div>
  )
}
