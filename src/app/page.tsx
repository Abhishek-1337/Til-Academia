"use client"

import { useState, useCallback } from "react"
import ApiKeyInput from "@/components/ApiKeyInput"
import TilForm from "@/components/TilForm"
import TilList from "@/components/TilList"
import Sidebar, { ALL_TOPICS } from "@/components/Sidebar"
import type { Til } from "@/lib/store"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [allTils, setAllTils] = useState<Til[]>([])
  const [composingMode, setComposingMode] = useState<"raw" | "manual" | null>(null)

  const handleTilsChange = useCallback((tils: Til[]) => {
    setAllTils(tils)
  }, [])

  const handleCreateNew = useCallback((mode: "raw" | "manual") => {
    setComposingMode(mode)
  }, [])

  const handleFormSaved = useCallback(() => {
    setRefreshKey((k) => k + 1)
    setComposingMode(null)
  }, [])

  const showAll = selectedTopic === ALL_TOPICS
  const showFiltered = selectedTopic && selectedTopic !== ALL_TOPICS

  return (
    <div className="lg:ml-64">
      <Sidebar
        tils={allTils}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
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
        ) : showFiltered || showAll ? (
          <TilList
            refreshKey={refreshKey}
            selectedTopic={showAll ? null : selectedTopic}
            onTilsChange={handleTilsChange}
          />
        ) : (
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
              Capture and organize your daily learnings. Use the sidebar to browse
              entries by topic or click &ldquo;New TIL&rdquo; to create one.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <button
                onClick={() => setComposingMode("manual")}
                className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
              >
                Create your first TIL
              </button>
              {allTils.length > 0 && (
                <button
                  onClick={() => setSelectedTopic(ALL_TOPICS)}
                  className="rounded-lg border border-gray-300 bg-white px-5 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
                >
                  Browse all entries ({allTils.length})
                </button>
              )}
            </div>
            {allTils.length > 0 && (
              <p className="mt-6 text-sm text-gray-400 dark:text-gray-500">
                Or select a topic from the sidebar to filter entries.
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
