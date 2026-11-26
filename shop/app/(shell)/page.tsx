"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Button, Card, Field, StatusBadge, inputClass } from "@/components/ui";
import { formatDateTime, vehicleLabel } from "@/lib/format";
import { useShop } from "@/lib/shop-context";
import { SERVICE_GROUPS, serviceTypes } from "@/lib/types";

export default function TodayPage() {
  const { state, act } = useShop();
  const [bayId, setBayId] = useState("bay_1");
  const [technicianId, setTechnicianId] = useState("staff_luis");
  const [error, setError] = useState("");

  const todayAppointments = useMemo(() => {
    if (!state) return [];
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return state.appointments
      .filter((item) => {
        const at = new Date(item.scheduledAt).getTime();
        return at >= start.getTime() - 1000 * 60 * 60 * 36 && item.status !== "cancelled";
      })
      .sort((a, b) => +new Date(a.scheduledAt) - +new Date(b.scheduledAt));
  }, [state]);

  const activeOrders = state?.repairOrders.filter(
    (item) => item.status !== "picked_up" && item.status !== "cancelled",
  ) ?? [];

  async function checkIn(appointmentId: string) {
    setError("");
    try {
      await act({ type: "check_in", payload: { appointmentId, bayId, technicianId } });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not check in.");
    }
  }

  if (!state) return null;

  return (
    <div className="grid gap-6">
      <div>
        <p className="text-xs font-extrabold tracking-[0.16em] text-gt-muted">SHOP FLOOR</p>
        <h1 className="text-3xl font-extrabold">Today</h1>
      </div>
      {error ? <p className="text-gt-danger">{error}</p> : null}
      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <div className="mb-4 flex items-center justify-between gap-3">
            <h2 className="text-lg font-bold">Appointments</h2>
            <div className="flex gap-2">
              <select className={inputClass} value={bayId} onChange={(event) => setBayId(event.target.value)}>
                {state.bays.map((bay) => (
                  <option key={bay.id} value={bay.id}>{bay.name}</option>
                ))}
              </select>
              <select className={inputClass} value={technicianId} onChange={(event) => setTechnicianId(event.target.value)}>
                {state.staff.map((person) => (
                  <option key={person.id} value={person.id}>{person.fullName}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="grid gap-3">
            {todayAppointments.length === 0 ? <p className="text-gt-muted">No appointments on the board.</p> : null}
            {todayAppointments.map((appointment) => {
              const customer = state.customers.find((item) => item.id === appointment.customerId);
              const vehicle = state.vehicles.find((item) => item.id === appointment.vehicleId);
              const service = serviceTypes.find((item) => item.id === appointment.serviceTypeId);
              return (
                <div key={appointment.id} className="rounded-2xl border border-gt-border bg-gt-card-alt p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-bold">{customer?.fullName} · {vehicle ? vehicleLabel(vehicle) : "Vehicle"}</p>
                      <p className="text-sm text-gt-muted">{service?.name} · {formatDateTime(appointment.scheduledAt)}</p>
                    </div>
                    <StatusBadge status={appointment.status} />
                  </div>
                  {appointment.notes ? <p className="mt-2 text-sm text-gt-muted">{appointment.notes}</p> : null}
                  {appointment.status === "requested" || appointment.status === "confirmed" ? (
                    <div className="mt-3 flex gap-2">
                      {appointment.status === "requested" ? (
                        <Button variant="secondary" onClick={() => act({ type: "update_appointment", payload: { id: appointment.id, status: "confirmed" } })}>
                          Confirm
                        </Button>
                      ) : null}
                      <Button onClick={() => checkIn(appointment.id)}>Check in & create RO</Button>
                    </div>
                  ) : (
                    <p className="mt-3 text-sm text-gt-primary-deep">Already on a repair order</p>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
        <Card>
          <h2 className="mb-4 text-lg font-bold">Active repair orders</h2>
          <div className="grid gap-3">
            {activeOrders.map((order) => {
              const customer = state.customers.find((item) => item.id === order.customerId);
              const vehicle = state.vehicles.find((item) => item.id === order.vehicleId);
              const tech = state.staff.find((item) => item.id === order.assignedTechnicianId);
              const subAdmin = state.staff.find((item) => item.id === order.assignedSubAdminId);
              return (
                <Link key={order.id} href={`/repair-orders/${order.id}`} className="rounded-2xl border border-gt-border bg-gt-card-alt p-4 hover:border-gt-primary">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold">#{order.number} · {order.serviceSummary}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-sm text-gt-muted">
                    {customer?.fullName} · {vehicle ? vehicleLabel(vehicle) : "Vehicle"} · {order.bayName ?? "Unassigned bay"} · {tech?.fullName ?? "No technician"} · {subAdmin?.fullName ?? "No sub-admin"}
                  </p>
                </Link>
              );
            })}
          </div>
        </Card>
      </div>
      <WalkInForm />
    </div>
  );
}

function WalkInForm() {
  const { state, act } = useShop();
  const [customerId, setCustomerId] = useState(state?.customers[0]?.id ?? "");
  const vehicles = state?.vehicles.filter((item) => item.customerId === customerId) ?? [];
  const [vehicleId, setVehicleId] = useState(vehicles[0]?.id ?? "");
  const [serviceSummary, setServiceSummary] = useState("EV system diagnostics");
  const [bayId, setBayId] = useState("bay_1");
  const [technicianId, setTechnicianId] = useState("staff_luis");

  if (!state) return null;

  return (
    <Card>
      <h2 className="mb-4 text-lg font-bold">Walk-in / create repair order</h2>
      <form
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-5"
        onSubmit={async (event) => {
          event.preventDefault();
          await act({
            type: "create_repair_order",
            payload: { customerId, vehicleId, serviceSummary, bayId, technicianId },
          });
        }}
      >
        <Field label="Customer">
          <select className={inputClass} value={customerId} onChange={(event) => setCustomerId(event.target.value)}>
            {state.customers.map((customer) => (
              <option key={customer.id} value={customer.id}>{customer.fullName}</option>
            ))}
          </select>
        </Field>
        <Field label="Vehicle">
          <select className={inputClass} value={vehicleId} onChange={(event) => setVehicleId(event.target.value)}>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>{vehicleLabel(vehicle)}</option>
            ))}
          </select>
        </Field>
        <Field label="Service">
          <select className={inputClass} value={serviceSummary} onChange={(event) => setServiceSummary(event.target.value)}>
            {SERVICE_GROUPS.map((group) => (
              <optgroup key={group.id} label={group.label}>
                {serviceTypes
                  .filter((service) => service.category === group.id)
                  .map((service) => (
                    <option key={service.id} value={service.name}>{service.name}</option>
                  ))}
              </optgroup>
            ))}
          </select>
        </Field>
        <Field label="Bay">
          <select className={inputClass} value={bayId} onChange={(event) => setBayId(event.target.value)}>
            {state.bays.map((bay) => (
              <option key={bay.id} value={bay.id}>{bay.name}</option>
            ))}
          </select>
        </Field>
        <Field label="Technician">
          <select className={inputClass} value={technicianId} onChange={(event) => setTechnicianId(event.target.value)}>
            {state.staff.map((person) => (
              <option key={person.id} value={person.id}>{person.fullName}</option>
            ))}
          </select>
        </Field>
        <div className="flex items-end">
          <Button type="submit">Create repair order</Button>
        </div>
      </form>
    </Card>
  );
}
