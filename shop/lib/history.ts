import type { Appointment, AuditEntry, RepairOrder, ShopState, UserRole } from "./types";
import { createId } from "./ids";

export type HistoryActor = {
  id: string;
  fullName: string;
  role: UserRole;
};

export function isClosedRepair(order: RepairOrder) {
  return order.status === "picked_up" || order.status === "cancelled";
}

export function isClosedAppointment(appointment: Appointment) {
  return appointment.status === "completed" || appointment.status === "cancelled" || appointment.status === "checked_in";
}

export function recordAudit(
  state: ShopState,
  input: {
    actor: HistoryActor;
    targetType: AuditEntry["targetType"];
    targetId: string;
    summary: string;
    reason: string;
    before: string;
    after: string;
  },
) {
  state.auditLog = state.auditLog ?? [];
  state.auditLog.unshift({
    id: createId("audit"),
    actorId: input.actor.id,
    actorName: input.actor.fullName,
    actorRole: input.actor.role,
    targetType: input.targetType,
    targetId: input.targetId,
    summary: input.summary,
    reason: input.reason.trim(),
    before: input.before,
    after: input.after,
    createdAt: new Date().toISOString(),
  });
}

export function auditForTarget(state: ShopState, targetType: AuditEntry["targetType"], targetId: string) {
  return (state.auditLog ?? []).filter((item) => item.targetType === targetType && item.targetId === targetId);
}
