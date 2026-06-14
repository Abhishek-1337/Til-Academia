"use client"

import { useState, useCallback } from "react"
import { getApiKey, saveTil } from "@/lib/store"
import type { Til } from "@/lib/store"
import RichEditor from "./RichEditor"
import TagInput from "./TagInput"
import TurndownService from "turndown"

const turndown = new TurndownService({ headingStyle: "atx" })

interface TilFormProps {
  onSaved: () => void
}

type Mode = "raw" | "manual"

export default function TilForm({ onSaved }: TilFormProps) {
  const [mode, setMode] = useState<Mode>("raw")
  const [raw, setRaw] = useState("")
  const [html, setHtml] = useState("")
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [saved, setSaved] = useState(false)

  const handleAiSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!raw.trim()) return

    const apiKey = getApiKey()
    if (!apiKey) {
      setError("Please set your OpenAI API key first")
      return
    }

    setLoading(true)
    setError("")

    try {
      const res = await fetch("/api/format", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ raw: raw.trim(), apiKey }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || "Failed to format")
      }

      const til: Til = {
        id: crypto.randomUUID(),
        raw: raw.trim(),
        formatted: data.formatted,
        tags,
        createdAt: Date.now(),
      }

      saveTil(til)
      setRaw("")
      setTags([])
      onSaved()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleManualSave = useCallback(() => {
    if (!html.trim()) return

    const text = html.replace(/<[^>]*>/g, "").trim()
    if (!text) {
      setError("Please write something before saving")
      return
    }

    const markdown = turndown.turndown(html)

    const til: Til = {
      id: crypto.randomUUID(),
      raw: text,
      formatted: markdown,
      tags,
      createdAt: Date.now(),
    }

    saveTil(til)
    setHtml("")
    setTags([])
    setError("")
    onSaved()
  }, [html, tags, onSaved])

  return (
    <div className="mb-8">
      <div className="mb-4 flex gap-1 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
        <button
          type="button"
          onClick={() => setMode("raw")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "raw"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          AI Format
        </button>
        <button
          type="button"
          onClick={() => setMode("manual")}
          className={`flex-1 rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
            mode === "manual"
              ? "bg-white text-gray-900 shadow-sm dark:bg-gray-700 dark:text-gray-100"
              : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          }`}
        >
          Manual
        </button>
      </div>

      {mode === "raw" ? (
        <form onSubmit={handleAiSubmit}>
          <div className="mb-3">
            <label
              htmlFor="raw-input"
              className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
            >
              What did you learn today?
            </label>
            <textarea
              id="raw-input"
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder="Learned about creating a user in Linux... usermod -aG sudo john..."
              rows={5}
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>
          <div className="mb-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Topics
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
          {error && (
            <p className="mb-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="submit"
            disabled={loading || !raw.trim()}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Formatting..." : "Format & Save"}
          </button>
        </form>
      ) : (
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
            Write your TIL entry
          </label>
          <RichEditor content={html} onChange={setHtml} />
          <div className="mt-3">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Topics
            </label>
            <TagInput tags={tags} onChange={setTags} />
          </div>
          {error && (
            <p className="mt-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </p>
          )}
          <button
            type="button"
            onClick={handleManualSave}
            disabled={!html.replace(/<[^>]*>/g, "").trim()}
            className="mt-3 rounded-lg bg-green-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Save
          </button>
        </div>
      )}
    </div>
  )
}
