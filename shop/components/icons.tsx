import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  CarFront,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  ParkingSquare,
  Users,
  Wrench,
} from "lucide-react";

export const shopIcons = {
  today: LayoutDashboard,
  appointments: CalendarDays,
  "repair-orders": Wrench,
  customers: Users,
  vehicles: CarFront,
  bays: ParkingSquare,
  logout: LogOut,
  jobs: ClipboardList,
} as const;

export type ShopIconKey = keyof typeof shopIcons;

export function ShopIcon({
  name,
  className = "h-4 w-4",
  strokeWidth = 1.85,
}: {
  name: ShopIconKey;
  className?: string;
  strokeWidth?: number;
}) {
  const Icon = shopIcons[name] as LucideIcon;
  return <Icon className={className} strokeWidth={strokeWidth} aria-hidden />;
}

export function navIconForHref(href: string): ShopIconKey {
  if (href === "/") return "today";
  if (href.startsWith("/appointments")) return "appointments";
  if (href.startsWith("/repair-orders")) return "repair-orders";
  if (href.startsWith("/customers")) return "customers";
  if (href.startsWith("/vehicles")) return "vehicles";
  if (href.startsWith("/bays")) return "bays";
  return "today";
}
