/**
 * Demo data for the Raresquared Labs client portal.
 *
 * Stands in for the backend. Every string here is written as the client would read it:
 * real back-office work (goods receipts, invoices, supplier email, CRM), no lorem ipsum,
 * no internal identifiers, no jargon. The fictional client is Northgate Supplies, a
 * builders' merchant.
 *
 * This module is the seed only. Mutable portal state lives in PortalProvider, so that
 * approving something on /approvals updates Home's count and the bell badge together.
 */

import type {
  Account,
  ActiveSession,
  Approval,
  Automation,
  Company,
  Integration,
  Module,
  AppNotification,
  NotificationPreferences,
  Run,
  Support,
  WorkItem,
} from "./types";

export const account: Account = {
  name: "Alex Whitfield",
  email: "alex.whitfield@northgatesupplies.co.uk",
  role: "Operations Director",
  initials: "AW",
};

export const company: Company = {
  name: "Northgate Supplies",
  industry: "Builders' merchant",
  plan: "Raresquared Managed",
};

/** Deliberately a named person, not a ticket form: this account has a lead who knows it. */
export const support: Support = {
  leadName: "Ruth Sandhu",
  leadInitials: "RS",
  leadRole: "Your account lead",
  email: "help@raresquared.co.uk",
  responseTime: "within 1 working hour",
  hours: "Monday to Friday, 8am–6pm",
};

export const automations: Automation[] = [
  {
    id: "goods-receipt-review",
    name: "Goods Receipt Review",
    description:
      "Checks every delivery note against the purchase order and flags anything that does not match.",
    status: "running",
    trigger: "A delivery note is scanned at goods-in",
    handledBy: "Marcus",
    tools: ["Sage 200", "SharePoint"],
    requiresApproval: false,
    runsToday: 12,
    lastRun: "4 minutes ago",
    successRate: 99,
    flow: [
      { label: "Delivery note scanned", stage: "trigger" },
      { label: "Marcus", stage: "agent" },
      { label: "Purchase order check", stage: "tools" },
      { label: "Filed automatically", stage: "approval" },
    ],
    configuration: [
      { label: "Runs", value: "Whenever a note is scanned" },
      { label: "Quantity tolerance", value: "Flag differences above 2%" },
      { label: "Filed to", value: "SharePoint — Goods In 2026" },
      { label: "Escalates to", value: "Warehouse supervisor" },
    ],
  },
  {
    id: "invoice-processing",
    name: "Invoice Processing",
    description:
      "Reads supplier invoices, matches them to the right order, and queues anything unusual for you.",
    status: "needs-attention",
    trigger: "An invoice arrives in the accounts inbox",
    handledBy: "Grace",
    tools: ["Xero", "Sage 200"],
    requiresApproval: true,
    runsToday: 9,
    lastRun: "3 minutes ago",
    successRate: 97,
    flow: [
      { label: "Invoice received", stage: "trigger" },
      { label: "Grace", stage: "agent" },
      { label: "Matched in Xero", stage: "tools" },
      { label: "You approve payment", stage: "approval" },
    ],
    configuration: [
      { label: "Runs", value: "On every invoice email" },
      { label: "Approval needed", value: "Above £2,500 or on a mismatch" },
      { label: "Posts to", value: "Xero — Accounts Payable" },
      { label: "Currency", value: "GBP" },
    ],
  },
  {
    id: "email-processing",
    name: "Email Processing",
    description:
      "Sorts incoming customer email, answers routine questions and passes the rest to your team.",
    status: "running",
    trigger: "An email arrives at sales@",
    handledBy: "Sam",
    tools: ["Microsoft 365", "HubSpot"],
    requiresApproval: false,
    runsToday: 8,
    lastRun: "7 minutes ago",
    successRate: 100,
    flow: [
      { label: "Email received", stage: "trigger" },
      { label: "Sam", stage: "agent" },
      { label: "Customer record updated", stage: "tools" },
      { label: "Replied or passed on", stage: "approval" },
    ],
    configuration: [
      { label: "Runs", value: "Continuously on sales@" },
      { label: "Replies automatically", value: "Stock and delivery questions" },
      { label: "Passes to team", value: "Complaints and credit queries" },
      { label: "Logged in", value: "HubSpot" },
    ],
  },
  {
    id: "purchase-order-matching",
    name: "Purchase Order Matching",
    description:
      "Compares what was ordered, delivered and invoiced so short deliveries are caught early.",
    status: "running",
    trigger: "A goods receipt and invoice both exist for an order",
    handledBy: "Grace",
    tools: ["Sage 200"],
    requiresApproval: true,
    runsToday: 6,
    lastRun: "22 minutes ago",
    successRate: 98,
    flow: [
      { label: "Order ready to match", stage: "trigger" },
      { label: "Grace", stage: "agent" },
      { label: "Three-way check", stage: "tools" },
      { label: "You confirm differences", stage: "approval" },
    ],
    configuration: [
      { label: "Runs", value: "Hourly" },
      { label: "Approval needed", value: "On any quantity or price difference" },
      { label: "Checks", value: "Order, delivery and invoice" },
      { label: "Reports to", value: "Purchasing team" },
    ],
  },
  {
    id: "supplier-communication",
    name: "Supplier Communication",
    description:
      "Chases late deliveries and confirms revised dates with your suppliers on your behalf.",
    status: "running",
    trigger: "A delivery passes its promised date",
    handledBy: "Nadia",
    tools: ["Microsoft 365", "Sage 200"],
    requiresApproval: true,
    runsToday: 3,
    lastRun: "18 minutes ago",
    successRate: 96,
    flow: [
      { label: "Delivery overdue", stage: "trigger" },
      { label: "Nadia", stage: "agent" },
      { label: "Drafts the chase email", stage: "tools" },
      { label: "You approve sending", stage: "approval" },
    ],
    configuration: [
      { label: "Runs", value: "Hourly" },
      { label: "Approval needed", value: "Before any email is sent" },
      { label: "Chases after", value: "2 working days overdue" },
      { label: "Sends from", value: "purchasing@northgatesupplies.co.uk" },
    ],
  },
  {
    id: "stock-reordering",
    name: "Stock Reordering",
    description:
      "Watches stock levels and prepares reorders before lines run out on the trade counter.",
    status: "running",
    trigger: "A line drops below its reorder point",
    handledBy: "Tom",
    tools: ["Sage 200"],
    requiresApproval: true,
    runsToday: 4,
    lastRun: "26 minutes ago",
    successRate: 98,
    flow: [
      { label: "Stock runs low", stage: "trigger" },
      { label: "Tom", stage: "agent" },
      { label: "Reorder prepared", stage: "tools" },
      { label: "You approve the order", stage: "approval" },
    ],
    configuration: [
      { label: "Runs", value: "Every 2 hours" },
      { label: "Approval needed", value: "Before any order is placed" },
      { label: "Takes account of", value: "Stock already on order" },
      { label: "Orders through", value: "Sage 200" },
    ],
  },
  {
    id: "statement-reconciliation",
    name: "Statement Reconciliation",
    description:
      "Reconciles supplier statements against your ledger and lists exactly what does not agree.",
    status: "running",
    trigger: "A supplier statement arrives",
    handledBy: "Ruth",
    tools: ["Sage 200", "Xero"],
    requiresApproval: false,
    runsToday: 2,
    lastRun: "2 hours ago",
    successRate: 97,
    flow: [
      { label: "Statement received", stage: "trigger" },
      { label: "Ruth", stage: "agent" },
      { label: "Compared to ledger", stage: "tools" },
      { label: "Differences listed", stage: "approval" },
    ],
    configuration: [
      { label: "Runs", value: "On every statement" },
      { label: "Checks", value: "Every line against the purchase ledger" },
      { label: "Reports", value: "Missing invoices and credits" },
      { label: "Sends to", value: "Accounts team" },
    ],
  },
  {
    id: "invoice-capture",
    name: "Invoice Capture",
    description:
      "Reads invoice PDFs as they arrive and pulls out the supplier, dates and totals.",
    status: "running",
    trigger: "An invoice PDF is uploaded or arrives by email",
    handledBy: "Ade",
    tools: ["SharePoint"],
    requiresApproval: true,
    runsToday: 0,
    lastRun: "",
    successRate: 96,
    flow: [
      { label: "Invoice received", stage: "trigger" },
      { label: "Ade", stage: "agent" },
      { label: "Fields extracted", stage: "tools" },
      { label: "You check the figures", stage: "approval" },
    ],
    configuration: [
      { label: "Reads", value: "Text-based PDFs up to 4MB" },
      { label: "Extracts", value: "Supplier, invoice number, dates, net, VAT, total" },
      { label: "Flags", value: "Anything it could not read with confidence" },
      { label: "Hands to", value: "Grace for matching and posting" },
    ],
  },
  {
    id: "crm-enrichment",
    name: "CRM Enrichment",
    description:
      "Keeps customer records complete by filling in trading details after each new enquiry.",
    status: "running",
    trigger: "A new customer record is created",
    handledBy: "Joel",
    tools: ["HubSpot", "Companies House"],
    requiresApproval: false,
    runsToday: 5,
    lastRun: "1 hour ago",
    successRate: 99,
    flow: [
      { label: "New record created", stage: "trigger" },
      { label: "Joel", stage: "agent" },
      { label: "Details looked up", stage: "tools" },
      { label: "Record completed", stage: "approval" },
    ],
    configuration: [
      { label: "Runs", value: "On every new record" },
      { label: "Adds", value: "Registered address and company number" },
      { label: "Source", value: "Companies House" },
      { label: "Updates", value: "HubSpot" },
    ],
  },
];

/**
 * What the client has on their account, and what they could add.
 *
 * Active modules unlock the automations above. The three available ones are real
 * back-office jobs a builders' merchant would recognise, priced as whole pounds per month.
 */
export const modules: Module[] = [
  {
    id: "mod-goods-in",
    personName: "Marcus",
    name: "Goods In",
    description:
      "Checks every delivery against what was ordered, so short and damaged deliveries are caught at the gate.",
    includes: [
      "Reads scanned delivery notes",
      "Matches them line by line to the purchase order",
      "Files the paperwork automatically",
    ],
    state: "active",
    monthlyPrice: 240,
    unlocks: ["goods-receipt-review"],
    addedOn: "March 2026",
  },
  {
    id: "mod-purchase-ledger",
    personName: "Grace",
    name: "Purchase Ledger",
    description:
      "Reads supplier invoices, matches them to orders and deliveries, and holds anything unusual for you.",
    includes: [
      "Reads invoices from the accounts inbox",
      "Three-way match against order and delivery",
      "Asks you before posting anything unexpected",
    ],
    state: "active",
    monthlyPrice: 320,
    unlocks: ["invoice-processing", "purchase-order-matching"],
    addedOn: "March 2026",
  },
  {
    id: "mod-customer-email",
    personName: "Sam",
    name: "Customer Email",
    description:
      "Handles routine customer email so your team only sees what genuinely needs them.",
    includes: [
      "Answers stock and delivery questions",
      "Logs every conversation against the customer",
      "Passes complaints and credit queries to your team",
    ],
    state: "active",
    monthlyPrice: 180,
    unlocks: ["email-processing"],
    addedOn: "June 2026",
  },
  {
    id: "mod-customer-records",
    personName: "Joel",
    name: "Customer Records",
    description:
      "Keeps customer records complete without anyone having to type in trading details.",
    includes: [
      "Fills in registered address and company number",
      "Runs on every new customer record",
      "Keeps HubSpot tidy",
    ],
    state: "active",
    monthlyPrice: 120,
    unlocks: ["crm-enrichment"],
    addedOn: "August 2026",
  },
  {
    id: "mod-invoice-capture",
    personName: "Ade",
    name: "Invoice Capture",
    description:
      "Reads invoice PDFs the moment they arrive, so nothing is typed in by hand.",
    includes: [
      "Reads text-based invoice PDFs",
      "Pulls out supplier, dates, net, VAT and total",
      "Flags anything it could not read with confidence",
    ],
    state: "active",
    monthlyPrice: 200,
    unlocks: ["invoice-capture"],
    addedOn: "September 2026",
  },
  {
    id: "mod-supplier-chasing",
    personName: "Nadia",
    name: "Supplier Chasing",
    description:
      "Chases late deliveries and confirms revised dates with suppliers on your behalf.",
    includes: [
      "Spots deliveries past their promised date",
      "Drafts the chase email for your approval",
      "Records what each supplier promised",
    ],
    state: "available",
    monthlyPrice: 160,
    unlocks: ["supplier-communication"],
    typicalImpact: "Merchants your size chase around 20 late orders a month.",
  },
  {
    id: "mod-stock-reordering",
    personName: "Tom",
    name: "Stock Reordering",
    description:
      "Watches stock levels and prepares reorders before lines run out on the trade counter.",
    includes: [
      "Tracks stock against your reorder points",
      "Prepares the purchase order for you to approve",
      "Takes account of what is already on order",
    ],
    state: "available",
    monthlyPrice: 280,
    unlocks: ["stock-reordering"],
    typicalImpact: "Most merchants cut out-of-stock lines by about a third.",
  },
  {
    id: "mod-statement-reconciliation",
    personName: "Ruth",
    name: "Statement Reconciliation",
    description:
      "Reconciles supplier statements against your ledger and lists exactly what does not agree.",
    includes: [
      "Reads monthly supplier statements",
      "Compares every line to your purchase ledger",
      "Lists missing invoices and credits to chase",
    ],
    state: "available",
    monthlyPrice: 220,
    unlocks: ["statement-reconciliation"],
    typicalImpact: "Usually saves a day and a half of accounts time each month.",
  },
];

export const approvals: Approval[] = [
  {
    id: "apr-3184",
    title: "Reject damaged goods and request a replacement",
    automationId: "goods-receipt-review",
    automationName: "Goods Receipt Review",
    reason:
      "Eight bags of cement arrived split and the delivery note was signed for as damaged at goods-in.",
    requestedAction:
      "Reject the damaged bags, request a replacement delivery and hold the invoice until it arrives.",
    context: [
      { label: "Purchase order", value: "PO-24823" },
      { label: "Supplier", value: "Hensall Aggregates" },
      { label: "Delivered", value: "40 bags — rapid set cement" },
      { label: "Damaged", value: "8 bags, split on arrival" },
      { label: "Signed for by", value: "Goods-in, bay 2" },
      { label: "Value affected", value: "£71.20" },
    ],
    submitted: "1 minute ago",
  },
  {
    id: "apr-3181",
    title: "Send purchase order update to Brantham Timber",
    automationId: "purchase-order-matching",
    automationName: "Purchase Order Matching",
    reason:
      "Raresquared found a mismatch between the delivered quantity and the original purchase order.",
    requestedAction: "Notify the supplier and flag the order for review.",
    context: [
      { label: "Purchase order", value: "PO-24817" },
      { label: "Supplier", value: "Brantham Timber" },
      { label: "Ordered", value: "240 lengths — C24 treated timber" },
      { label: "Delivered", value: "216 lengths" },
      { label: "Difference", value: "24 lengths short" },
      { label: "Order value", value: "£4,812.00" },
    ],
    urgent: true,
    submitted: "3 minutes ago",
  },
  {
    id: "apr-3179",
    title: "Approve invoice for payment",
    automationId: "invoice-processing",
    automationName: "Invoice Processing",
    reason:
      "This invoice is £340 higher than the order it matches, which is above the amount Raresquared can approve on its own.",
    requestedAction: "Post the invoice to Xero and schedule it for the next payment run.",
    context: [
      { label: "Invoice", value: "INV-99214" },
      { label: "Supplier", value: "Hensall Aggregates" },
      { label: "Invoice total", value: "£3,180.00" },
      { label: "Order total", value: "£2,840.00" },
      { label: "Difference", value: "£340.00 — delivery surcharge" },
      { label: "Due", value: "28 September 2026" },
    ],
    urgent: true,
    submitted: "48 minutes ago",
  },
  {
    id: "apr-3168",
    title: "Confirm revised delivery date",
    automationId: "supplier-communication",
    automationName: "Supplier Communication",
    reason:
      "Kesgrave Fixings replied offering a later delivery date, and the order is needed for a booked job.",
    requestedAction: "Accept the revised date and tell the site team.",
    context: [
      { label: "Purchase order", value: "PO-24790" },
      { label: "Supplier", value: "Kesgrave Fixings" },
      { label: "Promised", value: "16 September 2026" },
      { label: "Now offered", value: "23 September 2026" },
      { label: "Affects", value: "Marsh Lane site — booked 24 September" },
    ],
    submitted: "Yesterday at 16:20",
  },
  {
    id: "apr-3152",
    title: "Write off short delivery",
    automationId: "goods-receipt-review",
    automationName: "Goods Receipt Review",
    reason:
      "Two bags of sand were recorded as damaged on arrival and the supplier agreed a credit.",
    requestedAction: "Record the credit against the order and close the receipt.",
    context: [
      { label: "Purchase order", value: "PO-24702" },
      { label: "Supplier", value: "Hensall Aggregates" },
      { label: "Credit agreed", value: "£38.40" },
    ],
    submitted: "Monday at 09:12",
    resolution: { outcome: "approved", when: "Monday at 09:40" },
  },
  {
    id: "apr-3149",
    title: "Send chase email to Verity Steel",
    automationId: "supplier-communication",
    automationName: "Supplier Communication",
    reason: "The order was four working days overdue with no reply to the first message.",
    requestedAction: "Send a second chase email and copy the purchasing team.",
    context: [
      { label: "Purchase order", value: "PO-24688" },
      { label: "Supplier", value: "Verity Steel" },
      { label: "Days overdue", value: "4 working days" },
    ],
    submitted: "Friday at 14:05",
    resolution: { outcome: "rejected", when: "Friday at 15:30" },
  },
];

export const runs: Run[] = [
  {
    id: "run-88241",
    automationId: "email-processing",
    automationName: "Email Processing",
    summary: "Stock enquiry answered and logged against the customer record",
    status: "running",
    startedAt: "09:44",
    relativeTime: "Just now",
    involvedApproval: false,
    lane: 0,
    steps: [
      { time: "09:44", description: "Email received from a customer", icon: "mail" },
      { time: "09:44", description: "Sam identified a stock enquiry", icon: "contact" },
      { time: "09:44", description: "Checking availability in Sage 200", icon: "refresh" },
    ],
  },
  {
    id: "run-88240",
    automationId: "purchase-order-matching",
    automationName: "Purchase Order Matching",
    summary: "Short delivery found on PO-24817 — waiting for your confirmation",
    status: "awaiting-approval",
    startedAt: "09:41",
    relativeTime: "3 minutes ago",
    duration: "12 seconds",
    involvedApproval: true,
    lane: 1,
    steps: [
      { time: "09:41", description: "Order ready to match", icon: "box" },
      { time: "09:41", description: "Grace compared order, delivery and invoice", icon: "document" },
      { time: "09:41", description: "Found 24 lengths short against PO-24817", icon: "warning" },
      { time: "09:42", description: "Sent to you for approval", icon: "check" },
    ],
  },
  {
    id: "run-88239",
    automationId: "goods-receipt-review",
    automationName: "Goods Receipt Review",
    summary: "Delivery note matched to PO-24820 and filed",
    status: "completed",
    startedAt: "09:40",
    relativeTime: "4 minutes ago",
    duration: "8 seconds",
    involvedApproval: false,
    lane: 0,
    steps: [
      { time: "09:40", description: "Delivery note scanned at goods-in", icon: "document" },
      { time: "09:40", description: "Marcus read the note", icon: "contact" },
      { time: "09:40", description: "Matched every line to PO-24820", icon: "check" },
      { time: "09:40", description: "Filed to SharePoint", icon: "box" },
    ],
  },
  {
    id: "run-88238",
    automationId: "invoice-processing",
    automationName: "Invoice Processing",
    summary: "Couldn't update the customer record — Raresquared will retry",
    status: "failed",
    startedAt: "09:38",
    relativeTime: "6 minutes ago",
    duration: "31 seconds",
    involvedApproval: false,
    lane: 1,
    clientMessage:
      "We couldn't update the customer record in HubSpot. Raresquared will retry automatically in a few minutes, and the invoice is safely stored in the meantime.",
    technicalDetail:
      "HubSpot API returned 503 Service Unavailable for PATCH /crm/v3/objects/companies/8841 after 3 attempts. Retry scheduled with exponential backoff.",
    steps: [
      { time: "09:38", description: "Invoice received from Hensall Aggregates", icon: "invoice" },
      { time: "09:38", description: "Grace read the totals", icon: "contact" },
      { time: "09:38", description: "Matched to order PO-24805", icon: "check" },
      { time: "09:39", description: "Couldn't reach HubSpot to update the record", icon: "warning" },
    ],
  },
  {
    id: "run-88237",
    automationId: "email-processing",
    automationName: "Email Processing",
    summary: "Delivery question answered for a trade customer",
    status: "completed",
    startedAt: "09:37",
    relativeTime: "7 minutes ago",
    duration: "6 seconds",
    involvedApproval: false,
    lane: 0,
    steps: [
      { time: "09:37", description: "Email received from a customer", icon: "mail" },
      { time: "09:37", description: "Sam identified a delivery question", icon: "contact" },
      { time: "09:37", description: "Customer record found in HubSpot", icon: "link" },
      { time: "09:37", description: "Reply sent and conversation logged", icon: "check" },
    ],
  },
  {
    id: "run-88236",
    automationId: "invoice-processing",
    automationName: "Invoice Processing",
    summary: "Invoice INV-99214 held for your approval",
    status: "awaiting-approval",
    startedAt: "08:56",
    relativeTime: "48 minutes ago",
    duration: "14 seconds",
    involvedApproval: true,
    lane: 1,
    steps: [
      { time: "08:56", description: "Invoice received from Hensall Aggregates", icon: "invoice" },
      { time: "08:56", description: "Grace read the totals", icon: "contact" },
      { time: "08:56", description: "Found £340 more than the matching order", icon: "warning" },
      { time: "08:56", description: "Sent to you for approval", icon: "check" },
    ],
  },
  {
    id: "run-88235",
    automationId: "crm-enrichment",
    automationName: "CRM Enrichment",
    summary: "Trading details added to a new customer record",
    status: "completed",
    startedAt: "08:44",
    relativeTime: "1 hour ago",
    duration: "5 seconds",
    involvedApproval: false,
    lane: 0,
    steps: [
      { time: "08:44", description: "New customer record created", icon: "contact" },
      { time: "08:44", description: "Joel looked up the company", icon: "document" },
      { time: "08:44", description: "Registered address and number added", icon: "check" },
    ],
  },
  {
    id: "run-88234",
    automationId: "goods-receipt-review",
    automationName: "Goods Receipt Review",
    summary: "Delivery note matched to PO-24812 and filed",
    status: "completed",
    startedAt: "08:21",
    relativeTime: "1 hour ago",
    duration: "9 seconds",
    involvedApproval: false,
    lane: 1,
    steps: [
      { time: "08:21", description: "Delivery note scanned at goods-in", icon: "document" },
      { time: "08:21", description: "Marcus read the note", icon: "contact" },
      { time: "08:21", description: "Matched every line to PO-24812", icon: "check" },
      { time: "08:21", description: "Filed to SharePoint", icon: "box" },
    ],
  },
];

export const recentWork: WorkItem[] = [
  {
    id: "work-1",
    description: "Invoice extracted and matched to PO-24805",
    automationName: "Invoice Processing",
    status: "completed",
    relativeTime: "2 minutes ago",
    icon: "invoice",
  },
  {
    id: "work-2",
    description: "Delivery note matched to PO-24820 and filed",
    automationName: "Goods Receipt Review",
    status: "completed",
    relativeTime: "4 minutes ago",
    icon: "document",
  },
  {
    id: "work-3",
    description: "Stock enquiry answered for a trade customer",
    automationName: "Email Processing",
    status: "completed",
    relativeTime: "7 minutes ago",
    icon: "mail",
  },
  {
    id: "work-4",
    description: "Short delivery found on PO-24817",
    automationName: "Purchase Order Matching",
    status: "awaiting-approval",
    relativeTime: "3 minutes ago",
    icon: "warning",
  },
  {
    id: "work-5",
    description: "Trading details added to a new customer record",
    automationName: "CRM Enrichment",
    status: "completed",
    relativeTime: "1 hour ago",
    icon: "contact",
  },
  {
    id: "work-6",
    description: "Delivery note matched to PO-24812 and filed",
    automationName: "Goods Receipt Review",
    status: "completed",
    relativeTime: "1 hour ago",
    icon: "document",
  },
];

export const notifications: AppNotification[] = [
  {
    id: "ntf-1",
    kind: "approval-requested",
    title: "Approval needed on PO-24817",
    detail: "Purchase Order Matching found a short delivery from Brantham Timber.",
    relativeTime: "3 minutes ago",
    read: false,
    href: "/approvals",
    approvalId: "apr-3181",
  },
  {
    id: "ntf-2",
    kind: "automation-failed",
    title: "Invoice Processing hit a problem",
    detail: "A customer record couldn't be updated. Raresquared is retrying.",
    relativeTime: "6 minutes ago",
    read: false,
    href: "/activity",
  },
  {
    id: "ntf-3",
    kind: "approval-requested",
    title: "Invoice held for approval",
    detail: "INV-99214 from Hensall Aggregates is £340 above its order.",
    relativeTime: "48 minutes ago",
    read: false,
    href: "/approvals",
    approvalId: "apr-3179",
  },
  {
    id: "ntf-4",
    kind: "integration-disconnected",
    title: "Xero needs reconnecting",
    detail: "The connection expired, so invoices are queuing until it is restored.",
    relativeTime: "2 hours ago",
    read: true,
    href: "/settings",
  },
  {
    id: "ntf-5",
    kind: "automation-recovered",
    title: "Email Processing is back to normal",
    detail: "Microsoft 365 responded again and the backlog has cleared.",
    relativeTime: "Yesterday",
    read: true,
    href: "/systems",
  },
  {
    id: "ntf-6",
    kind: "automation-activated",
    title: "CRM Enrichment is now live",
    detail: "New customer records will have their trading details filled in.",
    relativeTime: "Monday",
    read: true,
    href: "/systems",
  },
];

export const integrations: Integration[] = [
  {
    id: "microsoft-365",
    name: "Microsoft 365",
    purpose: "Reads the sales inbox and sends replies on your behalf.",
    status: "connected",
    account: "sales@northgatesupplies.co.uk",
  },
  {
    id: "xero",
    name: "Xero",
    purpose: "Posts approved supplier invoices for payment.",
    status: "needs-attention",
    account: "Northgate Supplies Ltd",
    attentionReason:
      "The connection expired. Invoices are being held safely until it is reconnected.",
  },
  {
    id: "sage-200",
    name: "Sage 200",
    purpose: "Checks purchase orders, stock and deliveries.",
    status: "connected",
    account: "NORTHGATE-PROD",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    purpose: "Keeps customer records and conversation history up to date.",
    status: "connected",
    account: "Northgate Supplies",
  },
  {
    id: "sharepoint",
    name: "SharePoint",
    purpose: "Files delivery notes and signed paperwork.",
    status: "connected",
    account: "Goods In 2026",
  },
  {
    id: "gmail",
    name: "Gmail",
    purpose: "Alternative mailbox for customer email.",
    status: "not-connected",
  },
];

export const notificationPreferences: NotificationPreferences = {
  emailNotifications: true,
  approvalNotifications: true,
  failedAutomationAlerts: true,
  weeklySummary: false,
};

export const activeSessions: ActiveSession[] = [
  {
    id: "ses-1",
    device: "Chrome on macOS",
    location: "Ipswich, United Kingdom",
    lastActive: "Active now",
  },
  {
    id: "ses-2",
    device: "Safari on iPhone",
    location: "Ipswich, United Kingdom",
    lastActive: "Yesterday at 18:04",
  },
  {
    id: "ses-3",
    device: "Edge on Windows",
    location: "Colchester, United Kingdom",
    lastActive: "Monday at 08:15",
  },
];
