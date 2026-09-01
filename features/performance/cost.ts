export function estimateQueryCost(opts: { table: string; rows: number }): number {
  // Simple linear cost model — can be extended with indexes, joins, etc.
  return opts.rows
}

export class AICostLimiter {
  private spent = 0
  constructor(private budget: number) {}

  spend(amount: number): void {
    this.spent += amount
  }

  canAfford(amount: number): boolean {
    return this.spent + amount <= this.budget
  }

  remaining(): number {
    return this.budget - this.spent
  }

  reset(): void {
    this.spent = 0
  }
}
