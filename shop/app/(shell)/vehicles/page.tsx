"use client";

import Link from "next/link";

import { Card, PageHeader } from "@/components/ui";
import { vehicleLabel } from "@/lib/format";
import { useShop } from "@/lib/shop-context";

export default function VehiclesPage() {
  const { state } = useShop();
  if (!state) return null;

  return (
    <div className="grid gap-5">
      <PageHeader
        eyebrow="Garage"
        title="Vehicles"
        subtitle="Open a vehicle to review every service, repair order, and customer pickup acknowledgment."
      />
      {state.vehicles.map((vehicle) => {
        const customer = state.customers.find((item) => item.id === vehicle.customerId);
        const services = state.repairOrders.filter((item) => item.vehicleId === vehicle.id).length;
        return (
          <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
            <Card>
              <p className="font-bold">{vehicleLabel(vehicle)}</p>
              <p className="text-sm text-gt-muted">
                {customer?.fullName} · {vehicle.vin || "No VIN"} · {vehicle.mileage.toLocaleString()} mi ·{" "}
                {vehicle.evType.toUpperCase()} · {services} service{services === 1 ? "" : "s"}
              </p>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
