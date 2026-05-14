"use client";

import { useState, useTransition } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createSupplierAction, updateSupplierAction } from "@/app/(app)/suppliers/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { Supplier } from "@/lib/db/types";

export function SupplierFormDialog({
  children,
  supplier,
}: {
  children: React.ReactNode;
  supplier?: Supplier;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = supplier
        ? await updateSupplierAction(supplier.id, formData)
        : await createSupplierAction(formData);
      if (res?.error) toast.error(res.error);
      else {
        toast.success(supplier ? "Supplier updated" : "Supplier created");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{supplier ? "Edit supplier" : "Add new supplier"}</DialogTitle>
          <DialogDescription>
            {supplier ? "Update supplier details." : "Add a vendor to track their quotes on your RFQs."}
          </DialogDescription>
        </DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Supplier name *</Label>
            <Input id="name" name="name" defaultValue={supplier?.name} required autoFocus />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input id="category" name="category" defaultValue={supplier?.category ?? ""} placeholder="e.g. Electronics" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input id="website" name="website" defaultValue={supplier?.website ?? ""} placeholder="https://..." />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea id="notes" name="notes" defaultValue={supplier?.notes ?? ""} rows={3} />
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              {supplier ? "Save changes" : "Create supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
