import {
  Bell,
  Bot,
  Check,
  ChevronDown,
  ChevronRight,
  Clock,
  ExternalLink,
  FileText,
  House,
  Link2,
  Mail,
  Menu,
  Package,
  Pause,
  Plug,
  Plus,
  ReceiptText,
  RefreshCw,
  RotateCcw,
  Settings,
  ShieldCheck,
  SquareCheck,
  TriangleAlert,
  User,
  UserRoundPlus,
  Users,
  Wrench,
  X,
  Zap,
} from "lucide-react";
import type { IconKey } from "@/lib/types";

/**
 * The portal's icon set.
 *
 * These were hand-drawn SVGs, which blurred at small sizes: the rail renders at 18px from
 * a 24 viewBox — a 0.75 scale — where only multiples of 4 land on a whole device pixel, so
 * coordinates like y=15 fell on quarter-pixels and smeared a 1.5px stroke. Rather than
 * hand-tune every path against that grid, the stroke icons now come from Lucide, which is
 * drawn and optically corrected for exactly this. Tree-shaken, so only what is imported
 * ships.
 *
 * The names below are kept as the public surface so no consumer changed: every component
 * still imports `SomethingIcon` from here. Sizing is still done with `className`
 * (`h-4 w-4`), which Lucide accepts.
 *
 * The six brand marks further down stay hand-drawn — Lucide has no brand logos, and the
 * client asked for true brand colours. They are filled multi-colour shapes rather than
 * thin strokes, so they were never part of the blur problem.
 */

type IconProps = { className?: string };

/** Lucide's default stroke is 2; 1.75 sits better against this portal's type weight. */
const STROKE = 1.75;

function wrap(
  Glyph: React.ComponentType<{
    className?: string;
    strokeWidth?: number;
    "aria-hidden"?: boolean;
  }>,
) {
  function WrappedIcon({ className }: IconProps) {
    return <Glyph className={className} strokeWidth={STROKE} aria-hidden />;
  }
  // Named so React DevTools and the react/display-name lint rule see a real component.
  WrappedIcon.displayName = `Icon(${Glyph.displayName ?? Glyph.name ?? "Lucide"})`;
  return WrappedIcon;
}

// Navigation
export const HomeIcon = wrap(House);
/*
 * Two figures, not a network diagram.
 *
 * This was `Network` — three linked nodes — chosen when the row read "Your systems",
 * where it said "connected things working together". The row is "Your workforce" now,
 * and a topology glyph labels it as infrastructure.
 *
 * It stays distinguishable from `ContactIcon`, the single figure used inside run steps:
 * one figure versus a pair reads apart at 18px.
 */
export const SystemsIcon = wrap(Users);
/*
 * One figure with a plus: someone you could take on. Deliberately not a second pair of
 * figures — "Your workforce" and "Hire workers" sit two rows apart, so their glyphs
 * have to be told apart at a glance rather than differing by a head count.
 */
export const HireIcon = wrap(UserRoundPlus);
export const ApprovalsIcon = wrap(SquareCheck);
export const HistoryIcon = wrap(RotateCcw);
export const SettingsIcon = wrap(Settings);

// Chrome
export const BellIcon = wrap(Bell);
export const ChevronDownIcon = wrap(ChevronDown);
export const ChevronRightIcon = wrap(ChevronRight);
export const MenuIcon = wrap(Menu);
export const CloseIcon = wrap(X);
export const PauseIcon = wrap(Pause);
export const ClockIcon = wrap(Clock);
export const PlusIcon = wrap(Plus);
export const PlugIcon = wrap(Plug);

// Status and work
export const CheckIcon = wrap(Check);
export const WarningIcon = wrap(TriangleAlert);
export const RefreshIcon = wrap(RefreshCw);
export const MailIcon = wrap(Mail);
export const DocumentIcon = wrap(FileText);
export const InvoiceIcon = wrap(ReceiptText);
export const ContactIcon = wrap(User);
/* Consumed by the iconsByKey dispatcher below (IconKey "link"), not by any component. */
export const LinkIcon = wrap(Link2);
export const ExternalLinkIcon = wrap(ExternalLink);
export const BoxIcon = wrap(Package);

// Flow stages
export const TriggerIcon = wrap(Zap);
export const AgentIcon = wrap(Bot);
export const ToolsIcon = wrap(Wrench);
export const ApprovalIcon = wrap(ShieldCheck);

const iconsByKey: Record<IconKey, (props: IconProps) => React.ReactElement> = {
  document: DocumentIcon,
  mail: MailIcon,
  invoice: InvoiceIcon,
  contact: ContactIcon,
  check: CheckIcon,
  warning: WarningIcon,
  box: BoxIcon,
  link: LinkIcon,
  refresh: RefreshIcon,
};

/** Renders the icon a data record asked for by key. */
export function Icon({ name, className }: { name: IconKey; className?: string }) {
  const Component = iconsByKey[name];
  return <Component className={className} />;
}

/*
 * Service marks for the Integrations list, in each brand's own colours.
 *
 * Filled multi-colour glyphs rather than the stroke idiom used everywhere else: a client
 * scanning the list recognises Gmail's red envelope or Xero's blue disc far faster than a
 * monochrome silhouette. Drawn from each brand's published geometry rather than embedding
 * logo files, so there are no third-party assets in the repo.
 */

const brandBase = {
  viewBox: "0 0 24 24",
  fill: "none",
  "aria-hidden": true,
  focusable: false,
};

/** Gmail — the red-and-white envelope. */
export function GmailIcon({ className }: IconProps) {
  return (
    <svg {...brandBase} className={className}>
      <path d="M3.4 19.2h3.1v-7.5L2 8.3v9.3c0 .9.7 1.6 1.4 1.6Z" fill="#4285F4" />
      <path d="M17.5 19.2h3.1c.8 0 1.4-.7 1.4-1.6V8.3l-4.5 3.4Z" fill="#34A853" />
      <path d="M17.5 5.6v6.1L22 8.3V6.4c0-1.7-2-2.7-3.3-1.7Z" fill="#FBBC04" />
      <path d="M6.5 11.7V5.6L12 9.7l5.5-4.1v6.1L12 15.8Z" fill="#EA4335" />
      <path d="M2 6.4v1.9l4.5 3.4V5.6L5.3 4.7C4 3.7 2 4.7 2 6.4Z" fill="#C5221F" />
    </svg>
  );
}

/** Microsoft 365 — the four coloured panes. */
export function MicrosoftIcon({ className }: IconProps) {
  return (
    <svg {...brandBase} className={className}>
      <rect x="2.5" y="2.5" width="8.6" height="8.6" fill="#F25022" />
      <rect x="12.9" y="2.5" width="8.6" height="8.6" fill="#7FBA00" />
      <rect x="2.5" y="12.9" width="8.6" height="8.6" fill="#00A4EF" />
      <rect x="12.9" y="12.9" width="8.6" height="8.6" fill="#FFB900" />
    </svg>
  );
}

/** Xero — the blue disc with its white X. */
export function XeroIcon({ className }: IconProps) {
  return (
    <svg {...brandBase} className={className}>
      <circle cx="12" cy="12" r="10" fill="#13B5EA" />
      <path
        d="m9.1 12 -2-2a.75.75 0 0 1 1.06-1.06l2 2 2-2A.75.75 0 0 1 13.2 10l-2 2 2 2a.75.75 0 0 1-1.06 1.06l-2-2-2 2A.75.75 0 0 1 7.1 14Z"
        fill="#fff"
      />
      <circle cx="15.8" cy="12" r="1.5" fill="#fff" />
    </svg>
  );
}

/** Sage — the brand green. */
export function SageIcon({ className }: IconProps) {
  return (
    <svg {...brandBase} className={className}>
      <rect x="2" y="2" width="20" height="20" rx="5" fill="#00D639" />
      <path
        d="M16.6 9.1c-.9-.8-2.3-1.2-3.9-1.2-2.9 0-4.9 1.4-4.9 3.4 0 1.7 1.3 2.6 3.6 3 1.6.3 2.1.6 2.1 1.1 0 .6-.7 1-1.9 1-1.3 0-2.4-.4-3.2-1.1l-1.2 1.6c1 .9 2.6 1.4 4.3 1.4 3 0 4.9-1.4 4.9-3.4 0-1.8-1.3-2.7-3.8-3.1-1.5-.3-1.9-.5-1.9-1 0-.5.6-.9 1.7-.9 1.1 0 2 .3 2.7.9Z"
        fill="#fff"
      />
    </svg>
  );
}

/** HubSpot — the orange sprocket mark. */
export function HubSpotIcon({ className }: IconProps) {
  return (
    <svg {...brandBase} className={className}>
      <path
        d="M17.4 8.6V6.3a1.8 1.8 0 1 0-1.9 0v2.3c-.8.2-1.6.6-2.2 1.2L7.6 5.2c0-.2.1-.3.1-.5a2.2 2.2 0 1 0-2.2 2.2c.4 0 .7-.1 1-.3l5.6 4.4a4.6 4.6 0 0 0 .1 4.6l-1.7 1.7a1.5 1.5 0 0 0-.4-.1 2.3 2.3 0 1 0 2.3 2.3c0-.2 0-.3-.1-.4l1.7-1.7a4.7 4.7 0 1 0 3.4-8.8Zm-.9 7.1a2.4 2.4 0 1 1 0-4.9 2.4 2.4 0 0 1 0 4.9Z"
        fill="#FF7A59"
      />
    </svg>
  );
}

/** SharePoint — the teal document mark. */
export function SharePointIcon({ className }: IconProps) {
  return (
    <svg {...brandBase} className={className}>
      <circle cx="9.4" cy="7.6" r="5.1" fill="#036C70" />
      <circle cx="15.2" cy="12.4" r="4.8" fill="#1A9BA1" />
      <circle cx="10.4" cy="17.6" r="3.9" fill="#37C6D0" />
      <path
        d="M11.6 8.5H5.1a.9.9 0 0 0-.9.9v6.5c0 .5.4.9.9.9h6.5c.5 0 .9-.4.9-.9V9.4a.9.9 0 0 0-.9-.9Z"
        fill="#000"
        opacity=".2"
      />
      <rect x="2.6" y="9.1" width="9.6" height="9.6" rx=".9" fill="#03787C" />
      <path
        d="M9.3 13.6c-.2-.2-.5-.3-.9-.4-.4-.1-.7-.2-.8-.3-.1-.1-.2-.2-.2-.3 0-.2.1-.3.2-.4.2-.1.4-.2.6-.2.5 0 .9.1 1.3.4v-1.1a3.3 3.3 0 0 0-1.3-.2c-.5 0-1 .1-1.4.4-.3.3-.5.7-.5 1.1 0 .7.5 1.2 1.4 1.5.3.1.6.2.7.3.1.1.2.2.2.4 0 .1-.1.3-.2.4-.2.1-.4.2-.7.2a2 2 0 0 1-1.4-.5v1.2c.4.2.9.3 1.4.3.6 0 1.1-.1 1.4-.4.4-.3.6-.7.6-1.2 0-.4-.1-.7-.4-1Z"
        fill="#fff"
      />
    </svg>
  );
}

/**
 * Integration id -> service mark. Anything unmapped falls back to the generic plug, so a
 * new integration renders sensibly before it gets its own glyph.
 */
const serviceIcons: Record<string, (props: IconProps) => React.ReactElement> = {
  "microsoft-365": MicrosoftIcon,
  xero: XeroIcon,
  "sage-200": SageIcon,
  hubspot: HubSpotIcon,
  sharepoint: SharePointIcon,
  gmail: GmailIcon,
};

export function ServiceIcon({ id, className }: { id: string; className?: string }) {
  const Component = serviceIcons[id] ?? PlugIcon;
  return <Component className={className} />;
}

