"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { navIconForHref, ShopIcon } from "@/components/icons";
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
      <div className="grid min-h-screen place-items-center bg-gt-bg text-gt-primary-deep">Loading shop…</div>
    );
  }

  const links = shopNavLinks(staff.role);
  const home = staff.role === "sub_admin" ? subAdminHome() : "/";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[248px_1fr]">
      <aside className="border-b border-gt-border bg-gt-elevated/90 text-gt-text backdrop-blur-sm lg:border-r lg:border-b-0">
        <Link href={home} className="block border-b border-gt-header bg-gt-header px-4 py-3">
          <img
            src="/logo.png"
            alt="Green Torque Hybrid/EV Repair"
            width={180}
            height={48}
            className="h-12 w-auto"
          />
        </Link>
        <div className="p-5">
          <nav className="grid gap-1.5">
            {links.map((link) => {
              const active =
                pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));
              const icon = navIconForHref(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--gt-primary-muted)] text-gt-primary-deep"
                      : "text-gt-text hover:bg-gt-card"
                  }`}
                >
                  <span
                    className={`grid h-8 w-8 place-items-center rounded-lg ${
                      active ? "bg-gt-card text-gt-primary-deep" : "bg-gt-card/80 text-gt-muted"
                    }`}
                  >
                    <ShopIcon name={icon} className="h-[18px] w-[18px]" />
                  </span>
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 rounded-[20px] border border-gt-border bg-gt-card p-4 text-sm shadow-[0_8px_24px_rgba(7,20,15,0.06)]">
            <p className="font-bold text-gt-text">{staff.fullName}</p>
            <p className="text-gt-muted">{staff.title}</p>
            <button
              onClick={signOut}
              className="mt-3 inline-flex items-center gap-2 text-gt-dim hover:text-gt-primary-deep"
            >
              <ShopIcon name="logout" className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <div className="relative overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute -top-20 -right-16 h-[220px] w-[220px] rounded-full bg-[var(--gt-primary-glow)]"
        />
        <div className="relative p-5 lg:p-8">{children}</div>
      </div>
    </div>
  );
}
