/**
 * OBSERVER: keeps an in-memory feed of everything that has happened on the
 * boards, by subscribing to every event ('*'). The services don't know this
 * exists -- that's the decoupling the event bus buys. Exposed read-only through
 * the /activity endpoint.
 */
export class ActivityLog {
  #entries = [];

  constructor(eventBus, limit = 200) {
    this.limit = limit;
    eventBus.subscribe('*', (event) => this.record(event));
  }

  record(event) {
    this.#entries.unshift({ type: event.type, at: event.at, detail: event.payload });
    if (this.#entries.length > this.limit) this.#entries.pop();
  }

  recent(n = 50) {
    return this.#entries.slice(0, n);
  }
}
