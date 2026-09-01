export class OfflineCache {
  private store = new Map<string, unknown>()

  set(key: string, value: unknown): void {
    this.store.set(key, value)
    // also try localStorage for persistence
    try {
      if (typeof localStorage !== "undefined") localStorage.setItem(`kanluem:${key}`, JSON.stringify(value))
    } catch {}
  }

  get<T>(key: string): T | undefined {
    if (this.store.has(key)) return this.store.get(key) as T
    try {
      if (typeof localStorage !== "undefined") {
        const raw = localStorage.getItem(`kanluem:${key}`)
        if (raw) return JSON.parse(raw) as T
      }
    } catch {}
    return undefined
  }

  has(key: string): boolean {
    if (this.store.has(key)) return true
    try {
      if (typeof localStorage !== "undefined") return localStorage.getItem(`kanluem:${key}`) !== null
    } catch {}
    return false
  }

  delete(key: string): void {
    this.store.delete(key)
    try {
      if (typeof localStorage !== "undefined") localStorage.removeItem(`kanluem:${key}`)
    } catch {}
  }

  clear(): void {
    this.store.clear()
  }
}
