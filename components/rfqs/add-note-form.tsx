"use client";

import { useRef, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { addNoteAction } from "@/app/(app)/rfqs/actions";
import { toast } from "sonner";
import { Loader2, Send } from "lucide-react";

export function AddNoteForm({ rfqId }: { rfqId: string }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isPending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    startTransition(async () => {
      const res = await addNoteAction(rfqId, formData);
      if (res?.error) toast.error(res.error);
      else {
        formRef.current?.reset();
        toast.success("Note added");
      }
    });
  }

  return (
    <form ref={formRef} action={onSubmit} className="space-y-2">
      <Textarea name="content" placeholder="Add a note, log a call, paste an email summary..." rows={3} />
      <div className="flex justify-end">
        <Button type="submit" size="sm" disabled={isPending}>
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          Post note
        </Button>
      </div>
    </form>
  );
}
