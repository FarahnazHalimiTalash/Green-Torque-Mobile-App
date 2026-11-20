"use client";

import { BackArrow, Card } from "@/components/ui";
import { vehicleLabel } from "@/lib/format";
import { useShop } from "@/lib/shop-context";

export default function VehiclesPage() {
  const { state } = useShop();
  if (!state) return null;

  return (
    <div className="grid gap-5">
      <BackArrow />
      <h1 className="text-3xl font-extrabold">Vehicles</h1>
      {state.vehicles.map((vehicle) => {
        const customer = state.customers.find((item) => item.id === vehicle.customerId);
        return (
          <Card key={vehicle.id}>
            <p className="font-bold">{vehicleLabel(vehicle)}</p>
            <p className="text-sm text-[#8AA99A]">
              {customer?.fullName} · {vehicle.vin || "No VIN"} · {vehicle.mileage.toLocaleString()} mi · {vehicle.evType.toUpperCase()}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
