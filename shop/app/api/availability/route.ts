import { readDb } from "@/lib/db";
import { bookedDropOffTimes } from "@/lib/drop-off";
import { json, options } from "@/lib/http";

export async function OPTIONS() {
  return options();
}

export async function GET() {
  const state = await readDb();
  return json({ booked: bookedDropOffTimes(state.appointments) });
}
