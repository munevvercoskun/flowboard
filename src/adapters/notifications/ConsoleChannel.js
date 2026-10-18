import { NotificationChannel } from '../../ports/NotificationChannel.js';

/** ADAPTER: prints notifications to stdout. The default channel. */
export class ConsoleChannel extends NotificationChannel {
  async send(message) {
    console.log(`[notify] ${message}`);
  }
}
