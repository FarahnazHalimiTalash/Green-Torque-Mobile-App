import type { Action } from "./actions";
import type { UserRole } from "./types";

export function isAdmin(role: UserRole) {
  return role === "admin";
}

export function canUploadWorkMedia(role: UserRole) {
  return role === "admin" || role === "sub_admin";
}

export function shopNavLinks(role: UserRole) {
  if (role === "sub_admin") {
    return [{ href: "/repair-orders", label: "Repair orders" }];
  }
  return [
    { href: "/", label: "Today" },
    { href: "/appointments", label: "Appointments" },
    { href: "/repair-orders", label: "Repair orders" },
    { href: "/customers", label: "Customers" },
    { href: "/vehicles", label: "Vehicles" },
    { href: "/bays", label: "Bays" },
  ];
}

export function subAdminHome() {
  return "/repair-orders";
}

export function assertStaffAction(staff: { role: UserRole } | null, action: Action) {
  if (!staff) {
    if (action.type === "send_message" && action.payload.sender === "customer") return;
    if (action.type === "update_appointment" && action.payload.status === "cancelled") return;
    if (
      action.type === "signup_customer" ||
      action.type === "add_vehicle" ||
      action.type === "book_appointment" ||
      action.type === "respond_estimate" ||
      action.type === "submit_pickup_acknowledgment" ||
      action.type === "mark_notification" ||
      action.type === "save_payment_method" ||
      action.type === "remove_payment_method" ||
      action.type === "pay_due"
    ) {
      return;
    }
    throw new Error("Not allowed.");
  }

  if (staff.role === "admin") return;

  if (action.type === "correct_history") {
    throw new Error("Only admin can correct history.");
  }

  if (staff.role === "sub_admin") {
    const media =
      action.type === "add_media" &&
      (action.payload.kind === "photo" || action.payload.kind === "video_clip") &&
      action.payload.visibleToCustomer;
    if (media) return;
    throw new Error("Sub-admins can only upload work photos and videos for the customer.");
  }

  if (
    action.type === "send_message" ||
    action.type === "send_estimate" ||
    action.type === "send_diagnosis_charge" ||
    action.type === "report_found_problem"
  ) {
    throw new Error("Only admin can message customers and send cost estimates.");
  }
  if (action.type === "add_media") {
    throw new Error("Only admin and sub-admin can upload work photos and videos.");
  }
}
