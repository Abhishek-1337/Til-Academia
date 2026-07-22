"use client"

import { useState, useRef, useEffect } from "react"

interface Topic {
  id: string
  name: string
}

interface TopicComboboxProps {
  value: { id?: string; name: string } | null
  onChange: (topic: { id?: string; name: string } | null) => void
}

export default function TopicCombobox({ value, onChange }: TopicComboboxProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState(value?.name ?? "")
  const [topics, setTopics] = useState<Topic[]>([])
  const [loading, setLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setSearch(value?.name ?? "")
  }, [value])

  useEffect(() => {
    if (!open) return
    setLoading(true)
    const controller = new AbortController()
    fetch(`/api/topics?q=${encodeURIComponent(search)}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setTopics(data))
      .catch(() => {})
      .finally(() => setLoading(false))
    return () => controller.abort()
  }, [search, open])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const filtered = search
    ? topics.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()))
    : topics

  const exactMatch = filtered.some((t) => t.name.toLowerCase() === search.toLowerCase())

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={search}
        onChange={(e) => {
          const val = e.target.value
          setSearch(val)
          onChange(val ? { name: val } : null)
          if (!open) setOpen(true)
        }}
        onFocus={() => setOpen(true)}
        placeholder="Search or create a topic..."
        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
      />
      {open && (
        <div
          ref={dropdownRef}
          className="absolute left-0 top-full z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-900"
        >
          {loading ? (
            <div className="px-3 py-2 text-sm text-gray-400">Loading...</div>
          ) : (
            <>
              {filtered.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => {
                    onChange({ id: topic.id, name: topic.name })
                    setSearch(topic.name)
                    setOpen(false)
                  }}
                  className={`flex w-full items-center px-3 py-2 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-800 ${
                    value?.id === topic.id
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200"
                      : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <span className="capitalize">{topic.name}</span>
                </button>
              ))}
              {search && !exactMatch && (
                <button
                  onClick={() => {
                    onChange({ name: search.trim().toLowerCase() })
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-800"
                >
                  <svg className="h-4 w-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                  Create &ldquo;{search.trim().toLowerCase()}&rdquo;
                </button>
              )}
              {!search && !loading && topics.length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-400">Type to create a new topic</div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}
