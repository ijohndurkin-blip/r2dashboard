"use client";

import { Card, CardHeader } from "./card";
import { usePortal } from "./portal-provider";
import { WorkerAvatar } from "./worker-avatar";

/**
 * Today's run totals, beside the timeline.
 *
 * The timeline answers "what happened" one run at a time; at 40 runs a day that is a lot
 * of scrolling before the client knows whether the day went well. This answers the
 * shape of the day in one glance: how much ran, how much needed a person, how much broke.
 *
 * Everything here is derived from the runs already on the provider — no new data, and no
 * second source of truth to drift from the list beside it.
 *
 * A filter panel was the other candidate for this space and was rejected: with the runs a
 * client actually has, filtering a short list is chrome for a problem they do not have yet.
 */

/** The timeline's own rule for what counts as an earlier day — kept identical on purpose. */
const EARLIER = /yesterday|monday|friday/i;

export function ActivitySummary() {
  const { runs, automations, activeModules } = usePortal();
  const today = runs.filter((run) => !EARLIER.test(run.relativeTime));

  const failed = today.filter((run) => run.status === "failed").length;
  const awaiting = today.filter((run) => run.status === "awaiting-approval").length;
  const running = today.filter((run) => run.status === "running").length;
  const completed = today.filter((run) => run.status === "completed").length;

  /*
   * Who ran today, busiest first.
   *
   * Keyed on the PERSON, not the job. This counted run.automationName while the heading
   * above it said "Who ran", so it listed "Goods Receipt Review" and "Invoice Processing"
   * under a heading promising names — the heading was renamed in the workforce sweep and
   * the data underneath it was not.
   *
   * Runs carry automationId, and handledBy lives on the automation, so the person comes
   * from a lookup rather than from the run itself.
   *
   * One consequence worth knowing: Grace runs two automations, so her two jobs merge into
   * a single row with their counts summed. That is correct for a question asking who was
   * busy — it is not a missing row.
   */
  const byPerson = new Map<string, { name: string; moduleId?: string; count: number }>();
  for (const run of today) {
    const person = automations.find((a) => a.id === run.automationId)?.handledBy;
    // A run whose automation is not on the account should not key on undefined; the
    // provider already scopes runs to unlocked modules, so this is belt and braces.
    if (!person) continue;
    // The module carries the face. Resolved through `unlocks` rather than by matching the
    // name, so two workers sharing a first name cannot collide on one avatar.
    const moduleId = activeModules.find((m) => m.unlocks.includes(run.automationId))?.id;
    const seen = byPerson.get(person);
    byPerson.set(person, {
      name: person,
      moduleId: seen?.moduleId ?? moduleId,
      count: (seen?.count ?? 0) + 1,
    });
  }
  const people = [...byPerson.values()].sort((a, b) => b.count - a.count);

  return (
    /*
     * Heading outside the card, mirroring the timeline beside it.
     *
     * The timeline renders "Today" as an h2 above its own card, so its card starts ~30px
     * down. With the label inside this card instead, items-start aligned this card's top
     * edge to the timeline's *heading*, and the two cards sat visibly out of line. Same
     * structure on both sides means they align by construction, not by a magic offset.
     */
    <section>
      {/*
       * "Today" to read, "Today's totals" to navigate by.
       *
       * The timeline beside this one also heads its column "Today", so by heading alone
       * the two were indistinguishable — a screen reader offered the same label twice with
       * no way to tell the log from the summary. The visible word stays short because it
       * is a column label sitting level with the timeline's; the accessible name says
       * which column it labels.
       */}
      <h2
        aria-label="Today's totals"
        className="mb-2.5 text-[13px] font-semibold text-muted"
      >
        Today
      </h2>

      <Card>
        {/*
         * No card title: the section heading above already says "Today", and repeating it
         * here would be the same label twice. The header carries only the total.
         *
         * `heading={false}`: "8 runs" is a value, not a label. As an h2 it put a number in
         * the document outline as though it introduced a section, and renamed itself every
         * time the count changed. The h2 above this card is what names the region.
         */}
        <CardHeader
          heading={false}
          title={`${today.length} ${today.length === 1 ? "run" : "runs"}`}
        />

        {/*
         * Only the states that need a person are coloured. Completed is the normal case and
         * stays neutral — colouring all four would make a good day look as loud as a bad one.
         */}
        <dl className="divide-y divide-line">
          <Line label="Completed" value={completed} />
          {running > 0 ? <Line label="Still running" value={running} /> : null}
          {awaiting > 0 ? <Line label="Waiting on you" value={awaiting} tone="text-flag" /> : null}
          {failed > 0 ? <Line label="Needed a retry" value={failed} tone="text-fault" /> : null}
        </dl>

        {people.length > 0 ? (
          <div className="border-t border-line px-5 py-4">
            <h3 className="text-[12.5px] font-semibold text-muted">Who ran</h3>
            <ul className="mt-2.5 flex flex-col gap-2">
              {/*
               * A face against each name, under a heading that asks "who". This was the
               * one list of people left in the portal reading as plain text.
               *
               * `items-center` rather than the baseline alignment the counts used: a
               * 22px circle beside 13px type has no shared baseline to sit on, and
               * aligning to one dropped the avatar below the name.
               */}
              {people.map((person) => (
                <li
                  key={person.name}
                  className="flex items-center justify-between gap-4 text-[13px]"
                >
                  <span className="flex min-w-0 items-center gap-2">
                    {person.moduleId ? (
                      <WorkerAvatar moduleId={person.moduleId} size={22} />
                    ) : null}
                    <span className="min-w-0 truncate text-ink">{person.name}</span>
                  </span>
                  <span className="tabular shrink-0 text-subtle">{person.count}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </Card>
    </section>
  );
}

function Line({
  label,
  value,
  tone = "text-ink",
}: {
  label: string;
  value: number;
  tone?: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3">
      <dt className="text-[13px] text-muted">{label}</dt>
      <dd className={`tabular text-[15px] font-semibold ${tone}`}>{value}</dd>
    </div>
  );
}
