import Image from "next/image";

/**
 * A worker's face.
 *
 * Rendered 3D portraits, deliberately. The product framing is that you hire a worker for
 * goods-in rather than enable a module, and a dimensional face carries that where a flat
 * mark does not. The style is stylized-realistic — recognisably rendered, not a
 * photograph — which is the point: person enough to read as staff, CG enough that nobody
 * mistakes one for a staff photo.
 *
 * The line that still holds: these are roles, not colleagues. A face beside
 * "Marcus · Goods In — 12 runs today" is fine because the run count is real work the
 * module did. Invented human activity — a lunch break, a reply-to address, an opinion —
 * is not, and past work has already had to strip exactly that back out.
 *
 * Sources are Ready Player Me .glb exports, rendered to 512×512 RGBA by
 * `scripts/render-avatar.py`. Pre-rendered rather than live 3D: these display at 22–52px,
 * where a WebGL renderer would cost more than the detail it could show.
 *
 * No initials fallback behind the image. The portraits carry transparency, so an ink disc
 * underneath showed through as a dark ring at the edges and a letter behind the face. The
 * image is the whole component; a module without artwork renders nothing rather than a
 * stray letter.
 *
 * `ring-*`: a dark outfit on a dark surface merges into it and the head appears to float.
 * A hairline ring holds the circle's edge regardless of what the worker is wearing —
 * cheaper and more reliable than lighting every portrait to separate from every surface.
 *
 * `aria-hidden`: every caller names the person in adjacent text, so a face announced ahead
 * of it is noise.
 */
export function WorkerAvatar({
  moduleId,
  /** Rendered size in px. 52 on a worker's page, 44 in the dialog, 40 on a card, 22 in the rail. */
  size,
  className = "",
}: {
  moduleId: string;
  size: number;
  className?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{ width: size, height: size }}
      className={`relative block shrink-0 overflow-hidden rounded-full ring-1 ring-line ring-inset ${className}`}
    >
      {/*
       * Intrinsic 512×512, declared, so the box is reserved before the file loads and
       * nothing shifts — the same reason the wordmark declares its own dimensions.
       */}
      <Image
        src={`/workforce/${moduleId}.png`}
        alt=""
        width={512}
        height={512}
        className="h-full w-full object-cover"
      />
    </span>
  );
}
