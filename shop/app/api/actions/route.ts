import { applyAction, type Action } from "@/lib/actions";
import { updateDb } from "@/lib/db";
import { json, options } from "@/lib/http";
import { customerSnapshot } from "@/lib/portal";

export async function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  const action = (await request.json()) as Action;
  try {
    const state = await updateDb((current) => applyAction(structuredClone(current), action));
    const customerId =
      action.type === "signup_customer"
        ? state.customers.find((item) => item.email === action.payload.email.trim().toLowerCase())?.id
        : "customerId" in action.payload
          ? action.payload.customerId
          : "userId" in action.payload
            ? action.payload.userId
            : undefined;
    return json({
      ok: true,
      state,
      snapshot: customerId ? customerSnapshot(state, customerId) : undefined,
    });
  } catch (error) {
    return json({ error: error instanceof Error ? error.message : "Could not save." }, 400);
  }
}
