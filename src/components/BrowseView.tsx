"use client"

import { useMemo } from "react"
import type { Til } from "@/lib/store"

interface BrowseViewProps {
  tils: Til[]
  onSelectTil: (id: string) => void
}

function normalizeTopic(topic: string | null | undefined): string {
  const t = (topic ?? "").trim().toLowerCase()
  return t || "miscellaneous"
}

export default function BrowseView({ tils, onSelectTil }: BrowseViewProps) {
  const sorted = useMemo(() => {
    return [...tils].sort((a, b) => b.createdAt - a.createdAt)
  }, [tils])

  const recentTils = useMemo(() => sorted.slice(0, 5), [sorted])

  const grouped = useMemo(() => {
    const map = new Map<string, Til[]>()
    for (const til of sorted) {
      const key = normalizeTopic(til.topic)
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(til)
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]))
  }, [sorted])

  const topics = useMemo(() => {
    return grouped.map(([topic]) => topic).sort()
  }, [grouped])

  if (tils.length === 0) {
    return null
  }

  return (
    <div className="prose prose-gray max-w-none dark:prose-invert">
      <h1>TIL</h1>
      <blockquote>
        <p>Today I Learned</p>
      </blockquote>
      <p>
        <strong>{tils.length} TIL{tils.length !== 1 ? "s" : ""} so far.</strong>
      </p>

      <hr />

      <h2>Recently Added/Updated TILs</h2>
      <ul>
        {recentTils.map((til) => (
          <li key={til.id}>
            <button
              onClick={() => onSelectTil(til.id)}
              className="text-left text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
            >
              {til.title || "Untitled"}
            </button>
          </li>
        ))}
      </ul>

      <hr />

      <h2>Categories</h2>
      <ul>
        {topics.map((topic) => (
          <li key={topic}>
            <a
              href={`#${topic}`}
              className="capitalize text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {topic}
            </a>
          </li>
        ))}
      </ul>

      <hr />

      {grouped.map(([topic, entries]) => (
        <div key={topic}>
          <h2 id={topic} className="capitalize">
            <a
              href={`#${topic}`}
              className="text-inherit no-underline hover:text-blue-600 dark:hover:text-blue-400"
            >
              {topic}
            </a>
          </h2>
          <ul>
            {entries.map((til) => (
              <li key={til.id}>
                <button
                  onClick={() => onSelectTil(til.id)}
                  className="text-left text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {til.title || "Untitled"}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  )
}
