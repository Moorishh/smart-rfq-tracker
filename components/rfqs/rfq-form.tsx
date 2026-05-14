"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { createRfqAction } from "@/app/(app)/rfqs/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { RFQ_STATUSES, RFQ_PRIORITIES, RFQ_STATUS_META, PRIORITY_META } from "@/lib/db/types";

export function RfqForm({
  clients,
  defaultClientId,
}: {
  clients: { id: string; name: string }[];
  defaultClientId?: string;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [clientId, setClientId] = useState<string>(defaultClientId ?? "");
  const [status, setStatus] = useState("received");
  const [priority, setPriority] = useState("normal");

  function onSubmit(formData: FormData) {
    setError(null);
    if (!clientId) {
      setError("Please pick a client");
      toast.error("Please pick a client");
      return;
    }
    formData.set("client_id", clientId);
    formData.set("status", status);
    formData.set("priority", priority);
    startTransition(async () => {
      const res = await createRfqAction(formData);
      if (res?.error) {
        setError(res.error);
        toast.error(res.error);
      }
    });
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <Card>
      <CardContent className="p-6">
        <form action={onSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="subject">Subject *</Label>
            <Input id="subject" name="subject" required autoFocus placeholder="e.g. Industrial pumps for project Alpha" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="reference">Reference</Label>
              <Input id="reference" name="reference" placeholder="RFQ-2026-001" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="client_id">Client *</Label>
              {clients.length === 0 ? (
                <div className="text-sm text-muted-foreground p-3 border rounded-lg">
                  No clients yet. <Link href="/clients" className="text-primary hover:underline">Create one first</Link>.
                </div>
              ) : (
                <Select value={clientId} onValueChange={setClientId}>
                  <SelectTrigger><SelectValue placeholder="Select client" /></SelectTrigger>
                  <SelectContent>
                    {clients.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RFQ_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>{RFQ_STATUS_META[s].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RFQ_PRIORITIES.map((p) => (
                    <SelectItem key={p} value={p}>{PRIORITY_META[p].label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date_received">Date received *</Label>
              <Input id="date_received" name="date_received" type="date" required defaultValue={today} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="due_date">Due date</Label>
              <Input id="due_date" name="due_date" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="next_follow_up">Next follow-up</Label>
              <Input id="next_follow_up" name="next_follow_up" type="date" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="expected_amount">Expected amount</Label>
              <Input id="expected_amount" name="expected_amount" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue="MAD" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={4} placeholder="Internal notes, scope, key details..." />
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}

          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button type="button" variant="ghost" asChild>
              <Link href="/rfqs">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isPending || clients.length === 0}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Create RFQ
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
