"use client"

import { useState, useCallback } from "react"
import ApiKeyInput from "@/components/ApiKeyInput"
import TilForm from "@/components/TilForm"
import TilList from "@/components/TilList"
import Sidebar from "@/components/Sidebar"
import type { Til } from "@/lib/store"

export default function Home() {
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
  const [allTils, setAllTils] = useState<Til[]>([])

  const handleTilsChange = useCallback((tils: Til[]) => {
    setAllTils(tils)
  }, [])

  return (
    <div className="lg:ml-64">
      <Sidebar
        tils={allTils}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
      />
      <main className="mx-auto max-w-3xl px-4 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Today I Learned
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Capture what you learn every day.
          </p>
        </header>

        <ApiKeyInput />
        <TilForm onSaved={() => setRefreshKey((k) => k + 1)} />
        <TilList
          refreshKey={refreshKey}
          selectedTopic={selectedTopic}
          onTilsChange={handleTilsChange}
        />
      </main>
    </div>
  )
}
