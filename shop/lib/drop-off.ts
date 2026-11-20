export const DROP_OFF_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function dropOffSlotKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
}

export function isActiveDropOff(status: string) {
  return status !== "cancelled";
}

export function bookedDropOffTimes(appointments: Array<{ scheduledAt: string; status: string }>) {
  return appointments.filter((item) => isActiveDropOff(item.status)).map((item) => item.scheduledAt);
}

export function dropOffSlotTaken(
  appointments: Array<{ scheduledAt: string; status: string }>,
  scheduledAt: string,
) {
  const key = dropOffSlotKey(new Date(scheduledAt));
  return appointments.some(
    (item) => isActiveDropOff(item.status) && dropOffSlotKey(new Date(item.scheduledAt)) === key,
  );
}
