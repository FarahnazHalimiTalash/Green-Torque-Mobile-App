import { repairStatusCopy } from "@/lib/format";
import type { RepairStatus } from "@/lib/types";

/** Same status tones as the customer app StatusBadge. */
export function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    requested: "bg-[var(--gt-warning-muted)] text-gt-warning",
    confirmed: "bg-[var(--gt-primary-muted)] text-gt-primary-deep",
    checked_in: "bg-[var(--gt-primary-muted)] text-gt-primary-deep",
    diagnosis: "bg-[var(--gt-warning-muted)] text-gt-warning",
    in_progress: "bg-[var(--gt-warning-muted)] text-gt-warning",
    inspection: "bg-[var(--gt-warning-muted)] text-gt-warning",
    ready: "bg-[var(--gt-primary-muted)] text-gt-primary-deep",
    picked_up: "bg-[var(--gt-primary-muted)] text-gt-primary-deep",
    completed: "bg-[var(--gt-primary-muted)] text-gt-primary-deep",
    cancelled: "bg-[var(--gt-danger-muted)] text-gt-danger",
    sent: "bg-[var(--gt-warning-muted)] text-gt-warning",
    approved: "bg-[var(--gt-primary-muted)] text-gt-primary-deep",
    declined: "bg-[var(--gt-danger-muted)] text-gt-danger",
    draft: "bg-gt-elevated text-gt-muted",
  };
  const label = repairStatusCopy[status as RepairStatus] ?? status.replaceAll("_", " ");
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-bold capitalize ${tones[status] ?? "bg-gt-elevated text-gt-muted"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

/** Same page-header pattern as the customer app (green eyebrow + bold title). */
export function PageHeader({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  return (
    <header className="mb-1 grid gap-2">
      {eyebrow ? (
        <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-gt-primary-deep">{eyebrow}</p>
      ) : null}
      <h1 className="text-[34px] font-extrabold leading-tight tracking-tight text-gt-text">{title}</h1>
      {subtitle ? <p className="max-w-xl text-base text-gt-muted">{subtitle}</p> : null}
    </header>
  );
}

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <section
      className={`rounded-[26px] border border-gt-border bg-gt-card p-5 shadow-[0_8px_24px_rgba(7,20,15,0.06)] ${className}`}
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
      <span className="font-semibold text-gt-muted">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  "min-h-11 rounded-xl border border-gt-border bg-gt-card px-3 text-sm text-gt-text outline-none transition focus:border-gt-primary focus:ring-2 focus:ring-[var(--gt-primary-glow)]";

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
      "bg-gradient-to-br from-[#22C55E] to-gt-primary text-white shadow-[0_8px_18px_rgba(21,128,61,0.22)]",
    secondary: "border border-gt-border-strong bg-gt-card text-gt-text",
    danger: "border border-gt-danger bg-[var(--gt-danger-muted)] text-gt-danger",
    ghost: "text-gt-primary-deep",
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
