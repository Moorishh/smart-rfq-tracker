"use client";

import { useState, useTransition } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createQuoteAction } from "@/app/(app)/rfqs/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const QUOTE_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "requested", label: "Requested" },
  { value: "received", label: "Received" },
  { value: "sent_to_client", label: "Sent to client" },
  { value: "accepted", label: "Accepted" },
  { value: "rejected", label: "Rejected" },
];

export function AddQuoteDialog({
  children, rfqId, suppliers,
}: {
  children: React.ReactNode;
  rfqId: string;
  suppliers: { id: string; name: string }[];
}) {
  const [open, setOpen] = useState(false);
  const [supplierId, setSupplierId] = useState<string>("");
  const [status, setStatus] = useState("requested");
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    if (supplierId) formData.set("supplier_id", supplierId);
    formData.set("status", status);
    startTransition(async () => {
      const res = await createQuoteAction(rfqId, formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success("Quote added");
        setOpen(false);
        setSupplierId("");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add supplier quote</DialogTitle></DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Supplier</Label>
            {suppliers.length === 0 ? (
              <p className="text-sm text-muted-foreground">No suppliers yet. Create one first.</p>
            ) : (
              <Select value={supplierId} onValueChange={setSupplierId}>
                <SelectTrigger><SelectValue placeholder="Select supplier (optional)" /></SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {QUOTE_STATUSES.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="amount">Supplier amount</Label>
              <Input id="amount" name="amount" type="number" step="0.01" placeholder="0.00" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" name="currency" defaultValue="MAD" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="client_price">Client price</Label>
              <Input id="client_price" name="client_price" type="number" step="0.01" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="margin_pct">Margin %</Label>
              <Input id="margin_pct" name="margin_pct" type="number" step="0.1" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="valid_until">Valid until</Label>
            <Input id="valid_until" name="valid_until" type="date" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="file_url">File link</Label>
            <Input id="file_url" name="file_url" placeholder="https://..." />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" rows={2} />
          </div>

          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add quote
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
