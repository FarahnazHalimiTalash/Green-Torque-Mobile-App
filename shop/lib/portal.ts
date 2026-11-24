import type { CustomerSnapshot, ShopState } from "./types";

export function customerSnapshot(state: ShopState, customerId: string): CustomerSnapshot {
  const customer = state.customers.find((item) => item.id === customerId);
  if (!customer) {
    throw new Error("Customer not found.");
  }

  const vehicles = state.vehicles.filter((item) => item.customerId === customerId);
  const conversation =
    state.conversations.find((item) => item.customerId === customerId) ?? {
      id: "",
      customerId,
      messages: [],
    };

  return {
    profile: {
      id: customer.id,
      fullName: customer.fullName,
      email: customer.email,
      phone: customer.phone,
      role: customer.role,
    },
    vehicles,
    selectedVehicleId: vehicles[0]?.id ?? null,
    appointments: state.appointments.filter((item) => item.customerId === customerId),
    repairOrders: state.repairOrders
      .filter((item) => item.customerId === customerId)
      .map((order) => ({
        ...order,
        estimate: !order.estimate || order.estimate.status === "draft" ? undefined : order.estimate,
        diagnosisCharge: order.diagnosisCharge?.status === "sent" ? order.diagnosisCharge : undefined,
      })),
    messages: conversation.messages,
    notifications: state.notifications
      .filter((item) => item.userId === customerId)
      .map(({ userId: _userId, ...item }) => item),
    paymentMethods: customer.paymentMethods ?? [],
    payments: (state.payments ?? []).filter((item) => item.customerId === customerId),
  };
}
