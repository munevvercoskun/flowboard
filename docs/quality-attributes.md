# Quality attributes — FlowBoard

Architecture is judged by the "-ilities" it buys, not by the features. These are the quality
attributes FlowBoard was designed for, each written as a concrete scenario (stimulus →
response → how we measure it) in the style COE 692 uses, and what in the design delivers it.

---

### Modifiability — *the primary driver*
> **Scenario:** a developer needs to add PostgreSQL storage. **Response:** write one
> `PostgresBoardRepository` adapter and change one line in `config.js`. **Measure:** zero
> changes to the domain or application layers.

Delivered by the **repository port** (ADR-0002) and the composition root. The same holds for
a new card ordering (one function), a new notification channel (one adapter), or a new
reaction to events (one subscriber).

### Testability
> **Scenario:** verify that moving a card keeps the board consistent. **Response:** a unit
> test instantiates the services with the in-memory adapter and asserts on the result.
> **Measure:** the test runs in milliseconds with no server and no I/O.

Delivered by **dependency inversion** — services depend on ports, so tests supply simple
in-memory implementations. See `test/architecture.test.js` (4 passing tests, no framework).

### Separation of concerns / maintainability
> **Scenario:** change the HTTP response shape without risking the business rules.
> **Response:** edit only the `http/` layer. **Measure:** the domain and application files are
> untouched and their tests still pass.

Delivered by the **layered structure**: HTTP → application → domain, dependencies inward.

### Availability (of the core operation)
> **Scenario:** the notification webhook is down when a card is created. **Response:** the
> card is still created and returned `201`; the failed notification is logged and dropped.
> **Measure:** the write succeeds regardless of the channel's health.

Delivered by **best-effort, isolated side-effects** (ADR-0003): observer errors are caught in
the event bus and never propagate to the write path.

### Performance (adequacy, not a headline)
> **Scenario:** typical board operations under normal load. **Response:** served from memory
> with synchronous in-process events. **Measure:** sub-5ms per request in the smoke test.

Delivered by the **in-memory default** and a tiny synchronous bus. Noted honestly: the
file adapter reads/writes the whole file per operation — fine for a demo, and the port is
exactly where you'd swap in a database with indexed access when data outgrows that.

---

## The trade-offs, stated plainly

| We chose | We gave up | Why it's the right call here |
|---|---|---|
| Modular monolith | independent scaling / deployment of parts | system is small and cohesive; the seams to split along already exist (ADR-0001) |
| Ports & adapters | some indirection and extra files | the two things that vary (storage, channels) change by config, not rewrites |
| Event-driven side-effects | a perfectly linear, easy-to-trace flow | reactions decouple from the write path; failures can't corrupt a write |
| In-memory default | durability out of the box | zero-setup to run and test; durability is one env var (`PERSISTENCE=file`) or one adapter away |

The theme: every structure here is bought *for a reason* and the cost is acknowledged. That's
the difference between architecture and just adding layers.
