"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam, getUser } from "@/lib/db/queries";
import { clientSchema, clientContactSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createClientAction(formData: FormData) {
  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    website: formData.get("website"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { team } = await getCurrentTeam();
  const user = await getUser();
  if (!team || !user) return { error: "Not authorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("clients")
    .insert({ ...parsed.data, team_id: team.id, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/clients");
  redirect(`/clients/${data.id}`);
}

export async function updateClientAction(id: string, formData: FormData) {
  const parsed = clientSchema.safeParse({
    name: formData.get("name"),
    industry: formData.get("industry"),
    website: formData.get("website"),
    address: formData.get("address"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("clients").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
}

export async function deleteClientAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("clients").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/clients");
  redirect("/clients");
}

export async function addClientContactAction(clientId: string, formData: FormData) {
  const parsed = clientContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone"),
    role: formData.get("role"),
    is_primary: formData.get("is_primary") === "on",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("client_contacts").insert({ ...parsed.data, client_id: clientId });
  if (error) return { error: error.message };
  revalidatePath(`/clients/${clientId}`);
}

export async function deleteClientContactAction(contactId: string, clientId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("client_contacts").delete().eq("id", contactId);
  if (error) return { error: error.message };
  revalidatePath(`/clients/${clientId}`);
}
