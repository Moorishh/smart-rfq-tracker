"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam, getUser } from "@/lib/db/queries";
import { rfqSchema, quoteSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { RfqStatus } from "@/lib/db/types";

function nullIfEmpty(v: FormDataEntryValue | null): string | null {
  if (v == null) return null;
  const s = v.toString().trim();
  return s === "" ? null : s;
}

export async function createRfqAction(formData: FormData) {
  const parsed = rfqSchema.safeParse({
    subject: formData.get("subject"),
    reference: formData.get("reference"),
    client_id: formData.get("client_id"),
    contact_id: nullIfEmpty(formData.get("contact_id")),
    status: formData.get("status") ?? "received",
    priority: formData.get("priority") ?? "normal",
    date_received: formData.get("date_received"),
    due_date: formData.get("due_date"),
    next_follow_up: formData.get("next_follow_up"),
    expected_amount: formData.get("expected_amount"),
    currency: formData.get("currency") || "MAD",
    assigned_to: nullIfEmpty(formData.get("assigned_to")),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { team } = await getCurrentTeam();
  const user = await getUser();
  if (!team || !user) return { error: "Not authorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("rfqs")
    .insert({ ...parsed.data, team_id: team.id, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    team_id: team.id,
    rfq_id: data.id,
    user_id: user.id,
    type: "created",
    content: "RFQ created",
  });

  revalidatePath("/rfqs");
  redirect(`/rfqs/${data.id}`);
}

export async function updateRfqAction(id: string, formData: FormData) {
  const parsed = rfqSchema.partial().safeParse({
    subject: formData.get("subject") ?? undefined,
    reference: formData.get("reference") ?? undefined,
    client_id: formData.get("client_id") ?? undefined,
    contact_id: nullIfEmpty(formData.get("contact_id")) ?? undefined,
    status: formData.get("status") ?? undefined,
    priority: formData.get("priority") ?? undefined,
    date_received: formData.get("date_received") ?? undefined,
    due_date: formData.get("due_date") ?? undefined,
    next_follow_up: formData.get("next_follow_up") ?? undefined,
    expected_amount: formData.get("expected_amount") ?? undefined,
    currency: formData.get("currency") ?? undefined,
    assigned_to: nullIfEmpty(formData.get("assigned_to")) ?? undefined,
    notes: formData.get("notes") ?? undefined,
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("rfqs").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/rfqs/${id}`);
  revalidatePath("/rfqs");
}

export async function updateRfqStatusAction(id: string, status: RfqStatus) {
  const { team } = await getCurrentTeam();
  const user = await getUser();
  if (!team || !user) return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("rfqs").update({ status }).eq("id", id);
  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    team_id: team.id,
    rfq_id: id,
    user_id: user.id,
    type: "status_changed",
    content: `Status changed to ${status}`,
    metadata: { status },
  });

  revalidatePath(`/rfqs/${id}`);
  revalidatePath("/rfqs");
}

export async function deleteRfqAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("rfqs").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/rfqs");
  redirect("/rfqs");
}

export async function addNoteAction(rfqId: string, formData: FormData) {
  const content = formData.get("content")?.toString().trim();
  if (!content) return { error: "Note is empty" };

  const { team } = await getCurrentTeam();
  const user = await getUser();
  if (!team || !user) return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("activities").insert({
    team_id: team.id,
    rfq_id: rfqId,
    user_id: user.id,
    type: "note",
    content,
  });
  if (error) return { error: error.message };
  revalidatePath(`/rfqs/${rfqId}`);
}

// =============== Quotes ===============
export async function createQuoteAction(rfqId: string, formData: FormData) {
  const parsed = quoteSchema.safeParse({
    rfq_id: rfqId,
    supplier_id: nullIfEmpty(formData.get("supplier_id")),
    status: formData.get("status") || "draft",
    amount: formData.get("amount"),
    currency: formData.get("currency") || "MAD",
    margin_pct: formData.get("margin_pct"),
    client_price: formData.get("client_price"),
    valid_until: formData.get("valid_until"),
    file_url: formData.get("file_url"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const user = await getUser();
  const { team } = await getCurrentTeam();
  if (!user || !team) return { error: "Not authorized" };

  const supabase = await createClient();
  const { error } = await supabase.from("quotes").insert({ ...parsed.data, created_by: user.id });
  if (error) return { error: error.message };

  await supabase.from("activities").insert({
    team_id: team.id,
    rfq_id: rfqId,
    user_id: user.id,
    type: "quote_added",
    content: "Supplier quote added",
  });

  revalidatePath(`/rfqs/${rfqId}`);
}

export async function deleteQuoteAction(quoteId: string, rfqId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("quotes").delete().eq("id", quoteId);
  if (error) return { error: error.message };
  revalidatePath(`/rfqs/${rfqId}`);
}
