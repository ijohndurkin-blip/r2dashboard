import Link from "next/link";
import { Card, CardHeader } from "@/components/card";
import { Greeting } from "@/components/greeting";
import { ChevronRightIcon } from "@/components/icons";
import { PageHeader } from "@/components/page-header";
import {
  AttentionList,
  AutomationSnapshotList,
  RecentWorkList,
  SystemStatusBand,
} from "@/components/home-sections";
import { RecentNotifications } from "@/components/recent-notifications";

/**
 * Overview — the five-second read.
 *
 * Order answers the client's questions as they ask them: is everything healthy, does
 * anything need me, what is running, what has been finished.
 *
 * A Trigger → Agent → Tools → Approval diagram used to sit under the status band. It was
 * removed: it explained the *concept* of automation rather than answering any of those
 * questions, never changed between visits, described any platform rather than this
 * client's work, and used the platform vocabulary ("Trigger", "Agent", "Tools") stripped
 * from the navigation. The concrete version already lives on each card in Your systems,
 * showing that workflow's real steps.
 *
 * No metric-card row, no chart.
 *
 * The one addition is the greeting in place of a plain "Overview" title, on a soft
 * brand-accent wash — the same 10% cyan tint the active rail row already carries, not a
 * new colour. Kept to this one spot rather than spread across the page: DESIGN.md is
 * emphatic that colour here means status, and a tint on every card would repeat the
 * "eleven tinted surfaces" mistake it records and reverses. This is brand identity, the
 * same exception already made for the rail and the avatars, not decoration.
 */
export default function HomePage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="rounded-2xl bg-brand-accent/5 px-5 py-5 sm:px-6 sm:py-6">
        <PageHeader
          title={<Greeting />}
          description="See what your Raresquared workforce is doing and anything that needs your attention."
        />
      </div>

      <SystemStatusBand />

      {/*
       * This row stretches, so both cards share the taller one's height and their bottom
       * edges line up. They come out near-identical anyway (426 vs 421px), so the cost is
       * a few pixels of trailing space inside the shorter card rather than the large void
       * that equal heights would leave if the two differed a lot.
       *
       * h-full on each card is what makes it work: stretching the grid cell only resizes
       * these wrapper divs, and the section inside would keep its content height.
       */}
      {/*
       * Two-up at xl (1280), not lg (1024).
       *
       * At exactly 1024 the rail leaves 672px of content, so a 3/2 split gave Your systems
       * 264px: "Goods Receipt Revi…" truncated, and "Needs attention" wrapped under its
       * own status dot. Stacking full-width there costs nothing — the page simply scrolls —
       * while 1280 and up has room for the pairing.
       */}
      <div className="grid items-stretch gap-6 xl:grid-cols-5">
        <div className="xl:col-span-3">
          <AttentionList />
        </div>

        <div className="xl:col-span-2">
          <AutomationSnapshot />
        </div>
      </div>

      {/*
       * Second row, paired rather than stacked.
       *
       * Latest updates first went under Your systems, which only moved the empty space:
       * the two stacked cards ran 934px against the 426px of Needs your attention, so the
       * page ended with 507px of void on the LEFT. Pairing across rows instead lands each
       * row level — 426/421 above — and gives Recent work's rows a neighbour rather than
       * leaving them to strand their timestamps under a full-width span.
       *
       * 7/5, not 1/2: at an even split Recent work fell to 544px and every description
       * wrapped to two lines ("Delivery note matched to PO-24820 and filed"), trading a
       * layout gap for a readability one. The wider share fits those lines while the
       * notification column, whose text is already a wrapped two-line detail, loses
       * nothing by being narrower. Mirrors the 3/2 emphasis of the row above.
       *
       * Also xl, not lg: at 1024 a 7/5 split left Recent work 396px, breaking "Invoice
       * extracted and matched to PO-24805" over four lines and the PO-24817 row over five.
       */}
      <div className="grid items-start gap-6 xl:grid-cols-12">
        <div className="xl:col-span-7">
          <RecentWork />
        </div>
        <div className="xl:col-span-5">
          <RecentNotifications />
        </div>
      </div>
    </div>
  );
}

/** Compact list of the client's automations and what each one is doing today. */
function AutomationSnapshot() {
  return (
    /* h-full: shares the height of Needs your attention beside it. */
    <Card className="h-full">
      {/*
       * "Today's work", not "Your workforce". This list renders AUTOMATIONS — Goods
       * Receipt Review, Invoice Processing — not the four people in the rail. Titling it
       * with the workforce would label five job names as the workforce and disagree with
       * the rail's four rows. "View all" still leads to /systems, where the people are.
       */}
      <CardHeader title="Today's work">
        <Link
          href="/systems"
          className="-my-1.5 flex min-h-9 items-center gap-1 rounded-lg px-2 text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          View all
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <AutomationSnapshotList />
    </Card>
  );
}

/** Completed work, most recent first. Folded into Home rather than given its own page. */
function RecentWork() {
  return (
    /*
     * No `measured` here any more. The 736px cap existed to stop a full-width card
     * stranding its timestamps ~660px from the label; in a half-width column the rows are
     * naturally tight, so the cap would never bind and would only mislead whoever reads
     * this next.
     */
    <Card>
      <CardHeader title="Recent work">
        <Link
          href="/activity"
          className="-my-1.5 flex min-h-9 items-center gap-1 rounded-lg px-2 text-muted transition-colors hover:bg-paper hover:text-ink"
        >
          Full history
          <ChevronRightIcon className="h-3.5 w-3.5" />
        </Link>
      </CardHeader>
      <RecentWorkList />
    </Card>
  );
}
