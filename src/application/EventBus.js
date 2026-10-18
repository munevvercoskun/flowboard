/**
 * A minimal in-process publish/subscribe bus -- the Observer pattern.
 *
 * Services publish domain events here; observers (ActivityLog, Notifier)
 * subscribe. The services never call the observers directly, which is what keeps
 * the write path and the side-effects (logging, notifications) decoupled: you
 * can add or remove an observer without touching a single service. See the
 * "Event-driven style" section of docs/ARCHITECTURE.md.
 */
export class EventBus {
  #handlers = []; // { type: string | '*', fn }

  /** Subscribe to one event type, or '*' for all of them. */
  subscribe(type, fn) {
    this.#handlers.push({ type, fn });
    return () => {
      this.#handlers = this.#handlers.filter((h) => h.fn !== fn);
    };
  }

  /** Publish an event. Observer errors are isolated so one bad observer can't
   *  break the operation or the other observers. */
  async publish(event) {
    const matches = this.#handlers.filter((h) => h.type === '*' || h.type === event.type);
    await Promise.all(matches.map(async ({ fn }) => {
      try {
        await fn(event);
      } catch (err) {
        console.error(`[eventbus] observer error on ${event.type}: ${err.message}`);
      }
    }));
  }
}
