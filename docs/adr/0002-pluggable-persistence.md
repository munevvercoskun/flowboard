# ADR-0002 — Persistence behind a repository port

**Status:** accepted · **Date:** 2026-10

## Context
The app needs to store boards. A prototype wants zero setup; a real deployment wants data to
survive a restart; later there may be a real database. Hard-coding any one of these into the
services would make the others a rewrite.

## Decision
Define a **`BoardRepository` port** (an abstract contract) that the application layer depends
on. Provide two adapters now — `InMemoryBoardRepository` and `JsonFileBoardRepository` — and
select one in the composition root via `PERSISTENCE=memory|file`.

## Why
- **The application layer shouldn't know how data is stored.** It calls `findById` / `save`;
  whether that's a Map, a file, or Postgres is an edge concern.
- **Swappability is the demonstrable property.** Changing storage is one line in `config.js`.
  A future `PostgresBoardRepository` is a new file, not a change to any service.
- **Testability** (see ADR and quality attributes): tests run against the in-memory adapter
  with no I/O.

## Consequences
- (+) Storage choice is configuration; tests are fast and isolated.
- (+) The path to a real database is clear and localised.
- (−) One extra layer of indirection and an interface to keep in sync. *Mitigation:* the port
  has three methods; the base class throws for any an adapter forgets, so drift fails loudly.
