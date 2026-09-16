import type { FlowNode, FlowStage } from "@/lib/types";
import { AgentIcon, ApprovalIcon, ToolsIcon, TriggerIcon } from "./icons";

/**
 * The flow on each card in Your systems: the real steps a workflow takes, e.g.
 * "Delivery note scanned → Document Agent → Purchase order check → Filed automatically".
 *
 * This is a diagram, not a breadcrumb. Earlier versions were a single row of 12.5px text
 * inside a full-width outlined box, which read as a form field, with separators (first
 * "/", then a faint 12px rule) too weak to signal sequence at all. Now each stage is a
 * node — glyph on a bordered tile above its label — spread evenly across the width, with
 * a connecting rule drawn between tile centres.
 *
 * Geometry: every node is an equal-width flex column with the tile centred in it. The
 * connector is absolutely positioned *inside* each node after the first, spanning from
 * the previous node's centre to this one's, at exactly tile-centre height. That way it
 * meets the tiles however the labels wrap, and the last node draws nothing after it.
 *
 * Colour: the glyph stroke only. Tiles stay white with a hairline border — an earlier
 * version filled them with pastel tints and read as toyish.
 */

const stageIcon: Record<FlowStage, (props: { className?: string }) => React.ReactElement> = {
  trigger: TriggerIcon,
  agent: AgentIcon,
  tools: ToolsIcon,
  approval: ApprovalIcon,
};

const stageGlyph: Record<FlowStage, string> = {
  trigger: "text-brand-accent",
  agent: "text-brand",
  tools: "text-signal",
  approval: "text-flag",
};

/** Tile centre is 14px from the top of a 28px tile — the connector sits on that line. */
const TILE_CENTRE = "top-[14px]";

export function FlowDiagram({ steps }: { steps: { node: FlowNode }[] }) {
  return (
    <ol className="flex items-start">
      {steps.map(({ node }, index) => {
        const StageIcon = stageIcon[node.stage];
        const first = index === 0;

        return (
          <li
            key={`${node.stage}-${node.label}`}
            className="relative flex flex-1 flex-col items-center px-1 text-center"
          >
            {/*
             * Spans from the previous node's centre to this one's: -50% of this column
             * plus half, less the tile radius at each end so it stops at the tile edge.
             */}
            {!first ? (
              <span
                aria-hidden="true"
                className={`absolute left-[calc(-50%+18px)] right-[calc(50%+18px)] ${TILE_CENTRE} h-px bg-line-strong`}
              />
            ) : null}

            <span className="relative z-10 flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-line bg-surface">
              <StageIcon className={`h-[15px] w-[15px] ${stageGlyph[node.stage]}`} />
            </span>

            <span className="mt-2 text-[12px] leading-snug text-muted">{node.label}</span>
          </li>
        );
      })}
    </ol>
  );
}
