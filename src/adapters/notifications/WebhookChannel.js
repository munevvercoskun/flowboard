import { NotificationChannel } from '../../ports/NotificationChannel.js';

/**
 * ADAPTER: POSTs notifications to a webhook URL (e.g. a Slack incoming webhook).
 * Kept deliberately thin and failure-tolerant: a notification problem must never
 * break the board operation that triggered it, so send() swallows errors after
 * logging them. This is the "notifications are best-effort" decision from ADR-0003.
 */
export class WebhookChannel extends NotificationChannel {
  constructor(url) {
    super();
    this.url = url;
  }

  async send(message) {
    try {
      await fetch(this.url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ text: message }),
      });
    } catch (err) {
      console.error(`[webhook] delivery failed (ignored): ${err.message}`);
    }
  }
}
