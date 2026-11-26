"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useShop } from "@/lib/shop-context";
import { shopNavLinks, subAdminHome } from "@/lib/staff";

export function Shell({ children }: { children: React.ReactNode }) {
  const { ready, staff, signOut } = useShop();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !staff) {
      router.replace("/login");
    }
  }, [ready, router, staff]);

  useEffect(() => {
    if (!staff || staff.role !== "sub_admin") return;
    const allowed = pathname === "/repair-orders" || pathname.startsWith("/repair-orders/");
    if (!allowed) router.replace(subAdminHome());
  }, [pathname, router, staff]);

  if (!ready || !staff) {
    return (
      <div className="grid min-h-screen place-items-center text-gt-primary-deep">Loading shop…</div>
    );
  }

  const links = shopNavLinks(staff.role);
  const home = staff.role === "sub_admin" ? subAdminHome() : "/";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-gt-border bg-gt-card text-gt-text lg:border-r lg:border-b-0">
        <Link href={home} className="block border-b border-gt-border bg-gt-header px-4 py-3">
          <img
            src="/logo.png"
            alt="Green Torque Hybrid/EV Repair"
            width={180}
            height={48}
            className="h-12 w-auto"
          />
        </Link>
        <div className="p-5">
          <p className="mb-3 text-[11px] font-bold uppercase tracking-[0.16em] text-gt-primary-deep">
            Shop console
          </p>
          <nav className="grid gap-1">
            {links.map((link) => {
              const active =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--gt-primary-muted)] text-gt-primary-deep"
                      : "text-gt-text hover:bg-gt-elevated"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 rounded-2xl border border-gt-border bg-gt-card-alt p-4 text-sm">
            <p className="font-bold text-gt-text">{staff.fullName}</p>
            <p className="text-gt-muted">{staff.title}</p>
            <button onClick={signOut} className="mt-3 text-gt-dim hover:text-gt-primary-deep">
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <div className="p-5 lg:p-8">{children}</div>
    </div>
  );
}
