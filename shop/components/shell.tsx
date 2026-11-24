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
      <div className="grid min-h-screen place-items-center text-[#3DDC84]">Loading shop…</div>
    );
  }

  const links = shopNavLinks(staff.role);
  const home = staff.role === "sub_admin" ? subAdminHome() : "/";

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#1E3D2E] bg-[#0B1C14] lg:border-r lg:border-b-0">
        <Link href={home} className="block border-b-[3px] border-[#00b000] bg-black px-4 py-3">
          <img
            src="/logo.png"
            alt="Green Torque Hybrid/EV Repair"
            width={180}
            height={48}
            className="h-12 w-auto"
          />
        </Link>
        <div className="p-5">
          <nav className="grid gap-1">
            {links.map((link) => {
              const active = pathname === link.href || (link.href !== "/" && pathname.startsWith(`${link.href}/`));
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold ${active ? "bg-[#3DDC84]/15 text-[#3DDC84]" : "text-[#F2FBF6] hover:bg-white/5"}`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-8 text-sm">
            <p className="font-bold">{staff.fullName}</p>
            <p className="text-[#8AA99A]">{staff.title}</p>
            <button onClick={signOut} className="mt-3 text-[#8AA99A] hover:text-[#3DDC84]">
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <div className="p-5 lg:p-8">{children}</div>
    </div>
  );
}
