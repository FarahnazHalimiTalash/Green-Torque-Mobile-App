import { dropOffSlotTaken } from "./drop-off";
import { createId } from "./ids";
import { customerSnapshot } from "./portal";
import { serviceTypes, type ShopState } from "./types";

function notify(
  state: ShopState,
  userId: string,
  title: string,
  body: string,
  href?: string,
) {
  state.notifications.unshift({
    id: createId("ntf"),
    userId,
    title,
    body,
    createdAt: new Date().toISOString(),
    read: false,
    href,
  });
}

function getConversation(state: ShopState, customerId: string, repairOrderId?: string) {
  let conversation = state.conversations.find((item) => item.customerId === customerId);
  if (!conversation) {
    conversation = {
      id: createId("convo"),
      customerId,
      repairOrderId,
      messages: [],
    };
    state.conversations.push(conversation);
  }
  return conversation;
}

function resolveBay(state: ShopState, bayId?: string) {
  const bay = state.bays.find((item) => item.id === bayId);
  return {
    bayId: bay?.id,
    bayName: bay?.name,
  };
}

function rebuildEstimate(state: ShopState, orderId: string, force = false) {
  const order = state.repairOrders.find((item) => item.id === orderId);
  if (!order) return;
  if (!force && (order.estimate?.status === "approved" || order.estimate?.status === "declined")) {
    return;
  }
  const partLines = order.parts.map((part) => ({
    id: part.id,
    name: part.name,
    amount: part.qty * part.unitCost,
  }));
  const laborLines = order.labor.map((line) => ({
    id: line.id,
    name: line.description,
    amount: line.hours * line.rate,
  }));
  const lines = [...partLines, ...laborLines];
  const amount = lines.reduce((sum, line) => sum + line.amount, 0);
  if (!lines.length) {
    if (!order.estimate || order.estimate.status === "draft") {
      order.estimate = undefined;
    }
    return;
  }
  const previous = order.estimate?.status;
  order.estimate = {
    id: order.estimate?.id ?? createId("est"),
    amount,
    status: previous === "sent" ? "sent" : "draft",
    lines,
    sentAt: order.estimate?.sentAt,
    respondedAt: order.estimate?.respondedAt,
  };
}

function resolveEstimate(order: ShopState["repairOrders"][number], estimateId?: string) {
  if (estimateId) {
    if (order.estimate?.id === estimateId) return order.estimate;
    const found = (order.foundProblems ?? []).find((item) => item.estimate.id === estimateId);
    if (found) return found.estimate;
    throw new Error("Estimate not found.");
  }
  if (order.estimate?.status === "sent") return order.estimate;
  const pending = (order.foundProblems ?? []).find((item) => item.estimate.status === "sent");
  if (pending) return pending.estimate;
  throw new Error("Estimate is not waiting for a decision.");
}

export type Action =
  | { type: "signup_customer"; payload: { fullName: string; email: string; phone: string; password: string } }
  | { type: "add_vehicle"; payload: { customerId: string; vin: string; year: number; make: string; model: string; mileage: number; nickname?: string; evType: "ev" | "hybrid" | "ice" } }
  | { type: "book_appointment"; payload: { customerId: string; vehicleId: string; serviceTypeId: string; scheduledAt: string; notes: string; photoUris: string[]; videoUris: string[] } }
  | { type: "update_appointment"; payload: { id: string; status: ShopState["appointments"][number]["status"] } }
  | { type: "check_in"; payload: { appointmentId: string; technicianId?: string; bayId?: string } }
  | { type: "create_repair_order"; payload: { customerId: string; vehicleId: string; serviceSummary: string; technicianId?: string; bayId?: string; appointmentId?: string } }
  | { type: "update_repair_order"; payload: { id: string; status?: ShopState["repairOrders"][number]["status"]; assignedTechnicianId?: string; assignedSubAdminId?: string; bayId?: string; serviceSummary?: string } }
  | { type: "add_note"; payload: { repairOrderId: string; body: string; visibleToCustomer: boolean } }
  | { type: "add_part"; payload: { repairOrderId: string; name: string; partNumber?: string; qty: number; unitCost: number } }
  | { type: "add_labor"; payload: { repairOrderId: string; description: string; hours: number; rate: number } }
  | { type: "add_media"; payload: { repairOrderId: string; kind: "photo" | "video_clip" | "diagnostic_report"; caption: string; uri?: string; durationSec?: number; visibleToCustomer: boolean } }
  | { type: "send_diagnosis_charge"; payload: { repairOrderId: string; amount: number; description?: string } }
  | { type: "send_estimate"; payload: { repairOrderId: string } }
  | { type: "report_found_problem"; payload: { repairOrderId: string; summary: string; lineName: string; amount: number } }
  | { type: "respond_estimate"; payload: { repairOrderId: string; status: "approved" | "declined"; customerId: string; estimateId?: string } }
  | { type: "send_message"; payload: { customerId: string; sender: "customer" | "shop"; body: string; repairOrderId?: string } }
  | { type: "mark_notification"; payload: { id?: string; userId: string; all?: boolean } };

export function applyAction(state: ShopState, action: Action): ShopState {
  const next = state;

  switch (action.type) {
    case "signup_customer": {
      const email = action.payload.email.trim().toLowerCase();
      if (next.customers.some((item) => item.email === email)) {
        throw new Error("An account with that email already exists.");
      }
      const customer = {
        id: createId("cust"),
        fullName: action.payload.fullName.trim(),
        email,
        phone: action.payload.phone.trim(),
        role: "customer" as const,
        password: action.payload.password,
      };
      next.customers.push(customer);
      getConversation(next, customer.id);
      notify(next, customer.id, "Welcome to Green Torque", "Add a vehicle to start booking EV and hybrid service.", "/(app)/vehicle/add");
      break;
    }
    case "add_vehicle": {
      next.vehicles.unshift({
        id: createId("veh"),
        customerId: action.payload.customerId,
        vin: action.payload.vin.trim().toUpperCase(),
        year: action.payload.year,
        make: action.payload.make.trim(),
        model: action.payload.model.trim(),
        mileage: action.payload.mileage,
        nickname: action.payload.nickname?.trim() || undefined,
        evType: action.payload.evType,
      });
      break;
    }
    case "book_appointment": {
      if (dropOffSlotTaken(next.appointments, action.payload.scheduledAt)) {
        throw new Error("That drop-off time is already booked.");
      }
      const appointment = {
        id: createId("apt"),
        customerId: action.payload.customerId,
        vehicleId: action.payload.vehicleId,
        serviceTypeId: action.payload.serviceTypeId,
        scheduledAt: action.payload.scheduledAt,
        status: "requested" as const,
        notes: action.payload.notes.trim(),
        photoUris: action.payload.photoUris,
        videoUris: action.payload.videoUris,
        createdAt: new Date().toISOString(),
      };
      next.appointments.unshift(appointment);
      notify(
        next,
        action.payload.customerId,
        "Appointment requested",
        "Green Torque will confirm your drop-off time shortly.",
        `/(app)/appointment/${appointment.id}`,
      );
      break;
    }
    case "update_appointment": {
      const appointment = next.appointments.find((item) => item.id === action.payload.id);
      if (!appointment) throw new Error("Appointment not found.");
      appointment.status = action.payload.status;
      if (action.payload.status === "confirmed") {
        notify(next, appointment.customerId, "Appointment confirmed", "Your drop-off time is confirmed.", `/(app)/appointment/${appointment.id}`);
      }
      if (action.payload.status === "cancelled") {
        appointment.status = "cancelled";
      }
      break;
    }
    case "check_in": {
      const appointment = next.appointments.find((item) => item.id === action.payload.appointmentId);
      if (!appointment) throw new Error("Appointment not found.");
      appointment.status = "checked_in";
      const service = serviceTypes.find((item) => item.id === appointment.serviceTypeId);
      applyAction(next, {
        type: "create_repair_order",
        payload: {
          customerId: appointment.customerId,
          vehicleId: appointment.vehicleId,
          serviceSummary: service?.name ?? "Service",
          technicianId: action.payload.technicianId,
          bayId: action.payload.bayId,
          appointmentId: appointment.id,
        },
      });
      break;
    }
    case "create_repair_order": {
      const assignment = resolveBay(next, action.payload.bayId);
      const number = String(next.nextRepairNumber);
      next.nextRepairNumber += 1;
      const order = {
        id: createId("ro"),
        number,
        appointmentId: action.payload.appointmentId,
        vehicleId: action.payload.vehicleId,
        customerId: action.payload.customerId,
        assignedTechnicianId: action.payload.technicianId,
        serviceSummary: action.payload.serviceSummary,
        status: "checked_in" as const,
        openedAt: new Date().toISOString(),
        notes: [],
        media: [],
        parts: [],
        labor: [],
        foundProblems: [],
        ...assignment,
      };
      next.repairOrders.unshift(order);
      getConversation(next, action.payload.customerId, order.id);
      notify(
        next,
        action.payload.customerId,
        "Vehicle checked in",
        `Repair order #${number} is open${assignment.bayName ? ` in ${assignment.bayName}` : ""}.`,
        `/(app)/repair/${order.id}`,
      );
      break;
    }
    case "update_repair_order": {
      const order = next.repairOrders.find((item) => item.id === action.payload.id);
      if (!order) throw new Error("Repair order not found.");
      if (action.payload.serviceSummary) order.serviceSummary = action.payload.serviceSummary;
      if (action.payload.assignedTechnicianId !== undefined) {
        order.assignedTechnicianId = action.payload.assignedTechnicianId || undefined;
      }
      if (action.payload.assignedSubAdminId !== undefined) {
        order.assignedSubAdminId = action.payload.assignedSubAdminId || undefined;
      }
      if (action.payload.bayId !== undefined) {
        Object.assign(order, resolveBay(next, action.payload.bayId || undefined));
      }
      if (action.payload.status) {
        order.status = action.payload.status;
        if (action.payload.status === "ready") {
          order.readyAt = new Date().toISOString();
          notify(next, order.customerId, "Ready for pickup", `Repair order #${order.number} is ready.`, `/(app)/repair/${order.id}`);
        }
        if (action.payload.status === "picked_up") {
          order.pickedUpAt = new Date().toISOString();
        }
        if (action.payload.status === "in_progress") {
          notify(next, order.customerId, "Repair in progress", `Work has started on repair order #${order.number}.`, `/(app)/repair/${order.id}`);
        }
      }
      break;
    }
    case "add_note": {
      const order = next.repairOrders.find((item) => item.id === action.payload.repairOrderId);
      if (!order) throw new Error("Repair order not found.");
      order.notes.unshift({
        id: createId("note"),
        body: action.payload.body.trim(),
        createdAt: new Date().toISOString(),
        visibleToCustomer: action.payload.visibleToCustomer,
      });
      if (action.payload.visibleToCustomer) {
        notify(next, order.customerId, "Repair update", action.payload.body.trim(), `/(app)/repair/${order.id}`);
      }
      break;
    }
    case "add_part": {
      const order = next.repairOrders.find((item) => item.id === action.payload.repairOrderId);
      if (!order) throw new Error("Repair order not found.");
      order.parts.push({
        id: createId("part"),
        name: action.payload.name.trim(),
        partNumber: action.payload.partNumber?.trim() || undefined,
        qty: action.payload.qty,
        unitCost: action.payload.unitCost,
      });
      rebuildEstimate(next, order.id);
      break;
    }
    case "add_labor": {
      const order = next.repairOrders.find((item) => item.id === action.payload.repairOrderId);
      if (!order) throw new Error("Repair order not found.");
      order.labor.push({
        id: createId("labor"),
        description: action.payload.description.trim(),
        hours: action.payload.hours,
        rate: action.payload.rate,
      });
      rebuildEstimate(next, order.id);
      break;
    }
    case "add_media": {
      const order = next.repairOrders.find((item) => item.id === action.payload.repairOrderId);
      if (!order) throw new Error("Repair order not found.");
      if (action.payload.kind === "video_clip" && !action.payload.uri) {
        throw new Error("Upload a work video first.");
      }
      order.media.unshift({
        id: createId("media"),
        kind: action.payload.kind,
        caption: action.payload.caption.trim(),
        uri: action.payload.uri,
        durationSec: action.payload.durationSec,
        createdAt: new Date().toISOString(),
        visibleToCustomer: action.payload.visibleToCustomer,
      });
      if (action.payload.visibleToCustomer) {
        notify(
          next,
          order.customerId,
          action.payload.kind === "video_clip" ? "New video update" : "New photo update",
          action.payload.caption.trim() || "Green Torque posted a work video on your repair.",
          `/(app)/repair/${order.id}`,
        );
      }
      break;
    }
    case "send_diagnosis_charge": {
      const order = next.repairOrders.find((item) => item.id === action.payload.repairOrderId);
      if (!order) throw new Error("Repair order not found.");
      const amount = Number(action.payload.amount);
      if (!Number.isFinite(amount) || amount <= 0) {
        throw new Error("Enter a diagnosis amount.");
      }
      order.diagnosisCharge = {
        amount,
        description: action.payload.description?.trim() || "Vehicle diagnosis",
        status: "sent",
        sentAt: new Date().toISOString(),
      };
      if (order.status === "checked_in") {
        order.status = "diagnosis";
      }
      notify(
        next,
        order.customerId,
        "Diagnosis charge",
        `Diagnosis for repair order #${order.number} is $${amount.toLocaleString()}. If more work is needed, the shop will send a separate estimate for you to approve or decline.`,
        `/(app)/repair/${order.id}`,
      );
      break;
    }
    case "send_estimate": {
      const order = next.repairOrders.find((item) => item.id === action.payload.repairOrderId);
      if (!order) throw new Error("Repair order not found.");
      rebuildEstimate(next, order.id, true);
      if (!order.estimate || order.estimate.amount <= 0) {
        throw new Error("Add further-service parts or labor before sending an estimate.");
      }
      order.estimate.status = "sent";
      order.estimate.sentAt = new Date().toISOString();
      order.estimate.respondedAt = undefined;
      notify(
        next,
        order.customerId,
        "Further service estimate",
        `Repair order #${order.number} further-service estimate is $${order.estimate.amount.toLocaleString()}. Approve or decline in the app.`,
        `/(app)/repair/${order.id}`,
      );
      break;
    }
    case "report_found_problem": {
      const order = next.repairOrders.find((item) => item.id === action.payload.repairOrderId);
      if (!order) throw new Error("Repair order not found.");
      const summary = action.payload.summary.trim();
      const lineName = action.payload.lineName.trim() || "Additional repair";
      const amount = Number(action.payload.amount);
      if (!summary) throw new Error("Describe the new problem.");
      if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a cost estimate for the new problem.");
      const estimateId = createId("est");
      const problem = {
        id: createId("fp"),
        summary,
        createdAt: new Date().toISOString(),
        estimate: {
          id: estimateId,
          amount,
          status: "sent" as const,
          sentAt: new Date().toISOString(),
          lines: [{ id: createId("line"), name: lineName, amount }],
        },
      };
      order.foundProblems = [problem, ...(order.foundProblems ?? [])];
      const conversation = getConversation(next, order.customerId, order.id);
      conversation.messages.push({
        id: createId("msg"),
        sender: "shop",
        body: `While working on your vehicle we found another problem: ${summary} Estimated cost: $${amount.toLocaleString()}. Please approve or decline this extra work in the app.`,
        createdAt: new Date().toISOString(),
      });
      notify(
        next,
        order.customerId,
        "New problem found",
        `While working on repair #${order.number}, the shop found: ${summary} Estimate $${amount.toLocaleString()}. Approve or decline in the app.`,
        `/(app)/repair/${order.id}`,
      );
      break;
    }
    case "respond_estimate": {
      const order = next.repairOrders.find((item) => item.id === action.payload.repairOrderId);
      if (!order) throw new Error("Repair order not found.");
      const estimate = resolveEstimate(order, action.payload.estimateId);
      if (estimate.status !== "sent") {
        throw new Error("Estimate is not waiting for a decision.");
      }
      estimate.status = action.payload.status;
      estimate.respondedAt = new Date().toISOString();
      const conversation = getConversation(next, action.payload.customerId, order.id);
      conversation.messages.push({
        id: createId("msg"),
        sender: "customer",
        body:
          action.payload.status === "approved"
            ? "Estimate approved. Please continue the additional repair."
            : "I declined this further-service estimate. Please do not continue that extra work.",
        createdAt: new Date().toISOString(),
      });
      notify(
        next,
        action.payload.customerId,
        action.payload.status === "approved" ? "Estimate approved" : "Estimate declined",
        action.payload.status === "approved"
          ? "The shop can continue the additional repair work."
          : "You declined the extra estimate. The diagnosis charge still applies.",
        `/(app)/repair/${order.id}`,
      );
      break;
    }
    case "send_message": {
      const conversation = getConversation(next, action.payload.customerId, action.payload.repairOrderId);
      conversation.messages.push({
        id: createId("msg"),
        sender: action.payload.sender,
        body: action.payload.body.trim(),
        createdAt: new Date().toISOString(),
      });
      if (action.payload.sender === "shop") {
        notify(next, action.payload.customerId, "New message from Green Torque", action.payload.body.trim(), "/(app)/messages");
      }
      break;
    }
    case "mark_notification": {
      next.notifications = next.notifications.map((item) => {
        if (item.userId !== action.payload.userId) return item;
        if (action.payload.all || item.id === action.payload.id) {
          return { ...item, read: true };
        }
        return item;
      });
      break;
    }
    default:
      break;
  }

  return next;
}

export { customerSnapshot };
