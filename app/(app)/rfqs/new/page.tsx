import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { RfqForm } from "@/components/rfqs/rfq-form";

export default async function NewRfqPage({
  searchParams,
}: {
  searchParams: Promise<{ client?: string }>;
}) {
  const { client: presetClientId } = await searchParams;
  const { team } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients").select("id, name").eq("team_id", team.id).order("name");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/rfqs">
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">New RFQ</h1>
        <p className="text-muted-foreground mt-1">Track a new request for quote in your pipeline.</p>
      </div>

      <RfqForm clients={clients ?? []} defaultClientId={presetClientId} />
    </div>
  );
}
