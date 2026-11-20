export const DROP_OFF_HOURS = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];

export function dropOffSlotKey(date: Date) {
  return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}`;
}

export function isDropOffTaken(bookedAt: string[], date: Date, hour: number) {
  const slot = new Date(date);
  slot.setHours(hour, 0, 0, 0);
  if (slot.getTime() <= Date.now()) return true;
  const key = dropOffSlotKey(slot);
  return bookedAt.some((iso) => dropOffSlotKey(new Date(iso)) === key);
}
