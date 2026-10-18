/**
 * PORT: a place notifications can be sent. The Notifier observer fans board
 * events out to every channel configured in the composition root, so adding
 * Slack/email later means writing one adapter -- no change to the services or
 * the event bus. See ADR-0003.
 */
export class NotificationChannel {
  /** @param {string} message @returns {Promise<void>} */
  async send(_message) { throw new Error('not implemented'); }
}
