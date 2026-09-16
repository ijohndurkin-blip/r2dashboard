import Image from "next/image";

/**
 * A worker, full length, floating on the card.
 *
 * The framing is that you hire a worker rather than enable a module, and a whole person
 * carries that where a cropped head does not. Separate from `WorkerAvatar` rather than a
 * mode on it: that component is built around the circular crop — `rounded-full`, the
 * `overflow-hidden`, the ring that holds its edge — and none of it applies here. No
 * circle, no ring, no plate. The render carries its own transparency, so the figure sits
 * directly on the card.
 *
 * `object-contain`: the source is 2:3 and the box may not be, and `cover` would crop the
 * head and shoes — the two things that make it read as a whole person.
 *
 * Only some workers have a full-length render; `hasFigure` is how a caller checks before
 * reaching for one, so a module without the artwork falls back to the head avatar rather
 * than requesting a file that is not there. `next/image` renders a broken image for a 404,
 * not nothing, so this is a gate rather than a nicety.
 *
 * `aria-hidden`: every caller names the person in adjacent text.
 */

/** Modules with a render in `public/workforce/full/`. */
const WITH_FIGURE = new Set([
  "mod-goods-in",
  "mod-purchase-ledger",
  "mod-customer-email",
  "mod-customer-records",
  "mod-invoice-capture",
  "mod-supplier-chasing",
  "mod-stock-reordering",
  "mod-statement-reconciliation",
]);

export function hasFigure(moduleId: string) {
  return WITH_FIGURE.has(moduleId);
}

export function WorkerFigure({
  moduleId,
  /** Rendered height in px. The figure is 2:3, so width follows at two thirds of this. */
  height,
  className = "",
}: {
  moduleId: string;
  height: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ height, width: Math.round((height * 2) / 3) }}
      className={`relative block shrink-0 ${className}`}
    >
      {/*
       * Intrinsic 512×768, declared, so the box is reserved before the file loads and
       * nothing shifts — as the head avatar and the wordmark both do.
       */}
      <Image
        src={`/workforce/full/${moduleId}.png`}
        alt=""
        width={512}
        height={768}
        className="h-full w-full object-contain"
      />
    </span>
  );
}
