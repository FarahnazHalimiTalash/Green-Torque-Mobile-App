"use client";

import { Card, PageHeader } from "@/components/ui";
import { useShop } from "@/lib/shop-context";

export default function BaysPage() {
  const { state } = useShop();
  if (!state) return null;

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Shop floor"
        title="Bays"
        subtitle="Assign a bay when a vehicle is checked in. Customers see work videos uploaded by admin or sub-admin, not a live camera."
      />
      {state.bays.map((bay) => {
        const current = state.repairOrders.find(
          (item) => item.bayId === bay.id && item.status !== "picked_up" && item.status !== "cancelled",
        );
        return (
          <Card key={bay.id}>
            <p className="font-bold">{bay.name}</p>
            <p className="text-sm text-gt-muted">{current ? `RO #${current.number}` : "Empty"}</p>
          </Card>
        );
      })}
    </div>
  );
}
