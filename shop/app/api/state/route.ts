import { readDb } from "@/lib/db";
import { json, options } from "@/lib/http";

export async function OPTIONS() {
  return options();
}

export async function GET() {
  const state = await readDb();
  const staff = state.staff.map(({ password: _password, ...item }) => item);
  const customers = state.customers.map(({ password: _password, ...item }) => item);
  return json({ ...state, staff, customers });
}
