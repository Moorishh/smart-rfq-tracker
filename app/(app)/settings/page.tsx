import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { initials, formatDate } from "@/lib/utils";
import { InviteMemberDialog } from "@/components/settings/invite-member-dialog";
import { Button } from "@/components/ui/button";
import { UserPlus } from "lucide-react";

export default async function SettingsPage() {
  const { team, role } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const { data: members } = await supabase
    .from("team_members")
    .select("role, joined_at, profile:profiles(id, full_name, email)")
    .eq("team_id", team.id)
    .order("joined_at");

  const { data: invitations } = await supabase
    .from("team_invitations")
    .select("*")
    .eq("team_id", team.id)
    .is("accepted_at", null)
    .order("created_at", { ascending: false });

  const isAdmin = role === "owner" || role === "admin";

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-1">Manage your workspace and team.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Information about your team workspace.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground text-xs">Workspace name</p>
              <p className="font-medium mt-0.5">{team.name}</p>
            </div>
            <div>
              <p className="text-muted-foreground text-xs">Created</p>
              <p className="font-medium mt-0.5">{formatDate(team.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Members</CardTitle>
            <CardDescription>People who can access this workspace.</CardDescription>
          </div>
          {isAdmin && (
            <InviteMemberDialog>
              <Button size="sm" variant="outline">
                <UserPlus className="h-4 w-4" />
                Invite
              </Button>
            </InviteMemberDialog>
          )}
        </CardHeader>
        <CardContent>
          <div className="divide-y -mx-2">
            {(members ?? []).map((m) => {
              const profile = m.profile as unknown as { id: string; full_name: string | null; email: string } | null;
              if (!profile) return null;
              return (
                <div key={profile.id} className="flex items-center justify-between gap-3 py-3 px-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback>{initials(profile.full_name ?? profile.email)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium truncate">{profile.full_name ?? profile.email.split("@")[0]}</p>
                      <p className="text-xs text-muted-foreground truncate">{profile.email}</p>
                    </div>
                  </div>
                  <Badge variant={m.role === "owner" ? "default" : "secondary"} className="capitalize">{m.role}</Badge>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {isAdmin && invitations && invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending invitations</CardTitle>
            <CardDescription>Share the invitation link with your colleagues.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {invitations.map((inv) => {
                const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL ?? ""}/invite/${inv.token}`;
                return (
                  <div key={inv.id} className="border rounded-lg p-3 flex items-center justify-between gap-3 flex-wrap">
                    <div className="min-w-0">
                      <p className="font-medium text-sm">{inv.email}</p>
                      <p className="text-xs text-muted-foreground">Expires {formatDate(inv.expires_at)} · role: {inv.role}</p>
                    </div>
                    <code className="text-xs bg-muted px-2 py-1 rounded truncate max-w-sm">{inviteUrl}</code>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
