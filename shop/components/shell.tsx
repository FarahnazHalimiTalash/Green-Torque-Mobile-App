"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

import { useShop } from "@/lib/shop-context";

const links = [
  { href: "/", label: "Today" },
  { href: "/appointments", label: "Appointments" },
  { href: "/repair-orders", label: "Repair orders" },
  { href: "/customers", label: "Customers" },
  { href: "/vehicles", label: "Vehicles" },
  { href: "/bays", label: "Bays & cameras" },
];

export function Shell({ children }: { children: React.ReactNode }) {
  const { ready, staff, signOut } = useShop();
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (ready && !staff) {
      router.replace("/login");
    }
  }, [ready, router, staff]);

  if (!ready || !staff) {
    return (
      <div className="grid min-h-screen place-items-center text-[#3DDC84]">Loading shop…</div>
    );
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[240px_1fr]">
      <aside className="border-b border-[#1E3D2E] bg-[#0B1C14] p-5 lg:border-r lg:border-b-0">
        <p className="text-xs font-extrabold tracking-[0.18em] text-[#3DDC84]">GREEN TORQUE</p>
        <p className="mt-1 text-sm text-[#8AA99A]">Hybrid & EV Repair</p>
        <nav className="mt-6 grid gap-1">
          {links.map((link) => {
            const active = pathname === link.href;
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
      </aside>
      <div className="p-5 lg:p-8">{children}</div>
    </div>
  );
}
