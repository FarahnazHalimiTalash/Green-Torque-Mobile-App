"use client";

import { Card } from "@/components/ui";
import { useShop } from "@/lib/shop-context";

export default function BaysPage() {
  const { state } = useShop();
  if (!state) return null;

  return (
    <div className="grid gap-5">
      <h1 className="text-3xl font-extrabold">Bays & cameras</h1>
      <p className="text-[#8AA99A]">
        Assign a camera to a bay, then assign the bay to a repair order. Customers never get a raw camera URL — only an authorized session for that order.
      </p>
      {state.bays.map((bay) => {
        const camera = state.cameras.find((item) => item.id === bay.cameraId);
        const current = state.repairOrders.find(
          (item) => item.bayId === bay.id && item.status !== "picked_up" && item.status !== "cancelled",
        );
        return (
          <Card key={bay.id}>
            <p className="font-bold">{bay.name}</p>
            <p className="text-sm text-[#8AA99A]">
              {camera ? `${camera.name} · ${camera.isActive ? "active" : "offline"}` : "No camera"} · {current ? `RO #${current.number}` : "Empty"}
            </p>
          </Card>
        );
      })}
    </div>
  );
}
