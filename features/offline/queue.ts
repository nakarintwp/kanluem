export type Mutation = {
  id?: string
  type: "create" | "update" | "delete"
  table: string
  payload: Record<string, unknown>
  retries?: number
}

export class MutationQueue {
  private queue: Mutation[] = []

  enqueue(mutation: Mutation): void {
    this.queue.push({ ...mutation, id: mutation.id || `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, retries: 0 })
  }

  dequeue(): Mutation | undefined {
    return this.queue.shift()
  }

  peek(): Mutation | undefined {
    return this.queue[0]
  }

  count(): number {
    return this.queue.length
  }

  retry(mutation: Mutation): void {
    this.queue.push({ ...mutation, retries: (mutation.retries || 0) + 1 })
  }

  clear(): void {
    this.queue = []
  }

  all(): Mutation[] {
    return [...this.queue]
  }
}
