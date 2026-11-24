"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";

import { Button, Card, Field, StatusBadge, inputClass } from "@/components/ui";
import { formatDateTime, formatMoney, repairStatusCopy, repairTimeline, vehicleLabel } from "@/lib/format";
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
  const [error, setError] = useState("");

  const order = state?.repairOrders.find((item) => item.id === id);
  const customer = state?.customers.find((item) => item.id === order?.customerId);
  const vehicle = state?.vehicles.find((item) => item.id === order?.vehicleId);
  const currentIndex = order ? repairTimeline.indexOf(order.status as (typeof repairTimeline)[number]) : -1;
  const admin = Boolean(staff && isAdmin(staff.role));
  const canUpload = Boolean(staff && canUploadWorkMedia(staff.role));
  const subAdmin = staff?.role === "sub_admin";

  const totals = useMemo(() => {
    if (!order) return { parts: 0, labor: 0 };
    return {
      parts: order.parts.reduce((sum, item) => sum + item.qty * item.unitCost, 0),
      labor: order.labor.reduce((sum, item) => sum + item.hours * item.rate, 0),
    };
  }, [order]);

  if (!state || !order) {
    return <p>Repair order not found.</p>;
  }

  if (subAdmin && order.assignedSubAdminId !== staff?.id) {
    return (
      <div className="grid gap-3">
        <p>This repair order is not assigned to you.</p>
        <Link href="/repair-orders" className="font-semibold text-[#3DDC84]">Back to assigned jobs</Link>
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
      <p className="mb-4 text-sm text-[#8AA99A]">
        {subAdmin
          ? "Upload photos and videos of the work. The customer sees them on this repair in their account. Messaging and other shop tools are admin-only."
          : "Admin and sub-admin can upload photos and videos of the work. The customer sees them on this repair in their account."}
      </p>
      {canUpload ? (
        <form className="grid gap-3" onSubmit={uploadWorkMedia}>
          <input
            className={inputClass}
            type="file"
            accept="image/*,video/*"
            onChange={(event) => setMediaFile(event.target.files?.[0] ?? null)}
          />
          {mediaFile ? <p className="text-sm text-[#8AA99A]">{mediaFile.name}</p> : null}
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
      ) : (
        <p className="text-sm text-[#8AA99A]">Ask an admin or sub-admin to upload work photos and videos.</p>
      )}
      <div className="mt-4 grid gap-4">
        {order.media.map((item) => (
          <div key={item.id} className="rounded-xl bg-[#0B1C14] p-3">
            {item.uri && item.kind === "photo" ? (
              <img src={item.uri} alt={item.caption || "Work photo"} className="mb-2 w-full rounded-xl" />
            ) : null}
            {item.uri && item.kind === "video_clip" ? (
              <video src={item.uri} controls className="mb-2 w-full rounded-xl bg-black" />
            ) : null}
            <p className="text-sm">{item.caption || (item.kind === "photo" ? "Work photo" : "Work video")}</p>
            <p className="mt-1 text-xs text-[#8AA99A]">{formatDateTime(item.createdAt)}</p>
          </div>
        ))}
      </div>
    </Card>
  );

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold tracking-[0.16em] text-[#8AA99A]">REPAIR ORDER</p>
          <h1 className="text-3xl font-extrabold">#{order.number} · {order.serviceSummary}</h1>
          <p className="text-[#8AA99A]">
            {customer?.fullName} · {vehicle ? vehicleLabel(vehicle) : "Vehicle"} · opened {formatDateTime(order.openedAt)}
          </p>
        </div>
        <StatusBadge status={order.status} />
      </div>
      {error ? <p className="text-[#E85D4C]">{error}</p> : null}

      {subAdmin ? mediaCard : (
        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="grid gap-6">
            <Card>
              <h2 className="mb-4 font-bold">Status and assignment</h2>
              <div className="mb-4 flex flex-wrap gap-2">
                {repairTimeline.map((step, index) => (
                  <button
                    key={step}
                    onClick={() => run({ type: "update_repair_order", payload: { id: order.id, status: step } })}
                    className={`rounded-full px-3 py-1 text-sm ${index === currentIndex ? "bg-[#F5A524] text-[#07140F] font-bold" : index < currentIndex ? "bg-[#3DDC84]/20 text-[#3DDC84]" : "bg-white/5 text-[#8AA99A]"}`}
                  >
                    {repairStatusCopy[step as RepairStatus]}
                  </button>
                ))}
                <Button variant="secondary" onClick={() => run({ type: "update_repair_order", payload: { id: order.id, status: "picked_up" } })}>
                  Mark picked up
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <Field label="Technician">
                  <select
                    className={inputClass}
                    value={order.assignedTechnicianId ?? ""}
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
              <h2 className="mb-4 font-bold">Diagnosis notes</h2>
              <div className="grid gap-3">
                {order.notes.map((item) => (
                  <div key={item.id} className="rounded-xl bg-[#0B1C14] p-3">
                    <p>{item.body}</p>
                    <p className="mt-1 text-xs text-[#8AA99A]">
                      {item.visibleToCustomer ? "Visible to customer" : "Internal"} · {formatDateTime(item.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
              <form
                className="mt-4 grid gap-3"
                onSubmit={async (event) => {
                  event.preventDefault();
                  await run({ type: "add_note", payload: { repairOrderId: order.id, body: note, visibleToCustomer } });
                  setNote("");
                }}
              >
                <textarea className={`${inputClass} min-h-24 py-3`} value={note} onChange={(event) => setNote(event.target.value)} placeholder="What did you find?" />
                <label className="flex items-center gap-2 text-sm text-[#8AA99A]">
                  <input type="checkbox" checked={visibleToCustomer} onChange={(event) => setVisibleToCustomer(event.target.checked)} />
                  Visible to customer
                </label>
                <Button type="submit">Add note</Button>
              </form>
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
              {order.estimate ? (
                <div className="mt-4">
                  <StatusBadge status={order.estimate.status} />
                  <p className="mt-2 text-2xl font-extrabold">{formatMoney(order.estimate.amount)}</p>
                </div>
              ) : null}
              <div className="mt-4">
                <Button onClick={() => run({ type: "send_estimate", payload: { repairOrderId: order.id } })}>
                  Send estimate to customer
                </Button>
              </div>
            </Card>

            {admin ? (
              <Card>
                <h2 className="mb-4 font-bold">Message customer</h2>
                <div className="mb-3 grid max-h-48 gap-2 overflow-auto">
                  {(state.conversations.find((item) => item.customerId === order.customerId)?.messages ?? []).map((item) => (
                    <p key={item.id} className={`rounded-xl px-3 py-2 text-sm ${item.sender === "shop" ? "bg-[#3DDC84]/10" : "bg-[#0B1C14]"}`}>
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
