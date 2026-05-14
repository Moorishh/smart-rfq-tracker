"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteQuoteAction } from "@/app/(app)/rfqs/actions";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteQuoteButton({ quoteId, rfqId }: { quoteId: string; rfqId: string }) {
  const [isPending, startTransition] = useTransition();
  function onClick() {
    if (!confirm("Delete this quote?")) return;
    startTransition(async () => {
      const res = await deleteQuoteAction(quoteId, rfqId);
      if (res?.error) toast.error(res.error);
    });
  }
  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={isPending} className="text-muted-foreground hover:text-destructive h-7">
      {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
    </Button>
  );
}
