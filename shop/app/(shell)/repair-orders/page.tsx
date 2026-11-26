"use client";

import Link from "next/link";

import { Card, StatusBadge } from "@/components/ui";
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
      <h1 className="text-3xl font-extrabold">{staff?.role === "sub_admin" ? "Assigned to you" : "Repair orders"}</h1>
      {staff?.role === "sub_admin" ? (
        <p className="text-[#4F6B5C]">
          Admin assigns jobs here. Open a job to upload work photos and videos for the customer. Messaging and other shop tools are admin-only.
        </p>
      ) : null}
      {staff?.role === "sub_admin" && orders.length === 0 ? (
        <p className="text-[#4F6B5C]">No jobs are assigned to you yet.</p>
      ) : null}
      {orders.map((order) => {
        const customer = state.customers.find((item) => item.id === order.customerId);
        const vehicle = state.vehicles.find((item) => item.id === order.vehicleId);
        const assigned = state.staff.find((item) => item.id === order.assignedSubAdminId);
        return (
          <Link key={order.id} href={`/repair-orders/${order.id}`}>
            <Card className="hover:border-[#16A34A]">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold">#{order.number} · {order.serviceSummary}</p>
                  <p className="text-sm text-[#4F6B5C]">
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
