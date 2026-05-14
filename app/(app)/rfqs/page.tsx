import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Plus } from "lucide-react";
import { RfqListView } from "@/components/rfqs/rfq-list-view";
import type { Rfq } from "@/lib/db/types";

export default async function RfqsPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; q?: string; status?: string }>;
}) {
  const { team } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const { data: rfqs } = await supabase
    .from("rfqs")
    .select("*, client:clients(id, name)")
    .eq("team_id", team.id)
    .order("updated_at", { ascending: false });

  const list = (rfqs ?? []) as unknown as (Rfq & { client: { id: string; name: string } | null })[];

  return (
    <div className="space-y-6 max-w-[1600px]">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">RFQs</h1>
          <p className="text-muted-foreground mt-1">Your full request-for-quote pipeline.</p>
        </div>
        <Button asChild>
          <Link href="/rfqs/new">
            <Plus className="h-4 w-4" />
            New RFQ
          </Link>
        </Button>
      </div>

      {list.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No RFQs yet</p>
            <p className="text-sm text-muted-foreground mt-1">Create your first RFQ to start tracking.</p>
            <Button className="mt-4" size="sm" asChild>
              <Link href="/rfqs/new">
                <Plus className="h-4 w-4" />
                Create RFQ
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <RfqListView rfqs={list} />
      )}
    </div>
  );
}
