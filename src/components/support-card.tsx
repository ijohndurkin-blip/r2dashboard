import { Card, CardHeader } from "./card";
import { MailIcon } from "./icons";
import { support } from "@/lib/data";

/**
 * How to reach a person at Raresquared, beside the Settings column.
 *
 * This fills what was ~376px of empty page, and earns it rather than merely occupying it:
 * the portal explains what ran and what needs a decision, but nothing anywhere told a
 * client who to contact when something is wrong. A client looking at an expired Xero
 * connection had no route to a human.
 *
 * Widening the Settings cards was the other way to use that space and was rejected on
 * measurement: every row is label-against-control, so the gap grows with the card —
 * 736px gives a 313px median, 880px gives 457px, full width gives 674px. There is no
 * width where the page gap closes and the controls stay near their labels.
 *
 * A named lead rather than a ticket form or a chat widget: the plan is "Raresquared
 * Managed", and a managed service that answers with a form contradicts itself.
 */
export function SupportCard() {
  return (
    <Card>
      <CardHeader title="Need help?" />

      <div className="flex flex-col gap-5 px-5 py-5">
        <div className="flex items-center gap-3.5">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-ink text-[13px] font-medium text-surface">
            {support.leadInitials}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink">{support.leadName}</p>
            <p className="mt-0.5 text-[12.5px] text-muted">{support.leadRole}</p>
          </div>
        </div>

        {/*
         * A real mailto, not a button that does nothing. Everything else in the portal
         * that looks actionable is, so a decorative contact link would be the odd one out.
         */}
        <a
          href={`mailto:${support.email}`}
          className="flex min-h-10 items-center justify-center gap-2 rounded-lg border border-line-strong bg-surface px-3.5 text-[13px] font-medium text-ink transition-colors hover:bg-paper"
        >
          <MailIcon className="h-4 w-4 text-muted" />
          Email your account lead
        </a>

        <dl className="flex flex-col gap-3 text-[13px]">
          <div>
            <dt className="text-[12.5px] text-subtle">Replies</dt>
            <dd className="mt-0.5 text-ink">{support.responseTime}</dd>
          </div>
          <div>
            <dt className="text-[12.5px] text-subtle">Available</dt>
            <dd className="mt-0.5 text-ink">{support.hours}</dd>
          </div>
        </dl>
      </div>
    </Card>
  );
}
