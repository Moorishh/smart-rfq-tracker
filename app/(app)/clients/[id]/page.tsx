import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, Building2, Globe, MapPin, Mail, Phone, Plus, Star, Trash2,
} from "lucide-react";
import { formatDate, cn } from "@/lib/utils";
import { ClientFormDialog } from "@/components/clients/client-form-dialog";
import { ClientContactDialog } from "@/components/clients/client-contact-dialog";
import { DeleteClientButton } from "@/components/clients/delete-client-button";
import { DeleteContactButton } from "@/components/clients/delete-contact-button";
import { RFQ_STATUS_META } from "@/lib/db/types";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { team } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const { data: client } = await supabase
    .from("clients")
    .select("*")
    .eq("id", id)
    .eq("team_id", team.id)
    .maybeSingle();

  if (!client) notFound();

  const [{ data: contacts }, { data: rfqs }] = await Promise.all([
    supabase.from("client_contacts").select("*").eq("client_id", id).order("is_primary", { ascending: false }),
    supabase.from("rfqs").select("id, subject, status, reference, date_received").eq("client_id", id).order("date_received", { ascending: false }),
  ]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/clients">
            <ArrowLeft className="h-4 w-4" />
            Back to clients
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{client.name}</h1>
              {client.industry && <Badge variant="secondary" className="mt-2">{client.industry}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <ClientFormDialog client={client}>
              <Button variant="outline">Edit</Button>
            </ClientFormDialog>
            <DeleteClientButton id={client.id} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <ClientContactDialog clientId={client.id}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                Add contact
              </Button>
            </ClientContactDialog>
          </CardHeader>
          <CardContent>
            {!contacts || contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No contacts yet.</p>
            ) : (
              <div className="divide-y -mx-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-3 px-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{c.name}</p>
                        {c.is_primary && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                        {c.role && <Badge variant="secondary" className="text-xs">{c.role}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                        {c.email && (
                          <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-primary">
                            <Mail className="h-3.5 w-3.5" /> {c.email}
                          </a>
                        )}
                        {c.phone && (
                          <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-primary">
                            <Phone className="h-3.5 w-3.5" /> {c.phone}
                          </a>
                        )}
                      </div>
                    </div>
                    <DeleteContactButton contactId={c.id} clientId={client.id} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {client.website && (
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <a href={client.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">
                  {client.website}
                </a>
              </div>
            )}
            {client.address && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <span>{client.address}</span>
              </div>
            )}
            {client.notes && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground whitespace-pre-wrap">{client.notes}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-2 border-t">
              Created {formatDate(client.created_at)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>RFQs</CardTitle>
            <CardDescription>All requests from this client.</CardDescription>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/rfqs/new?client=${client.id}`}>
              <Plus className="h-4 w-4" />
              New RFQ
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!rfqs || rfqs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-4 text-center">No RFQs yet for this client.</p>
          ) : (
            <div className="divide-y -mx-2">
              {rfqs.map((r) => {
                const status = RFQ_STATUS_META[r.status as keyof typeof RFQ_STATUS_META];
                return (
                  <Link
                    key={r.id}
                    href={`/rfqs/${r.id}`}
                    className="flex items-center justify-between gap-4 py-3 px-2 hover:bg-muted/40 rounded-md transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{r.subject}</p>
                      <p className="text-sm text-muted-foreground">
                        {r.reference ?? "no ref"} · received {formatDate(r.date_received)}
                      </p>
                    </div>
                    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", status.color)}>
                      {status.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
