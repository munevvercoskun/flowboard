// Domain events. These are plain facts about things that have happened -- they
// carry no behaviour and no dependency on Express, the database, or notifications.
// The application layer publishes them; observers react. That one-way flow is what
// makes the notification/activity features event-driven instead of hard-wired into
// the services (see docs/ARCHITECTURE.md, "Event-driven style").

export const EventTypes = Object.freeze({
  BOARD_CREATED: 'board.created',
  COLUMN_ADDED: 'column.added',
  CARD_CREATED: 'card.created',
  CARD_MOVED: 'card.moved',
  CARD_ASSIGNED: 'card.assigned',
});

export function domainEvent(type, payload) {
  return Object.freeze({ type, payload, at: new Date().toISOString() });
}
