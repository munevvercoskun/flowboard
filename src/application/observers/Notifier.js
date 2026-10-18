import { EventTypes } from '../../domain/events.js';

/**
 * OBSERVER: turns the events worth telling someone about into human messages and
 * fans them out to every configured NotificationChannel. Subscribes only to the
 * events that matter (not '*'), so adding a channel or changing the wording never
 * touches a service.
 */
export class Notifier {
  constructor(eventBus, channels = []) {
    this.channels = channels;
    eventBus.subscribe(EventTypes.CARD_CREATED, (e) =>
      this.#announce(`New card "${e.payload.title}" on board ${e.payload.boardId}`));
    eventBus.subscribe(EventTypes.CARD_MOVED, (e) =>
      this.#announce(`Card ${e.payload.cardId} moved to column ${e.payload.toColumnId}`));
    eventBus.subscribe(EventTypes.CARD_ASSIGNED, (e) =>
      this.#announce(`Card ${e.payload.cardId} assigned to ${e.payload.assignee}`));
  }

  async #announce(message) {
    await Promise.all(this.channels.map((ch) => ch.send(message)));
  }
}
