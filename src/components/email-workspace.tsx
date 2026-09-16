"use client";

import { useId, useState } from "react";
import { EmptyState } from "./empty-state";
import { MailIcon } from "./icons";
import { usePortal } from "./portal-provider";
import type { Run } from "@/lib/types";

/**
 * Sam's tool: what they did with the post, and which conversations needed a person.
 *
 * Deliberately NOT shaped like Ade's invoice dashboard. That one answers "what do these
 * documents add up to?" — money totals, due dates, a searchable register. Email has no
 * amounts and no due dates, so borrowing those four tiles would leave a client staring at
 * £0.00 forever. Sam's question is the split: how much of the inbox they absorbed, and what
 * they handed over. Their own configuration states it — replies to stock and delivery
 * questions, passes complaints and credit queries to your team — so that ratio IS the
 * dashboard.
 *
 * Pages are TABS inside the page rather than rows in the rail, at the client's direction,
 * reusing the tablist the approvals page already uses so there is one tab idiom.
 *
 * Every figure is derived from Sam's actual runs, never from `runsToday`. The automation
 * record says 8 while the seed holds 2, and a tile reading 8 above a table of 2 rows is
 * the same defect as the old "4 items need your attention" — the boldest number
 * disagreeing with the list beneath it.
 */

type Tab = "overview" | "conversations";
type TypeFilter = "all" | "stock" | "delivery" | "complaint" | "credit";
type OutcomeFilter = "all" | "answered" | "passed";

/**
 * What kind of enquiry a run was, read from its summary.
 *
 * The seed data describes runs in prose rather than carrying a category, so this reads
 * the words Sam's own configuration uses. When a run says nothing recognisable it stays
 * "Enquiry" rather than being forced into a bucket it may not belong in.
 */
function enquiryType(run: Run): { key: Exclude<TypeFilter, "all"> | "other"; label: string } {
  const text = `${run.summary} ${run.steps.map((s) => s.description).join(" ")}`.toLowerCase();
  if (/complaint/.test(text)) return { key: "complaint", label: "Complaint" };
  if (/credit/.test(text)) return { key: "credit", label: "Credit" };
  if (/deliver/.test(text)) return { key: "delivery", label: "Delivery" };
  if (/stock|availab/.test(text)) return { key: "stock", label: "Stock" };
  return { key: "other", label: "Enquiry" };
}

/** Whether Sam finished it themselves or handed it to a person. */
function wasPassedOn(run: Run): boolean {
  const text = `${run.summary} ${run.steps.map((s) => s.description).join(" ")}`.toLowerCase();
  return run.involvedApproval || /passed|escalat|handed|your team/.test(text);
}

/** A customer, where the seed data names one. Kept vague rather than invented. */
function customer(run: Run): string {
  const match = run.summary.match(/for (?:a )?([A-Z][\w'&. ]+?)(?:\.|$| —)/);
  if (match) return match[1].trim();
  return /trade/i.test(run.summary) ? "Trade customer" : "Customer";
}

function Tile({
  label,
  value,
  meta,
  tone = "neutral",
}: {
  label: string;
  value: number;
  meta: string;
  tone?: "neutral" | "flag";
}) {
  const active = tone === "flag" && value > 0;
  return (
    <div
      className={`rounded-xl border px-4 py-3.5 ${
        active ? "border-flag/30 bg-flag-soft" : "border-line bg-surface"
      }`}
    >
      <p className="text-[11.5px] font-semibold tracking-wide text-subtle">{label}</p>
      <p
        className={`tabular mt-2 text-[19px] font-semibold tracking-[-0.01em] ${
          active ? "text-flag" : "text-ink"
        }`}
      >
        {value}
      </p>
      <p className="mt-1 text-[12.5px] text-muted">{meta}</p>
    </div>
  );
}

function Chip({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`min-h-8 rounded-lg border px-2.5 text-[12.5px] transition-colors ${
        selected
          ? "border-ink bg-ink font-medium text-surface"
          : "border-line-strong bg-surface text-nav hover:bg-paper hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function EmailWorkspace({
  personName,
  automationIds,
}: {
  personName: string;
  /** The automations this worker runs, so their conversations can be picked out. */
  automationIds: string[];
}) {
  const { runs } = usePortal();
  const [tab, setTab] = useState<Tab>("overview");
  const [type, setType] = useState<TypeFilter>("all");
  const [outcome, setOutcome] = useState<OutcomeFilter>("all");
  const [query, setQuery] = useState("");
  const panelId = useId();

  const conversations = runs.filter((run) => automationIds.includes(run.automationId));
  const passedOn = conversations.filter(wasPassedOn);
  const answered = conversations.filter((run) => !wasPassedOn(run));
  const inFlight = conversations.filter((run) => run.status === "running");

  /*
   * The one figure a client actually wants: how much of the post Sam absorbed. A
   * proportion rather than a sum, which is why Ade's dashboard has no equivalent.
   */
  const share =
    conversations.length === 0
      ? 0
      : Math.round((answered.length / conversations.length) * 100);

  const shown = conversations.filter((run) => {
    if (type !== "all" && enquiryType(run).key !== type) return false;
    if (outcome === "answered" && wasPassedOn(run)) return false;
    if (outcome === "passed" && !wasPassedOn(run)) return false;
    const haystack = `${run.summary} ${customer(run)}`.toLowerCase();
    return query.trim() === "" || haystack.includes(query.trim().toLowerCase());
  });

  const tabs = [
    { id: "overview" as Tab, label: "Overview", count: undefined },
    { id: "conversations" as Tab, label: "Conversations", count: conversations.length },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* The same tablist the approvals page uses — one tab idiom in the portal. */}
      <div
        role="tablist"
        aria-label={`${personName}'s pages`}
        className="flex gap-1 border-b border-line"
      >
        {tabs.map((item) => {
          const selected = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`tab-${item.id}`}
              aria-selected={selected}
              aria-controls={`${panelId}-${item.id}`}
              onClick={() => setTab(item.id)}
              className={`-mb-px grid min-h-10 items-center border-b-2 px-3 text-[13.5px] transition-colors ${
                selected
                  ? "border-ink font-medium text-ink"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {/*
               * Both states occupy the bold width, so selecting a tab cannot resize it.
               * Same reasoning as the approvals tablist.
               */}
              <span
                aria-hidden
                className="invisible col-start-1 row-start-1 flex items-center gap-2 font-medium"
              >
                {item.label}
                {item.count !== undefined ? (
                  <span className="tabular text-[12.5px]">{item.count}</span>
                ) : null}
              </span>
              <span className="col-start-1 row-start-1 flex items-center gap-2">
                {item.label}
                {item.count !== undefined ? (
                  <span className="tabular text-[12.5px] text-subtle">{item.count}</span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      {tab === "overview" ? (
        <div
          role="tabpanel"
          id={`${panelId}-overview`}
          aria-labelledby="tab-overview"
          className="flex flex-col gap-4"
        >
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Tile
              label="Answered"
              value={answered.length}
              meta={`handled without you`}
            />
            <Tile
              label="Passed to you"
              value={passedOn.length}
              meta="needed a person"
              tone="flag"
            />
            <Tile label="Mid-conversation" value={inFlight.length} meta="still open" />
            <Tile
              label="Logged"
              value={conversations.length}
              meta="written to HubSpot"
            />
          </div>

          {/*
           * The split, as a bar. Green because "absorbed by Sam" is the healthy state,
           * and this is the one place on the page where a proportion is the answer.
           */}
          <section
            aria-labelledby="email-share"
            className="rounded-xl border border-line bg-surface px-5 py-4"
          >
            <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
              <h3 id="email-share" className="text-[15px] font-semibold text-ink">
                How {personName} is splitting the post
              </h3>
              <p className="text-[12.5px] text-muted">
                <span className="tabular font-medium text-ink">
                  {answered.length} of {conversations.length}
                </span>{" "}
                answered without you
              </p>
            </div>

            <div
              className="mt-3 flex h-2 overflow-hidden rounded-full bg-line"
              role="img"
              aria-label={`${share}% answered by ${personName}, ${100 - share}% passed to your team`}
            >
              <span className="bg-signal" style={{ width: `${share}%` }} />
              <span className="bg-flag" style={{ width: `${100 - share}%` }} />
            </div>

            <p className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[12.5px] text-muted">
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-signal" />
                Answered by {personName}
              </span>
              <span className="flex items-center gap-1.5">
                <span aria-hidden="true" className="h-2 w-2 rounded-full bg-flag" />
                Passed to your team
              </span>
            </p>
          </section>

          <section
            aria-labelledby="email-handles"
            className="rounded-xl border border-line bg-surface px-5 py-4"
          >
            <h3 id="email-handles" className="text-[15px] font-semibold text-ink">
              What {personName} answers without you
            </h3>
            <dl className="mt-3 grid gap-x-8 gap-y-2.5 text-[13px] sm:grid-cols-2">
              <div>
                <dt className="text-subtle">Answers automatically</dt>
                <dd className="mt-0.5 text-ink">Stock and delivery questions</dd>
              </div>
              <div>
                <dt className="text-subtle">Passes to your team</dt>
                <dd className="mt-0.5 text-ink">Complaints and credit queries</dd>
              </div>
              <div>
                <dt className="text-subtle">Watching</dt>
                <dd className="mt-0.5 text-ink">sales@, continuously</dd>
              </div>
              <div>
                <dt className="text-subtle">Logged in</dt>
                <dd className="mt-0.5 text-ink">HubSpot</dd>
              </div>
            </dl>
          </section>
        </div>
      ) : (
        <div
          role="tabpanel"
          id={`${panelId}-conversations`}
          aria-labelledby="tab-conversations"
          className="rounded-xl border border-line bg-surface"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              <h3 className="flex items-baseline gap-2 text-[15px] font-semibold text-ink">
                Conversations
                <span className="tabular text-[13px] font-normal text-muted">
                  {shown.length} of {conversations.length}
                </span>
              </h3>
              <p className="mt-0.5 text-[12.5px] text-muted">
                Every enquiry {personName} has handled, and how it ended.
              </p>
            </div>

            <label className="min-w-0 shrink-0">
              <span className="sr-only">Search conversations</span>
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search customer, subject…"
                className="min-h-9 w-full rounded-lg border border-line-strong bg-surface px-3 text-[13px] text-ink placeholder:text-subtle focus:border-ink focus:outline-none sm:w-60"
              />
            </label>
          </div>

          <div className="flex flex-wrap gap-x-6 gap-y-3 border-b border-line bg-paper px-5 py-3.5">
            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-[11.5px] font-medium text-subtle">
                Enquiry type
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["all", "All"],
                    ["stock", "Stock"],
                    ["delivery", "Delivery"],
                    ["complaint", "Complaint"],
                    ["credit", "Credit"],
                  ] as const
                ).map(([key, label]) => (
                  <Chip key={key} selected={type === key} onClick={() => setType(key)}>
                    {label}
                  </Chip>
                ))}
              </div>
            </fieldset>

            <fieldset className="min-w-0">
              <legend className="mb-1.5 text-[11.5px] font-medium text-subtle">
                Outcome
              </legend>
              <div className="flex flex-wrap gap-1.5">
                {(
                  [
                    ["all", "All"],
                    ["answered", "Answered"],
                    ["passed", "Passed on"],
                  ] as const
                ).map(([key, label]) => (
                  <Chip
                    key={key}
                    selected={outcome === key}
                    onClick={() => setOutcome(key)}
                  >
                    {label}
                  </Chip>
                ))}
              </div>
            </fieldset>
          </div>

          {shown.length === 0 ? (
            <EmptyState
              icon={<MailIcon className="h-5 w-5" />}
              title={
                conversations.length === 0
                  ? "No conversations yet."
                  : "Nothing matches those filters."
              }
              description={
                conversations.length === 0
                  ? `Enquiries appear here as ${personName} handles them.`
                  : "Clear a filter to see the rest."
              }
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left">
                <thead>
                  <tr className="border-b border-line text-[11.5px] font-semibold tracking-wide text-subtle">
                    <th className="px-5 py-3">Customer</th>
                    <th className="px-5 py-3">What they asked</th>
                    <th className="px-5 py-3">Type</th>
                    <th className="px-5 py-3">Outcome</th>
                    <th className="px-5 py-3 text-right">When</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {shown.map((run) => {
                    const kind = enquiryType(run);
                    const passed = wasPassedOn(run);
                    return (
                      <tr key={run.id} className="align-top">
                        <td className="px-5 py-3.5 text-[13px] text-ink">
                          {customer(run)}
                        </td>
                        <td className="px-5 py-3.5">
                          <p className="max-w-[46ch] text-[13px] leading-relaxed text-muted">
                            {run.summary}
                          </p>
                        </td>
                        <td className="px-5 py-3.5 text-[12.5px] text-muted">
                          {kind.label}
                        </td>
                        <td className="px-5 py-3.5">
                          <span
                            className={`inline-flex items-center rounded-full px-2 py-1 text-[12px] font-medium ${
                              passed
                                ? "bg-flag-soft text-flag"
                                : run.status === "running"
                                  ? "bg-paper text-muted"
                                  : "bg-signal-soft text-signal"
                            }`}
                          >
                            {passed
                              ? "Passed on"
                              : run.status === "running"
                                ? "In progress"
                                : "Answered"}
                          </span>
                        </td>
                        <td className="tabular px-5 py-3.5 text-right text-[12.5px] text-subtle">
                          {run.relativeTime}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
