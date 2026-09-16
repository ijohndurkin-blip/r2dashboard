"use client";

import { SystemCard } from "./system-card";
import { EmptyState } from "./empty-state";
import { BoxIcon } from "./icons";
import { usePortal } from "./portal-provider";

/**
 * Everything Raresquared runs for this client, then what else it could take on.
 */
export function SystemsView() {
  const { activeModules, automations, runs } = usePortal();

  const monthlyTotal = activeModules.reduce(
    (total, module) => total + module.monthlyPrice,
    0,
  );

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="systems-active">
        <div className="mb-4 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
          <h2 id="systems-active" className="text-[15px] font-semibold text-ink">
            Running for you
            <span className="tabular ml-2 text-[13px] font-normal text-muted">
              {activeModules.length}
            </span>
          </h2>
          <p className="text-[13px] text-muted">
            <span className="tabular text-ink">£{monthlyTotal}</span> a month in total
          </p>
        </div>

        {activeModules.length === 0 ? (
          <div className="rounded-xl border border-line bg-surface">
            <EmptyState
              icon={<BoxIcon className="h-5 w-5" />}
              title="Nobody working yet"
              description="Take someone on from Hire workers and they start straight away."
            />
          </div>
        ) : (
          /*
           * Two-up from lg rather than running one card per row down a 1097px column with
           * the right half empty. (It once matched an "available to add" grid below; that
           * section has moved to /hire.)
           *
           * Measured at 1440 before committing: two-up gives 541px per card, and at that
           * width nothing degrades — no checklist item wraps, descriptions stay at two
           * lines, the status block stays beside the title, and all four cards come out an
           * identical 262px tall, so the rows sit level. Three-up was tried and rejected:
           * 355px pushed descriptions to five lines and footers to two.
           *
           * xl (1280), not lg. lg was tried and measured: at 1024 each card fell to 340px,
           * which pushed every description to four lines, footers to two, and wrapped a
           * checklist item on Customer Email — the same failure as the rejected three-up.
           * The guess that 340px would be fine came from the available-to-add cards
           * rendering cleanly at 355px, but their descriptions are shorter than these.
           * Every other paired layout in the portal (Home, Activity, Settings) pairs at xl
           * for this reason; below it these stay single column, which measures clean.
           *
           * No width cap on this wrapper. An 896px cap was tried and removed: centred it
           * gave the page two left edges with every heading 108px adrift of its cards;
           * left-aligned it stopped the cards at 1184 while "Running for you" and the
           * monthly total still reached 1400.
           *
           * Cards stretch to their row rather than each sizing to its own content. The
           * items-start this replaces was there for a card that expanded inline, which it
           * no longer does — the detail is a dialog. Once one worker had a full-length
           * figure, start-alignment left that card visibly taller than the one beside it
           * with its neighbour trailing empty space; stretching keeps a row even whatever
           * height its tallest card needs.
           */
          <div className="grid w-full gap-4 xl:grid-cols-2">
            {activeModules.map((module) => (
              <SystemCard
                key={module.id}
                module={module}
                automations={automations.filter((automation) =>
                  module.unlocks.includes(automation.id),
                )}
                runs={runs}
              />
            ))}
          </div>
        )}
      </section>

      {/*
       * No "Available to hire" here any more. It has its own destination — "View
       * workforce" in the rail — because this page answers "are my people working?",
       * asked daily, while that one answers "who else could I have?", asked
       * occasionally. Underneath the working list, the second read as an afterthought.
       */}
    </div>
  );
}
