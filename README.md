# FlowBoard — a Kanban API, built to show the architecture

A small task-board REST API (boards → columns → cards, with moves, assignments and an
activity feed) built in Node.js and Express. The features are ordinary on purpose — the
project is about **software design and architecture**, which is what COE 692 is actually
about.

> COE 692 — Software Design & Architecture. FlowBoard is a **modular monolith** with a
> clean layered + event-driven + plugin structure. The decisions behind it are written
> down as ADRs, the quality attributes are stated as testable scenarios, and the whole
> thing runs in one container. It's deliberately *not* a pile of microservices — choosing
> the monolith, and being able to say why, is part of the point (ADR-0001).

```
npm install
npm test        # 4 tests, Node's built-in runner, no framework
npm run demo    # scripted tour of the API, no server needed
npm start       # the API on http://localhost:3000
```

---

## The architecture in one picture

```
            HTTP  (routes + middleware)          <-- adapts the web to the core
              |         depends on
              v
         Application  (BoardService, CardService, EventBus, Strategy, Observers)
              |         depends on
              v
           Domain  (Board, Column, Card, events)  <-- pure, no dependencies
              ^
              |  implements the ports
         Adapters  (in-memory / JSON-file store, console / webhook notify)
```

Dependencies point **inward**: the domain knows nothing, the application depends only on
the domain and on *ports* (interfaces), and the outside world (HTTP, storage,
notifications) plugs in from the edge. Everything concrete is wired in **one file**,
`src/config.js` — the composition root.

Three architectural styles, each doing a specific job:

| Style | Where | Why |
|---|---|---|
| **Layered / hexagonal** | the dependency arrows above | isolate business rules from HTTP and storage so either can change alone |
| **Event-driven** | `EventBus` + observers | notifications and the activity log react to events, so the write path doesn't know they exist |
| **Plugin / ports-and-adapters** | `ports/` + `adapters/` | swap storage or notification channels by config, no code change |

Full write-up with the C4 diagram: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

---

## The design patterns, and where they live

| Pattern | File | What it does |
|---|---|---|
| **Repository** (port + adapters) | `ports/BoardRepository.js`, `adapters/persistence/*` | hides whether boards live in memory or a file |
| **Strategy** | `application/ordering/orderingStrategies.js` | interchangeable card orderings (`?order=priority`) |
| **Observer / pub-sub** | `application/EventBus.js`, `observers/*` | activity log + notifier react to domain events |
| **Adapter** | `adapters/notifications/*` | console and webhook notification channels behind one port |
| **Factory** | `domain/ids.js`, entity constructors | id creation isolated from the entities |
| **Middleware pipeline** | `http/middleware/*` | logging → JSON → routes → error handling as composable stages |

Adding a tier of functionality is additive: a new ordering is one function, a new storage
backend is one adapter + one line in `config.js`, a new notification channel is one adapter.

---

## What's in here

```
src/
  domain/          Board, Column, Card, events, ids   (pure, no dependencies)
  ports/           BoardRepository, NotificationChannel  (the contracts)
  adapters/
    persistence/   InMemory... , JsonFile...           (swappable storage)
    notifications/ Console... , Webhook...             (swappable channels)
  application/     BoardService, CardService, EventBus, ordering/, observers/
  http/            server.js, routes/, middleware/      (the web adapter)
  config.js        THE COMPOSITION ROOT -- the only file that picks concretes
  index.js         entry point
test/              architecture.test.js                 (no server, no I/O)
docs/              ARCHITECTURE.md, adr/, quality-attributes.md, C4 diagram, guide PDF
Dockerfile, docker-compose.yml                          (runs as one container)
```

---

## The API

| Method & path | Does |
|---|---|
| `GET /health` | liveness check |
| `POST /boards` `{name}` | create a board |
| `GET /boards` / `GET /boards/:id` | list / fetch |
| `POST /boards/:id/columns` `{name}` | add a column |
| `POST /boards/:id/columns/:col/cards` `{title,priority?,assignee?}` | add a card |
| `GET /boards/:id/columns/:col/cards?order=priority` | list cards, ordered (Strategy) |
| `POST /boards/:id/cards/:card/move` `{from,to}` | move a card |
| `POST /boards/:id/cards/:card/assign` `{assignee}` | assign a card |
| `GET /activity?n=50` | the event feed the Observer recorded |

```bash
curl -X POST localhost:3000/boards -H 'content-type: application/json' -d '{"name":"Sprint 1"}'
```

---

## Running it in a container

```bash
docker compose up --build        # http://localhost:3000, file persistence on a volume
```

One image, one process — a monolith deploys as a single unit, which is one of its
advantages (ADR-0001).

---

## Honest notes on scope

- **It's a monolith, and that's a decision, not a limitation.** For a system this size, the
  operational cost of microservices (network calls, partial failure, deployment machinery)
  buys nothing. The module boundaries here (domain / application / adapters) are where you'd
  *split* later if real scale demanded it — ADR-0001 says exactly when that would be.
- **No auth.** Out of scope; the focus is structure.
- **In-memory by default**, JSON-file optional. Both are behind the repository port, so a
  real database (Postgres, Mongo) is a third adapter and a one-line config change — the
  application layer wouldn't move. That swappability is the thing being demonstrated.

## Built with
Node.js · Express · no database, no test framework (Node's built-in runner) · Docker
