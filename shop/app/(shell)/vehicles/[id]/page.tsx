"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button, Card, Field, PageHeader, StatusBadge, inputClass } from "@/components/ui";
import { formatDateTime, formatMoney, repairStatusCopy, vehicleLabel } from "@/lib/format";
import { auditForTarget, isClosedRepair } from "@/lib/history";
import { useShop } from "@/lib/shop-context";
import { isAdmin } from "@/lib/staff";

export default function VehicleHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const { state, staff, act } = useShop();
  const [error, setError] = useState("");
  const [reasons, setReasons] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [signatures, setSignatures] = useState<Record<string, string>>({});
  const admin = Boolean(staff && isAdmin(staff.role));

  const vehicle = state?.vehicles.find((item) => item.id === id);
  const customer = state?.customers.find((item) => item.id === vehicle?.customerId);
  const history = useMemo(() => {
    if (!state || !vehicle) return [];
    return state.repairOrders
      .filter((item) => item.vehicleId === vehicle.id)
      .sort((a, b) => +new Date(b.openedAt) - +new Date(a.openedAt));
  }, [state, vehicle]);

  if (!state || !vehicle) {
    return <p>Vehicle not found.</p>;
  }

  return (
    <div className="grid gap-6">
      <div>
        <Link href="/vehicles" className="text-sm font-semibold text-gt-primary-deep">
          All vehicles
        </Link>
        <div className="mt-3">
          <PageHeader
            eyebrow="Vehicle history"
            title={vehicleLabel(vehicle)}
            subtitle={`${customer?.fullName ?? "Customer"} · ${vehicle.vin || "No VIN"} · ${vehicle.mileage.toLocaleString()} mi · ${vehicle.evType.toUpperCase()}`}
          />
        </div>
        <p className="text-sm text-gt-muted">
          Full service history for this vehicle, including parts, labor, estimates, and locked customer pickup
          acknowledgments. Admin can edit customer pickup notes with a required audit reason.
        </p>
      </div>
      {error ? <p className="text-gt-danger">{error}</p> : null}

      {history.length === 0 ? (
        <Card>
          <p className="text-sm text-gt-muted">No repair history for this vehicle yet.</p>
        </Card>
      ) : null}

      {history.map((order) => {
        const audits = auditForTarget(state, "repair_order", order.id);
        const partsTotal = order.parts.reduce((sum, item) => sum + item.qty * item.unitCost, 0);
        const laborTotal = order.labor.reduce((sum, item) => sum + item.hours * item.rate, 0);
        return (
          <Card key={order.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gt-primary-deep">Repair order</p>
                <Link href={`/repair-orders/${order.id}`} className="text-xl font-extrabold text-gt-primary-deep">
                  #{order.number} · {order.serviceSummary}
                </Link>
                <p className="mt-1 text-sm text-gt-muted">
                  Opened {formatDateTime(order.openedAt)}
                  {order.pickedUpAt ? ` · Picked up ${formatDateTime(order.pickedUpAt)}` : ""}
                  {order.bayName ? ` · ${order.bayName}` : ""}
                </p>
              </div>
              <StatusBadge status={order.status} />
            </div>

            <div className="mt-4 grid gap-2 text-sm">
              {order.diagnosisCharge?.status === "sent" ? (
                <p>Diagnosis · {formatMoney(order.diagnosisCharge.amount)} · {order.diagnosisCharge.description}</p>
              ) : null}
              {order.estimate ? (
                <p>
                  Further-service estimate · {formatMoney(order.estimate.amount)} · {order.estimate.status}
                </p>
              ) : null}
              {(order.foundProblems ?? []).map((problem) => (
                <p key={problem.id}>
                  Found problem · {problem.summary} · {formatMoney(problem.estimate.amount)} · {problem.estimate.status}
                </p>
              ))}
              {order.parts.map((part) => (
                <p key={part.id}>
                  Part · {part.qty}× {part.name} · {formatMoney(part.qty * part.unitCost)}
                </p>
              ))}
              {order.labor.map((line) => (
                <p key={line.id}>
                  Labor · {line.hours}h {line.description} · {formatMoney(line.hours * line.rate)}
                </p>
              ))}
              {partsTotal + laborTotal > 0 ? (
                <p className="font-bold">Parts & labor total · {formatMoney(partsTotal + laborTotal)}</p>
              ) : null}
              {order.notes
                .filter((note) => note.visibleToCustomer)
                .map((note) => (
                  <p key={note.id} className="text-gt-muted">
                    Shop note · {note.body}
                  </p>
                ))}
            </div>

            <div className="mt-4 rounded-xl bg-gt-card-alt p-4">
              <p className="text-sm font-bold">Customer pickup acknowledgment</p>
              {order.pickupAcknowledgment ? (
                <>
                  <p className="mt-2">{order.pickupAcknowledgment.note}</p>
                  <p className="mt-3 text-lg font-bold italic">{order.pickupAcknowledgment.signatureFullName}</p>
                  <p className="mt-1 text-xs text-gt-muted">
                    Signed {formatDateTime(order.pickupAcknowledgment.signedAt)} · Customer cannot edit
                  </p>
                </>
              ) : (
                <p className="mt-2 text-sm text-gt-warning">No customer pickup signature on file yet.</p>
              )}
            </div>

            {admin && isClosedRepair(order) ? (
              <form
                className="mt-4 grid gap-3 border-t border-gt-border pt-4"
                onSubmit={async (event) => {
                  event.preventDefault();
                  setError("");
                  try {
                    await act({
                      type: "correct_history",
                      payload: {
                        targetType: "repair_order",
                        targetId: order.id,
                        reason: reasons[order.id] ?? "",
                        pickupNote: (notes[order.id] ?? order.pickupAcknowledgment?.note ?? "").trim(),
                        pickupSignature: (
                          signatures[order.id] ??
                          order.pickupAcknowledgment?.signatureFullName ??
                          ""
                        ).trim(),
                      },
                    });
                    setReasons((current) => ({ ...current, [order.id]: "" }));
                  } catch (err) {
                    setError(err instanceof Error ? err.message : "Could not save.");
                  }
                }}
              >
                <p className="text-sm font-bold">Edit customer acknowledgment (audited)</p>
                <Field label="Customer note">
                  <textarea
                    className={`${inputClass} min-h-20 py-3`}
                    value={notes[order.id] ?? order.pickupAcknowledgment?.note ?? ""}
                    onChange={(event) => setNotes((current) => ({ ...current, [order.id]: event.target.value }))}
                  />
                </Field>
                <Field label="Signature full name">
                  <input
                    className={inputClass}
                    value={signatures[order.id] ?? order.pickupAcknowledgment?.signatureFullName ?? ""}
                    onChange={(event) =>
                      setSignatures((current) => ({ ...current, [order.id]: event.target.value }))
                    }
                  />
                </Field>
                <Field label="Reason (required for audit)">
                  <textarea
                    className={`${inputClass} min-h-16 py-3`}
                    value={reasons[order.id] ?? ""}
                    onChange={(event) => setReasons((current) => ({ ...current, [order.id]: event.target.value }))}
                    placeholder="Why is this customer acknowledgment being corrected?"
                    required
                  />
                </Field>
                <Button type="submit">Save acknowledgment correction</Button>
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
                    <p className="mt-1 text-xs text-gt-muted">Before: {entry.before}</p>
                    <p className="text-xs text-gt-muted">After: {entry.after}</p>
                  </div>
                ))}
              </div>
            ) : null}

            <p className="mt-3 text-xs text-gt-muted">Status label: {repairStatusCopy[order.status]}</p>
          </Card>
        );
      })}
    </div>
  );
}
