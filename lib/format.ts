import type { RepairStatus } from '@/types';

export function formatMileage(value: number) {
  return `${value.toLocaleString()} mi`;
}

export function formatMoney(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatDateTime(iso: string) {
  return `${formatDate(iso)} · ${formatTime(iso)}`;
}

export function vehicleLabel(vehicle: { year: number; make: string; model: string }) {
  return `${vehicle.year} ${vehicle.make} ${vehicle.model}`;
}

export const repairStatusCopy: Record<RepairStatus, string> = {
  checked_in: 'Vehicle checked in',
  diagnosis: 'Diagnosis',
  in_progress: 'Repair in Progress',
  inspection: 'Quality inspection',
  ready: 'Ready for pickup',
  picked_up: 'Picked up',
  cancelled: 'Cancelled',
};

export const repairTimeline: RepairStatus[] = [
  'checked_in',
  'diagnosis',
  'in_progress',
  'inspection',
  'ready',
];
