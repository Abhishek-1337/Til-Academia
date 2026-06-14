"use client"

import { useState, type KeyboardEvent } from "react"

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
}

export default function TagInput({ tags, onChange }: TagInputProps) {
  const [input, setInput] = useState("")

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase().replace(/^#/, "")
    if (tag && !tags.includes(tag)) {
      onChange([...tags, tag])
    }
    setInput("")
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      addTag(input)
    }
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onChange(tags.slice(0, -1))
    }
  }

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag))
  }

  return (
    <div className="rounded-lg border border-gray-300 bg-white px-3 py-2 focus-within:ring-2 focus-within:ring-blue-400 dark:border-gray-600 dark:bg-gray-900">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((tag) => (
          <span
            key={tag}
            className="flex items-center gap-1 rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900 dark:text-blue-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100"
            >
              &times;
            </button>
          </span>
        ))}
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={() => addTag(input)}
          placeholder={tags.length === 0 ? "Add topics (press Enter or comma)" : ""}
          className="min-w-[120px] flex-1 border-0 bg-transparent py-0.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none dark:text-gray-100 dark:placeholder-gray-500"
        />
      </div>
    </div>
  )
}
