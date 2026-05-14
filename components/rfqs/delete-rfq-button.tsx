"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteRfqAction } from "@/app/(app)/rfqs/actions";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteRfqButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  function onClick() {
    if (!confirm("Delete this RFQ? All quotes and activity will be lost.")) return;
    startTransition(async () => {
      const res = await deleteRfqAction(id);
      if (res?.error) toast.error(res.error);
    });
  }
  return (
    <Button variant="outline" onClick={onClick} disabled={isPending} className="text-destructive hover:text-destructive">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
    </Button>
  );
}
