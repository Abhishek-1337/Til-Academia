"use client"

import { useState } from "react"
import type { Til } from "@/lib/store"

interface SidebarProps {
  tils: Til[]
  selectedTopic: string | null
  onSelectTopic: (topic: string | null) => void
}

export default function Sidebar({ tils, selectedTopic, onSelectTopic }: SidebarProps) {
  const [query, setQuery] = useState("")

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
              onSelectTopic(null)
              setQuery("")
            }}
            className={`relative flex w-full items-center gap-2 px-3 py-1.5 text-left text-sm transition-colors ${
              selectedTopic === null
                ? "text-blue-700 dark:text-blue-300"
                : "text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-200"
            }`}
          >
            {selectedTopic === null && (
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
        <div className="mb-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter topics..."
            className="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:placeholder:text-gray-500"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => {
              onSelectTopic(null)
              setQuery("")
            }}
            className={`rounded-lg px-3 py-1.5 text-sm ${
              selectedTopic === null
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
