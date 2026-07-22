"use client"

import { useState, useCallback, useEffect } from "react"
import ApiKeyInput from "@/components/ApiKeyInput"
import TilForm from "@/components/TilForm"
import BrowseView from "@/components/BrowseView"
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

  const selectedTil = selectedTilId ? allTils.find((t) => t.id === selectedTilId) ?? null : null
  const editingTil = editingTilId ? allTils.find((t) => t.id === editingTilId) ?? null : null

  const [showNewMenu, setShowNewMenu] = useState(false)

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
        <div className="relative">
          <button
            onClick={() => setShowNewMenu(!showNewMenu)}
            className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            New TIL
          </button>
          {showNewMenu && (
            <div className="absolute right-0 top-full z-50 mt-1 w-56 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
              <button
                onClick={() => { handleCreateNew("raw"); setShowNewMenu(false) }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <svg className="h-4 w-4 shrink-0 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <div className="font-medium">AI Parse</div>
                  <div className="text-xs text-gray-400">Paste raw notes, get formatted Markdown</div>
                </div>
              </button>
              <div className="border-t border-gray-100 dark:border-gray-800" />
              <button
                onClick={() => { handleCreateNew("manual"); setShowNewMenu(false) }}
                className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <svg className="h-4 w-4 shrink-0 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <div>
                  <div className="font-medium">Manual Entry</div>
                  <div className="text-xs text-gray-400">Write with the rich text editor</div>
                </div>
              </button>
            </div>
          )}
        </div>
        <AuthButton />
      </header>

      <div className="lg:ml-64">
        <Sidebar
          tils={allTils}
          selectedTilId={selectedTilId}
          selectedTopic={selectedTopic}
          query={query}
          onSelectTil={handleSelectTil}
          onSelectTopic={handleSelectTopic}
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
                    {selectedTil.topic.name}
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
        ) : (
          <BrowseView tils={allTils} onSelectTil={handleSelectTil} />
        )}
      </main>
      </div>
    </div>
  )
}
