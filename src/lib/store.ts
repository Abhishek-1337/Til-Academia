export interface Til {
  id: string
  title?: string | null
  topicId?: string | null
  topic?: { id: string; name: string } | null
  raw: string
  formatted: string
  tags: string[]
  createdAt: number
}

export interface Topic {
  id: string
  name: string
  createdAt: number
}

export async function getTils(topic?: string | null): Promise<Til[]> {
  const params = topic ? `?topic=${encodeURIComponent(topic)}` : ""
  const res = await fetch(`/api/tils${params}`)
  if (!res.ok) throw new Error("Failed to fetch TILs")
  return res.json()
}

export async function saveTil(data: {
  title?: string | null
  topicId?: string | null
  topicName?: string
  raw: string
  formatted: string
  tags: string[]
}): Promise<Til> {
  const res = await fetch("/api/tils", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to save TIL")
  return res.json()
}

export async function updateTil(
  id: string,
  data: {
    title?: string | null
    topicId?: string | null
    topicName?: string
    raw: string
    formatted: string
    tags: string[]
  }
): Promise<Til> {
  const res = await fetch(`/api/tils/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  })
  if (!res.ok) throw new Error("Failed to update TIL")
  return res.json()
}

export async function getTopics(q?: string): Promise<Topic[]> {
  const params = q ? `?q=${encodeURIComponent(q)}` : ""
  const res = await fetch(`/api/topics${params}`)
  if (!res.ok) throw new Error("Failed to fetch topics")
  return res.json()
}

export async function createTopic(name: string): Promise<Topic> {
  const res = await fetch("/api/topics", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  })
  if (!res.ok) throw new Error("Failed to create topic")
  return res.json()
}

export async function deleteTil(id: string): Promise<void> {
  const res = await fetch(`/api/tils/${id}`, { method: "DELETE" })
  if (!res.ok) throw new Error("Failed to delete TIL")
}

export function getApiKey(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("openai_key") || ""
}

export function setApiKey(key: string) {
  localStorage.setItem("openai_key", key)
}
