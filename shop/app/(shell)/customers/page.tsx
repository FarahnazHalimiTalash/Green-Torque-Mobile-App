"use client";

import { Card } from "@/components/ui";
import { paymentMethodLabel } from "@/lib/card";
import { useShop } from "@/lib/shop-context";

export default function CustomersPage() {
  const { state } = useShop();
  if (!state) return null;

  return (
    <div className="grid gap-5">
      <h1 className="text-3xl font-extrabold">Customers</h1>
      {state.customers.map((customer) => {
        const vehicles = state.vehicles.filter((item) => item.customerId === customer.id);
        const open = state.repairOrders.filter(
          (item) => item.customerId === customer.id && item.status !== "picked_up" && item.status !== "cancelled",
        );
        return (
          <Card key={customer.id}>
            <p className="font-bold">{customer.fullName}</p>
            <p className="text-sm text-[#4F6B5C]">{customer.email} · {customer.phone}</p>
            <p className="mt-2 text-sm text-[#4F6B5C]">
              {vehicles.length} vehicle{vehicles.length === 1 ? "" : "s"} · {open.length} open repair order{open.length === 1 ? "" : "s"}
              {" · "}
              {customer.paymentMethods?.[0] ? paymentMethodLabel(customer.paymentMethods[0]) : "No card on file"}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
