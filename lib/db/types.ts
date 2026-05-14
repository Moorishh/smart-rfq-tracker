export type RfqStatus =
  | "received"
  | "sourcing"
  | "preparing"
  | "sent"
  | "follow_up"
  | "po_received"
  | "handed_over"
  | "won"
  | "lost";

export type RfqPriority = "low" | "normal" | "high" | "urgent";

export type QuoteStatus =
  | "draft"
  | "requested"
  | "received"
  | "sent_to_client"
  | "accepted"
  | "rejected";

export type ActivityType =
  | "created"
  | "status_changed"
  | "note"
  | "email_sent"
  | "call"
  | "quote_added"
  | "quote_updated"
  | "file_uploaded"
  | "assigned";

export type TeamRole = "owner" | "admin" | "member";

export type Profile = {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
};

export type Team = {
  id: string;
  name: string;
  slug: string;
  owner_id: string;
  created_at: string;
};

export type TeamMember = {
  team_id: string;
  user_id: string;
  role: TeamRole;
  joined_at: string;
};

export type Client = {
  id: string;
  team_id: string;
  name: string;
  industry: string | null;
  website: string | null;
  address: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type ClientContact = {
  id: string;
  client_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  is_primary: boolean;
  created_at: string;
};

export type Supplier = {
  id: string;
  team_id: string;
  name: string;
  category: string | null;
  website: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type SupplierContact = {
  id: string;
  supplier_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  role: string | null;
  is_primary: boolean;
  created_at: string;
};

export type Rfq = {
  id: string;
  team_id: string;
  reference: string | null;
  subject: string;
  client_id: string;
  contact_id: string | null;
  status: RfqStatus;
  priority: RfqPriority;
  date_received: string;
  due_date: string | null;
  next_follow_up: string | null;
  expected_amount: number | null;
  currency: string;
  assigned_to: string | null;
  notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Quote = {
  id: string;
  rfq_id: string;
  supplier_id: string | null;
  status: QuoteStatus;
  amount: number | null;
  currency: string;
  margin_pct: number | null;
  client_price: number | null;
  valid_until: string | null;
  file_url: string | null;
  notes: string | null;
  requested_at: string | null;
  received_at: string | null;
  sent_at: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
};

export type Activity = {
  id: string;
  team_id: string;
  rfq_id: string | null;
  user_id: string | null;
  type: ActivityType;
  content: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export const RFQ_STATUS_META: Record<RfqStatus, { label: string; color: string }> = {
  received:     { label: "RFQ Received",       color: "bg-blue-100 text-blue-700 border-blue-200" },
  sourcing:     { label: "Sourcing Supplier",  color: "bg-purple-100 text-purple-700 border-purple-200" },
  preparing:    { label: "Preparing Quote",    color: "bg-indigo-100 text-indigo-700 border-indigo-200" },
  sent:         { label: "Quote Sent",         color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  follow_up:    { label: "Follow-up",          color: "bg-amber-100 text-amber-700 border-amber-200" },
  po_received:  { label: "PO Received",        color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
  handed_over:  { label: "Handed Over",        color: "bg-teal-100 text-teal-700 border-teal-200" },
  won:          { label: "Won",                color: "bg-green-100 text-green-700 border-green-200" },
  lost:         { label: "Lost",               color: "bg-rose-100 text-rose-700 border-rose-200" },
};

export const PRIORITY_META: Record<RfqPriority, { label: string; color: string }> = {
  low:    { label: "Low",    color: "bg-slate-100 text-slate-700" },
  normal: { label: "Normal", color: "bg-blue-100 text-blue-700" },
  high:   { label: "High",   color: "bg-orange-100 text-orange-700" },
  urgent: { label: "Urgent", color: "bg-red-100 text-red-700" },
};

export const RFQ_STATUSES: RfqStatus[] = [
  "received","sourcing","preparing","sent","follow_up","po_received","handed_over","won","lost",
];

export const RFQ_PRIORITIES: RfqPriority[] = ["low","normal","high","urgent"];
