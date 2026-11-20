import { readDb } from "@/lib/db";
import { json, options } from "@/lib/http";
import { customerSnapshot } from "@/lib/portal";

export async function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  const body = (await request.json()) as {
    email?: string;
    password?: string;
    kind?: "staff" | "customer" | "demo";
  };
  const state = await readDb();
  const email = body.email?.trim().toLowerCase() ?? "";

  if (body.kind === "demo") {
    const customer = state.customers.find((item) => item.email === "farahnaz@greentorque.demo");
    if (!customer) return json({ error: "Demo customer missing." }, 404);
    return json({ kind: "customer", user: customer, snapshot: customerSnapshot(state, customer.id) });
  }

  if (body.kind === "staff") {
    const staff = state.staff.find((item) => item.email === email && item.password === body.password);
    if (!staff) return json({ error: "Check your shop email and password." }, 401);
    const { password: _password, ...safe } = staff;
    return json({ kind: "staff", user: safe, state });
  }

  const customer = state.customers.find((item) => item.email === email && item.password === body.password);
  if (!customer) return json({ error: "Check your email and password." }, 401);
  const { password: _password, ...safe } = customer;
  return json({ kind: "customer", user: safe, snapshot: customerSnapshot(state, customer.id) });
}

export async function GET() {
  const state = await readDb();
  return json({
    shop: state.shop,
    staffCount: state.staff.length,
  });
}

export async function PUT() {
  const { resetDb } = await import("@/lib/db");
  const state = await resetDb();
  return json({ ok: true, nextRepairNumber: state.nextRepairNumber });
}
