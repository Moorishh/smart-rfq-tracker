import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Building2, Plus, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";

export default async function ClientsPage() {
  const { team } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const { data: clients } = await supabase
    .from("clients")
    .select("*, contacts:client_contacts(count), rfqs:rfqs(count)")
    .eq("team_id", team.id)
    .order("name");

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clients</h1>
          <p className="text-muted-foreground mt-1">Companies that send you requests for quote.</p>
        </div>
        <ClientFormDialog>
          <Button>
            <Plus className="h-4 w-4" />
            New client
          </Button>
        </ClientFormDialog>
      </div>

      {!clients || clients.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No clients yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first client to start tracking RFQs.</p>
            <ClientFormDialog>
              <Button className="mt-4" size="sm">
                <Plus className="h-4 w-4" />
                Add client
              </Button>
            </ClientFormDialog>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {clients.map((c) => {
                const contactsCount = (c.contacts as Array<{ count: number }> | null)?.[0]?.count ?? 0;
                const rfqsCount = (c.rfqs as Array<{ count: number }> | null)?.[0]?.count ?? 0;
                return (
                  <Link
                    key={c.id}
                    href={`/clients/${c.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Building2 className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{c.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {c.industry ?? "No industry"} · added {formatDate(c.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:flex items-center gap-6 text-sm shrink-0">
                      <div className="text-right">
                        <p className="font-semibold">{contactsCount}</p>
                        <p className="text-xs text-muted-foreground">contacts</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{rfqsCount}</p>
                        <p className="text-xs text-muted-foreground">RFQs</p>
                      </div>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
