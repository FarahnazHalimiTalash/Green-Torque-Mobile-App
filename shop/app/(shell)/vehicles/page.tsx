"use client";

import Link from "next/link";

import { Card } from "@/components/ui";
import { vehicleLabel } from "@/lib/format";
import { useShop } from "@/lib/shop-context";

export default function VehiclesPage() {
  const { state } = useShop();
  if (!state) return null;

  return (
    <div className="grid gap-5">
      <h1 className="text-3xl font-extrabold">Vehicles</h1>
      <p className="text-sm text-[#4F6B5C]">
        Open a vehicle to review every service, repair order, and customer pickup acknowledgment.
      </p>
      {state.vehicles.map((vehicle) => {
        const customer = state.customers.find((item) => item.id === vehicle.customerId);
        const services = state.repairOrders.filter((item) => item.vehicleId === vehicle.id).length;
        return (
          <Link key={vehicle.id} href={`/vehicles/${vehicle.id}`}>
            <Card>
              <p className="font-bold">{vehicleLabel(vehicle)}</p>
              <p className="text-sm text-[#4F6B5C]">
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
