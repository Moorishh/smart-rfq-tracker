import { createClient } from "@/lib/supabase/server";
import { cache } from "react";
import type { Team, TeamRole } from "./types";

export const getUser = cache(async () => {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  return data.user;
});

export const getCurrentTeam = cache(async (): Promise<{
  team: Team | null;
  role: TeamRole | null;
}> => {
  const supabase = await createClient();
  const user = await getUser();
  if (!user) return { team: null, role: null };

  const { data: memberships } = await supabase
    .from("team_members")
    .select("role, team:teams(*)")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: true })
    .limit(1);

  const first = memberships?.[0];
  if (!first) return { team: null, role: null };
  return {
    team: (first.team as unknown) as Team,
    role: first.role as TeamRole,
  };
});
