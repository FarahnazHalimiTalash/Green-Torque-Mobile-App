"use client";

import { useState } from "react";

import { Button, Card, Field, PageHeader, StatusBadge, inputClass } from "@/components/ui";
import { formatDateTime, vehicleLabel } from "@/lib/format";
import { auditForTarget, isClosedAppointment } from "@/lib/history";
import { useShop } from "@/lib/shop-context";
import { isAdmin } from "@/lib/staff";
import { serviceTypes, type AppointmentStatus } from "@/lib/types";

const appointmentStatuses: AppointmentStatus[] = [
  "requested",
  "confirmed",
  "checked_in",
  "completed",
  "cancelled",
];

export default function AppointmentsPage() {
  const { state, staff, act } = useShop();
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [statusEdits, setStatusEdits] = useState<Record<string, AppointmentStatus | "">>({});
  const [noteEdits, setNoteEdits] = useState<Record<string, string>>({});
  const [error, setError] = useState("");
  const admin = Boolean(staff && isAdmin(staff.role));

  if (!state) return null;

  return (
    <div className="grid gap-5">
      <PageHeader title="Appointments" />
      {error ? <p className="text-gt-danger">{error}</p> : null}
      {state.appointments.map((appointment) => {
        const customer = state.customers.find((item) => item.id === appointment.customerId);
        const vehicle = state.vehicles.find((item) => item.id === appointment.vehicleId);
        const service = serviceTypes.find((item) => item.id === appointment.serviceTypeId);
        const closed = isClosedAppointment(appointment);
        const audits = auditForTarget(state, "appointment", appointment.id);
        return (
          <Card key={appointment.id}>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-bold">{customer?.fullName} · {vehicle ? vehicleLabel(vehicle) : "Vehicle"}</p>
                <p className="text-sm text-gt-muted">{service?.name} · {formatDateTime(appointment.scheduledAt)}</p>
                {appointment.notes ? <p className="mt-2 text-sm text-gt-muted">{appointment.notes}</p> : null}
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
                {closed ? (
                  <p className="mt-2 text-sm font-semibold text-gt-warning">Closed history</p>
                ) : null}
              </div>
              <StatusBadge status={appointment.status} />
            </div>
            {appointment.status === "requested" ? (
              <div className="mt-3">
                <Button
                  onClick={async () => {
                    setError("");
                    try {
                      await act({ type: "update_appointment", payload: { id: appointment.id, status: "confirmed" } });
                    } catch (err) {
                      setError(err instanceof Error ? err.message : "Could not save.");
                    }
                  }}
                >
                  Confirm
                </Button>
              </div>
            ) : null}
            {closed && admin ? (
              <form
                className="mt-4 grid gap-3 border-t border-gt-border pt-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setError("");
                  try {
                    await act({
                      type: "correct_history",
                      payload: {
                        targetType: "appointment",
                        targetId: appointment.id,
                        reason: reasons[appointment.id] ?? "",
                        status: statusEdits[appointment.id] || undefined,
                        notes: noteEdits[appointment.id],
                      },
                    });
                    setReasons((current) => ({ ...current, [appointment.id]: "" }));
                    setStatusEdits((current) => ({ ...current, [appointment.id]: "" }));
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not save.");
                  }
                }}
              >
                <p className="text-sm font-bold">History correction</p>
                <Field label="Status">
                  <select
                    className={inputClass}
                    value={statusEdits[appointment.id] ?? ""}
                    onChange={(event) =>
                      setStatusEdits((current) => ({
                        ...current,
                        [appointment.id]: event.target.value as AppointmentStatus | "",
                      }))
                    }
                  >
                    <option value="">Keep current ({appointment.status})</option>
                    {appointmentStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Notes">
                  <textarea
                    className={`${inputClass} min-h-16 py-3`}
                    value={noteEdits[appointment.id] ?? appointment.notes}
                    onChange={(event) =>
                      setNoteEdits((current) => ({ ...current, [appointment.id]: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Reason (required for audit)">
                  <textarea
                    className={`${inputClass} min-h-16 py-3`}
                    value={reasons[appointment.id] ?? ""}
                    onChange={(event) =>
                      setReasons((current) => ({ ...current, [appointment.id]: event.target.value }))
                    }
                    placeholder="Why is this history being corrected?"
                    required
                  />
                </Field>
                <Button type="submit">Save correction with audit trail</Button>
              </form>
            ) : null}
            {audits.length ? (
              <div className="mt-4 grid gap-2 border-t border-gt-border pt-4">
                <p className="text-sm font-bold">Audit trail</p>
                {audits.map((entry) => (
                  <div key={entry.id} className="rounded-xl bg-gt-card-alt p-3 text-sm">
                    <p className="font-bold">{entry.summary}</p>
                    <p className="text-gt-muted">
                      {entry.actorName} · {formatDateTime(entry.createdAt)}
                    </p>
                    <p className="mt-1">Reason: {entry.reason}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </Card>
        );
      })}
    </div>
  );
}
