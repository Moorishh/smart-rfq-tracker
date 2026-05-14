import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText,
  AlertTriangle,
  Trophy,
  TrendingUp,
  ArrowRight,
  Plus,
} from "lucide-react";
import { RFQ_STATUS_META, PRIORITY_META, type Rfq } from "@/lib/db/types";
import { formatCurrency, formatDate, isOverdue, cn } from "@/lib/utils";

export default async function DashboardPage() {
  const { team } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const today = new Date().toISOString().slice(0, 10);

  const [{ data: allRfqs }, { data: recent }] = await Promise.all([
    supabase.from("rfqs").select("id, status, priority, next_follow_up, expected_amount, currency").eq("team_id", team.id),
    supabase
      .from("rfqs")
      .select("*, client:clients(name)")
      .eq("team_id", team.id)
      .order("updated_at", { ascending: false })
      .limit(5),
  ]);

  const rfqs = (allRfqs ?? []) as Pick<Rfq, "id" | "status" | "priority" | "next_follow_up" | "expected_amount" | "currency">[];

  const openRfqs = rfqs.filter((r) => !["won", "lost", "handed_over"].includes(r.status)).length;
  const overdueFollowUps = rfqs.filter(
    (r) => r.next_follow_up && r.next_follow_up < today && !["won", "lost"].includes(r.status)
  ).length;
  const urgent = rfqs.filter((r) => r.priority === "urgent").length;
  const wonValue = rfqs
    .filter((r) => r.status === "won" || r.status === "po_received")
    .reduce((sum, r) => sum + (r.expected_amount ?? 0), 0);

  return (
    <div className="space-y-8 max-w-7xl">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back — here&apos;s your pipeline at a glance.</p>
        </div>
        <Button asChild>
          <Link href="/rfqs/new">
            <Plus className="h-4 w-4" />
            New RFQ
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Open RFQs"
          value={openRfqs.toString()}
          icon={FileText}
          tone="default"
        />
        <StatCard
          title="Overdue follow-ups"
          value={overdueFollowUps.toString()}
          icon={AlertTriangle}
          tone={overdueFollowUps > 0 ? "danger" : "default"}
        />
        <StatCard
          title="Urgent"
          value={urgent.toString()}
          icon={TrendingUp}
          tone={urgent > 0 ? "warning" : "default"}
        />
        <StatCard
          title="Won pipeline value"
          value={formatCurrency(wonValue, "MAD")}
          icon={Trophy}
          tone="success"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent RFQs</CardTitle>
            <CardDescription>Your last 5 updated requests.</CardDescription>
          </div>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/rfqs">
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {!recent || recent.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="divide-y">
              {recent.map((r) => {
                const overdue = isOverdue(r.next_follow_up);
                const status = RFQ_STATUS_META[r.status as keyof typeof RFQ_STATUS_META];
                const priority = PRIORITY_META[r.priority as keyof typeof PRIORITY_META];
                const clientName = (r.client as unknown as { name: string } | null)?.name;
                return (
                  <Link
                    key={r.id}
                    href={`/rfqs/${r.id}`}
                    className="flex items-center justify-between gap-4 py-3 hover:bg-muted/40 -mx-2 px-2 rounded-lg transition-colors"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{r.subject}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {clientName ?? "—"} · {r.reference ?? "no ref"}
                      </p>
                    </div>
                    <div className="hidden sm:flex items-center gap-2 shrink-0">
                      <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", status.color)}>
                        {status.label}
                      </span>
                      <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", priority.color)}>
                        {priority.label}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground shrink-0 hidden md:block">
                      {r.next_follow_up && (
                        <span className={overdue ? "text-destructive font-medium" : ""}>
                          {formatDate(r.next_follow_up)}
                        </span>
                      )}
                    </div>
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

function StatCard({
  title,
  value,
  icon: Icon,
  tone,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "default" | "success" | "warning" | "danger";
}) {
  const toneClasses = {
    default: "bg-primary/10 text-primary",
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-rose-100 text-rose-700",
  } as const;
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2 truncate">{value}</p>
          </div>
          <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", toneClasses[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-12">
      <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>
      <p className="font-medium">No RFQs yet</p>
      <p className="text-sm text-muted-foreground mt-1">Create your first request for quote to get started.</p>
      <Button asChild className="mt-4" size="sm">
        <Link href="/rfqs/new">
          <Plus className="h-4 w-4" />
          Create RFQ
        </Link>
      </Button>
    </div>
  );
}
