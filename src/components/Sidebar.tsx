"use client"

import { useState, useRef, useEffect, useMemo } from "react"
import type { Til } from "@/lib/store"

interface SidebarProps {
  tils: Til[]
  selectedTilId: string | null
  onSelectTil: (id: string | null) => void
  onCreateNew: (mode: "raw" | "manual") => void
}

const MS_PER_DAY = 86400000

function getDateLabel(timestamp: number): string {
  const now = new Date()
  const date = new Date(timestamp)
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const entry = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  const diff = Math.round((today.getTime() - entry.getTime()) / MS_PER_DAY)

  if (diff === 0) return "Today"
  if (diff === 1) return "Yesterday"
  if (diff < 7) return "This Week"
  if (diff < 14) return "Last Week"
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth()) return "This Month"
  return date.toLocaleDateString("en-US", { month: "long", year: "numeric" })
}

function getDateGroupOrder(label: string): number {
  const order: Record<string, number> = {
    "Today": 0,
    "Yesterday": 1,
    "This Week": 2,
    "Last Week": 3,
    "This Month": 4,
  }
  return order[label] ?? 5
}

const DATE_FILTERS = ["Today", "Yesterday", "This Week", "Last Week", "This Month"] as const
type DateFilter = (typeof DATE_FILTERS)[number] | "custom"

export default function Sidebar({ tils, selectedTilId, onSelectTil, onCreateNew }: SidebarProps) {
  const [query, setQuery] = useState("")
  const [dateFilter, setDateFilter] = useState<DateFilter | null>(null)
  const [customDate, setCustomDate] = useState("")
  const [showNewMenu, setShowNewMenu] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [isDark, setIsDark] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
  )
  const desktopMenuRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const datePickerRef = useRef<HTMLDivElement>(null)
  const mobileDatePickerRef = useRef<HTMLDivElement>(null)

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
      if (
        datePickerRef.current &&
        !datePickerRef.current.contains(target) &&
        mobileDatePickerRef.current &&
        !mobileDatePickerRef.current.contains(target)
      ) {
        setShowDatePicker(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const toggleTheme = () => {
    const next = !isDark
    setIsDark(next)
    document.documentElement.classList.toggle("dark", next)
    localStorage.setItem("theme", next ? "dark" : "light")
  }

  const sorted = useMemo(() => {
    return [...tils].sort((a, b) => b.createdAt - a.createdAt)
  }, [tils])

  const filtered = useMemo(() => {
    let result = sorted

    if (dateFilter === "custom" && customDate) {
      const target = new Date(customDate)
      result = result.filter((til) => {
        const t = new Date(til.createdAt)
        return (
          t.getFullYear() === target.getFullYear() &&
          t.getMonth() === target.getMonth() &&
          t.getDate() === target.getDate()
        )
      })
    } else if (dateFilter && dateFilter !== "custom") {
      result = result.filter((til) => getDateLabel(til.createdAt) === dateFilter)
    }

    if (!query) return result
    const q = query.toLowerCase()
    return result.filter((til) => {
      if (
        (til.title && til.title.toLowerCase().includes(q)) ||
        til.raw.toLowerCase().includes(q) ||
        til.formatted.toLowerCase().includes(q) ||
        til.tags.some((tag) => tag.toLowerCase().includes(q))
      ) return true

      const d = new Date(til.createdAt)
      const dateStrings = [
        getDateLabel(til.createdAt).toLowerCase(),
        d.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase(),
        d.toLocaleDateString("en-US", { weekday: "short" }).toLowerCase(),
        d.toLocaleDateString("en-US", { month: "long" }).toLowerCase(),
        d.toLocaleDateString("en-US", { month: "short" }).toLowerCase(),
        d.getDate().toString(),
        d.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase(),
        d.toLocaleDateString("en-US", { month: "long", day: "numeric" }).toLowerCase(),
        d.getFullYear().toString(),
      ]
      return dateStrings.some((s) => s.includes(q))
    })
  }, [query, dateFilter, customDate, sorted])

  const grouped = useMemo(() => {
    const groups = new Map<string, Til[]>()
    for (const til of filtered) {
      const label = getDateLabel(til.createdAt)
      if (!groups.has(label)) groups.set(label, [])
      groups.get(label)!.push(til)
    }
    return Array.from(groups.entries()).sort(
      (a, b) => getDateGroupOrder(a[0]) - getDateGroupOrder(b[0])
    )
  }, [filtered])

  return (
    <>
      <aside className="hidden h-screen w-64 shrink-0 overflow-y-auto border-r border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-950 lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:flex-col">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-4 dark:border-gray-800">
          <h1 className="text-base font-semibold text-gray-900 dark:text-gray-100">
            TIL Academia
          </h1>
          <button
            onClick={toggleTheme}
            className="rounded-md p-1.5 text-gray-500 hover:bg-gray-200 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
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
            placeholder="Filter TILs..."
            className="w-full rounded-md border-0 bg-white px-3 py-1.5 text-sm text-gray-900 shadow-sm ring-1 ring-gray-200 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:placeholder:text-gray-500"
          />
        </div>

        {!query && (
          <div className="border-b border-gray-100 px-3 py-2 dark:border-gray-800" ref={datePickerRef}>
            <div className="relative">
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                className="flex w-full items-center gap-2 rounded-md bg-white px-3 py-1.5 text-sm text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50 dark:bg-gray-900 dark:text-gray-300 dark:ring-gray-700 dark:hover:bg-gray-800"
              >
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="flex-1 text-left">
                  {dateFilter === "custom" && customDate
                    ? new Date(customDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                    : dateFilter ?? "All dates"}
                </span>
                <svg className={`h-4 w-4 text-gray-400 transition-transform ${showDatePicker ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showDatePicker && (
                <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                  <div className="mb-2 flex flex-wrap gap-1">
                    <button
                      onClick={() => { setDateFilter(null); setCustomDate(""); setShowDatePicker(false) }}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                        dateFilter === null
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      All
                    </button>
                    {DATE_FILTERS.map((f) => (
                      <button
                        key={f}
                        onClick={() => { setDateFilter(f); setCustomDate(""); setShowDatePicker(false) }}
                        className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                          dateFilter === f
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                            : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                        }`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                  <div className="border-t border-gray-100 pt-2 dark:border-gray-800">
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => { setCustomDate(e.target.value); setDateFilter(e.target.value ? "custom" : null) }}
                      className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <nav className="flex-1 overflow-y-auto px-3 py-2">
          {filtered.length === 0 ? (
            <p className="px-3 py-8 text-center text-sm text-gray-400 dark:text-gray-500">
              {query ? "No TILs match your filter." : "No entries saved yet."}
            </p>
          ) : (
            <div className="space-y-4">
              {grouped.map(([label, entries]) => (
                <div key={label}>
                  <h2 className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                    {label}
                  </h2>
                  <div className="space-y-0.5">
                    {entries.map((til) => {
                      const isSelected = selectedTilId === til.id

                      return (
                        <button
                          key={til.id}
                          onClick={() => { onSelectTil(til.id); setQuery(""); setShowNewMenu(false) }}
                          className={`relative flex w-full flex-col gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                            isSelected
                              ? "bg-blue-50 dark:bg-blue-900/30"
                              : "hover:bg-gray-100 dark:hover:bg-gray-800"
                          }`}
                        >
                          {isSelected && (
                            <span className="absolute inset-y-0 left-0 w-0.5 rounded-r-full bg-blue-600 dark:bg-blue-400" />
                          )}
                          <span className={`block truncate text-sm font-medium leading-snug ${
                            isSelected
                              ? "text-blue-800 dark:text-blue-200"
                              : "text-gray-800 dark:text-gray-200"
                          }`}>
                            {til.title || "Untitled"}
                          </span>
                          {til.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {til.tags.map((tag) => (
                                <span
                                  key={tag}
                                  className="inline-flex items-center rounded-full bg-gray-200 px-1.5 py-0.5 text-[10px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </nav>
      </aside>

      {/* mobile view */}
      <div className="mb-6 lg:hidden">
        <div className="mb-3 flex gap-2">
          <div className="flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 dark:border-gray-700 dark:bg-gray-900 flex-1">
            <svg className="h-4 w-4 shrink-0 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter TILs..."
              className="flex-1 border-0 bg-transparent py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder:text-gray-500"
            />
          </div>
          <button
            onClick={toggleTheme}
            className="rounded-lg border border-gray-200 bg-white p-2 text-gray-500 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 transition-colors"
            aria-label="Toggle theme"
          >
            {isDark ? (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>
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
        {!query && (
          <div className="relative mb-3" ref={mobileDatePickerRef}>
            <button
              onClick={() => setShowDatePicker(!showDatePicker)}
              className="flex w-full items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="flex-1 text-left">
                {dateFilter === "custom" && customDate
                  ? new Date(customDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
                  : dateFilter ?? "All dates"}
              </span>
              <svg className={`h-4 w-4 text-gray-400 transition-transform ${showDatePicker ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {showDatePicker && (
              <div className="absolute left-0 top-full z-30 mt-1 w-64 rounded-lg border border-gray-200 bg-white p-3 shadow-lg dark:border-gray-700 dark:bg-gray-900">
                <div className="mb-2 flex flex-wrap gap-1">
                  <button
                    onClick={() => { setDateFilter(null); setCustomDate(""); setShowDatePicker(false) }}
                    className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                      dateFilter === null
                        ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                        : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    All
                  </button>
                  {DATE_FILTERS.map((f) => (
                    <button
                      key={f}
                      onClick={() => { setDateFilter(f); setCustomDate(""); setShowDatePicker(false) }}
                      className={`rounded-md px-2 py-1 text-[11px] font-medium ${
                        dateFilter === f
                          ? "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300"
                          : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
                <div className="border-t border-gray-100 pt-2 dark:border-gray-800">
                  <input
                    type="date"
                    value={customDate}
                    onChange={(e) => { setCustomDate(e.target.value); setDateFilter(e.target.value ? "custom" : null) }}
                    className="w-full rounded-md border border-gray-200 bg-white px-3 py-1.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
                  />
                </div>
              </div>
            )}
          </div>
        )}
        {grouped.map(([label, entries]) => (
          <div key={label} className="mb-4">
            <h3 className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              {label}
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {entries.slice(0, 3).map((til) => {
                return (
                  <button
                    key={til.id}
                    onClick={() => onSelectTil(til.id)}
                    className={`rounded-lg px-3 py-1.5 text-sm ${
                      selectedTilId === til.id
                        ? "bg-blue-100 font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200"
                        : "text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
                    }`}
                  >
                    {til.title || "Untitled"}
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
