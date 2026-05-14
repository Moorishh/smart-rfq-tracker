"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam, getUser } from "@/lib/db/queries";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const inviteSchema = z.object({
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "member"]).default("member"),
});

export async function inviteMemberAction(formData: FormData) {
  const parsed = inviteSchema.safeParse({
    email: formData.get("email"),
    role: formData.get("role") || "member",
  });
  if (!parsed.success) return { error: parsed.error.errors[0]?.message ?? "Invalid input" };

  const { team, role } = await getCurrentTeam();
  const user = await getUser();
  if (!team || !user) return { error: "Not authorized" };
  if (role !== "owner" && role !== "admin") return { error: "Only admins can invite" };

  const supabase = await createClient();
  const { error } = await supabase.from("team_invitations").insert({
    team_id: team.id,
    email: parsed.data.email,
    role: parsed.data.role,
    invited_by: user.id,
  });
  if (error) return { error: error.message };
  revalidatePath("/settings");
}
