# Raresquared Labs — Client Portal

Built from an empty directory on 2026-09-15. Next 16.3.5, React 19.2.8, Tailwind 4.3.3,
TypeScript 5.9.3, pnpm. No prior app existed, so the brief's clauses about preserving
existing auth, restructuring `/client`, and deleting obsolete components did not apply.

## Routes
`/` Overview · `/systems` Your systems · `/approvals` · `/activity` · `/settings`

Each has a `loading.tsx`. Plus `error.tsx` (uses Next 16's `retry` prop, not `reset`) and
`not-found.tsx`.

## Navigation
A 248px left rail — **not** a top bar — with five items: Home, Your systems, Approvals,
Activity, Settings. One bell and one account control at its foot. No search, no "New
automation" button, no second avatar.

"Your systems" replaced "Automations": the client chose the name, and it also merged what
were briefly two separate pages (Modules and Automations) that described the same things
twice. The word "automation" survives only as internal identifiers and in Settings'
"Failed automation alerts", where it reads as plain English.

## Architecture
- `src/lib/types.ts` — domain model in the client's vocabulary
- `src/lib/data.ts` — demo seed data (Northgate Supplies, a builders' merchant)
- `src/components/portal-provider.tsx` — the one source of mutable state

**Everything the client sees is scoped to the modules on their account.** Automations,
runs, recent work, approvals *and* notifications are all filtered against the unlocked set
in one `useMemo`. Without that the portal would report work for systems they do not own.

`purchaseModule(id)` flips a module to active, reveals its automations and raises a
notification. It is the single call site a real payment provider replaces — the client
asked to wire purchasing later.

## Components
PageHeader · StatusIndicator · SystemCard / AvailableSystemCard · FlowDiagram ·
ApprovalCard · ActivityRun · ActivityTimeline · EmptyState · NotificationMenu ·
ProfileMenu · AppSidebar · Card · Skeleton · Icon set · `use-dismissable` hook

## Verified
- `pnpm lint`, `pnpm typecheck`, `pnpm build` green on a clean tree
- All five pages swept for WCAG AA contrast — zero failures
- Purchase flow end-to-end: module moves, total updates, automation appears, approvals
  return, bell notifies
- Approve/Reject updates Home's count, the rail badge and the bell together
- Logo ink centred on the nav rows' centre line (measured, ±0px)

Design decisions and the measurement scripts behind them are in DESIGN.md.
