"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteSupplierAction } from "@/app/(app)/suppliers/actions";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteSupplierButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  function onClick() {
    if (!confirm("Delete this supplier?")) return;
    startTransition(async () => {
      const res = await deleteSupplierAction(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Supplier deleted");
    });
  }
  return (
    <Button variant="outline" onClick={onClick} disabled={isPending} className="text-destructive hover:text-destructive">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Delete
    </Button>
  );
}
