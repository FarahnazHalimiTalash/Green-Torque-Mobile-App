import type { AccountState, CustomerSnapshot, EstimateStatus, Vehicle } from '@/types';

export const SHOP_API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';

export function shopMediaUrl(uri?: string) {
  if (!uri) return '';
  if (/^(https?:|blob:|data:|file:)/i.test(uri)) return uri;
  const path = uri.startsWith('/') ? uri : `/${uri}`;
  return `${SHOP_API_URL}${path}`;
}

type AuthResponse = {
  kind: 'customer';
  user: { id: string; email: string };
  snapshot: CustomerSnapshot;
  error?: string;
};

type ActionResponse = {
  ok?: boolean;
  error?: string;
  snapshot?: CustomerSnapshot;
};

export function snapshotToAccount(snapshot: CustomerSnapshot, password = ''): AccountState {
  return {
    password,
    profile: snapshot.profile,
    vehicles: snapshot.vehicles,
    selectedVehicleId: snapshot.selectedVehicleId,
    appointments: snapshot.appointments,
    repairOrders: snapshot.repairOrders.map((order) => ({
      ...order,
      parts: order.parts ?? [],
      labor: order.labor ?? [],
    })),
    messages: snapshot.messages,
    notifications: snapshot.notifications,
    paymentMethods: snapshot.paymentMethods ?? [],
    payments: snapshot.payments ?? [],
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${SHOP_API_URL}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {}),
    },
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) {
    throw new Error(data.error ?? 'Shop API request failed.');
  }
  return data;
}

export async function shopHealth() {
  try {
    const response = await fetch(`${SHOP_API_URL}/api/health`);
    return response.ok;
  } catch {
    return false;
  }
}

export async function shopDemoLogin() {
  const data = await request<AuthResponse>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ kind: 'demo' }),
  });
  return { customerId: data.user.id, account: snapshotToAccount(data.snapshot) };
}

export async function shopCustomerLogin(email: string, password: string) {
  const data = await request<AuthResponse>('/api/auth', {
    method: 'POST',
    body: JSON.stringify({ kind: 'customer', email, password }),
  });
  return { customerId: data.user.id, account: snapshotToAccount(data.snapshot, password) };
}

export async function shopSignup(input: {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}) {
  const created = await request<ActionResponse>('/api/actions', {
    method: 'POST',
    body: JSON.stringify({ type: 'signup_customer', payload: input }),
  });
  if (!created.snapshot) {
    throw new Error('Account created, but the shop did not return a customer profile.');
  }
  return {
    customerId: created.snapshot.profile.id,
    account: snapshotToAccount(created.snapshot, input.password),
  };
}

export async function shopAvailability() {
  const data = await request<{ booked: string[] }>('/api/availability');
  return data.booked ?? [];
}

export async function shopPortal(customerId: string) {
  const snapshot = await request<CustomerSnapshot>(`/api/portal?customerId=${encodeURIComponent(customerId)}`);
  return snapshotToAccount(snapshot);
}

export async function shopAction(action: Record<string, unknown>) {
  const data = await request<ActionResponse>('/api/actions', {
    method: 'POST',
    body: JSON.stringify(action),
  });
  return data.snapshot ? snapshotToAccount(data.snapshot) : null;
}

export async function shopAddVehicle(customerId: string, input: Omit<Vehicle, 'id' | 'customerId'>) {
  return shopAction({
    type: 'add_vehicle',
    payload: { ...input, customerId },
  });
}

export async function shopBookAppointment(
  customerId: string,
  payload: {
    vehicleId: string;
    serviceTypeId: string;
    scheduledAt: string;
    notes: string;
    photoUris: string[];
    videoUris: string[];
  },
) {
  return shopAction({
    type: 'book_appointment',
    payload: { ...payload, customerId },
  });
}

export async function shopCancelAppointment(id: string) {
  return shopAction({
    type: 'update_appointment',
    payload: { id, status: 'cancelled' },
  });
}

export async function shopRespondEstimate(
  repairOrderId: string,
  customerId: string,
  status: Extract<EstimateStatus, 'approved' | 'declined'>,
  estimateId?: string,
) {
  return shopAction({
    type: 'respond_estimate',
    payload: { repairOrderId, customerId, status, estimateId },
  });
}

export async function shopSendMessage(customerId: string, body: string) {
  return shopAction({
    type: 'send_message',
    payload: { customerId, sender: 'customer', body },
  });
}

export async function shopMarkNotification(userId: string, id?: string, all?: boolean) {
  return shopAction({
    type: 'mark_notification',
    payload: { userId, id, all },
  });
}

export async function shopSavePaymentMethod(
  customerId: string,
  payload: { cardNumber: string; expMonth: string; expYear: string; cardholderName: string; cvc?: string },
) {
  return shopAction({
    type: 'save_payment_method',
    payload: { customerId, ...payload },
  });
}

export async function shopRemovePaymentMethod(customerId: string, paymentMethodId: string) {
  return shopAction({
    type: 'remove_payment_method',
    payload: { customerId, paymentMethodId },
  });
}

export async function shopPayDue(customerId: string, repairOrderId: string, paymentMethodId: string) {
  return shopAction({
    type: 'pay_due',
    payload: { customerId, repairOrderId, paymentMethodId },
  });
}
