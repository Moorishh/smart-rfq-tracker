import { redirect } from "next/navigation";
import { getCurrentTeam, getUser } from "@/lib/db/queries";
import { createClient } from "@/lib/supabase/server";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser();
  if (!user) redirect("/login");

  const { team } = await getCurrentTeam();
  if (!team) redirect("/onboarding");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="min-h-screen bg-muted/30">
      <Sidebar teamName={team.name} />
      <div className="md:pl-64">
        <Topbar userEmail={profile?.email ?? user.email ?? ""} userName={profile?.full_name ?? null} />
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
