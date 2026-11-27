"use client";

import Link from "next/link";

import { Card, PageHeader, StatusBadge } from "@/components/ui";
import { formatDate, vehicleLabel } from "@/lib/format";
import { useShop } from "@/lib/shop-context";

export default function RepairOrdersPage() {
  const { state, staff } = useShop();
  if (!state) return null;

  const orders =
    staff?.role === "sub_admin"
      ? state.repairOrders.filter((order) => order.assignedSubAdminId === staff.id)
      : state.repairOrders;

  return (
    <div className="grid gap-5">
      <PageHeader title={staff?.role === "sub_admin" ? "Assigned to you" : "Repair orders"} />
      {staff?.role === "sub_admin" && orders.length === 0 ? (
        <p className="text-gt-muted">No jobs assigned</p>
      ) : null}
      {orders.map((order) => {
        const customer = state.customers.find((item) => item.id === order.customerId);
        const vehicle = state.vehicles.find((item) => item.id === order.vehicleId);
        const assigned = state.staff.find((item) => item.id === order.assignedSubAdminId);
        return (
          <Link key={order.id} href={`/repair-orders/${order.id}`}>
            <Card className="hover:border-gt-primary">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">#{order.number} · {order.serviceSummary}</p>
                  <p className="text-sm text-gt-muted">
                    {customer?.fullName} · {vehicle ? vehicleLabel(vehicle) : "Vehicle"} · {formatDate(order.openedAt)} · {order.bayName ?? "No bay"}
                    {staff?.role === "sub_admin" ? "" : ` · ${assigned?.fullName ?? "No sub-admin"}`}
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
