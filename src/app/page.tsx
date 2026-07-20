"use client"

import { useState, useCallback, useEffect, useMemo } from "react"
import ApiKeyInput from "@/components/ApiKeyInput"
import TilForm from "@/components/TilForm"
import TilList from "@/components/TilList"
import Sidebar from "@/components/Sidebar"
import AuthButton from "@/components/AuthButton"
import { deleteTil, getTils } from "@/lib/store"
import { renderMarkdownToHtml } from "@/lib/markdown"
import type { Til } from "@/lib/store"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTilId, setSelectedTilId] = useState<string | null>(null)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [allTils, setAllTils] = useState<Til[]>([])
  const [composingMode, setComposingMode] = useState<"raw" | "manual" | null>(null)
  const [editingTilId, setEditingTilId] = useState<string | null>(null)
  const [apiKeyResetKey, setApiKeyResetKey] = useState(0)

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
    setEditingTilId(null)
    setSelectedTilId(null)
  }, [])

  const handleEditTil = useCallback((id: string) => {
    setEditingTilId(id)
    setComposingMode(null)
  }, [])

  const handleSelectTil = useCallback((id: string | null) => {
    setSelectedTilId(id)
    setComposingMode(null)
  }, [])

  const handleSelectTopic = useCallback((topic: string | null) => {
    setSelectedTopic(topic)
    if (topic) setSelectedTilId(null)
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
  const editingTil = editingTilId ? allTils.find((t) => t.id === editingTilId) ?? null : null

  return (
    <div>
      <header className="sticky top-0 z-40 flex items-center gap-4 border-b border-gray-200 bg-white/90 px-6 py-3 backdrop-blur dark:border-gray-800 dark:bg-gray-900/90 lg:ml-64">
        <div className="flex flex-1 justify-center px-4">
          <div className="relative w-full max-w-md">
            <svg className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter TILs..."
              className="w-full rounded-lg border-0 bg-gray-100 py-2 pl-9 pr-3 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500"
            />
          </div>
        </div>
        <AuthButton />
      </header>

      <div className="lg:ml-64">
        <Sidebar
          tils={allTils}
          selectedTilId={selectedTilId}
          selectedTopic={selectedTopic}
          query={query}
          onQueryChange={setQuery}
          onSelectTil={handleSelectTil}
          onSelectTopic={handleSelectTopic}
          onCreateNew={handleCreateNew}
        />
        <main className="mx-auto max-w-5xl px-4 py-12">
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
            <ApiKeyInput resetKey={apiKeyResetKey} />
            <TilForm
              key={composingMode}
              initialMode={composingMode}
              onSaved={handleFormSaved}
              onApiKeyError={() => setApiKeyResetKey((k) => k + 1)}
            />
          </>
        ) : editingTil ? (
          <>
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Edit TIL
              </h2>
              <button
                onClick={() => setEditingTilId(null)}
                className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                Cancel
              </button>
            </div>
            <TilForm
              key={editingTil.id}
              til={editingTil}
              onSaved={handleFormSaved}
            />
          </>
        ) : selectedTil ? (
          <article className="px-0 sm:px-4">
            <div className="mb-8 flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedTilId(null)
                  if (selectedTopic) setSelectedTopic(null)
                }}
                className="inline-flex items-center gap-1 text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Back to {selectedTopic ? selectedTopic : "all"}
              </button>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleEditTil(selectedTil.id)}
                  className="text-xs text-blue-500 underline hover:text-blue-700"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDeleteTil(selectedTil.id)}
                  className="text-xs text-red-400 underline hover:text-red-600"
                >
                  Delete
                </button>
              </div>
            </div>

              <header className="mb-8">
                {selectedTil.title && (
                  <h1 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    {selectedTil.title}
                  </h1>
                )}
                {selectedTil.topic && (
                  <span className="mb-3 inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium capitalize text-blue-700 dark:bg-blue-900 dark:text-blue-200">
                    {selectedTil.topic}
                  </span>
                )}
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

            <div className="rounded-xl bg-gray-50 p-6 dark:bg-gray-800">
              <div
                className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-semibold prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-p:leading-relaxed [&_pre]:overflow-x-auto"
                dangerouslySetInnerHTML={{
                  __html: renderMarkdownToHtml(selectedTil.formatted),
                }}
              />
            </div>

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
    </div>
  )
}
