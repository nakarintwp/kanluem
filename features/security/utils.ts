export function sanitize(input: string): string {
  return input
    .replace(/<[^>]*>/g, "")
    .trim()
    .slice(0, 500)
}

export class RateLimiter {
  private store = new Map<string, { count: number; resetAt: number }>()
  constructor(private limit: number, private windowMs: number) {}

  allow(key: string): boolean {
    const now = Date.now()
    const entry = this.store.get(key)
    if (!entry || now > entry.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + this.windowMs })
      return true
    }
    if (entry.count < this.limit) {
      entry.count++
      return true
    }
    return false
  }

  reset(key: string): void {
    this.store.delete(key)
  }
}
