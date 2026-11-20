"use client";

import Link from "next/link";

import { Card, StatusBadge } from "@/components/ui";
import { formatDate, vehicleLabel } from "@/lib/format";
import { useShop } from "@/lib/shop-context";

export default function RepairOrdersPage() {
  const { state } = useShop();
  if (!state) return null;

  return (
    <div className="grid gap-5">
      <h1 className="text-3xl font-extrabold">Repair orders</h1>
      {state.repairOrders.map((order) => {
        const customer = state.customers.find((item) => item.id === order.customerId);
        const vehicle = state.vehicles.find((item) => item.id === order.vehicleId);
        return (
          <Link key={order.id} href={`/repair-orders/${order.id}`}>
            <Card className="hover:border-[#3DDC84]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">#{order.number} · {order.serviceSummary}</p>
                  <p className="text-sm text-[#8AA99A]">
                    {customer?.fullName} · {vehicle ? vehicleLabel(vehicle) : "Vehicle"} · {formatDate(order.openedAt)} · {order.bayName ?? "No bay"}
                  </p>
                </div>
                <StatusBadge status={order.status} />
              </div>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
