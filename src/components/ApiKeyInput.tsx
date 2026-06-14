"use client"

import { useState } from "react"
import { getApiKey, setApiKey } from "@/lib/store"

export default function ApiKeyInput() {
  const [key, setKey] = useState(getApiKey())
  const [saved, setSaved] = useState(!!getApiKey())

  const handleSave = () => {
    if (!key.trim()) return
    setApiKey(key.trim())
    setSaved(true)
  }

  if (saved) return null

  return (
    <div className="mb-8 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-950/30">
      <p className="mb-2 text-sm font-medium text-amber-800 dark:text-amber-200">
        Enter your OpenAI API key to enable AI formatting. Your key is stored
        locally in your browser and never sent to our server.
      </p>
      <div className="flex gap-2">
        <input
          type="password"
          value={key}
          onChange={(e) => {
            setKey(e.target.value)
            setSaved(false)
          }}
          placeholder="sk-..."
          className="flex-1 rounded-md border border-amber-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 dark:border-amber-700 dark:bg-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleSave}
          disabled={!key.trim()}
          className="rounded-md bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save
        </button>
      </div>
    </div>
  )
}
