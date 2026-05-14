"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteSupplierContactAction } from "@/app/(app)/suppliers/actions";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteSupplierContactButton({ contactId, supplierId }: { contactId: string; supplierId: string }) {
  const [isPending, startTransition] = useTransition();
  function onClick() {
    if (!confirm("Delete this contact?")) return;
    startTransition(async () => {
      const res = await deleteSupplierContactAction(contactId, supplierId);
      if (res?.error) toast.error(res.error);
    });
  }
  return (
    <Button variant="ghost" size="icon" onClick={onClick} disabled={isPending} className="text-muted-foreground hover:text-destructive">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
