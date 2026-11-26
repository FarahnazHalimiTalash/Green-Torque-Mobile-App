import type { RepairStatus } from "@/lib/types";
import { repairStatusCopy } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    requested: "bg-[rgba(3,105,161,0.1)] text-[#0369A1]",
    confirmed: "bg-[rgba(22,163,74,0.1)] text-[#15803D]",
    checked_in: "bg-[rgba(3,105,161,0.1)] text-[#0369A1]",
    diagnosis: "bg-[rgba(194,65,12,0.1)] text-[#C2410C]",
    in_progress: "bg-[rgba(194,65,12,0.1)] text-[#C2410C]",
    inspection: "bg-[rgba(3,105,161,0.1)] text-[#0369A1]",
    ready: "bg-[rgba(22,163,74,0.1)] text-[#15803D]",
    picked_up: "bg-[rgba(22,163,74,0.1)] text-[#15803D]",
    cancelled: "bg-[rgba(220,38,38,0.1)] text-[#DC2626]",
    sent: "bg-[rgba(194,65,12,0.1)] text-[#C2410C]",
    approved: "bg-[rgba(22,163,74,0.1)] text-[#15803D]",
    declined: "bg-[rgba(220,38,38,0.1)] text-[#DC2626]",
    draft: "bg-[#EEF5F0] text-[#4F6B5C]",
  };
  const label = repairStatusCopy[status as RepairStatus] ?? status.replaceAll("_", " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold capitalize ${tones[status] ?? "bg-[#EEF5F0] text-[#4F6B5C]"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[26px] border border-[#D7E5DC] bg-white p-5 shadow-[0_8px_24px_rgba(7,20,15,0.06)] ${className}`}
    >
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-semibold text-[#4F6B5C]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 rounded-xl border border-[#D7E5DC] bg-white px-3 text-sm text-[#0C1F16] outline-none transition focus:border-[#16A34A] focus:ring-2 focus:ring-[rgba(22,163,74,0.15)]";

export function Button({
  children,
  onClick,
  variant = "primary",
  type = "button",
  disabled,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger" | "ghost";
  type?: "button" | "submit";
  disabled?: boolean;
}) {
  const styles = {
    primary:
      "bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white shadow-[0_8px_18px_rgba(21,128,61,0.22)]",
    secondary: "border border-[#B7CFC0] bg-white text-[#0C1F16]",
    danger: "border border-[#DC2626] bg-[rgba(220,38,38,0.08)] text-[#DC2626]",
    ghost: "text-[#15803D]",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 rounded-xl px-4 text-sm font-bold transition hover:brightness-[0.98] disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
