import { z } from "zod";

const optionalText = z
  .string()
  .trim()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

const optionalDate = z
  .string()
  .transform((v) => (v === "" ? null : v))
  .nullable()
  .optional();

const optionalNumber = z
  .union([z.string(), z.number()])
  .transform((v) => {
    if (v === "" || v == null) return null;
    const n = typeof v === "string" ? Number(v) : v;
    return Number.isFinite(n) ? n : null;
  })
  .nullable()
  .optional();

export const loginSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "At least 8 characters"),
});

export const signupSchema = loginSchema.extend({
  full_name: z.string().min(2, "Your name is required"),
});

export const teamSchema = z.object({
  name: z.string().min(2, "Team name is too short"),
});

export const clientSchema = z.object({
  name: z.string().min(2, "Client name is required"),
  industry: optionalText,
  website: optionalText,
  address: optionalText,
  notes: optionalText,
});

export const clientContactSchema = z.object({
  name: z.string().min(2, "Contact name is required"),
  email: z.union([z.string().email(), z.literal("")]).transform((v) => v || null).nullable(),
  phone: optionalText,
  role: optionalText,
  is_primary: z.boolean().optional().default(false),
});

export const supplierSchema = z.object({
  name: z.string().min(2, "Supplier name is required"),
  category: optionalText,
  website: optionalText,
  notes: optionalText,
});

export const supplierContactSchema = clientContactSchema;

export const rfqSchema = z.object({
  subject: z.string().min(2, "Subject is required"),
  reference: optionalText,
  client_id: z.string().uuid("Pick a client"),
  contact_id: z.string().uuid().nullable().optional(),
  status: z.enum([
    "received","sourcing","preparing","sent","follow_up","po_received","handed_over","won","lost",
  ]).default("received"),
  priority: z.enum(["low","normal","high","urgent"]).default("normal"),
  date_received: z.string().min(1),
  due_date: optionalDate,
  next_follow_up: optionalDate,
  expected_amount: optionalNumber,
  currency: z.string().default("MAD"),
  assigned_to: z.string().uuid().nullable().optional(),
  notes: optionalText,
});

export const quoteSchema = z.object({
  rfq_id: z.string().uuid(),
  supplier_id: z.string().uuid().nullable().optional(),
  status: z.enum(["draft","requested","received","sent_to_client","accepted","rejected"]).default("draft"),
  amount: optionalNumber,
  currency: z.string().default("MAD"),
  margin_pct: optionalNumber,
  client_price: optionalNumber,
  valid_until: optionalDate,
  file_url: optionalText,
  notes: optionalText,
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type TeamInput = z.infer<typeof teamSchema>;
export type ClientInput = z.infer<typeof clientSchema>;
export type ClientContactInput = z.infer<typeof clientContactSchema>;
export type SupplierInput = z.infer<typeof supplierSchema>;
export type SupplierContactInput = z.infer<typeof supplierContactSchema>;
export type RfqInput = z.infer<typeof rfqSchema>;
export type QuoteInput = z.infer<typeof quoteSchema>;
