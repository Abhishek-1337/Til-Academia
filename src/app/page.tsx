"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import ApiKeyInput from "@/components/ApiKeyInput"
import TilForm from "@/components/TilForm"
import TilList from "@/components/TilList"
import Sidebar from "@/components/Sidebar"
import { deleteTil, getTils } from "@/lib/store"
import { renderMarkdownToHtml } from "@/lib/markdown"
import type { Til } from "@/lib/store"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTilId, setSelectedTilId] = useState<string | null>(null)
  const [allTils, setAllTils] = useState<Til[]>([])
  const [composingMode, setComposingMode] = useState<"raw" | "manual" | null>(null)

  const loadTils = useCallback(async () => {
    try {
      const tils = await getTils()
      setAllTils(tils)
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTils()
  }, [loadTils, refreshKey])

  const handleCreateNew = useCallback((mode: "raw" | "manual") => {
    setComposingMode(mode)
    setSelectedTilId(null)
  }, [])

  const handleFormSaved = useCallback(() => {
    setRefreshKey((k) => k + 1)
    setComposingMode(null)
    setSelectedTilId(null)
  }, [])

  const handleSelectTil = useCallback((id: string | null) => {
    setSelectedTilId(id)
    setComposingMode(null)
  }, [])

  const handleDeleteTil = useCallback(async (id: string) => {
    try {
      await deleteTil(id)
      setAllTils((prev) => prev.filter((t) => t.id !== id))
      if (selectedTilId === id) {
        setSelectedTilId(null)
      }
    } catch {
      // ignore
    }
  }, [selectedTilId])

  const sortedTils = useMemo(() => {
    return [...allTils].sort((a, b) => b.createdAt - a.createdAt)
  }, [allTils])

  const selectedTil = selectedTilId ? allTils.find((t) => t.id === selectedTilId) ?? null : null

  return (
    <div className="lg:ml-64">
      <Sidebar
        tils={allTils}
        selectedTilId={selectedTilId}
        onSelectTil={handleSelectTil}
        onCreateNew={handleCreateNew}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        {composingMode ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                New TIL
              </h2>
              <button
                onClick={() => setComposingMode(null)}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
            <ApiKeyInput />
            <TilForm
              key={composingMode}
              initialMode={composingMode}
              onSaved={handleFormSaved}
            />
          </>
        ) : selectedTil ? (
          <article className="px-0 sm:px-4">
            <div className="mb-8 flex items-center justify-between">
              <button
                onClick={() => setSelectedTilId(null)}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to all
              </button>
              <button
                onClick={() => handleDeleteTil(selectedTil.id)}
                className="text-xs text-red-400 underline hover:text-red-600"
              >
                Delete
              </button>
            </div>

            <header className="mb-8">
              <time className="text-sm text-gray-500 dark:text-gray-400">
                {new Date(selectedTil.createdAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </time>
              {selectedTil.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {selectedTil.tags.map((tag) => (
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

            <div
              className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-p:leading-relaxed [&_pre]:overflow-x-auto"
              dangerouslySetInnerHTML={{
                __html: renderMarkdownToHtml(selectedTil.formatted),
              }}
            />

            {selectedTil.raw && (
              <details className="mt-12">
                <summary className="cursor-pointer text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                  Show raw input
                </summary>
                <pre className="mt-2 rounded-lg bg-gray-100 p-4 text-xs text-gray-600 dark:bg-gray-800 dark:text-gray-400">
                  {selectedTil.raw}
                </pre>
              </details>
            )}
          </article>
        ) : sortedTils.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-6 rounded-full bg-blue-50 p-4 dark:bg-blue-900/30">
              <svg
                className="h-10 w-10 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={1.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
              Today I Learned
            </h1>
            <p className="mt-3 max-w-md text-base text-gray-500 dark:text-gray-400">
              Capture and organize your daily learnings. Click &ldquo;New TIL&rdquo;
              to create your first entry.
            </p>
            <button
              onClick={() => setComposingMode("manual")}
              className="mt-8 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              Create your first TIL
            </button>
          </div>
        ) : (
          <TilList
            refreshKey={refreshKey}
            selectedTopic={null}
            onTilsChange={loadTils}
          />
        )}
      </main>
    </div>
  )
}
