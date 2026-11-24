import { applyAction, type Action } from "@/lib/actions";
import { updateDb } from "@/lib/db";
import { json, options } from "@/lib/http";
import { customerSnapshot } from "@/lib/portal";
import { assertStaffAction } from "@/lib/staff";

export async function OPTIONS() {
  return options();
}

export async function POST(request: Request) {
  const action = (await request.json()) as Action;
  const staffId = request.headers.get("x-user-id");
  try {
    const state = await updateDb((current) => {
      const staff = staffId ? current.staff.find((item) => item.id === staffId) ?? null : null;
      assertStaffAction(staff, action);
      return applyAction(structuredClone(current), action);
    });
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
