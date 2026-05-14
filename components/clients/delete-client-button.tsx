"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { deleteClientAction } from "@/app/(app)/clients/actions";
import { toast } from "sonner";
import { Trash2, Loader2 } from "lucide-react";

export function DeleteClientButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();

  function onClick() {
    if (!confirm("Delete this client? This cannot be undone.")) return;
    startTransition(async () => {
      const res = await deleteClientAction(id);
      if (res?.error) toast.error(res.error);
      else toast.success("Client deleted");
    });
  }

  return (
    <Button variant="outline" onClick={onClick} disabled={isPending} className="text-destructive hover:text-destructive">
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Delete
    </Button>
  );
}
