"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam, getUser } from "@/lib/db/queries";
import { supplierSchema, supplierContactSchema } from "@/lib/validation/schemas";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createSupplierAction(formData: FormData) {
  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    website: formData.get("website"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { team } = await getCurrentTeam();
  const user = await getUser();
  if (!team || !user) return { error: "Not authorized" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("suppliers")
    .insert({ ...parsed.data, team_id: team.id, created_by: user.id })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/suppliers");
  redirect(`/suppliers/${data.id}`);
}

export async function updateSupplierAction(id: string, formData: FormData) {
  const parsed = supplierSchema.safeParse({
    name: formData.get("name"),
    category: formData.get("category"),
    website: formData.get("website"),
    notes: formData.get("notes"),
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").update(parsed.data).eq("id", id);
  if (error) return { error: error.message };
  revalidatePath(`/suppliers/${id}`);
  revalidatePath("/suppliers");
}

export async function deleteSupplierAction(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("suppliers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/suppliers");
  redirect("/suppliers");
}

export async function addSupplierContactAction(supplierId: string, formData: FormData) {
  const parsed = supplierContactSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email") ?? "",
    phone: formData.get("phone"),
    role: formData.get("role"),
    is_primary: formData.get("is_primary") === "on",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const supabase = await createClient();
  const { error } = await supabase.from("supplier_contacts").insert({ ...parsed.data, supplier_id: supplierId });
  if (error) return { error: error.message };
  revalidatePath(`/suppliers/${supplierId}`);
}

export async function deleteSupplierContactAction(contactId: string, supplierId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("supplier_contacts").delete().eq("id", contactId);
  if (error) return { error: error.message };
  revalidatePath(`/suppliers/${supplierId}`);
}
