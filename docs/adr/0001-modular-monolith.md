# ADR-0001 — Build FlowBoard as a modular monolith, not microservices

**Status:** accepted · **Date:** 2026-10

## Context
FlowBoard manages boards, columns and cards and reacts to changes (activity feed,
notifications). The obvious "modern" reflex is to split it into services — a board service,
a card service, a notification service — talking over HTTP or a message bus.

## Decision
Build it as a **single deployable** (one Node process, one container) with strong internal
module boundaries: a layered core (domain → application → HTTP) and ports-and-adapters for
anything that varies (storage, notifications).

## Why
- **The work is cohesive.** Boards, columns and cards are one consistency boundary — moving a
  card touches a board. Splitting that across services turns a local, atomic operation into a
  distributed transaction, which is strictly harder for no gain here.
- **Operational cost.** Microservices bring network latency, partial-failure handling, service
  discovery, and N deployment pipelines. A system this size shouldn't pay that.
- **The split is still available.** The module seams (the services and the ports) are exactly
  where you'd cut if one part later needed independent scaling. Modular monolith = monolith
  simplicity now, clean extraction later.

## Consequences
- (+) Simple to run, test and reason about; one `docker compose up`.
- (+) No distributed-systems failure modes to handle.
- (−) The whole app scales as one unit. *Mitigation:* the boundaries are drawn so a hot
  component (e.g. notifications) could be extracted behind its existing port without a rewrite.
- **Revisit when:** a single component needs independent scaling or an independent release
  cadence, or the team grows past the point where one deployable is a bottleneck.
