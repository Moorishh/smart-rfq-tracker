"use client";

import { useTransition } from "react";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { updateRfqStatusAction } from "@/app/(app)/rfqs/actions";
import { RFQ_STATUSES, RFQ_STATUS_META, type RfqStatus } from "@/lib/db/types";
import { toast } from "sonner";

export function RfqStatusSelect({ id, currentStatus }: { id: string; currentStatus: RfqStatus }) {
  const [isPending, startTransition] = useTransition();

  function onChange(next: string) {
    startTransition(async () => {
      const res = await updateRfqStatusAction(id, next as RfqStatus);
      if (res?.error) toast.error(res.error);
      else toast.success("Status updated");
    });
  }

  return (
    <Select value={currentStatus} onValueChange={onChange} disabled={isPending}>
      <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
      <SelectContent>
        {RFQ_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>{RFQ_STATUS_META[s].label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
