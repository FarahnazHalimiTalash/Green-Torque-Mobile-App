import { readDb } from "@/lib/db";
import { json, options } from "@/lib/http";
import { customerSnapshot } from "@/lib/portal";

export async function OPTIONS() {
  return options();
}

export async function GET(request: Request) {
  const customerId = new URL(request.url).searchParams.get("customerId");
  if (!customerId) return json({ error: "customerId is required." }, 400);
  const state = await readDb();
  return json(customerSnapshot(state, customerId));
}
