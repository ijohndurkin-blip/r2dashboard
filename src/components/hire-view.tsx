"use client";

import { AvailableSystemCard } from "./system-card";
import { EmptyState } from "./empty-state";
import { CheckIcon } from "./icons";
import { usePortal } from "./portal-provider";

/**
 * The people the client could take on.
 *
 * This lived as an "Available to hire" section at the foot of /systems until the client
 * moved it to its own destination. That page answers "are my people working?", which is a
 * question asked daily; this one answers "who else could I have?", which is asked
 * occasionally and deserves not to sit underneath the other.
 */
export function HireView() {
  const { availableModules } = usePortal();

  const availableTotal = availableModules.reduce(
    (total, module) => total + module.monthlyPrice,
    0,
  );

  if (availableModules.length === 0) {
    return (
      <div className="rounded-2xl border border-line bg-surface">
        <EmptyState
          icon={<CheckIcon className="h-5 w-5" />}
          title="You have taken everyone on."
          description="There is nobody left to hire — your workforce covers everything Raresquared offers."
        />
      </div>
    );
  }

  return (
    <section aria-labelledby="hire-available">
      {/*
       * The same row /systems carries above its grid — a count on the left, the money on
       * the right — so the two pages open the same way rather than this one dropping
       * straight from the page title into cards.
       *
       * The figure is what taking on everyone left would add, not a total already being
       * paid: on /systems the number is what the client owes each month, and printing an
       * equivalent-looking total here for people they have not hired would read as a bill.
       * "would add" is doing load-bearing work in that sentence.
       */}
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
        <h2 id="hire-available" className="text-[15px] font-semibold text-ink">
          Available to hire
          <span className="tabular ml-2 text-[13px] font-normal text-muted">
            {availableModules.length}
          </span>
        </h2>
        <p className="text-[13px] text-muted">
          <span className="tabular text-ink">£{availableTotal}</span> a month would add all{" "}
          {availableModules.length}
        </p>
      </div>

      {/*
       * Two-up at xl, matching /systems. This was three-up on the grounds that these
       * descriptions are shorter than the owned cards', which held while the card led with a
       * 40px avatar. A full-length figure needs the width: three-up puts the card at 355px,
       * and a figure beside the text leaves it about 155px to wrap in, against 340px at
       * two-up. The workforce page already learned this — a figure big enough to read
       * squeezed the description into a ribbon.
       */}
      <div className="grid gap-4 md:grid-cols-2">
        {availableModules.map((module) => (
          <AvailableSystemCard key={module.id} module={module} />
        ))}
      </div>
    </section>
  );
}
