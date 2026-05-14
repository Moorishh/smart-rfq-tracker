import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Truck, Plus, ChevronRight } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";

export default async function SuppliersPage() {
  const { team } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const { data: suppliers } = await supabase
    .from("suppliers")
    .select("*, contacts:supplier_contacts(count)")
    .eq("team_id", team.id)
    .order("name");

  return (
    <div className="space-y-6 max-w-7xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Suppliers</h1>
          <p className="text-muted-foreground mt-1">Vendors and partners you source quotes from.</p>
        </div>
        <SupplierFormDialog>
          <Button>
            <Plus className="h-4 w-4" />
            New supplier
          </Button>
        </SupplierFormDialog>
      </div>

      {!suppliers || suppliers.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 mx-auto rounded-full bg-muted flex items-center justify-center mb-3">
              <Truck className="h-6 w-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No suppliers yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add suppliers to track their quotes on RFQs.</p>
            <SupplierFormDialog>
              <Button className="mt-4" size="sm">
                <Plus className="h-4 w-4" />
                Add supplier
              </Button>
            </SupplierFormDialog>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {suppliers.map((s) => {
                const contactsCount = (s.contacts as Array<{ count: number }> | null)?.[0]?.count ?? 0;
                return (
                  <Link
                    key={s.id}
                    href={`/suppliers/${s.id}`}
                    className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-muted/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                        <Truck className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{s.name}</p>
                        <p className="text-sm text-muted-foreground truncate">
                          {s.category ?? "No category"} · added {formatDate(s.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="hidden sm:block text-right shrink-0 mr-4">
                      <p className="font-semibold text-sm">{contactsCount}</p>
                      <p className="text-xs text-muted-foreground">contacts</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
