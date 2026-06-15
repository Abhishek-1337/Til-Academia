"use client"

import { useState, useRef, useEffect } from "react"
import type { Til } from "@/lib/store"

export const ALL_TOPICS = "__all__"

interface SidebarProps {
  tils: Til[]
  selectedTopic: string | null
  onSelectTopic: (topic: string | null) => void
  onCreateNew: (mode: "raw" | "manual") => void
}

export default function Sidebar({ tils, selectedTopic, onSelectTopic, onCreateNew }: SidebarProps) {
  const [query, setQuery] = useState("")
  const [showNewMenu, setShowNewMenu] = useState(false)
  const desktopMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node
      if (
        desktopMenuRef.current &&
        !desktopMenuRef.current.contains(target) &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(target)
      ) {
        setShowNewMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const topicCounts = new Map<string, number>()
  for (const til of tils) {
    for (const tag of til.tags) {
      topicCounts.set(tag, (topicCounts.get(tag) || 0) + 1)
    }
  }

  let topics = Array.from(topicCounts.entries()).sort((a, b) => b[1] - a[1])

  if (query) {
    const q = query.toLowerCase()
    topics = topics.filter(([topic]) => topic.includes(q))
  }

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
        <div className="border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            TIL Academia
          </h1>
        </div>

        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <div className="relative" ref={desktopMenuRef}>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="flex w-full items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              New TIL
            </button>
            {showNewMenu && (
              <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <button
                  onClick={() => { onCreateNew("raw"); setShowNewMenu(false) }}
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
                  onClick={() => { onCreateNew("manual"); setShowNewMenu(false) }}
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
        </div>

        <div className="border-b border-gray-100 px-4 py-3 dark:border-gray-800">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter topics..."
            className="w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500"
          />
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-3">
          <button
            onClick={() => {
              onSelectTopic(ALL_TOPICS)
              setQuery("")
              setShowNewMenu(false)
            }}
            className={`relative flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
              selectedTopic === ALL_TOPICS
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {selectedTopic === ALL_TOPICS && (
              <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-blue-600 dark:bg-blue-400" />
            )}
            All entries
            <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
              {tils.length}
            </span>
          </button>

          <div className="my-2 border-t border-gray-100 dark:border-gray-800" />

          {topics.map(([topic, count]) => (
            <button
              key={topic}
              onClick={() => {
                onSelectTopic(topic)
                setQuery("")
                setShowNewMenu(false)
              }}
              className={`relative flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
                selectedTopic === topic
                  ? "text-blue-700 dark:text-blue-300"
                  : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
              }`}
            >
              {selectedTopic === topic && (
                <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-blue-600 dark:bg-blue-400" />
              )}
              {topic}
              <span className="ml-auto text-xs text-gray-400 dark:text-gray-500">
                {count}
              </span>
            </button>
          ))}

          {query && topics.length === 0 && (
            <p className="px-3 py-4 text-center text-sm text-gray-400 dark:text-gray-500">
              No topics match &ldquo;{query}&rdquo;
            </p>
          )}
        </nav>
      </aside>

      {/* mobile topic bar */}
      <div className="mb-6 lg:hidden">
        <div className="mb-3 flex gap-2">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter topics..."
            className="flex-1 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
          <div className="relative" ref={mobileMenuRef}>
            <button
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </button>
            {showNewMenu && (
              <div className="absolute right-0 top-full z-20 mt-1 w-48 overflow-hidden rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <button
                  onClick={() => { onCreateNew("raw"); setShowNewMenu(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <svg className="h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  AI Parse
                </button>
                <div className="border-t border-gray-100 dark:border-gray-800" />
                <button
                  onClick={() => { onCreateNew("manual"); setShowNewMenu(false) }}
                  className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  <svg className="h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Manual Entry
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              onSelectTopic(ALL_TOPICS)
              setQuery("")
            }}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              selectedTopic === ALL_TOPICS
                ? "bg-blue-100 font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            All ({tils.length})
          </button>
          {topics.map(([topic, count]) => (
            <button
              key={topic}
              onClick={() => {
                onSelectTopic(topic)
                setQuery("")
              }}
              className={`rounded-lg px-3 py-1.5 text-sm ${
                selectedTopic === topic
                  ? "bg-blue-100 font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                  : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
              }`}
            >
              {topic} ({count})
            </button>
          ))}
        </div>
      </div>
    </>
  )
}
