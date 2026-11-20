import type { RepairStatus } from "@/lib/types";
import { repairStatusCopy } from "@/lib/format";

export function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    requested: "bg-[#5BB0FF]/15 text-[#5BB0FF]",
    confirmed: "bg-[#3DDC84]/15 text-[#3DDC84]",
    checked_in: "bg-[#5BB0FF]/15 text-[#5BB0FF]",
    diagnosis: "bg-[#F5A524]/15 text-[#F5A524]",
    in_progress: "bg-[#F5A524]/15 text-[#F5A524]",
    inspection: "bg-[#5BB0FF]/15 text-[#5BB0FF]",
    ready: "bg-[#3DDC84]/15 text-[#3DDC84]",
    picked_up: "bg-[#3DDC84]/15 text-[#3DDC84]",
    cancelled: "bg-[#E85D4C]/15 text-[#E85D4C]",
    sent: "bg-[#F5A524]/15 text-[#F5A524]",
    approved: "bg-[#3DDC84]/15 text-[#3DDC84]",
    declined: "bg-[#E85D4C]/15 text-[#E85D4C]",
    draft: "bg-white/10 text-[#8AA99A]",
  };
  const label = repairStatusCopy[status as RepairStatus] ?? status.replaceAll("_", " ");
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold capitalize ${tones[status] ?? "bg-white/10 text-[#8AA99A]"}`}>
      {label}
    </span>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-2xl border border-[#1E3D2E] bg-[#12261C] p-5 ${className}`}>
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
      <span className="font-semibold text-[#8AA99A]">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 rounded-xl border border-[#1E3D2E] bg-[#0B1C14] px-3 text-sm text-[#F2FBF6] outline-none focus:border-[#3DDC84]";

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
    primary: "bg-[#3DDC84] text-[#07140F]",
    secondary: "border border-[#1E3D2E] bg-[#163024] text-[#F2FBF6]",
    danger: "border border-[#E85D4C] bg-[#E85D4C]/15 text-[#F2FBF6]",
    ghost: "text-[#3DDC84]",
  };
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`min-h-11 rounded-xl px-4 text-sm font-bold disabled:opacity-50 ${styles[variant]}`}
    >
      {children}
    </button>
  );
}
