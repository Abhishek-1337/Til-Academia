export interface Til {
  id: string
  raw: string
  formatted: string
  tags: string[]
  createdAt: number
}

export function getTils(): Til[] {
  if (typeof window === "undefined") return []
  try {
    const data = localStorage.getItem("tils")
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function saveTil(til: Til) {
  const tils = getTils()
  tils.unshift(til)
  localStorage.setItem("tils", JSON.stringify(tils))
}

export function deleteTil(id: string) {
  const tils = getTils().filter((t) => t.id !== id)
  localStorage.setItem("tils", JSON.stringify(tils))
}

export function getApiKey(): string {
  if (typeof window === "undefined") return ""
  return localStorage.getItem("openai_key") || ""
}

export function setApiKey(key: string) {
  localStorage.setItem("openai_key", key)
}
