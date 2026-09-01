export type Channel = "in_app" | "web_push" | "line" | "telegram" | "email"

export interface SendPayload {
  userId: string
  title: string
  body?: string
}

export interface SendResult {
  channel: Channel
  status: "sent" | "failed"
  id: string
}

export class InAppProvider {
  async send(payload: SendPayload): Promise<SendResult> {
    return { channel: "in_app", status: "sent", id: `inapp-${Date.now()}` }
  }
}

export class WebPushProvider {
  async send(payload: SendPayload): Promise<SendResult> {
    return { channel: "web_push", status: "sent", id: `push-${Date.now()}` }
  }
}

export class LineProvider {
  async send(payload: SendPayload): Promise<SendResult> {
    // stub - real would call LINE Messaging API
    return { channel: "line", status: "sent", id: `line-${Date.now()}` }
  }
}

export class TelegramProvider {
  async send(payload: SendPayload): Promise<SendResult> {
    // stub - real would call Telegram Bot API
    return { channel: "telegram", status: "sent", id: `tg-${Date.now()}` }
  }
}

export class NotificationProvider {
  private providers: Record<Channel, { send: (p: SendPayload) => Promise<SendResult> }> = {
    in_app: new InAppProvider(),
    web_push: new WebPushProvider(),
    line: new LineProvider(),
    telegram: new TelegramProvider(),
    email: { send: async () => ({ channel: "email" as Channel, status: "sent" as const, id: `email-${Date.now()}` }) },
  }

  async send(channel: Channel, payload: SendPayload): Promise<SendResult> {
    const provider = this.providers[channel]
    if (!provider) throw new Error(`Unknown channel ${channel}`)
    return provider.send(payload)
  }
}

export class DeliveryLog {
  private logs: { channel: Channel; status: string; title: string }[] = []

  add(entry: { channel: Channel; status: string; title: string }) {
    this.logs.push(entry)
  }

  count(): number {
    return this.logs.length
  }

  byChannel(channel: Channel): typeof this.logs {
    return this.logs.filter((l) => l.channel === channel)
  }
}
