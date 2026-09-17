"use client";

/**
 * Shared portal state.
 *
 * The brief requires Approve/Reject and the notification bell to actually work, and the
 * counts are cross-page: approving on /approvals must change Home's "needs your attention"
 * count and the bell badge at the same time. A static data module can't do that, so the
 * seed data is loaded into one provider mounted in the root layout. Pages stay server
 * components; only the interactive pieces read from here.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  approvals as seedApprovals,
  automations as seedAutomations,
  integrations as seedIntegrations,
  modules as seedModules,
  notificationPreferences as seedPreferences,
  notifications as seedNotifications,
  recentWork as seedRecentWork,
  runs as seedRuns,
} from "@/lib/data";
import type {
  AppNotification,
  Approval,
  Automation,
  ExternalReviewItem,
  Integration,
  Module,
  NotificationPreferences,
  Run,
  WorkItem,
} from "@/lib/types";

/** Where Bob's real application lives — see invoice-processor-embed.tsx for the same URL. */
const INVOICE_PROCESSOR_ORIGIN = "https://invoices.raresquaredlabs.co.uk";

/** Which workers are active vs. available to hire — the one thing here worth persisting. */
const MODULES_STORAGE_KEY = "r2dashboard:modules";

interface PortalState {
  approvals: Approval[];
  /** Approvals still waiting on the client, newest first. */
  pendingApprovals: Approval[];
  /** Approvals the client has already actioned. */
  completedApprovals: Approval[];
  automations: Automation[];
  notifications: AppNotification[];
  unreadCount: number;
  integrations: Integration[];
  preferences: NotificationPreferences;
  modules: Module[];
  /** Modules on the account, newest addition last. */
  activeModules: Module[];
  /** Modules the client could add. */
  availableModules: Module[];
  /** Runs belonging to automations the client actually has. */
  runs: Run[];
  /** Completed work from automations the client actually has. */
  recentWork: WorkItem[];
  /** True when nothing needs the client's attention. */
  allHealthy: boolean;

  /**
   * Invoices flagged for review, read live from Bob's real application rather than seed
   * data. Empty until that app has been opened at least once in this browser (its session
   * cookie is what authenticates the read) — never an error, just nothing to show yet.
   */
  bobReviewItems: ExternalReviewItem[];

  approveRequest: (id: string) => void;
  rejectRequest: (id: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  setPreference: (key: keyof NotificationPreferences, value: boolean) => void;
  /**
   * Add a module to the account. Today this flips local state; when a payment provider
   * is wired up, this is the single call site that becomes an async checkout.
   */
  purchaseModule: (id: string) => void;
  /** Take a module off the account. It moves back to Hire workers, not deleted. */
  removeModule: (id: string) => void;
}

const PortalContext = createContext<PortalState | null>(null);

/** Timestamp for a just-taken action, in the same style as the seed data. */
function nowLabel(): string {
  return new Date().toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function PortalProvider({ children }: { children: ReactNode }) {
  const [approvals, setApprovals] = useState<Approval[]>(seedApprovals);
  const [notifications, setNotifications] = useState<AppNotification[]>(seedNotifications);
  const [preferences, setPreferences] = useState<NotificationPreferences>(seedPreferences);
  const [integrations] = useState<Integration[]>(seedIntegrations);
  const [modules, setModules] = useState<Module[]>(seedModules);
  const [bobReviewItems, setBobReviewItems] = useState<ExternalReviewItem[]>([]);

  /*
   * Removing or re-hiring a worker is meant to stick — a client who takes Bob off the
   * account shouldn't see him snap back the moment they refresh. Kept out of the initial
   * state (rather than read in the useState initializer) so the server-rendered markup
   * and the first client render match; this restores the saved set right after mount,
   * one render later.
   */
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(MODULES_STORAGE_KEY);
      // A genuine one-time sync from an external store on mount, not a derived-state
      // effect the lint rule is meant to catch — there's no prop or render value to
      // adjust state from, only localStorage, which useState's initializer can't reach
      // safely without risking a server/client markup mismatch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (stored) setModules(JSON.parse(stored) as Module[]);
    } catch {
      // Private browsing, disabled storage, or corrupted data — seed data still works.
    }
  }, []);

  /*
   * Skips its very first run. Without this, mount order works against itself: the
   * restore effect above calls setModules, but that update hasn't been applied to
   * `modules` yet by the time THIS effect runs in the same commit — so its first pass
   * would write the untouched seed data straight over whatever was just restored,
   * and the correction would only arrive a render later than the damage. One skipped
   * write on mount costs nothing; every write after an actual change still lands.
   */
  const skippedFirstPersist = useRef(false);
  useEffect(() => {
    if (!skippedFirstPersist.current) {
      skippedFirstPersist.current = true;
      return;
    }
    try {
      window.localStorage.setItem(MODULES_STORAGE_KEY, JSON.stringify(modules));
    } catch {
      // Nothing to persist to — the account still works for this session.
    }
  }, [modules]);

  /*
   * Polls Bob's real backend for its own live review queue. This is the one piece of
   * portal state that isn't seed data — everything else here is a demo the client can
   * ignore, but Bob's badge and the Approvals page should reflect his actual invoices.
   *
   * Silently gives up on any failure (offline, not yet authenticated in this browser,
   * CORS not configured yet) and leaves the list as it was — a stale or empty count is
   * fine; breaking the dashboard over it is not.
   */
  useEffect(() => {
    let cancelled = false;
    async function poll() {
      try {
        const res = await fetch(`${INVOICE_PROCESSOR_ORIGIN}/api/state`, {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        const invoices = Array.isArray(data.invoices) ? data.invoices : [];
        const items: ExternalReviewItem[] = invoices
          .filter((invoice: { status?: string }) => invoice.status === "needs_review")
          .map((invoice: {
            id: string;
            invoiceNumber: string;
            supplierName: string;
            totalAmount: number | null;
          }) => ({
            id: invoice.id,
            invoiceNumber: invoice.invoiceNumber,
            supplierName: invoice.supplierName,
            totalAmount: invoice.totalAmount,
          }));
        if (!cancelled) setBobReviewItems(items);
      } catch {
        // Offline, blocked, or not yet authenticated — nothing to do here.
      }
    }
    poll();
    const timer = window.setInterval(poll, 60000);
    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, []);

  /*
   * The 60s poll above is a baseline that works from anywhere in the portal, but it left
   * a real gap: acting on an invoice inside Bob's own embedded iframe didn't move his
   * badge until the next poll landed, which read as "you have to refresh". His app posts
   * its review queue on every data change (see App.tsx's loadData there); this catches
   * that broadcast and updates immediately whenever his iframe happens to be mounted,
   * with the poll still covering every other page and the time before he's ever opened.
   */
  useEffect(() => {
    function onMessage(event: MessageEvent) {
      if (event.origin !== INVOICE_PROCESSOR_ORIGIN) return;
      const data = event.data as { type?: string; items?: ExternalReviewItem[] } | null;
      if (data?.type === "rare2-invoice-processor:review-queue" && Array.isArray(data.items)) {
        setBobReviewItems(data.items);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  /**
   * Resolving an approval also clears any notification that pointed at it, so the bell
   * never keeps nagging about work the client has already done.
   */
  const resolve = useCallback(
    (id: string, outcome: "approved" | "rejected") => {
      setApprovals((current) =>
        current.map((approval) =>
          approval.id === id && !approval.resolution
            ? { ...approval, resolution: { outcome, when: `Today at ${nowLabel()}` } }
            : approval,
        ),
      );
      // Clear only the notification raised for *this* approval. Matching on kind alone
      // would dismiss unrelated requests the client has not looked at yet.
      setNotifications((current) =>
        current.map((notification) =>
          notification.approvalId === id && !notification.read
            ? { ...notification, read: true }
            : notification,
        ),
      );
    },
    [],
  );

  const approveRequest = useCallback((id: string) => resolve(id, "approved"), [resolve]);
  const rejectRequest = useCallback((id: string) => resolve(id, "rejected"), [resolve]);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((current) =>
      current.map((notification) =>
        notification.id === id ? { ...notification, read: true } : notification,
      ),
    );
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setNotifications((current) => current.map((n) => (n.read ? n : { ...n, read: true })));
  }, []);

  const setPreference = useCallback(
    (key: keyof NotificationPreferences, value: boolean) => {
      setPreferences((current) => ({ ...current, [key]: value }));
    },
    [],
  );

  /**
   * Adding a module switches on the automations behind it and tells the client it is live.
   * Replacing this body with a checkout call is the only change a real payment flow needs.
   */
  const purchaseModule = useCallback((id: string) => {
    setModules((current) =>
      current.map((module) =>
        module.id === id && module.state === "available"
          ? { ...module, state: "active", addedOn: "Just now" }
          : module,
      ),
    );

    const added = seedModules.find((module) => module.id === id);
    if (!added) return;

    setNotifications((current) => [
      {
        id: `ntf-mod-${id}`,
        kind: "automation-activated",
        title: `${added.name} is now live`,
        detail: `${added.description}`,
        relativeTime: "Just now",
        read: false,
        href: "/systems",
      },
      ...current,
    ]);
  }, []);

  /**
   * The reverse of purchaseModule: takes a worker off the account. They move back to
   * Hire workers rather than being deleted — the module's own data (description,
   * pricing, artwork) stays exactly as it was, ready to take on again.
   */
  const removeModule = useCallback((id: string) => {
    setModules((current) =>
      current.map((module) =>
        module.id === id && module.state === "active"
          ? { ...module, state: "available" }
          : module,
      ),
    );
  }, []);

  const value = useMemo<PortalState>(() => {
    const activeModules = modules.filter((module) => module.state === "active");
    const availableModules = modules.filter((module) => module.state === "available");
    const bobIsActive = activeModules.some(
      (module) => module.id === "mod-bob-invoice-processor",
    );

    /*
     * Everything the client sees is scoped to the modules on their account. Without this
     * the portal would report approvals and work for automations they do not have, which
     * is exactly the kind of thing that destroys trust in what the portal is telling them.
     */
    const unlocked = new Set(activeModules.flatMap((module) => module.unlocks));
    const automations = seedAutomations.filter((automation) => unlocked.has(automation.id));
    const runs = seedRuns.filter((run) => unlocked.has(run.automationId));

    const unlockedNames = new Set(automations.map((automation) => automation.name));
    const recentWork = seedRecentWork.filter((item) =>
      unlockedNames.has(item.automationName),
    );

    const visibleApprovals = approvals.filter((approval) =>
      unlocked.has(approval.automationId),
    );

    /*
     * Notifications are gated too. Without this the bell could nag about work belonging
     * to a module the client has not bought — the same failure the other surfaces are
     * filtered to prevent. A notification with no approvalId (a general one) always shows.
     */
    const visibleNotifications = notifications.filter((notification) => {
      if (!notification.approvalId) return true;
      const source = approvals.find((a) => a.id === notification.approvalId);
      return !source || unlocked.has(source.automationId);
    });
    /*
     * Pending approvals, the urgent ones first.
     *
     * Sorted here rather than in the card, so the rail's counts, Home's three and the
     * full list on /approvals all agree on which ones lead. A card that sorted for itself
     * would show a different top three from the page it links to.
     *
     * Within each group the source order is kept, which is newest first. That is
     * deliberate: age is a weak signal on its own — the oldest of these has been waiting
     * since yesterday precisely because nothing about it is urgent.
     */
    const pendingApprovals = visibleApprovals
      .filter((approval) => !approval.resolution)
      .slice()
      .sort((a, b) => Number(b.urgent ?? false) - Number(a.urgent ?? false));
    const completedApprovals = visibleApprovals.filter((approval) => approval.resolution);

    /*
     * Summed only to answer "is anything outstanding at all?". It used to be exposed as
     * attentionCount and printed as "4 items need your attention", which disagreed with
     * every other count on Home; the band now names approvals and unhealthy systems
     * separately, so the total stays internal to this flag. Bob's live queue counts here
     * too — Home's dot has no business saying "Everything running normally" while an
     * actual invoice sits flagged.
     */
    const unhealthy = automations.filter(
      (automation) => automation.status === "needs-attention",
    ).length;
    const outstanding = pendingApprovals.length + unhealthy + bobReviewItems.length;

    return {
      approvals: visibleApprovals,
      pendingApprovals,
      completedApprovals,
      automations,
      notifications: visibleNotifications,
      unreadCount: visibleNotifications.filter((notification) => !notification.read).length,
      integrations,
      preferences,
      modules,
      activeModules,
      availableModules,
      runs,
      recentWork,
      allHealthy: outstanding === 0,
      /*
       * Scoped to whether Bob is actually on the account, same principle as `unlocked`
       * above: a client who has removed him should not keep seeing his invoices flagged
       * across the sidebar, Home and Approvals. The underlying poll and message listener
       * keep running regardless, so re-hiring him shows the current count immediately
       * rather than waiting on the next poll.
       */
      bobReviewItems: bobIsActive ? bobReviewItems : [],
      approveRequest,
      rejectRequest,
      markNotificationRead,
      markAllNotificationsRead,
      setPreference,
      purchaseModule,
      removeModule,
    };
  }, [
    approvals,
    modules,
    notifications,
    integrations,
    preferences,
    bobReviewItems,
    approveRequest,
    rejectRequest,
    markNotificationRead,
    markAllNotificationsRead,
    setPreference,
    purchaseModule,
    removeModule,
  ]);

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>;
}

export function usePortal(): PortalState {
  const context = useContext(PortalContext);
  if (!context) {
    throw new Error("usePortal must be used inside PortalProvider");
  }
  return context;
}
