export type AIProviderName = "mock" | "openai" | "anthropic" | "gemini"

export class AIProvider {
  constructor(public name: AIProviderName) {}

  async parse(text: string): Promise<{ raw: string; provider: string; parsed: unknown }> {
    const { parseSmartReminder } = await import("./parser")
    const parsed = parseSmartReminder(text)
    return { raw: text, provider: this.name, parsed }
  }

  // Abstraction allows switching provider without changing callers (Blueprint §2 AI)
  async switchProvider(name: AIProviderName): Promise<void> {
    this.name = name
  }
}
