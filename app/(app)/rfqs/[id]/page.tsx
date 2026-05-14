import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, FileText, Calendar, Building2, DollarSign, Plus, Mail, FileUp, Phone, MessageSquare, ArrowRightLeft, UserPlus, ExternalLink } from "lucide-react";
import { formatCurrency, formatDate, isOverdue, cn } from "@/lib/utils";
import { RFQ_STATUS_META, PRIORITY_META, type ActivityType } from "@/lib/db/types";
import { RfqStatusSelect } from "@/components/rfqs/rfq-status-select";
import { AddNoteForm } from "@/components/rfqs/add-note-form";
import { AddQuoteDialog } from "@/components/rfqs/add-quote-dialog";
import { DeleteRfqButton } from "@/components/rfqs/delete-rfq-button";
import { DeleteQuoteButton } from "@/components/rfqs/delete-quote-button";

const ACTIVITY_ICONS: Record<ActivityType, React.ComponentType<{ className?: string }>> = {
  created: FileText,
  status_changed: ArrowRightLeft,
  note: MessageSquare,
  email_sent: Mail,
  call: Phone,
  quote_added: DollarSign,
  quote_updated: DollarSign,
  file_uploaded: FileUp,
  assigned: UserPlus,
};

export default async function RfqDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { team } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const { data: rfq } = await supabase
    .from("rfqs")
    .select("*, client:clients(id, name)")
    .eq("id", id).eq("team_id", team.id)
    .maybeSingle();

  if (!rfq) notFound();

  const [{ data: quotes }, { data: activities }, { data: suppliers }] = await Promise.all([
    supabase.from("quotes").select("*, supplier:suppliers(id, name)").eq("rfq_id", id).order("created_at", { ascending: false }),
    supabase.from("activities").select("*, user:profiles(full_name, email)").eq("rfq_id", id).order("created_at", { ascending: false }).limit(50),
    supabase.from("suppliers").select("id, name").eq("team_id", team.id).order("name"),
  ]);

  const status = RFQ_STATUS_META[rfq.status as keyof typeof RFQ_STATUS_META];
  const priority = PRIORITY_META[rfq.priority as keyof typeof PRIORITY_META];
  const overdue = isOverdue(rfq.next_follow_up) && !["won","lost"].includes(rfq.status);

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/rfqs">
            <ArrowLeft className="h-4 w-4" />
            Back to RFQs
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-2">
              {rfq.reference && <Badge variant="outline" className="font-mono">{rfq.reference}</Badge>}
              <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", priority.color)}>
                {priority.label}
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight">{rfq.subject}</h1>
            <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
              <Building2 className="h-4 w-4" />
              <Link href={`/clients/${rfq.client?.id}`} className="hover:text-primary">
                {rfq.client?.name}
              </Link>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <RfqStatusSelect id={rfq.id} currentStatus={rfq.status} />
            <DeleteRfqButton id={rfq.id} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Supplier Quotes</CardTitle>
                <CardDescription>Quotes received from suppliers for this RFQ.</CardDescription>
              </div>
              <AddQuoteDialog rfqId={rfq.id} suppliers={suppliers ?? []}>
                <Button size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                  Add quote
                </Button>
              </AddQuoteDialog>
            </CardHeader>
            <CardContent>
              {!quotes || quotes.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No supplier quotes yet.</p>
              ) : (
                <div className="space-y-3">
                  {quotes.map((q) => {
                    const supplier = q.supplier as unknown as { id: string; name: string } | null;
                    return (
                      <div key={q.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between gap-3 flex-wrap">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">
                                {supplier ? (
                                  <Link href={`/suppliers/${supplier.id}`} className="hover:text-primary">{supplier.name}</Link>
                                ) : "—"}
                              </p>
                              <Badge variant="secondary" className="text-xs uppercase">{q.status.replace("_"," ")}</Badge>
                            </div>
                            {q.notes && <p className="text-sm text-muted-foreground mt-1 whitespace-pre-wrap">{q.notes}</p>}
                          </div>
                          <div className="text-right">
                            <p className="text-xl font-bold tabular-nums">{formatCurrency(q.amount, q.currency)}</p>
                            {q.client_price != null && (
                              <p className="text-xs text-muted-foreground">
                                Client price: <span className="font-medium tabular-nums">{formatCurrency(q.client_price, q.currency)}</span>
                                {q.margin_pct != null && ` · ${q.margin_pct}% margin`}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between gap-3 mt-3 pt-3 border-t text-xs text-muted-foreground">
                          <div className="flex items-center gap-3">
                            {q.valid_until && <span>Valid until {formatDate(q.valid_until)}</span>}
                            {q.file_url && (
                              <a href={q.file_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary hover:underline">
                                <ExternalLink className="h-3 w-3" /> View file
                              </a>
                            )}
                          </div>
                          <DeleteQuoteButton quoteId={q.id} rfqId={rfq.id} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Activity</CardTitle>
              <CardDescription>Timeline of changes and notes.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <AddNoteForm rfqId={rfq.id} />
              {!activities || activities.length === 0 ? (
                <p className="text-sm text-muted-foreground py-4 text-center">No activity yet.</p>
              ) : (
                <div className="space-y-4 relative">
                  <div className="absolute left-4 top-2 bottom-2 w-px bg-border" aria-hidden />
                  {activities.map((a) => {
                    const Icon = ACTIVITY_ICONS[a.type as ActivityType] ?? MessageSquare;
                    const user = a.user as unknown as { full_name: string | null; email: string } | null;
                    const userLabel = user?.full_name ?? user?.email?.split("@")[0] ?? "Someone";
                    return (
                      <div key={a.id} className="flex gap-3 relative">
                        <div className="w-8 h-8 rounded-full bg-card border flex items-center justify-center shrink-0 z-10">
                          <Icon className="h-3.5 w-3.5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0 flex-1 pb-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{userLabel}</span>
                            <span className="text-xs text-muted-foreground">{formatDate(a.created_at)}</span>
                          </div>
                          {a.content && <p className="text-sm text-foreground/80 mt-0.5 whitespace-pre-wrap">{a.content}</p>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <DetailRow icon={Calendar} label="Received">{formatDate(rfq.date_received)}</DetailRow>
              <DetailRow icon={Calendar} label="Due date">{rfq.due_date ? formatDate(rfq.due_date) : "—"}</DetailRow>
              <DetailRow icon={Calendar} label="Next follow-up">
                <span className={overdue ? "text-destructive font-medium" : ""}>
                  {rfq.next_follow_up ? formatDate(rfq.next_follow_up) : "—"}
                </span>
              </DetailRow>
              <DetailRow icon={DollarSign} label="Expected amount">
                {formatCurrency(rfq.expected_amount, rfq.currency)}
              </DetailRow>
              {rfq.notes && (
                <div className="pt-3 border-t">
                  <p className="text-xs text-muted-foreground mb-1">Notes</p>
                  <p className="whitespace-pre-wrap">{rfq.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function DetailRow({
  icon: Icon, label, children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">{label}</p>
        <div className="font-medium">{children}</div>
      </div>
    </div>
  );
}
