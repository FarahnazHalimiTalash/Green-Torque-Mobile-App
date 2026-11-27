"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button, Card, Field, StatusBadge, inputClass } from "@/components/ui";
import { dueChargesForOrder } from "@/lib/billing";
import { paymentMethodLabel } from "@/lib/card";
import { formatDateTime, formatMoney, repairStatusCopy, repairTimeline, vehicleLabel } from "@/lib/format";
import { auditForTarget, isClosedRepair } from "@/lib/history";
import { useShop } from "@/lib/shop-context";
import { canUploadWorkMedia, isAdmin } from "@/lib/staff";
import type { RepairStatus } from "@/lib/types";

export default function RepairOrderPage() {
  const { id } = useParams<{ id: string }>();
  const { state, staff, act } = useShop();
  const [note, setNote] = useState("");
  const [visibleToCustomer, setVisibleToCustomer] = useState(true);
  const [partName, setPartName] = useState("");
  const [partNumber, setPartNumber] = useState("");
  const [qty, setQty] = useState("1");
  const [unitCost, setUnitCost] = useState("");
  const [laborName, setLaborName] = useState("");
  const [hours, setHours] = useState("1");
  const [rate, setRate] = useState("140");
  const [clip, setClip] = useState("");
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");
  const [diagnosisAmount, setDiagnosisAmount] = useState("149");
  const [problemSummary, setProblemSummary] = useState("");
  const [problemLine, setProblemLine] = useState("");
  const [problemAmount, setProblemAmount] = useState("");
  const [correctionSummary, setCorrectionSummary] = useState("");
  const [correctionStatus, setCorrectionStatus] = useState<RepairStatus | "">("");
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionPickupNote, setCorrectionPickupNote] = useState("");
  const [correctionPickupSignature, setCorrectionPickupSignature] = useState("");
  const [error, setError] = useState("");

  const order = state?.repairOrders.find((item) => item.id === id);
  const customer = state?.customers.find((item) => item.id === order?.customerId);
  const vehicle = state?.vehicles.find((item) => item.id === order?.vehicleId);
  const currentIndex = order ? repairTimeline.indexOf(order.status as (typeof repairTimeline)[number]) : -1;
  const admin = Boolean(staff && isAdmin(staff.role));
  const canUpload = Boolean(staff && canUploadWorkMedia(staff.role));
  const subAdmin = staff?.role === "sub_admin";
  const closed = order ? isClosedRepair(order) : false;
  const auditEntries = state && order ? auditForTarget(state, "repair_order", order.id) : [];

  const totals = useMemo(() => {
    if (!order) return { parts: 0, labor: 0 };
    return {
      parts: order.parts.reduce((sum, item) => sum + item.qty * item.unitCost, 0),
      labor: order.labor.reduce((sum, item) => sum + item.hours * item.rate, 0),
    };
  }, [order]);
  const orderPayments = (state?.payments ?? []).filter((item) => item.repairOrderId === order?.id);
  const due = order ? dueChargesForOrder(order, state?.payments ?? []) : [];
  const customerCard = customer?.paymentMethods?.[0];

  if (!state || !order) {
    return <p>Repair order not found.</p>;
  }

  if (subAdmin && order.assignedSubAdminId !== staff?.id) {
    return (
      <div className="grid gap-3">
        <p>This repair order is not assigned to you.</p>
        <Link href="/repair-orders" className="font-semibold text-gt-primary-deep">Back to assigned jobs</Link>
      </div>
    );
  }

  const repairOrder = order;

  async function run(action: Parameters<typeof act>[0]) {
    setError("");
    try {
      await act(action);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not save.");
    }
  }

  async function uploadWorkMedia(event: React.FormEvent) {
    event.preventDefault();
    if (!mediaFile || !staff) {
      setError("Choose a photo or video.");
      return;
    }
    setError("");
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", mediaFile);
      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { "x-user-id": staff.id },
        body: form,
      });
      const data = (await response.json()) as { uri?: string; kind?: "photo" | "video_clip"; error?: string };
      if (!response.ok || !data.uri || !data.kind) {
        throw new Error(data.error ?? "Could not upload file.");
      }
      await run({
        type: "add_media",
        payload: {
          repairOrderId: repairOrder.id,
          kind: data.kind,
          caption: clip,
          uri: data.uri,
          visibleToCustomer: true,
        },
      });
      setClip("");
      setMediaFile(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not upload file.");
    } finally {
      setUploading(false);
    }
  }

  const mediaCard = (
    <Card>
      <h2 className="mb-4 font-bold">Work photos & videos</h2>
      <p className="mb-4 text-sm text-gt-muted">
        {closed
          ? "Closed history is view-only for media. Admin can correct status and summary below with a reason."
          : subAdmin
            ? "Upload photos and videos of the work. The customer sees them on this repair in their account. Messaging and other shop tools are admin-only."
            : "Admin and sub-admin can upload photos and videos of the work. The customer sees them on this repair in their account."}
      </p>
      {canUpload && !closed ? (
        <form className="grid gap-3" onSubmit={uploadWorkMedia}>
          <input
            className={inputClass}
            type="file"
            accept="image/*,video/*"
            onChange={(event) => setMediaFile(event.target.files?.[0] ?? null)}
          />
          {mediaFile ? <p className="text-sm text-gt-muted">{mediaFile.name}</p> : null}
          <textarea
            className={`${inputClass} min-h-20 py-3`}
            value={clip}
            onChange={(event) => setClip(event.target.value)}
            placeholder="What should the customer know about this photo or video?"
          />
          <Button type="submit" disabled={uploading}>
            {uploading ? "Uploading…" : "Upload photo or video"}
          </Button>
        </form>
      ) : !closed ? (
        <p className="text-sm text-gt-muted">Ask an admin or sub-admin to upload work photos and videos.</p>
      ) : null}
      <div className="mt-4 grid gap-4">
        {order.media.map((item) => (
          <div key={item.id} className="rounded-xl bg-gt-card-alt p-3">
            {item.uri && item.kind === "photo" ? (
              <img src={item.uri} alt={item.caption || "Work photo"} className="mb-2 w-full rounded-xl" />
            ) : null}
            {item.uri && item.kind === "video_clip" ? (
              <video src={item.uri} controls className="mb-2 w-full rounded-xl bg-black" />
            ) : null}
            <p className="text-sm">{item.caption || (item.kind === "photo" ? "Work photo" : "Work video")}</p>
            <p className="mt-1 text-xs text-gt-muted">{formatDateTime(item.createdAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );

  const historyCorrectionCard =
    closed && admin ? (
      <Card>
        <h2 className="mb-2 font-bold">History correction</h2>
        <p className="mb-4 text-sm text-gt-muted">
          Closed repairs are locked. Admin can correct them only with a reason so every change stays in the audit trail.
        </p>
        <form
          className="grid gap-3"
          onSubmit={async (event) => {
            event.preventDefault();
            await run({
              type: "correct_history",
              payload: {
                targetType: "repair_order",
                targetId: order.id,
                reason: correctionReason,
                serviceSummary: correctionSummary || undefined,
                status: correctionStatus || undefined,
                pickupNote: correctionPickupNote || undefined,
                pickupSignature: correctionPickupSignature || undefined,
              },
            });
            setCorrectionReason("");
            setCorrectionSummary("");
            setCorrectionStatus("");
            setCorrectionPickupNote("");
            setCorrectionPickupSignature("");
          }}
        >
          <Field label="Service summary">
            <input
              className={inputClass}
              value={correctionSummary}
              onChange={(event) => setCorrectionSummary(event.target.value)}
              placeholder={order.serviceSummary}
            />
          </Field>
          <Field label="Status">
            <select
              className={inputClass}
              value={correctionStatus}
              onChange={(event) => setCorrectionStatus(event.target.value as RepairStatus | "")}
            >
              <option value="">Keep current ({repairStatusCopy[order.status]})</option>
              {([...repairTimeline, "picked_up", "cancelled"] as RepairStatus[]).map((step) => (
                <option key={step} value={step}>
                  {repairStatusCopy[step]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Customer pickup note">
            <textarea
              className={`${inputClass} min-h-20 py-3`}
              value={correctionPickupNote}
              onChange={(event) => setCorrectionPickupNote(event.target.value)}
              placeholder={order.pickupAcknowledgment?.note ?? "Customer confirmation note"}
            />
          </Field>
          <Field label="Customer signature full name">
            <input
              className={inputClass}
              value={correctionPickupSignature}
              onChange={(event) => setCorrectionPickupSignature(event.target.value)}
              placeholder={order.pickupAcknowledgment?.signatureFullName ?? customer?.fullName ?? "Full name"}
            />
          </Field>
          <Field label="Reason (required for audit)">
            <textarea
              className={`${inputClass} min-h-20 py-3`}
              value={correctionReason}
              onChange={(event) => setCorrectionReason(event.target.value)}
              placeholder="Why is this history being corrected?"
              required
            />
          </Field>
          <Button type="submit">Save correction with audit trail</Button>
        </form>
      </Card>
    ) : null;

  const auditCard = (
    <Card>
      <h2 className="mb-4 font-bold">Audit trail</h2>
      {auditEntries.length === 0 ? (
        <p className="text-sm text-gt-muted">No history corrections recorded for this repair yet.</p>
      ) : (
        <div className="grid gap-3">
          {auditEntries.map((entry) => (
            <div key={entry.id} className="rounded-xl bg-gt-card-alt p-3 text-sm">
              <p className="font-bold">{entry.summary}</p>
              <p className="mt-1 text-gt-muted">
                {entry.actorName} ({entry.actorRole}) · {formatDateTime(entry.createdAt)}
              </p>
              <p className="mt-2">Reason: {entry.reason}</p>
              <p className="mt-1 text-xs text-gt-muted">Before: {entry.before}</p>
              <p className="text-xs text-gt-muted">After: {entry.after}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gt-primary-deep">Repair order</p>
          <h1 className="text-[34px] font-extrabold leading-tight tracking-tight text-gt-text">
            #{order.number} · {order.serviceSummary}
          </h1>
          <p className="text-gt-muted">
            {customer?.fullName} · {vehicle ? vehicleLabel(vehicle) : "Vehicle"} · opened {formatDateTime(order.openedAt)}
          </p>
          {vehicle ? (
            <Link href={`/vehicles/${vehicle.id}`} className="mt-2 inline-block text-sm font-semibold text-gt-primary-deep">
              Open full vehicle service history
            </Link>
          ) : null}
          {closed ? (
            <p className="mt-2 text-sm font-semibold text-gt-warning">
              Closed history — customers cannot edit. Admin corrections are audited.
            </p>
          ) : null}
        </div>
        <StatusBadge status={order.status} />
      </div>
      {error ? <p className="text-gt-danger">{error}</p> : null}

      <Card>
        <h2 className="mb-2 font-bold">Customer pickup acknowledgment</h2>
        {order.pickupAcknowledgment ? (
          <div className="rounded-xl bg-gt-card-alt p-4">
            <p className="text-sm text-gt-muted">Customer note (locked for customer; admin edits are audited)</p>
            <p className="mt-2">{order.pickupAcknowledgment.note}</p>
            <p className="mt-4 text-sm text-gt-muted">Signature</p>
            <p className="text-xl font-bold italic">{order.pickupAcknowledgment.signatureFullName}</p>
            <p className="mt-2 text-xs text-gt-muted">Signed {formatDateTime(order.pickupAcknowledgment.signedAt)}</p>
          </div>
        ) : (
          <p className="text-sm text-gt-warning">
            {order.status === "ready" || order.status === "picked_up"
              ? "Waiting for the customer to submit a pickup note and full-name signature in the app."
              : "When the vehicle is ready, the customer must sign a pickup acknowledgment before history is complete."}
          </p>
        )}
      </Card>

      {subAdmin ? (
        <>
          {mediaCard}
          {closed ? auditCard : null}
        </>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6">
            {historyCorrectionCard}
            {closed ? auditCard : null}
            <Card>
              <h2 className="mb-4 font-bold">Status and assignment</h2>
              {closed ? (
                <p className="mb-4 text-sm text-gt-muted">
                  Status is locked. Use History correction above to change closed records.
                </p>
              ) : (
                <div className="mb-4 flex flex-wrap gap-2">
                  {repairTimeline.map((step, index) => (
                    <button
                      key={step}
                      onClick={() => run({ type: "update_repair_order", payload: { id: order.id, status: step } })}
                      className={`rounded-full px-3 py-1 text-sm ${index === currentIndex ? "bg-gt-warning text-white font-bold" : index < currentIndex ? "bg-[var(--gt-primary-muted)] text-gt-primary-deep" : "bg-gt-elevated text-gt-muted"}`}
                    >
                      {repairStatusCopy[step as RepairStatus]}
                    </button>
                  ))}
                  <Button variant="secondary" onClick={() => run({ type: "update_repair_order", payload: { id: order.id, status: "picked_up" } })}>
                    Mark picked up
                  </Button>
                </div>
              )}
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Technician">
                  <select
                    className={inputClass}
                    value={order.assignedTechnicianId ?? ""}
                    disabled={closed}
                    onChange={(event) => run({ type: "update_repair_order", payload: { id: order.id, assignedTechnicianId: event.target.value } })}
                  >
                    <option value="">Unassigned</option>
                    {state.staff.filter((person) => person.role === "technician").map((person) => (
                      <option key={person.id} value={person.id}>{person.fullName}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Sub-admin">
                  <select
                    className={inputClass}
                    value={order.assignedSubAdminId ?? ""}
                    disabled={closed}
                    onChange={(event) => run({ type: "update_repair_order", payload: { id: order.id, assignedSubAdminId: event.target.value } })}
                  >
                    <option value="">Unassigned</option>
                    {state.staff.filter((person) => person.role === "sub_admin").map((person) => (
                      <option key={person.id} value={person.id}>{person.fullName}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Work bay">
                  <select
                    className={inputClass}
                    value={order.bayId ?? ""}
                    disabled={closed}
                    onChange={(event) => run({ type: "update_repair_order", payload: { id: order.id, bayId: event.target.value } })}
                  >
                    <option value="">Unassigned</option>
                    {state.bays.map((bay) => (
                      <option key={bay.id} value={bay.id}>{bay.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
            </Card>

            <Card>
              <h2 className="mb-4 font-bold">Diagnosis charge</h2>
              <p className="mb-4 text-sm text-gt-muted">
                After check-in, diagnosis has a fee. Send it to the customer. If more work is needed, send a separate further-service estimate they can accept or decline.
              </p>
              {order.diagnosisCharge?.status === "sent" ? (
                <div className="mb-4 rounded-xl border border-gt-primary/40 bg-[var(--gt-primary-muted)] p-4">
                  <p className="font-bold text-gt-primary-deep">Diagnosis sent to customer</p>
                  <p className="mt-1 text-2xl font-extrabold">{formatMoney(order.diagnosisCharge.amount)}</p>
                  <p className="mt-1 text-sm text-gt-muted">{order.diagnosisCharge.description}</p>
                </div>
              ) : (
                <p className="mb-4 text-sm text-gt-warning">No diagnosis charge has been sent yet.</p>
              )}
              {admin && !closed ? (
                <form
                  className="grid gap-3"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await run({
                      type: "send_diagnosis_charge",
                      payload: { repairOrderId: order.id, amount: Number(diagnosisAmount) },
                    });
                  }}
                >
                  <Field label="Diagnosis amount">
                    <input
                      className={inputClass}
                      value={diagnosisAmount}
                      onChange={(event) => setDiagnosisAmount(event.target.value)}
                      inputMode="decimal"
                    />
                  </Field>
                  <Button type="submit">Send diagnosis charge to customer</Button>
                </form>
              ) : null}
            </Card>

            <Card>
              <h2 className="mb-4 font-bold">Diagnosis notes</h2>
              <div className="grid gap-3">
                {order.notes.map((item) => (
                  <div key={item.id} className="rounded-xl bg-gt-card-alt p-3">
                    <p>{item.body}</p>
                    <p className="mt-1 text-xs text-gt-muted">
                      {item.visibleToCustomer ? "Visible to customer" : "Internal"} · {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
              {!closed ? (
                <form
                  className="mt-4 grid gap-3"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await run({ type: "add_note", payload: { repairOrderId: order.id, body: note, visibleToCustomer } });
                    setNote("");
                  }}
                >
                  <textarea className={`${inputClass} min-h-24 py-3`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What did you find?" />
                  <label className="flex items-center gap-2 text-sm text-gt-muted">
                    <input type="checkbox" checked={visibleToCustomer} onChange={(event) => setVisibleToCustomer(event.target.checked)} />
                    Visible to customer
                  </label>
                  <Button type="submit">Add note</Button>
                </form>
              ) : null}
            </Card>

            {mediaCard}
          </div>

          <div className="grid gap-6">
            <Card>
              <h2 className="mb-4 font-bold">Parts & labor</h2>
              <div className="grid gap-2 text-sm">
                {order.parts.map((part) => (
                  <p key={part.id}>{part.qty}× {part.name} · {formatMoney(part.qty * part.unitCost)}</p>
                ))}
                {order.labor.map((line) => (
                  <p key={line.id}>{line.hours}h {line.description} · {formatMoney(line.hours * line.rate)}</p>
                ))}
              </div>
              <p className="mt-3 font-bold">
                Total {formatMoney(totals.parts + totals.labor)}
              </p>
              {!closed ? (
                <>
                  <form
                    className="mt-4 grid gap-2"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      await run({
                        type: "add_part",
                        payload: {
                          repairOrderId: order.id,
                          name: partName,
                          partNumber,
                          qty: Number(qty),
                          unitCost: Number(unitCost),
                        },
                      });
                      setPartName("");
                      setPartNumber("");
                      setUnitCost("");
                    }}
                  >
                    <input className={inputClass} placeholder="Part name" value={partName} onChange={(event) => setPartName(event.target.value)} />
                    <div className="grid grid-cols-3 gap-2">
                      <input className={inputClass} placeholder="PN" value={partNumber} onChange={(event) => setPartNumber(event.target.value)} />
                      <input className={inputClass} placeholder="Qty" value={qty} onChange={(event) => setQty(event.target.value)} />
                      <input className={inputClass} placeholder="Cost" value={unitCost} onChange={(event) => setUnitCost(event.target.value)} />
                    </div>
                    <Button type="submit" variant="secondary">Add part</Button>
                  </form>
                  <form
                    className="mt-3 grid gap-2"
                    onSubmit={async (event) => {
                      event.preventDefault();
                      await run({
                        type: "add_labor",
                        payload: {
                          repairOrderId: order.id,
                          description: laborName,
                          hours: Number(hours),
                          rate: Number(rate),
                        },
                      });
                      setLaborName("");
                    }}
                  >
                    <input className={inputClass} placeholder="Labor description" value={laborName} onChange={(event) => setLaborName(event.target.value)} />
                    <div className="grid grid-cols-2 gap-2">
                      <input className={inputClass} placeholder="Hours" value={hours} onChange={(event) => setHours(event.target.value)} />
                      <input className={inputClass} placeholder="Rate" value={rate} onChange={(event) => setRate(event.target.value)} />
                    </div>
                    <Button type="submit" variant="secondary">Add labor</Button>
                  </form>
                </>
              ) : null}
              {order.estimate ? (
                <div className="mt-4 grid gap-3">
                  <StatusBadge status={order.estimate.status} />
                  <p className="text-2xl font-extrabold">{formatMoney(order.estimate.amount)}</p>
                  {order.estimate.status === "sent" ? (
                    <div className="rounded-xl border border-gt-warning bg-[var(--gt-warning-muted)] p-4">
                      <p className="font-bold text-gt-warning">Waiting for customer decision</p>
                      <p className="mt-1 text-sm">The customer can approve or decline this further-service estimate in the app.</p>
                    </div>
                  ) : null}
                  {order.estimate.status === "approved" ? (
                    <div className="rounded-xl border border-gt-primary bg-[var(--gt-primary-muted)] p-4">
                      <p className="font-bold text-gt-primary-deep">Customer approved</p>
                      <p className="mt-1 text-sm">The customer accepted this further-service estimate. Continue the additional repair.</p>
                    </div>
                  ) : null}
                  {order.estimate.status === "declined" ? (
                    <div className="rounded-xl border border-gt-danger bg-[var(--gt-danger-muted)] p-4">
                      <p className="font-bold text-gt-danger">Customer declined</p>
                      <p className="mt-1 text-sm">The customer declined this further-service estimate. The diagnosis charge still applies. Do not continue this extra work unless you send a new estimate.</p>
                    </div>
                  ) : null}
                </div>
              ) : null}
              {admin && !closed ? (
                <div className="mt-4">
                  <Button onClick={() => run({ type: "send_estimate", payload: { repairOrderId: order.id } })}>
                    Send further-service estimate to customer
                  </Button>
                </div>
              ) : null}
            </Card>

            <Card>
              <h2 className="mb-4 font-bold">New problem found during work</h2>
              <p className="mb-4 text-sm text-gt-muted">
                {closed
                  ? "Closed history is view-only for found problems."
                  : "If another issue appears while the vehicle is in the shop, only admin can review it, send a new cost estimate, and notify the customer. They can approve or decline that extra work."}
              </p>
              {(order.foundProblems ?? []).map((problem) => (
                <div key={problem.id} className="mb-4 rounded-xl bg-gt-card-alt p-4">
                  <p className="font-bold">{problem.summary}</p>
                  <p className="mt-1 text-2xl font-extrabold">{formatMoney(problem.estimate.amount)}</p>
                  {problem.estimate.lines.map((line) => (
                    <p key={line.id} className="text-sm text-gt-muted">{line.name} · {formatMoney(line.amount)}</p>
                  ))}
                  <div className="mt-3">
                    <StatusBadge status={problem.estimate.status} />
                  </div>
                  {problem.estimate.status === "sent" ? (
                    <p className="mt-2 text-sm text-gt-warning">Customer notified. Waiting for approve or decline.</p>
                  ) : null}
                  {problem.estimate.status === "approved" ? (
                    <p className="mt-2 text-sm text-gt-primary-deep">Customer approved this extra repair.</p>
                  ) : null}
                  {problem.estimate.status === "declined" ? (
                    <p className="mt-2 text-sm text-gt-danger">Customer declined this extra repair. Do not continue it unless you send a new estimate.</p>
                  ) : null}
                </div>
              ))}
              {admin && !closed ? (
                <form
                  className="grid gap-3"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await run({
                      type: "report_found_problem",
                      payload: {
                        repairOrderId: order.id,
                        summary: problemSummary,
                        lineName: problemLine,
                        amount: Number(problemAmount),
                      },
                    });
                    setProblemSummary("");
                    setProblemLine("");
                    setProblemAmount("");
                  }}
                >
                  <Field label="What was found">
                    <textarea
                      className={`${inputClass} min-h-24 py-3`}
                      value={problemSummary}
                      onChange={(event) => setProblemSummary(event.target.value)}
                      placeholder="Example: Front brake pads are worn and need replacement."
                    />
                  </Field>
                  <Field label="Repair item">
                    <input
                      className={inputClass}
                      value={problemLine}
                      onChange={(event) => setProblemLine(event.target.value)}
                      placeholder="Front brake pad replacement"
                    />
                  </Field>
                  <Field label="Estimate amount">
                    <input
                      className={inputClass}
                      value={problemAmount}
                      onChange={(event) => setProblemAmount(event.target.value)}
                      inputMode="decimal"
                    />
                  </Field>
                  <Button type="submit">Notify customer and send estimate</Button>
                </form>
              ) : !closed ? (
                <p className="text-sm text-gt-muted">Ask an admin to review a newly found problem and send the customer an estimate.</p>
              ) : null}
            </Card>

            <Card>
              <h2 className="mb-4 font-bold">Customer payment</h2>
              <p className="mb-3 text-sm text-gt-muted">
                {customerCard ? paymentMethodLabel(customerCard) : "No payment method on file. The customer adds a card in the app."}
              </p>
              {due.map((item) => (
                <p key={item.sourceId} className="text-sm">Due · {item.description} · {formatMoney(item.amount)}</p>
              ))}
              {orderPayments.map((item) => (
                <p key={item.id} className="mt-2 text-sm text-gt-primary-deep">
                  Paid {formatMoney(item.amount)} · {item.methodBrand} •••• {item.methodLast4} · {item.description}
                </p>
              ))}
              {!due.length && !orderPayments.length ? (
                <p className="text-sm text-gt-muted">No charges due yet. Diagnosis and approved extra work appear here after the customer can pay.</p>
              ) : null}
            </Card>

            {admin ? (
              <Card>
                <h2 className="mb-4 font-bold">Message customer</h2>
                <div className="mb-3 grid max-h-48 gap-2 overflow-auto">
                  {(state.conversations.find((item) => item.customerId === order.customerId)?.messages ?? []).map((item) => (
                    <p key={item.id} className={`rounded-xl px-3 py-2 text-sm ${item.sender === "shop" ? "bg-[var(--gt-primary-muted)]" : "bg-gt-card-alt"}`}>
                      <span className="font-bold">{item.sender === "shop" ? "Shop" : customer?.fullName}: </span>
                      {item.body}
                    </p>
                  ))}
                </div>
                <form
                  className="grid gap-2"
                  onSubmit={async (event) => {
                    event.preventDefault();
                    await run({
                      type: "send_message",
                      payload: { customerId: order.customerId, sender: "shop", body: message, repairOrderId: order.id },
                    });
                    setMessage("");
                  }}
                >
                  <input className={inputClass} value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Message the customer" />
                  <Button type="submit">Send</Button>
                </form>
              </Card>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}
