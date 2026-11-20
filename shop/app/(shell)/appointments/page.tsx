"use client";

import { Button, Card, StatusBadge } from "@/components/ui";
import { formatDateTime, vehicleLabel } from "@/lib/format";
import { useShop } from "@/lib/shop-context";
import { serviceTypes } from "@/lib/types";

export default function AppointmentsPage() {
  const { state, act } = useShop();
  if (!state) return null;

  return (
    <div className="grid gap-5">
      <h1 className="text-3xl font-extrabold">Appointments</h1>
      {state.appointments.map((appointment) => {
        const customer = state.customers.find((item) => item.id === appointment.customerId);
        const vehicle = state.vehicles.find((item) => item.id === appointment.vehicleId);
        const service = serviceTypes.find((item) => item.id === appointment.serviceTypeId);
        return (
          <Card key={appointment.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">{customer?.fullName} · {vehicle ? vehicleLabel(vehicle) : "Vehicle"}</p>
                <p className="text-sm text-[#8AA99A]">{service?.name} · {formatDateTime(appointment.scheduledAt)}</p>
                {appointment.notes ? <p className="mt-2 text-sm text-[#8AA99A]">{appointment.notes}</p> : null}
                {(appointment.photoUris?.length || appointment.videoUris?.length) ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(appointment.photoUris ?? []).map((uri) => (
                      <img key={uri} src={uri} alt="Customer photo" className="h-16 w-16 rounded-lg object-cover" />
                    ))}
                    {(appointment.videoUris ?? []).map((uri) => (
                      <video key={uri} src={uri} controls className="h-16 w-28 rounded-lg bg-black" />
                    ))}
                  </div>
                ) : null}
              </div>
              <StatusBadge status={appointment.status} />
            </div>
            {appointment.status === "requested" ? (
              <div className="mt-3">
                <Button onClick={() => act({ type: "update_appointment", payload: { id: appointment.id, status: "confirmed" } })}>
                  Confirm
                </Button>
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
