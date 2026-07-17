# UML Models — esc-ascendas

PlantUML models for the Ascenda Loyalty Hotel Booking System (SUTD 50.003).
They are grounded in the design spec and the three implementation plans:

- `../superpowers/specs/2026-06-25-hotel-booking-platform-design.md`
- `../superpowers/plans/2026-06-25-foundation-and-search.md`
- `../superpowers/plans/2026-06-28-booking-and-payment.md`
- `../superpowers/plans/2026-06-28-accounts-points-gdpr.md`

## Diagrams

| File | Diagram | Covers |
| --- | --- | --- |
| `use-case.puml` | Use-case (+ misuse cases) | UC1–UC5 and the two misuse cases — the anchor the class diagram is kept consistent with |
| `class-diagram.puml` | Class diagram | All three domains (Search, Booking, Account) + BFF controllers, Drizzle entities, domain types, React components/hooks/providers — with associations, multiplicities, and operations |
| `seq-1-destination-search.puml` | Sequence | UC1 — client-side fuzzy autocomplete + validated submit (rooms + adults/children) |
| `seq-2-price-polling.puml` | Sequence | UC2 — progressive price-polling loop via `PricesProvider`/`useHotelPrices` (spec attach point #1) |
| `seq-3-hotel-detail.puml` | Sequence | UC3 — fresh room-rate polling via `RoomsProvider`/`useHotelRooms` + "rate confirmed" badge |
| `seq-4-booking-payment.puml` | Sequence | UC4 — email-OTP verification + Stripe confirm (single synchronous confirm, no redirect step) (spec attach point #2) |
| `seq-5-account-points-gdpr.puml` | Sequence | UC5 — points history (Recharts) + booking list + GDPR deletion |

## Rendering

The two graph-layout diagrams (`use-case`, `class-diagram`) carry a
`!pragma layout smetana` directive so they render with PlantUML's pure-Java
engine — **no Graphviz install required**. Sequence diagrams never need Graphviz.

```sh
# Render every diagram to PNG (or -tsvg for vector)
java -jar plantuml.jar -tpng -o rendered docs/uml/*.puml
```

For tighter orthogonal routing on the class diagram, install Graphviz
(`brew install graphviz`) and delete the `!pragma layout smetana` line.

VS Code: the "PlantUML" extension previews these inline (Alt+D).

> `rendered/` output is generated and git-ignored — regenerate from the `.puml` sources.
