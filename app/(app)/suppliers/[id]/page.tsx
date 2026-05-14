import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentTeam } from "@/lib/db/queries";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Truck, Globe, Mail, Phone, Plus, Star } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { SupplierFormDialog } from "@/components/suppliers/supplier-form-dialog";
import { SupplierContactDialog } from "@/components/suppliers/supplier-contact-dialog";
import { DeleteSupplierButton } from "@/components/suppliers/delete-supplier-button";
import { DeleteSupplierContactButton } from "@/components/suppliers/delete-supplier-contact-button";

export default async function SupplierDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { team } = await getCurrentTeam();
  if (!team) return null;

  const supabase = await createClient();
  const { data: supplier } = await supabase
    .from("suppliers").select("*").eq("id", id).eq("team_id", team.id).maybeSingle();

  if (!supplier) notFound();

  const { data: contacts } = await supabase
    .from("supplier_contacts").select("*").eq("supplier_id", id).order("is_primary", { ascending: false });

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <Button variant="ghost" size="sm" asChild className="mb-4">
          <Link href="/suppliers">
            <ArrowLeft className="h-4 w-4" />
            Back to suppliers
          </Link>
        </Button>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{supplier.name}</h1>
              {supplier.category && <Badge variant="secondary" className="mt-2">{supplier.category}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            <SupplierFormDialog supplier={supplier}>
              <Button variant="outline">Edit</Button>
            </SupplierFormDialog>
            <DeleteSupplierButton id={supplier.id} />
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Contacts</CardTitle>
            <SupplierContactDialog supplierId={supplier.id}>
              <Button size="sm" variant="outline">
                <Plus className="h-4 w-4" />
                Add contact
              </Button>
            </SupplierContactDialog>
          </CardHeader>
          <CardContent>
            {!contacts || contacts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">No contacts yet.</p>
            ) : (
              <div className="divide-y -mx-2">
                {contacts.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 py-3 px-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{c.name}</p>
                        {c.is_primary && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />}
                        {c.role && <Badge variant="secondary" className="text-xs">{c.role}</Badge>}
                      </div>
                      <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground flex-wrap">
                        {c.email && <a href={`mailto:${c.email}`} className="flex items-center gap-1 hover:text-primary"><Mail className="h-3.5 w-3.5" />{c.email}</a>}
                        {c.phone && <a href={`tel:${c.phone}`} className="flex items-center gap-1 hover:text-primary"><Phone className="h-3.5 w-3.5" />{c.phone}</a>}
                      </div>
                    </div>
                    <DeleteSupplierContactButton contactId={c.id} supplierId={supplier.id} />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Details</CardTitle></CardHeader>
          <CardContent className="space-y-3 text-sm">
            {supplier.website && (
              <div className="flex items-start gap-2">
                <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                <a href={supplier.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate">{supplier.website}</a>
              </div>
            )}
            {supplier.notes && (
              <div className="pt-2 border-t">
                <p className="text-muted-foreground whitespace-pre-wrap">{supplier.notes}</p>
              </div>
            )}
            <p className="text-xs text-muted-foreground pt-2 border-t">Created {formatDate(supplier.created_at)}</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
