# Raresquared Labs Portal — Design Plan

## Subject, audience, job
A business owner or ops manager who has hired Raresquared to run automated back-office work
(goods receipts, invoices, supplier email, CRM). They are **not** technical and do not want to
operate an AI system. The portal's single job: *show me my digital workforce is working, and tell
me if it needs me.*

Vernacular to borrow: the **operations board** / shift log of a well-run back office — a warehouse
goods-in desk, an accounts-payable ledger. Calm, legible, accountable. Not "AI platform".

## Settled decisions (from architecture review)
- **Light palette only.** Brief never asks for dark mode; half-implementing it breaks the portal
  on a dark OS. Strip the scaffold's `prefers-color-scheme` block. Tokens, not raw `zinc-*`.
- **Shared client state via Context** mounted in root layout, seeded from typed demo data, so
  Approve/Reject updates Home's count *and* the bell badge. Pages stay server components.
- **Width:** ~1600px cap + fluid padding. `max-w-7xl` (1280) leaves dead margins at 1440/1920 —
  the exact failure the brief calls out. Verify content fills at 1920.
- **Activity uses concurrent lanes**, not one vertical timeline — stated twice in the brief.
- **Menus:** Escape-to-close, outside-click, focus return, `aria-expanded`/`aria-haspopup`.
  StatusIndicator carries real or `sr-only` text, never colour alone.
- **FlowDiagram:** stacked by default, horizontal from `md` up. No overflow-hidden crutch.

## Colour — "ledger paper and ink"
Base is a cool paper white with true-neutral ink, so the one accent does all the talking.
- `--paper`   `#FBFBFA`  app background (warm-neutral, not blue-grey, not cream #F4F1EA)
- `--surface` `#FFFFFF`  cards
- `--ink`     `#18181B`  primary text (true neutral; NOT tinted near-black #0B0B0B)
- `--muted`   `#6B7280`  secondary text
- `--line`    `#E7E7E4`  hairline borders
- `--signal`  `#15803D`  healthy / running (a deep ledger green, not mint, not emerald glow)
- `--flag`    `#B45309`  needs attention (amber-brown, reads as "review", not alarm red)
- `--fault`   `#B91C1C`  failed only

Restraint rule: green and amber appear **only** as status. Never as decoration, never a gradient.
No purple, no blue accent anywhere — that is the generic automation-SaaS tell.

## Logo
The supplied lockup ships at `public/raresquared-logo.png` (261×85 RGBA) and is rendered
through `next/image` at 26px tall with its intrinsic dimensions declared, so the header
reserves space before the file loads and the nav does not shift. Earlier hand-drawn SVG
approximations were replaced at the client's request — use the real asset, not a redraw.

## Type
One family, two roles, differentiated by weight and tracking rather than by mixing families.
Body/UI: a restrained grotesque (see FONT below). Numerals: tabular where counts align.
- Page title   28/32px, weight 600, tracking -0.02em
- Section head 15px, weight 600
- Body         14px, weight 400, `--muted`
- Meta         13px, weight 400
No ALL-CAPS labels. No eyebrow labels above headings. No `→` glued to link text.
No single-word accent colouring inside headings.

## Systems: modules and automations merged (revised)
Modules and Automations briefly existed as separate nav items. The client pointed out they
described the same things twice — "Goods In" on one page, "Goods Receipt Review" on the
other — so they are now one page, `/systems`, titled **Your systems**. Each card is the
module the client pays for, expandable into the automations it runs (status, runs today,
flow, trigger, approval need). Modules available to hire have since moved to their own
page, `/hire` — see "The workforce" below.

"Automations" was also the last piece of platform vocabulary in the nav; "Your systems"
matches the wording already used in Home's supporting copy.

Everything the client sees is **scoped to the modules on their account** — automations,
runs, recent work and approvals are all filtered against the unlocked set in the provider.
Without that the portal would report work for systems they do not have, which is precisely
the kind of thing that destroys trust in what it is telling them.

`purchaseModule(id)` flips local state and raises a notification. It is the single call
site a real payment provider replaces; the UI above it does not change.

## The workforce — systems presented as people
The client asked for the rail's modules to read as a **workforce** with first names rather
than software they own. This is the vernacular the brief already set — *show me my digital
workforce is working* — carried into the interface instead of only the audience note.

Each module carries a `personName` (Marcus, Priya, Sam, Joel; Nadia, Tom and Ruth on the
three not yet bought). The eight automations' `handledBy` values were "Document Agent",
"Invoice Agent" and so on; they now name the same people. **"Agent" was the last piece of
platform vocabulary left in the data** — the same reason "Automations" was dropped from the
nav — and it rendered nowhere, so nothing regressed by reclaiming the field.

**The name is never shown alone.** The rail reads "Marcus · Goods In" and the worker's page
is titled "Marcus" with "Goods In — …" directly beneath. Four bare first names in a rail is
a staff list, not navigation, and the portal's job is telling a non-technical owner which
system handles what at a glance (principle 2). The job takes the quieter grey so the name
leads the scan while the function stays legible beside it.

The vocabulary is now used **throughout**, at the client's direction. "Your systems"
became **"Your workforce"** in the nav row, the page title and Home's card header, and the
cards read "Nadia · Supplier Chasing" with a "Take Nadia on" button.

Hiring has since moved off that page to its own destination, **"Hire workers"** at
`/hire`, sitting directly under Home in the rail. `/systems` answers *are my people
working?*, which a client asks daily; `/hire` answers *who else could I have?*, asked
occasionally. Stacked beneath the working list, the second read as an afterthought of the
first.

The path is `/hire`, not `/workforce`: it was briefly the latter, which read oddly beside
`/systems` — the page you *own* had the legacy path while the page you *browse* carried
the new vocabulary. `/hire` names what the page does and leaves `/systems` alone.

Note that `public/workforce/` is the **avatar asset directory** and is unrelated to either
route. Do not sweep it up in a path rename; every worker's face resolves through it.

An earlier pass kept `/systems` as "Your systems" on the reasoning that a workforce you
purchase by the month reads oddly. The client overruled that, and the hiring language
resolves the objection rather than dodging it: you take someone on, you do not buy them.

The rail's sub-heading is **"Working for you"**, not "Your workforce". With the nav row
directly above now carrying that name, the rail would otherwise repeat the same two words
within five rows; the sub-heading names what the list *is* rather than echoing the
destination above it.

The route stays `/systems` — the URL is live, and `Module`, `moduleId` and
`purchaseModule` are untouched. This is a change to what the client reads, not the model.

The not-on-account page keeps the system name as its title: a stranger's first name
heading a system you do not have explains nothing.

### The worker's avatar
The card's button reads **"View Marcus"**, not "View details", and each worker has an
illustrated face — on their card in `/systems` and in the dialog header, where it scales
and fades in as the dialog opens.

**Illustrated, not photoreal, and that is a product decision rather than a taste one.** A
photograph of a person who does not exist, sitting beside "Marcus · Goods In — 12 runs
today, last run 4 minutes ago", claims a member of staff the client could ask to speak to.
If they forward a screenshot, or ring up asking for Marcus, the photo has misled them. An
illustration reads as a friendly mark for an automated system. The first set generated came
back photoreal and was rejected for exactly this; the second is flat vector.

The seven PNGs live in `public/workforce/<module-id>.png` at 512×512 with transparency, cut
from one generated sheet. They render through `next/image` with intrinsic dimensions
declared, so the box is reserved before the file loads.

Constraints that are easy to undo by accident:
- **No initials fallback behind the avatar.** One was tried — the ink disc the account
  control uses — on the reasoning that a module without artwork should degrade to the
  portal's own person idiom. It was removed at the client's request: the illustrations
  carry transparency, so the disc showed through as a dark ring at the edges and a letter
  behind the face. A fallback that is visible *through* the thing it backs is not a
  fallback. A module without artwork now renders an empty circle rather than a stray
  letter; if one is ever added, give it a PNG.
- **The rail carries faces too, at 22px.** They were first reviewed at 18px, read as mush,
  and the rail kept its `ModuleIcon` glyphs; the client asked for avatars there, so they
  were sized up instead of shrunk. 22px is the largest the row takes without growing it
  (`min-h-9` = 36px, less `py-1.5` top and bottom leaves 24px), and at that size hair, skin
  tone and clothing colour tell one worker from another even where the faces are not
  legible. Do not drop back to 18px "for consistency" with the nav glyphs above — that was
  tried and rejected.
- **The avatar sits in an 18px centring column, and overflows it by 2px a side.** Sharing a
  left edge is not sharing a centre: measured, the nav's 18px glyphs centre on **x=33**,
  while a flush-left 22px avatar centred on **35**, with labels at **54** and **58**. Four
  rows nearly lining up reads worse than either alignment. Boxing the avatar to the glyph
  width puts every midline on 33 and every label on 54, which `getBoundingClientRect`
  confirms across all four rows (`deltaY` 0 vertically). If the avatar size or the nav glyph
  size ever changes, re-measure and re-derive — this is not a number to nudge by eye.
- **The entrance is one-shot, never a loop.** Opening the dialog is a user action, so an
  entrance is allowed under principle 5; a looping idle would be decoration, and looping
  motion here is reserved for live status (the pinging dots). `.avatar-in` in `globals.css`
  fires once per open — the dialog is conditionally rendered, so no JS is involved — and
  the existing `prefers-reduced-motion` block clamps it, so the avatar simply appears for
  anyone who asked not to be moved.

Avatars are `aria-hidden` with empty `alt`: every one sits beside the person's name in
text, so a face announced ahead of it is noise.

### The status band counts work, not people
Home's band says "5 jobs running" and "1 job needs attention", and Home's snapshot card is
titled **"Today's work"**. Both were tempting to personify and must not be: those figures
count *automations*, and four workers run eight automations between them. "5 workers
running" would contradict the four rows in the rail — the same defect as the old "4 items
need your attention", where the boldest number on the page disagreed with the list beneath
it. The band describes the work; the rail names who does it.

Names are a mixed, plain set, and copy about them uses they/them — they are fictional
workers on a real client's portal, so no one of them should carry an assumed gender.

## Per-module pages, and the rail's module list (revised again)
Each active module now also has its own page at `/systems/[moduleId]`, listed in the rail
beneath the five destinations under a "Your modules" heading. The client asked for this
explicitly, having been shown the alternatives (link to an anchor on `/systems`, or
auto-expand the card).

This is **not** the thing that was removed before. What the client rejected was a separate
*Modules* nav item that re-listed the same content as `/systems` — one page describing what
another page already described. These are per-module destinations: `/systems` stays the
index of what you have and what you could add, and each page below it is one system's own
dashboard. Only **active** modules appear in the rail; the ones still to buy stay on
`/systems`, where they have a price and an Add button a nav row cannot carry.

Nav is five destinations — Home · Your systems · Approvals · Activity · Settings — plus one
row per active module.

Consequences worth knowing:
- `isActive` in the rail is an **exact** match for `/` and `/systems`, not a prefix match.
  A prefix match lit the parent row and the module row at once: two `aria-current="page"`
  elements, and two filled surfaces in a rail whose active state is the surface alone.
- Module rows carry **one distinct glyph each** — truck, receipt, envelope, contact book —
  at 16px against the nav rows' 18px, so the two levels stay distinguishable. Icons were
  left off at first, on the reasoning that there is no per-module artwork and one generic
  box repeated four times is noise; the client asked for them, and *distinct* marks are
  the answer to that objection, since four different shapes are told apart at 16px where
  four identical ones are not. `ModuleIcon(id)` maps them, following `ServiceIcon`'s
  convention so data never names a component. All **seven** modules are mapped, not just
  the four owned: `purchaseModule` can promote one into the rail mid-session.
- The rows sit **flush left** (`px-3`, `gap-3`), identical to the rows above: the icon
  starts at the button's left edge and the label follows. They were briefly indented to
  54px — text aligned with the labels above, blank space where their icons would be — and
  the client asked for flush left, then for icons. The parent rows' own structure gives
  both.
- A **hairline divider** separates the five fixed destinations from the modules, inset to
  the row padding (`mx-3`) rather than run edge-to-edge — the same rule as the account
  block at the foot. The heading alone had been carrying that break and did not hold it;
  the modules read as a sixth nav group rather than a different kind of thing.
- Module pages carry **no back link**. Each one has its own row in the rail, so it is a
  destination reached directly, not a subpage descended into from `/systems`; a "back to
  Your systems" crumb framed it as belonging to somewhere else.
- The page **validates the id against the seed module list**, not the client's active set.
  Checking "is it active" server-side would 404 a module the client had just bought until
  they reloaded. A real-but-not-owned module gets an explanatory state instead.
- **The module page carries only what `/systems` does not.** It briefly repeated two
  things the systems page already showed, and both were cut at the client's request:
  "How it works" (`ModuleDetail` — each automation's flow, trigger, tools and
  configuration, which belongs to the card's "View details" dialog and renders there
  only) and "What this system covers" (`module.includes`, which the card itself lists).
  Together those were two thirds of the page restating its own index — the same
  duplication the client corrected when modules and automations were separate pages.

  What is left answers *does it need me, and what has it been doing*: the status band,
  decisions waiting, and the run list. The title's description still says what the system
  covers, in one sentence. `ModuleDetail` stays a separate component because the dialog
  still uses it.

  The rule for anything added here later: if `/systems` already shows it, this page does
  not repeat it.
- The dashboard heads its run list **"Latest runs" with no count**. The automation data
  carries `runsToday: 12` for Goods Receipt Review while the seed holds four run records;
  a counted heading would print two numbers a client can compare and find disagreeing —
  the same failure as the old "4 items need your attention". For the same reason there is
  no averaged success rate across a module's automations: the unweighted mean of two rates
  describes nothing. Each automation shows its own, where it is attributable.

### The body is a slot
Everything below the status band is `children`, defaulting to the seed-data dashboard.
Some modules will eventually be backed by a real application rather than seed data — the
Rare² Invoice Processor is the first candidate, landing on Purchase Ledger — and when one
is, it mounts through that slot while the shell above it (back link, title, status band)
stays portal-owned. One set of page furniture whatever runs underneath.

## Usability sweep — the repeatable audit
Every page was swept with one script rather than by eye. It flags four things, and each
threshold exists because a real defect hid behind it:

| Check | Threshold | Why |
| --- | --- | --- |
| Text size | < 12.5px | "1 approval pending" and the account role were smaller than the text around them |
| Touch targets | < 36px | "View all", "Full history" and "waiting on you" were 20px tall |
| Line length | > 85 chars | Approval reasons ran to ~175 characters a line |
| Heading order | any skipped level | Approvals jumped h1 → h3 |

Two rules for reading its output:
- **Skip `sr-only` elements.** They measure 1×1px and report as "truncated"; that is correct
  by design, not a defect.
- **Glyphs are exempt from the text floor.** The badge count and the avatar initials are
  marks, not prose. A *status label* — "Approval involved", "This device" — is prose and
  must clear the floor.

The line-length figure is an estimate (`width / (fontSize * 0.5)`); where an explicit `ch`
cap is already in place, trust the cap over the estimate.

## Home carries no explanatory diagram
A full-size Trigger → Agent → Tools → Approval diagram sat under the status band. It was
removed, and the reasoning is worth keeping because it applies to anything proposed for
that slot:

- It answered **none** of the four questions the portal exists to answer (what is it doing
  / is it working / do I need to act / what happened). It explained the *concept* of
  automation — onboarding material, in the most valuable space on the page.
- It **never changed** between visits. A client opening this daily scrolls past it by day two.
- It was **generic**: "Trigger → Agent → Tools → Approval" describes any automation
  platform, and said nothing about this client's goods receipts or invoices.
- It used the platform vocabulary ("Trigger", "Agent", "Tools") deliberately stripped from
  the navigation.
- The concrete version already exists on each card in Your systems, showing that
  workflow's **real** steps. Specific, therefore useful.

With it gone, the first screenful of Home is entirely live, actionable state. The compact
per-workflow flow survives in `flow-diagram.tsx`; the full-size branch and its
`overviewFlow` data were deleted rather than left as dead code.

## Colour means status. Nothing else.
This rule was in the brief from the start, and I broke it by drift: asked to "give some
colour", I added tints one request at a time without ever counting the total. The portal
ended up with eleven tinted surfaces — four pastel flow stages, five step-icon branches, a
pale cyan rail tile — and read as toyish. Each addition was defensible alone; together they
were a children's-app palette.

The rule, restated:
- **Status carries colour.** Running/completed green, needs-attention amber, failed red.
- **Explanation does not.** The flow diagram has no status — no stage is healthy or
  failing — so its tiles are neutral. Tinting them was decoration.
- **Working steps do not.** "An email arrived" is not an outcome. In a run's step list only
  done / failed / retrying take colour; the rest stay grey so the one that matters stands out.
- **Prefer an outlined glyph to a filled tile.** A coloured border and mark on a white tile
  states the status without turning every row into a sticker.
- **`--color-brand` navy fills; `--color-brand-accent` cyan does not.** A pale cyan block
  (`#b5e5f3`) was the most toyish element in the portal. The active rail tile is solid navy
  with a white glyph.

The one deliberate exception is the Integrations list, where real brand logos in real brand
colours exist so a client can spot Gmail or Xero at a glance. Recognition is their whole job.

The **second** exception is the workforce avatars, admitted on the same grounds: telling
Marcus from Priya at a glance *is* their job, and seven monochrome faces would not do it.
This is the largest colour addition the portal has taken, so it is recorded here rather
than left to look like drift. It does not licence any further tinting — the avatars are
illustrations of people, not decoration on surfaces, and every rule above still holds for
cards, tiles, flow stages and step icons.

Before adding any colour, count what is already tinted on that screen.

### The approve/reject exception
The approval buttons are the one place colour does not mean status: **Approve is filled
`--color-signal` green, Reject is outlined `--color-fault` red.**

This was the client's explicit decision, made after the trade was put to them. It is
recorded here as a deliberate exception rather than left to look like drift, because it is
the single case in the portal where green does not mean *running normally*.

What it costs, stated plainly: green and red now each carry two meanings — a status on the
dots, and an action on this one card. A reader scanning for health signals has one more
thing to disambiguate.

What was tried first, and rejected by the client:
- **Navy `--color-brand` for the primary action.** Signals importance without claiming a
  status; white on it is 14.69:1. Applied to Approve, *Confirm and add* and the error/404
  retries, then reverted when green/red was chosen — leaving navy on three buttons wearing
  a convention that no longer existed would have been worse than plain `--color-ink`.

Constraints that still hold:
- Reject is **outlined, not filled**. Two solid blocks would compete, and a filled red
  would pull the eye hardest to the action a client takes least often.
- Contrast measured, not assumed: white on green 5.02:1, red on white 6.47:1, red on
  `--color-fault-soft` hover 5.90:1.
- This exception covers approve/reject only. Every other button stays neutral —
  `--color-ink` filled for a primary action, outlined for secondary.

## Text contrast — measured, not eyeballed
Every text colour must clear WCAG AA against the background it actually sits on: **4.5:1**
for body text, 3:1 for large text (>=24px, or >=18.66px bold). `--color-subtle` was
originally `#9aa0a8`, which scored **2.64:1** on white and made role labels, timestamps and
`·` separators genuinely hard to read. The greys are now:

- `--color-ink` `#18181b` — primary text (17.72:1 on white)
- `--color-muted` `#5f6673` — secondary text (5.78:1)
- `--color-subtle` `#6d737d` — meta text (4.77:1 on white, 4.61:1 on `--color-paper`),
  still visibly lighter than muted so the three-step hierarchy survives

`subtle` must clear the floor on **both** white cards and the `#fbfbfa` page background;
an intermediate `#767c86` passed on neither (4.20:1). The value was solved for numerically
rather than picked by eye — darkening from a base hue until both ratios cleared 4.6.

To re-check after any colour change, run this in the browser console on each page — it
resolves the real (non-transparent) ancestor background and reports anything failing:

```js
const lum=([r,g,b])=>{const f=c=>{c/=255;return c<=0.03928?c/12.92:Math.pow((c+0.055)/1.055,2.4)};
  return 0.2126*f(r)+0.7152*f(g)+0.0722*f(b)};
const ratio=(a,b)=>{const L1=lum(a),L2=lum(b),hi=Math.max(L1,L2),lo=Math.min(L1,L2);return (hi+0.05)/(lo+0.05)};
// ...walk ancestors for the first opaque backgroundColor, compare against getComputedStyle(el).color
```

Check every page, not just one: `subtle` is used for timestamps, `dt` labels, lane numbers
and empty states, so a single page never samples all of its call sites.

## Mobile — verified at 375px, not inferred
Below `lg` the rail becomes an off-canvas drawer behind a slim bar. Measured at 375×812:

- Drawer **288px** wide (not 264): the 60px logo box runs 32→216px and the close button
  starts at 239px, leaving a **23px** gap. At 264px the two touched exactly.
- All five nav rows are 44px and tappable; the account footer stays in view; no
  horizontal overflow.
- The logo takes a `size` prop: `"rail"` (60px, desktop rail and drawer) and `"bar"`
  (36px, mobile top bar). One fixed 60px mark spanned half a 375px bar and crowded the
  menu button.

Use CDP `emulate` with `375x812x2,mobile,touch` to check this — resizing the OS window
fails when Chrome is maximised ("Restore window to normal state before setting content
size").

## Rail menus are mutually exclusive
The bell and the account menu sit a few pixels apart at the foot of a 248px rail, so two
open panels overlap. `use-dismissable` keeps a module-level registry of open menus and
closes the others when one opens — coordinated in the shared hook rather than by wiring
the two components to each other, so any future dropdown gets the behaviour for free.

## Nav icons
Each glyph says what its page is *for*, not what shape was convenient:

- **Home** — a house.
- **Your workforce** — two figures. This was three linked nodes, chosen when the row read
  "Your systems" and a topology glyph said "connected things working together"; against
  "Your workforce" it labelled the page as infrastructure. It stays distinct from the
  portal's other person marks — a single figure in run steps, a book-and-figure on Joel's
  module row in the same rail. (A generic 4-square grid was rejected earlier still: it
  read as an app launcher and said nothing about work being done.)
- **Approvals** — a tick in a rounded square: something you confirm. An inbox tray read as
  "mail", which is the wrong job.
- **Activity** — a clock with its hand swept back, for a record of what has happened.
- **Settings** — a cog.

## Nav rows
Rows are 44px (`min-h-11`) at 14px. Every icon sits on its own 32px rounded tile so a row
has a visual anchor rather than floating grey text: inactive tiles are `bg-paper` with a
`--color-subtle` glyph, the active tile inverts to `bg-ink` with a `--color-surface` glyph.
The whole row is a `group`, so hovering lifts the tile to `bg-line/70` and both glyph and
label to `--color-ink`.

The active row reads through its surface rather than a marker: a 10% `--color-brand-accent`
wash, a `semibold` `--color-brand` label, and the icon tile filled `--color-brand-soft`
with a **navy** glyph. An earlier version added a solid black bar on the left edge —
removed at the client's request as too heavy.

Three brand blues, each with one job:
- `--color-brand` `#082850` — navy. Text, glyphs, and safe as a filled surface (14.69:1).
- `--color-brand-accent` `#08a8d8` — the logo cyan. Highlights and washes on light
  backgrounds. **Never** put white text on it: 2.76:1.
- `--color-brand-soft` `#b5e5f3` — 30% cyan on white, for the active icon tile. Navy glyph
  on it is 10.81:1.

### Contrast script caveat
Tailwind emits opacity modifiers (`bg-x/10`) as `oklab(...)`, which a naive
`match(/\d+(\.\d+)?/g)` rgb parser turns into garbage — it once reported a contrast ratio
of 1,535,096. Any sweep script must either resolve oklab properly or fall back to a
screenshot for translucent surfaces. Do not trust a number that looks impossible.

The way round it: never parse the colour yourself. Set it on a throwaway element and read
`getComputedStyle().color` back, which hands you sRGB whatever the input notation was, and
composite alpha by walking up to the first opaque ancestor. Validate the harness against
the known values in this document before believing a clean result — a sweep that finds
nothing looks identical to a sweep that is looking at nothing.

### Full-page sweep, all six routes
Every text node measured against its composited background, large-text threshold applied
at >=24px or >=18.66px bold: **no failures** on `/`, `/systems`, `/hire`, `/approvals`,
`/activity` or `/settings` (63–129 text elements per page).

The workforce-photography and status-band work added these, all clearing AA:

| Ratio | Where |
|------:|-------|
| 4.68 | "Urgent" badge — `flag` on `flag-soft` |
| 4.68 | "Review approvals" hover — `flag` on `flag-soft` |
| 5.02 | "1 job needs attention", "Review approvals" — `flag` on white |
| 5.02 | Pending approval badge — white on `flag` |
| 5.02 | Resolved approval badge — white on `signal` |
| 17.11 | Hire page total — `ink` on `paper` |
| 17.72 | "Who ran" names — `ink` on white |

`flag` on `flag-soft` at 4.68 is the tightest pair in the portal. It clears the 4.5 floor,
but it is the first thing to re-measure if either token moves.

**The two brand blues are not interchangeable.** Both were sampled from the logo PNG by
tallying opaque saturated pixels on a canvas:
- `--color-brand` `#082850` — the navy body of the mark. White on it is **14.69:1**, so it
  is safe as a filled surface (active tiles, buttons).
- `--color-brand-accent` `#08a8d8` — the cyan on the superscript "2" and node motif. White
  on it is only **2.76:1**, so it is a highlight on light backgrounds only. Never fill a
  tile or button with it and put white text on top.

The Approvals count stays `--color-flag`, not brand: a waiting approval is a status, and
turning it brand-coloured would bury it among the navigation chrome.

The Approvals count is a **solid** `--color-flag` pill with white text — a waiting approval
is the one thing in the rail that should draw the eye. Soft-tinted badges read as decoration.

## Rail alignment — one 24px line (non-negotiable)
Everything in the rail hangs off a single vertical line **24px from the rail's left edge**:
the logo's first ink, every nav row's icon, and the account avatar. This was wrong once
(22 / 24 / 20px respectively) and read immediately as sloppy, so it is measured rather than
eyeballed:

```js
// logo ink, nav icons and avatar must all return 24
el.getBoundingClientRect().left - aside.getBoundingClientRect().left
```

Concretely: logo block `pl-5` (the PNG carries 4px of transparent padding, so 20 + 4 = 24);
`<nav>` `px-3` plus each link `px-3`; profile button `px-3` inside a footer at `px-3`.
Changing any one of those breaks the line — change all three or none.

### Tried and reverted: aligning the rows to the wordmark
The rows were once pushed out to **72px** so their icons sat under the "RARE²" lettering
rather than under the glyph that precedes it. A canvas alpha scan of the rendered PNG gives
the geometry, and it is worth keeping for anyone who tries this again:

```
glyph ink   24 → 66px
gap          7px
lettering   72 → 199px   ⇒ row pl-[60px] on top of the nav's px-3
```

Two things went wrong. Putting the offset on the `<nav>` dragged the active row's highlight
in with it, shrinking a surface that should span the full 12 → 235px column. Moving the
offset onto the row fixed that but left 60px of empty highlight to the left of each icon.
The client reverted it. The rail is back on one line.

The account block is the client's name and role beside a 28px avatar, with the bell as a
40px peer on the same baseline. **No chevron** — the button already exposes `aria-expanded`,
and the space is better spent keeping "Operations Director" from truncating.

## Navigation — left rail (revised)
Navigation moved from a top bar to a 248px fixed left rail at the client's request. The rail
holds the logo, the five destinations (each with an icon and, for Approvals, a live count),
and at its foot the notification bell immediately before the single account control — both
menus open *upward* (`align="top"`) since they sit at the bottom of the viewport. Content is
offset `lg:pl-[248px]` and capped at 1400px. Below `lg` the rail becomes an off-canvas drawer
behind a slim bar, because a permanent rail would consume most of a phone screen.

`devIndicators: false` in `next.config.ts`: the Next dev badge sits bottom-left and was
intercepting clicks on the bell during development. Dev-only chrome, never shipped.

The profile menu holds one settings link, not two. Account and Settings were the same page,
and the rail already lists Settings — three routes to one destination is clutter.

## Layout concept — "status band, then the line of work"
Rejecting sidebar + 4 KPI cards + chart. Horizontal top nav (brief mandates it), then a full-width
**status band** that answers "is it healthy?" in one line, then content in an asymmetric two-column
reading order on desktop that collapses to one column on mobile.

```
+--------------------------------------------------------------------+
| Raresquared Labs     Home Automations Approvals Activity Settings   ⌁ ◍ |
+--------------------------------------------------------------------+
|                                                                    |
|  Overview                                                          |
|  See what your Raresquared systems are doing and anything that     |
|  needs your attention.                                             |
|                                                                    |
|  ● Everything running normally           3 automations · 20 runs   |  <- status band, one line
|                                                                    |
|  Trigger  ──▶  Agent  ──▶  Tools  ──▶  Approval                    |  <- explanatory flow
|  Something     Raresquared   Work is      You review               |
|  happens       processes it  completed    important actions        |
|                                                                    |
|  +------------------------------+  +----------------------------+  |
|  | Needs your attention      2  |  | Automations                |  |  <- 60/40 asymmetric
|  | Invoice Processing           |  | Goods Receipt Review       |  |
|  |   Quantity mismatch  Review  |  |   Running normally  12 today|  |
|  +------------------------------+  +----------------------------+  |
|                                                                    |
|  Recent work                                                       |
|  ✓ Invoice extracted and matched   Invoice Processing   2 min ago   |
+--------------------------------------------------------------------+
```
Alignment: everything left-aligned on a single grid. Nothing centred except empty states.
Counts right-aligned so they scan vertically as a column of numbers.

## Principles
1. **One line answers "is it healthy?"** The status band is the boldest element; everything
   else is quiet. That is where the boldness is spent.
2. **Every element answers one of:** what is it doing / is it working / do I need to act /
   what happened. Anything else gets cut.
3. **Human sentences, not labels.** "We couldn't update the CRM. Raresquared will retry
   automatically." Technical detail hides behind a disclosure.
4. **Borders over shadows.** Hairline `--line` defines structure; `shadow-xs` only on raised
   menus. No card gets a drop shadow by default.
5. **Motion only on user action** — menu open, row expand. No page-load reveal sequences,
   no per-card hover lift. Respect `prefers-reduced-motion`.

## Self-critique applied
- Dropped a "runs this week" sparkline row: fails principle 2 (a chart nobody acts on).
- Dropped per-card hover elevation: named in the skill as a generated-design tell.
- Dropped numbered 01/02/03 markers on the flow: it *is* a sequence, but arrows already encode
  it and numbers would imply the client performs the steps.
- Kept exactly one accent per state; resisted giving each automation a colour identity.
