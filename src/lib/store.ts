export interface Til {
  id: string
  raw: string
  formatted: string
  tags: string[]
  createdAt: number
}

export async function getTils(topic?: string | null): Promise<Til[]> {
  const params = topic ? `?topic=${encodeURIComponent(topic)}` : ""
  const res = await fetch(`/api/tils${params}`)
  if (!res.ok) throw new Error("Failed to fetch TILs")
  return res.json()
}

export async function saveTil(til: Omit<Til, "id" | "createdAt">): Promise<Til> {
  const res = await fetch("/api/tils", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(til),
  })
  if (!res.ok) throw new Error("Failed to save TIL")
  return res.json()
}

export async function updateTil(
  id: string,
  til: Omit<Til, "id" | "createdAt">
): Promise<Til> {
  const res = await fetch(`/api/tils/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(til),
  })
  if (!res.ok) throw new Error("Failed to update TIL")
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
