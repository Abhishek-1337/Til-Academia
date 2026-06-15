"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { deleteTil, getTils } from "@/lib/store"
import type { Til } from "@/lib/store"
import TilCard from "./TilCard"

interface TilListProps {
  refreshKey: number
  selectedTopic: string | null
  onTilsChange: (tils: Til[]) => void
}

export default function TilList({ refreshKey, selectedTopic, onTilsChange }: TilListProps) {
  const [tils, setTils] = useState<Til[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const all = await getTils()
      setTils(all)
      onTilsChange(all)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [onTilsChange])

  useEffect(() => {
    load()
  }, [load, refreshKey])

  const filtered = useMemo(() => {
    return selectedTopic ? tils.filter((t) => t.tags.includes(selectedTopic)) : tils
  }, [selectedTopic, tils])

  const handleDelete = async (id: string) => {
    try {
      await deleteTil(id)
      setTils((prev) => {
        const next = prev.filter((t) => t.id !== id)
        onTilsChange(next)
        return next
      })
    } catch {
      // ignore
    }
  }

  if (loading) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        Loading...
      </p>
    )
  }

  if (tils.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No entries saved yet.
      </p>
    )
  }

  if (filtered.length === 0) {
    return (
      <p className="py-8 text-center text-sm text-gray-400 dark:text-gray-500">
        No entries with topic &ldquo;{selectedTopic}&rdquo;.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
        {selectedTopic ? (
          <>
            <span className="text-gray-400 font-normal">Topic: </span>
            {selectedTopic}
            <span className="ml-2 text-sm font-normal text-gray-400">
              ({filtered.length})
            </span>
          </>
        ) : (
          <>Saved TILs ({filtered.length})</>
        )}
      </h2>
      {filtered.map((til) => (
        <TilCard key={til.id} til={til} onDelete={handleDelete} />
      ))}
    </div>
  )
}
