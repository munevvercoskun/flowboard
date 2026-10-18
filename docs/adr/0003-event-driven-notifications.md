# ADR-0003 — Side-effects via an in-process event bus

**Status:** accepted · **Date:** 2026-10

## Context
Two features react to board changes: an activity feed, and notifications (console now, maybe
Slack later). The naive approach calls a logger and a notifier directly from inside every
service method. That couples the write path to every side-effect and makes the services grow
a new line each time a reaction is added.

## Decision
Services **publish domain events** to an in-process `EventBus` (the Observer pattern) after
each change. The `ActivityLog` and `Notifier` subscribe. Notifications are **best-effort**:
a failing channel logs and is swallowed, never breaking the operation that triggered it.

## Why
- **Decoupling.** A service's job is to change state and announce what happened; it shouldn't
  know who's listening. Adding the activity feed and notifications required *zero* changes to
  the services.
- **Open/closed for reactions.** A new reaction (metrics, an audit trail, a webhook) is a new
  subscriber — no existing code changes.
- **Resilience.** A broken webhook must not fail a card move; isolating observer errors in the
  bus guarantees that.

## Consequences
- (+) Services stay focused; reactions are added/removed independently.
- (+) Notification failures can't corrupt a write.
- (−) The flow is less linear to trace, and in-process events are lost if the process dies
  mid-handling. *Mitigation:* the bus is tiny and synchronous within a request; if durability
  is ever needed, the same publish points move to a real broker (Kafka/RabbitMQ) behind the
  same bus interface — a change at the edge, not in the services.
