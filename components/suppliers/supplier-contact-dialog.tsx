"use client";

import { useState, useTransition } from "react";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addSupplierContactAction } from "@/app/(app)/suppliers/actions";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export function SupplierContactDialog({
  children,
  supplierId,
}: {
  children: React.ReactNode;
  supplierId: string;
}) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addSupplierContactAction(supplierId, formData);
      if (res?.error) toast.error(res.error);
      else { toast.success("Contact added"); setOpen(false); }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Add contact</DialogTitle></DialogHeader>
        <form action={onSubmit} className="space-y-4">
          <div className="space-y-2"><Label htmlFor="name">Name *</Label><Input id="name" name="name" required autoFocus /></div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" /></div>
            <div className="space-y-2"><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" /></div>
          </div>
          <div className="space-y-2"><Label htmlFor="role">Role / Title</Label><Input id="role" name="role" placeholder="Account manager" /></div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="is_primary" className="rounded border-input" />
            Primary contact
          </label>
          <DialogFooter className="gap-2">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Add contact
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
