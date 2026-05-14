"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search, AlertTriangle } from "lucide-react";
import { cn, formatCurrency, formatDate, isOverdue } from "@/lib/utils";
import {
  RFQ_STATUS_META, PRIORITY_META, RFQ_STATUSES, type Rfq, type RfqStatus,
} from "@/lib/db/types";

type RfqWithClient = Rfq & { client: { id: string; name: string } | null };

export function RfqListView({ rfqs }: { rfqs: RfqWithClient[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return rfqs.filter((r) => {
      const text = `${r.subject} ${r.reference ?? ""} ${r.client?.name ?? ""}`.toLowerCase();
      const matchesSearch = text.includes(q);
      const matchesStatus = statusFilter === "all" || r.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [rfqs, search, statusFilter]);

  return (
    <Card>
      <CardContent className="p-0">
        <div className="p-4 border-b flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search subject, reference, client..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              {RFQ_STATUSES.map((s) => (
                <SelectItem key={s} value={s}>{RFQ_STATUS_META[s].label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Tabs defaultValue="table">
          <div className="px-4 pt-3">
            <TabsList>
              <TabsTrigger value="table">Table</TabsTrigger>
              <TabsTrigger value="kanban">Kanban</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="table" className="mt-0">
            <TableView rfqs={filtered} />
          </TabsContent>

          <TabsContent value="kanban" className="mt-0 p-4">
            <KanbanView rfqs={filtered} />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

function TableView({ rfqs }: { rfqs: RfqWithClient[] }) {
  if (rfqs.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-12">No RFQs match your filters.</p>;
  }
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="border-y bg-muted/30 text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th className="text-left font-medium px-4 py-3">Subject</th>
            <th className="text-left font-medium px-4 py-3">Client</th>
            <th className="text-left font-medium px-4 py-3">Status</th>
            <th className="text-left font-medium px-4 py-3">Priority</th>
            <th className="text-right font-medium px-4 py-3">Expected</th>
            <th className="text-left font-medium px-4 py-3">Follow-up</th>
            <th className="text-left font-medium px-4 py-3">Received</th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {rfqs.map((r) => {
            const overdue = isOverdue(r.next_follow_up) && !["won","lost"].includes(r.status);
            const status = RFQ_STATUS_META[r.status];
            const priority = PRIORITY_META[r.priority];
            return (
              <tr key={r.id} className="hover:bg-muted/30 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <Link href={`/rfqs/${r.id}`} className="block">
                    <p className="font-medium">{r.subject}</p>
                    <p className="text-xs text-muted-foreground">{r.reference ?? "—"}</p>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/rfqs/${r.id}`}>{r.client?.name ?? "—"}</Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/rfqs/${r.id}`}>
                    <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", status.color)}>
                      {status.label}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/rfqs/${r.id}`}>
                    <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", priority.color)}>
                      {priority.label}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  <Link href={`/rfqs/${r.id}`}>{formatCurrency(r.expected_amount, r.currency)}</Link>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/rfqs/${r.id}`} className={cn("inline-flex items-center gap-1", overdue && "text-destructive font-medium")}>
                    {overdue && <AlertTriangle className="h-3.5 w-3.5" />}
                    {formatDate(r.next_follow_up)}
                  </Link>
                </td>
                <td className="px-4 py-3 text-muted-foreground">
                  <Link href={`/rfqs/${r.id}`}>{formatDate(r.date_received)}</Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function KanbanView({ rfqs }: { rfqs: RfqWithClient[] }) {
  const columns: RfqStatus[] = ["received","sourcing","preparing","sent","follow_up","po_received","won","lost"];
  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {columns.map((col) => {
          const meta = RFQ_STATUS_META[col];
          const items = rfqs.filter((r) => r.status === col);
          return (
            <div key={col} className="w-72 shrink-0">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className={cn("inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-medium", meta.color)}>
                  {meta.label}
                </span>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((r) => {
                  const overdue = isOverdue(r.next_follow_up) && !["won","lost"].includes(r.status);
                  return (
                    <Link
                      key={r.id}
                      href={`/rfqs/${r.id}`}
                      className="block bg-card border rounded-lg p-3 hover:shadow-md transition-shadow"
                    >
                      <p className="font-medium text-sm line-clamp-2">{r.subject}</p>
                      <p className="text-xs text-muted-foreground mt-1 truncate">{r.client?.name ?? "—"}</p>
                      <div className="flex items-center justify-between mt-2 gap-2">
                        <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium", PRIORITY_META[r.priority].color)}>
                          {PRIORITY_META[r.priority].label}
                        </span>
                        {r.next_follow_up && (
                          <span className={cn("text-xs", overdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                            {overdue && <AlertTriangle className="h-3 w-3 inline mr-0.5" />}
                            {formatDate(r.next_follow_up)}
                          </span>
                        )}
                      </div>
                    </Link>
                  );
                })}
                {items.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-4">Empty</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
