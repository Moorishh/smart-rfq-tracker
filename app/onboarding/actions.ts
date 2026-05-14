"use server";

import { createClient } from "@/lib/supabase/server";
import { teamSchema } from "@/lib/validation/schemas";
import { slugify } from "@/lib/utils";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";

export async function createTeamAction(formData: FormData) {
  const parsed = teamSchema.safeParse({ name: formData.get("name") });
  if (!parsed.success) {
    return { error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  const supabase = await createClient();
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return { error: "Not authenticated" };

  // Generate a unique slug
  let slug = slugify(parsed.data.name);
  if (!slug) slug = "team";
  let suffix = 0;
  while (true) {
    const candidate = suffix === 0 ? slug : `${slug}-${suffix}`;
    const { data: existing } = await supabase
      .from("teams")
      .select("id")
      .eq("slug", candidate)
      .maybeSingle();
    if (!existing) {
      slug = candidate;
      break;
    }
    suffix += 1;
  }

  const { data: team, error: teamErr } = await supabase
    .from("teams")
    .insert({ name: parsed.data.name, slug, owner_id: userData.user.id })
    .select("id")
    .single();

  if (teamErr || !team) return { error: teamErr?.message ?? "Failed to create team" };

  const { error: memberErr } = await supabase
    .from("team_members")
    .insert({ team_id: team.id, user_id: userData.user.id, role: "owner" });

  if (memberErr) return { error: memberErr.message };

  revalidatePath("/", "layout");
  redirect("/");
}
