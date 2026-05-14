import { redirect } from "next/navigation";
import { getCurrentTeam, getUser } from "@/lib/db/queries";
import { CreateTeamForm } from "./create-team-form";
import { Briefcase } from "lucide-react";

export default async function OnboardingPage() {
  const user = await getUser();
  if (!user) redirect("/login");

  const { team } = await getCurrentTeam();
  if (team) redirect("/");

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center">
            <Briefcase className="h-5 w-5" />
          </div>
          <span className="font-semibold text-lg">Smart RFQ Tracker</span>
        </div>
        <div className="space-y-2 mb-6">
          <h1 className="text-3xl font-bold tracking-tight">Create your workspace</h1>
          <p className="text-muted-foreground">
            Your workspace is where you and your colleagues collaborate on RFQs.
          </p>
        </div>
        <CreateTeamForm />
      </div>
    </div>
  );
}
